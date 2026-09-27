// stock-server is a small always-on HTTP server run on the store's own
// master machine, reachable from outside only via Tailscale Funnel (never
// bound to a public interface directly). It holds a read-only connection
// to ADN's local MariaDB, same DSN convention as agent/master-machine -
// never write to that database (see project CLAUDE.md's hard rule).
//
// GET /products (code/name/price/stock, filterable) is queried directly
// by n8n and the Next.js app over the Funnel URL - no Firestore sync for
// this data, unlike the daily conciliation numbers.
package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// defaultConfigPath resolves to config.json next to the executable itself
// (one level up from bin/, matching how it's laid out on disk), not
// relative to the process's working directory. Task Scheduler, a manual
// double-click, or a terminal opened in some other folder would each start
// this process with a different cwd - config.json must be found the same
// way regardless.
func defaultConfigPath() string {
	exe, err := os.Executable()
	if err != nil {
		return "config.json"
	}
	return filepath.Join(filepath.Dir(exe), "..", "config.json")
}

type Config struct {
	DSN    string `json:"dsn"`
	APIKey string `json:"api_key"`
}

func loadConfig(path string) (Config, error) {
	var cfg Config
	data, err := os.ReadFile(path)
	if err != nil {
		return cfg, fmt.Errorf("reading config %s: %w (copy config.example.json there and fill in your DSN)", path, err)
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, fmt.Errorf("parsing config %s: %w", path, err)
	}
	if cfg.DSN == "" {
		return cfg, fmt.Errorf("config %s: \"dsn\" is empty", path)
	}
	if cfg.APIKey == "" {
		return cfg, fmt.Errorf("config %s: \"api_key\" is empty", path)
	}
	return cfg, nil
}

type Product struct {
	Codigo string  `json:"codigo"`
	Nombre string  `json:"nombre"`
	Precio float64 `json:"precio"`
	Stock  float64 `json:"stock"`
}

// Validated against ADN's own UI: product 010012 shows stock 12, and
// SUM(SALDOF) across its 3 saldoinv rows (CLI/INV/PRO) is -59+0+71=12.
// saldoinv is ADN's own maintained balance snapshot, not a ledger scan -
// full catalog (~10.8k rows) runs in ~1.7s.
//
// PRE_PRECIOCOP, not PRE_PRECIO: the latter is stored in a different base
// currency and needs its own rate conversion (PRE_PRECIOUSD + a rate
// table) to reach the real POS price. PRE_PRECIOCOP is ADN's own
// precomputed real Supermarket price in COP - confirmed against the UI.
const productsBaseQuery = `
SELECT
  p.PDT_CODIGO AS codigo,
  p.PDT_DESCRIPCION AS nombre,
  pr.PRE_PRECIOCOP AS precio,
  IFNULL(s.stock, 0) AS stock
FROM ADN_PRODUCTOS p
INNER JOIN ADN_PRECIOS pr ON pr.PRE_UGR_PDT_CODIGO = p.PDT_CODIGO
LEFT JOIN (
  SELECT CODIGO, SUM(SALDOF) AS stock
  FROM saldoinv
  GROUP BY CODIGO
) s ON s.CODIGO = p.PDT_CODIGO
WHERE p.PDT_ESTADO = "1"`

func writeJSONError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]any{"success": false, "message": message})
}

func handleProducts(db *sql.DB, apiKey string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if key := r.Header.Get("x-ingest-key"); key == "" || key != apiKey {
			writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		q := r.URL.Query()
		query := productsBaseQuery
		var args []any

		if code := q.Get("code"); code != "" {
			query += " AND p.PDT_CODIGO = ?"
			args = append(args, code)
		}
		if name := q.Get("q"); name != "" {
			query += " AND p.PDT_DESCRIPCION LIKE ?"
			args = append(args, "%"+name+"%")
		}
		if maxStock := q.Get("max_stock"); maxStock != "" {
			// References the "stock" SELECT-list alias - MariaDB allows this
			// in HAVING, unlike WHERE.
			query += " HAVING stock <= ?"
			args = append(args, maxStock)
		}

		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()

		rows, err := db.QueryContext(ctx, query, args...)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer rows.Close()

		products := []Product{}
		for rows.Next() {
			var p Product
			if err := rows.Scan(&p.Codigo, &p.Nombre, &p.Precio, &p.Stock); err != nil {
				writeJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			products = append(products, p)
		}
		if err := rows.Err(); err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"success": true, "products": products})
	}
}

func main() {
	port := flag.String("port", "8081", "port to listen on (localhost only)")
	configPath := flag.String("config", defaultConfigPath(), "path to config.json")
	flag.Parse()

	cfg, err := loadConfig(*configPath)
	if err != nil {
		log.Fatal(err)
	}

	db, err := sql.Open("mysql", cfg.DSN)
	if err != nil {
		log.Fatalf("opening DB: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		// Don't fail to start over this - ADN's DB or network may be
		// briefly unavailable and this server should still answer /health
		// (reporting db_ok: false) so the healthcheck workflow can tell
		// "server is down" apart from "server is up, DB is unreachable".
		log.Printf("warning: initial DB ping failed: %v", err)
	}

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
		dbOK := db.PingContext(ctx) == nil

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status": "ok",
			"db_ok":  dbOK,
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	http.HandleFunc("/products", handleProducts(db, cfg.APIKey))

	addr := "127.0.0.1:" + *port
	log.Printf("stock-server listening on %s (localhost only)", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
