// Command master-machine looks up each PENDING shift for a checkout/date,
// runs the parameterized ADN cash-register report queries (see
// queries/cash_report.sql) scoped to that shift's own open/close window,
// and posts the resulting summary to the app's /api/ingest endpoint.
package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"net/url"
	"os"
	"regexp"
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

// tokenOrder documents and drives the exact bind-parameter sequence per
// section in queries/cash_report.sql (see that file's own header comment,
// which must stay in sync with this): D=date, C=caja, S=shift start time,
// E=shift end time (S/E as HH:MM:SS local to the shift, not the store's
// whole business day).
var tokenOrder = map[string]string{
	"Datos":     "DDSECCDDSECC",
	"ResumenT1": "DDSECCDDCCSE",
	"ResumenT2": "DDSECCDDSECC",
	"Ventas":    "CCDDSE",
	"Billetes":  "CSE",
}

func argsFor(section, date, caja, shiftStart, shiftEnd string) ([]any, error) {
	order, ok := tokenOrder[section]
	if !ok {
		return nil, fmt.Errorf("unknown query section %q", section)
	}
	args := make([]any, len(order))
	for i, t := range order {
		switch t {
		case 'D':
			args[i] = date
		case 'C':
			args[i] = caja
		case 'S':
			args[i] = shiftStart
		case 'E':
			args[i] = shiftEnd
		}
	}
	return args, nil
}

// Row names from the ResumenT1/ResumenT2 "RESUMEN GENERAL DE CAJA" overview,
// as printed on the summary page of the rendered report (see
// reports_examples/checkout_report_example.pdf).
const (
	nombrePuntoDeVenta       = "PUNTO DE VENTA"
	nombreBanesco            = "BANESCO"
	nombreBancoEfectivoPesos = "BANCO EFECTIVO PESOS"
	nombreEfectivoBolivares  = "EFECTIVO BOLIVARES"
)

// Summary holds the three overview-page totals the app persists, as plain
// float64 (no currency formatting, no string encoding).
type Summary struct {
	POSSystem    float64 // money.bs.pos_system
	MobileSystem float64 // money.bs.mobile_system
	CopSystem    float64 // money.cop.system
	// Bs cash is never legitimate here (only COP/USD cash is received), so any
	// amount is a cashier misfiling; the app flags it and can fold it into COP.
	BsCashSystem float64 // money.bs.cash_system

	// ADN's own COP-per-Bs rate for the shift, derived from the BANCO EFECTIVO
	// PESOS row (ADN prints MONTO / tasaCOP as its "other currency" column).
	// Used as the default for money.bs.cash_cop_rate when Bs cash shows up.
	CopPerBs float64

	// Rows ResumenT1/T2 returned for the shift. 0 means ADN had nothing for
	// this window (wrong caja code, wrong date, window mismatch), so posting
	// would overwrite good system values with zeros.
	RowCount int
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
	case nombreEfectivoBolivares:
		s.BsCashSystem = monto
	}
}

// buildSummary runs ResumenT1 and ResumenT2, scoped to one shift's time
// window, and reduces them to the three overview totals that shift needs.
func buildSummary(db *sql.DB, queries map[string]string, date, caja, shiftStart, shiftEnd string) (Summary, error) {
	var s Summary
	for _, section := range []string{"ResumenT1", "ResumenT2"} {
		args, err := argsFor(section, date, caja, shiftStart, shiftEnd)
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
		s.RowCount++
		applyRow(s, nombre, monto)
		if nombre == nombreBancoEfectivoPesos && monto > 0 {
			s.CopPerBs = math.Round(montoOtraMoneda/monto*1e4) / 1e4
		}
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

// Shift is one PENDING register_balance's shift window, as returned by
// GET <ingest_url>/shifts.
type Shift struct {
	ID        string `json:"id"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
}

// listShifts asks the app which PENDING register_balances exist for this
// branch/checkout/date, so each can be reported on with its own time
// window instead of guessing at a single whole-day match (a checkout can
// have more than one shift/cashier in a day).
func listShifts(cfg Config, caja, date string, includeChecked bool) ([]Shift, error) {
	if cfg.IngestURL == "" || cfg.IngestKey == "" {
		return nil, fmt.Errorf("config is missing \"ingest_url\" or \"ingest_key\"")
	}
	if cfg.Branch == "" {
		return nil, fmt.Errorf("config is missing \"branch\"")
	}

	u, err := url.Parse(cfg.IngestURL)
	if err != nil {
		return nil, fmt.Errorf("parsing ingest_url: %w", err)
	}
	u.Path = strings.TrimSuffix(u.Path, "/") + "/shifts"
	q := u.Query()
	q.Set("branch", cfg.Branch)
	q.Set("checkout_number", caja)
	q.Set("date", date)
	if includeChecked {
		q.Set("include_checked", "true")
	}
	u.RawQuery = q.Encode()

	req, err := http.NewRequest(http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-ingest-key", cfg.IngestKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("listing shifts from %s: %w", u.String(), err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("listing shifts returned %s: %s", resp.Status, strings.TrimSpace(string(body)))
	}

	var result struct {
		Success bool    `json:"success"`
		Shifts  []Shift `json:"shifts"`
		Message string  `json:"message"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("parsing shifts response: %w", err)
	}
	if !result.Success {
		return nil, fmt.Errorf("listing shifts: %s", result.Message)
	}
	return result.Shifts, nil
}

// ingestPayload matches IngestPayload in src/app/api/ingest/route.ts.
type ingestPayload struct {
	DocID        string `json:"doc_id"`
	AllowChecked bool   `json:"allow_checked,omitempty"`
	Money        struct {
		Cop struct {
			System float64 `json:"system"`
		} `json:"cop"`
		Bs struct {
			PosSystem    float64 `json:"pos_system"`
			MobileSystem float64 `json:"mobile_system"`
			CashSystem   float64 `json:"cash_system"`
			CashCopRate  float64 `json:"cash_cop_rate"`
		} `json:"bs"`
	} `json:"money"`
}

func newIngestPayload(docID string, includeChecked bool, s Summary) ingestPayload {
	var p ingestPayload
	p.DocID = docID
	p.AllowChecked = includeChecked
	p.Money.Cop.System = s.CopSystem
	p.Money.Bs.PosSystem = s.POSSystem
	p.Money.Bs.MobileSystem = s.MobileSystem
	p.Money.Bs.CashSystem = s.BsCashSystem
	p.Money.Bs.CashCopRate = s.CopPerBs
	return p
}

// postSummary sends one shift's summary to the app's /api/ingest endpoint,
// which updates that specific register_balances doc's "_system" money
// fields and marks it CHECKED.
func postSummary(cfg Config, payload ingestPayload) error {
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

func run(cfg Config, queriesPath, date, caja string, doIngest, includeChecked bool, out *os.File) error {
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

	shifts, err := listShifts(cfg, caja, date, includeChecked)
	if err != nil {
		return fmt.Errorf("listing shifts: %w", err)
	}
	if len(shifts) == 0 {
		fmt.Fprintf(out, "no eligible shifts found for caja=%s date=%s\n", caja, date)
		return nil
	}

	report := make(map[string]any, len(shifts))
	for _, shift := range shifts {
		shiftReport := make(map[string]any, len(order)+1)
		for _, name := range order {
			args, err := argsFor(name, date, caja, shift.StartTime, shift.EndTime)
			if err != nil {
				return err
			}
			rows, err := db.Query(queries[name], args...)
			if err != nil {
				return fmt.Errorf("running query %s for shift %s: %w", name, shift.ID, err)
			}
			result, err := rowsToMaps(rows)
			rows.Close()
			if err != nil {
				return fmt.Errorf("reading results for %s (shift %s): %w", name, shift.ID, err)
			}
			shiftReport[name] = result
		}

		summary, err := buildSummary(db, queries, date, caja, shift.StartTime, shift.EndTime)
		if err != nil {
			return fmt.Errorf("building summary for shift %s: %w", shift.ID, err)
		}
		shiftReport["summary"] = map[string]any{
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

		if doIngest && summary.RowCount == 0 {
			fmt.Fprintf(out, "SKIPPED shift %s: ADN returned no rows for caja=%s date=%s window=%s..%s - not posting zeros\n",
				shift.ID, caja, date, shift.StartTime, shift.EndTime)
		} else if doIngest {
			if err := postSummary(cfg, newIngestPayload(shift.ID, includeChecked, summary)); err != nil {
				return fmt.Errorf("ingest for shift %s: %w", shift.ID, err)
			}
			shiftReport["ingested"] = true
		}

		report[shift.ID] = shiftReport
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
	caja := flag.String("caja", "", "IDCAJA / checkout code (required)")
	ingest := flag.Bool("ingest", true, "POST each shift's summary to the app's /api/ingest endpoint")
	includeChecked := flag.Bool("include-checked", false, "also reprocess already-CHECKED shifts (e.g. to correct a fixed bug) instead of only PENDING ones")
	flag.Parse()

	if *caja == "" {
		log.Fatal("-caja is required")
	}

	cfg, err := loadConfig(*configPath)
	if err != nil {
		log.Fatal(err)
	}

	if err := run(cfg, *queriesPath, *date, *caja, *ingest, *includeChecked, os.Stdout); err != nil {
		log.Fatal(err)
	}
}
