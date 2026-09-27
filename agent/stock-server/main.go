// stock-server is a small always-on HTTP server run on the store's own
// master machine, reachable from outside only via Tailscale Funnel (never
// bound to a public interface directly). It holds a read-only connection
// to ADN's local MariaDB, same DSN convention as agent/master-machine -
// never write to that database (see project CLAUDE.md's hard rule).
//
// Real stock-query endpoints get added once the inventory report's SQL is
// in hand; they will require the same shared-secret header pattern the
// rest of this project already uses (see agent/master-machine and
// src/app/api/ingest), never bare/open like /health is.
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
	DSN string `json:"dsn"`
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
	return cfg, nil
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

	addr := "127.0.0.1:" + *port
	log.Printf("stock-server listening on %s (localhost only)", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
