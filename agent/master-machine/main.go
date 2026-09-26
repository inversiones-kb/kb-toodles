// Command master-machine runs the parameterized ADN cash-register report
// queries (see queries/cash_report.sql) against a MySQL/MariaDB database and
// prints the results as JSON.
package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type Config struct {
	DSN       string `json:"dsn"`
	Branch    string `json:"branch"`
	IngestURL string `json:"ingest_url"`
	IngestKey string `json:"ingest_key"`
}

func loadConfig(path string) (Config, error) {
	var cfg Config
	data, err := os.ReadFile(path)
	if err != nil {
		return cfg, fmt.Errorf("reading config %s: %w (copy master-machine/config.example.json there and fill in your DSN)", path, err)
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, fmt.Errorf("parsing config %s: %w", path, err)
	}
	if cfg.DSN == "" {
		return cfg, fmt.Errorf("config %s: \"dsn\" is empty", path)
	}
	return cfg, nil
}

var sectionRe = regexp.MustCompile(`(?m)^-- name:\s*(\S+)\s*$`)

// loadQueries splits a "-- name: X" delimited SQL file into named
// statements, preserving file order.
func loadQueries(path string) (queries map[string]string, order []string, err error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, nil, err
	}
	content := string(data)
	matches := sectionRe.FindAllStringSubmatchIndex(content, -1)
	queries = make(map[string]string, len(matches))
	for i, m := range matches {
		name := content[m[2]:m[3]]
		start := m[1]
		end := len(content)
		if i+1 < len(matches) {
			end = matches[i+1][0]
		}
		body := strings.TrimSpace(content[start:end])
		body = strings.TrimSuffix(body, ";")
		queries[name] = body
		order = append(order, name)
	}
	if len(order) == 0 {
		return nil, nil, fmt.Errorf("no \"-- name: X\" sections found in %s", path)
	}
	return queries, order, nil
}

// argsFor returns the bind parameters for a named section, matching the
// placeholder order baked into queries/cash_report.sql.
func argsFor(section, date, caja string) ([]any, error) {
	switch section {
	case "Datos", "ResumenT1", "ResumenT2":
		return []any{date, date, caja, caja, date, date, caja, caja}, nil
	case "Ventas":
		return []any{caja, caja, date, date}, nil
	case "Billetes":
		return []any{caja}, nil
	default:
		return nil, fmt.Errorf("unknown query section %q", section)
	}
}

// Row names from the ResumenT1/ResumenT2 "RESUMEN GENERAL DE CAJA" overview,
// as printed on the summary page of the rendered report (see
// reports_examples/checkout_report_example.pdf).
const (
	nombrePuntoDeVenta       = "PUNTO DE VENTA"
	nombreBanesco            = "BANESCO"
	nombreBancoEfectivoPesos = "BANCO EFECTIVO PESOS"
)

// Summary holds the three overview-page totals the app persists, as plain
// float64 (no currency formatting, no string encoding).
type Summary struct {
	POSSystem    float64 // money.bs.pos_system
	MobileSystem float64 // money.bs.mobile_system
	CopSystem    float64 // money.cop.system
}

// applyRow folds one ResumenT1/ResumenT2 row (NOMBRE, MONTO) into s. Rows
// with an unrecognized NOMBRE are ignored.
func applyRow(s *Summary, nombre string, monto float64) {
	switch nombre {
	case nombrePuntoDeVenta:
		s.POSSystem = monto
	case nombreBanesco:
		s.MobileSystem = monto
	case nombreBancoEfectivoPesos:
		s.CopSystem = monto
	}
}

// buildSummary runs ResumenT1 and ResumenT2 and reduces them to the three
// overview totals a checkout report actually needs to persist.
func buildSummary(db *sql.DB, queries map[string]string, date, caja string) (Summary, error) {
	var s Summary
	for _, section := range []string{"ResumenT1", "ResumenT2"} {
		args, err := argsFor(section, date, caja)
		if err != nil {
			return s, err
		}
		rows, err := db.Query(queries[section], args...)
		if err != nil {
			return s, fmt.Errorf("running query %s: %w", section, err)
		}
		err = scanSummaryRows(rows, &s)
		rows.Close()
		if err != nil {
			return s, fmt.Errorf("reading results for %s: %w", section, err)
		}
	}
	return s, nil
}

// scanSummaryRows scans the fixed 5-column shape shared by every branch of
// ResumenT1/ResumenT2: cantidad, montoOtraMoneda, monto, nombre, tipotrans.
func scanSummaryRows(rows *sql.Rows, s *Summary) error {
	for rows.Next() {
		var cantidad int
		var montoOtraMoneda, monto float64
		var nombre, tipotrans string
		if err := rows.Scan(&cantidad, &montoOtraMoneda, &monto, &nombre, &tipotrans); err != nil {
			return err
		}
		applyRow(s, nombre, monto)
	}
	return rows.Err()
}

func rowsToMaps(rows *sql.Rows) ([]map[string]any, error) {
	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}
	out := []map[string]any{}
	for rows.Next() {
		vals := make([]any, len(cols))
		ptrs := make([]any, len(cols))
		for i := range vals {
			ptrs[i] = &vals[i]
		}
		if err := rows.Scan(ptrs...); err != nil {
			return nil, err
		}
		row := make(map[string]any, len(cols))
		for i, c := range cols {
			if b, ok := vals[i].([]byte); ok {
				row[c] = string(b)
			} else {
				row[c] = vals[i]
			}
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

// ingestPayload matches IngestPayload in src/app/api/ingest/route.ts.
type ingestPayload struct {
	Branch         string `json:"branch"`
	CheckoutNumber int    `json:"checkout_number"`
	Date           string `json:"date"`
	Money          struct {
		Cop struct {
			System float64 `json:"system"`
		} `json:"cop"`
		Bs struct {
			PosSystem    float64 `json:"pos_system"`
			MobileSystem float64 `json:"mobile_system"`
		} `json:"bs"`
	} `json:"money"`
}

func newIngestPayload(branch, caja, date string, s Summary) (ingestPayload, error) {
	checkoutNumber, err := strconv.Atoi(caja)
	if err != nil {
		return ingestPayload{}, fmt.Errorf("caja %q is not a valid checkout_number: %w", caja, err)
	}
	var p ingestPayload
	p.Branch = branch
	p.CheckoutNumber = checkoutNumber
	p.Date = date
	p.Money.Cop.System = s.CopSystem
	p.Money.Bs.PosSystem = s.POSSystem
	p.Money.Bs.MobileSystem = s.MobileSystem
	return p, nil
}

// postSummary sends the summary to the app's /api/ingest endpoint, which
// updates the matching register_balances doc's "_system" money fields.
func postSummary(cfg Config, payload ingestPayload) error {
	if cfg.IngestURL == "" || cfg.IngestKey == "" {
		return fmt.Errorf("config is missing \"ingest_url\" or \"ingest_key\"")
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, cfg.IngestURL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-ingest-key", cfg.IngestKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("posting to %s: %w", cfg.IngestURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("ingest returned %s: %s", resp.Status, strings.TrimSpace(string(respBody)))
	}
	return nil
}

func run(cfg Config, queriesPath, date, caja string, doIngest bool, out *os.File) error {
	db, err := sql.Open("mysql", cfg.DSN)
	if err != nil {
		return fmt.Errorf("opening database: %w", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		return fmt.Errorf("connecting to database: %w", err)
	}

	queries, order, err := loadQueries(queriesPath)
	if err != nil {
		return fmt.Errorf("loading queries: %w", err)
	}

	report := make(map[string]any, len(order))
	for _, name := range order {
		args, err := argsFor(name, date, caja)
		if err != nil {
			return err
		}
		rows, err := db.Query(queries[name], args...)
		if err != nil {
			return fmt.Errorf("running query %s: %w", name, err)
		}
		result, err := rowsToMaps(rows)
		rows.Close()
		if err != nil {
			return fmt.Errorf("reading results for %s: %w", name, err)
		}
		report[name] = result
	}

	summary, err := buildSummary(db, queries, date, caja)
	if err != nil {
		return fmt.Errorf("building summary: %w", err)
	}
	report["summary"] = map[string]any{
		"money": map[string]any{
			"bs": map[string]any{
				"pos_system":    summary.POSSystem,
				"mobile_system": summary.MobileSystem,
			},
			"cop": map[string]any{
				"system": summary.CopSystem,
			},
		},
	}

	if doIngest {
		if caja == "" {
			return fmt.Errorf("-caja is required to ingest (a summary needs one specific checkout_number to update)")
		}
		if cfg.Branch == "" {
			return fmt.Errorf("config is missing \"branch\"")
		}
		payload, err := newIngestPayload(cfg.Branch, caja, date, summary)
		if err != nil {
			return err
		}
		if err := postSummary(cfg, payload); err != nil {
			return fmt.Errorf("ingest: %w", err)
		}
		report["ingested"] = true
	}

	enc := json.NewEncoder(out)
	enc.SetIndent("", "  ")
	return enc.Encode(report)
}

func main() {
	// Defaults assume the binary is run from the deployment root (whatever
	// that folder is named) with the layout: config.json, bin/master-machine,
	// master-machine/queries/cash_report.sql — matching what run-daily.ps1
	// copies over and what "agent/" contains in this repo.
	configPath := flag.String("config", "config.json", "path to config.json (see master-machine/config.example.json)")
	queriesPath := flag.String("queries", "master-machine/queries/cash_report.sql", "path to the parameterized query file")
	date := flag.String("date", time.Now().Format("2006-01-02"), "report date (YYYY-MM-DD)")
	caja := flag.String("caja", "", "IDCAJA / checkout code to filter by (empty = all; required to ingest)")
	ingest := flag.Bool("ingest", true, "POST the summary to the app's /api/ingest endpoint")
	flag.Parse()

	cfg, err := loadConfig(*configPath)
	if err != nil {
		log.Fatal(err)
	}

	if err := run(cfg, *queriesPath, *date, *caja, *ingest, os.Stdout); err != nil {
		log.Fatal(err)
	}
}
