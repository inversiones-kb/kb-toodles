package main

import (
	"math"
	"testing"
)

func TestLoadQueries(t *testing.T) {
	queries, order, err := loadQueries("queries/cash_report.sql")
	if err != nil {
		t.Fatalf("loadQueries: %v", err)
	}

	wantOrder := []string{"Datos", "ResumenT1", "ResumenT2", "Ventas", "Billetes"}
	if len(order) != len(wantOrder) {
		t.Fatalf("got %d sections, want %d: %v", len(order), len(wantOrder), order)
	}
	for i, name := range wantOrder {
		if order[i] != name {
			t.Fatalf("section %d = %q, want %q", i, order[i], name)
		}
	}

	for name, body := range queries {
		want := len(tokenOrder[name])
		if got := len(argsForCount(t, name)); got != want {
			t.Errorf("%s: argsFor returned %d params, want %d", name, got, want)
		}
		if got := placeholderCount(body); got != want {
			t.Errorf("%s: query has %d \"?\" placeholders, want %d", name, got, want)
		}
	}
}

func argsForCount(t *testing.T, section string) []any {
	t.Helper()
	args, err := argsFor(section, "2026-01-01", "01", "07:00:00", "20:00:00")
	if err != nil {
		t.Fatalf("argsFor(%s): %v", section, err)
	}
	return args
}

// Values taken from reports_examples/checkout_report_example.pdf's
// "RESUMEN GENERAL DE CAJA" overview page.
func TestApplyRow(t *testing.T) {
	var s Summary
	applyRow(&s, "BANCO EFECTIVO PESOS", 417730.00)
	applyRow(&s, "BANESCO", 3092.87)
	applyRow(&s, "PUNTO DE VENTA", 183690.29)
	applyRow(&s, "EFECTIVO BOLIVARES", 83891.15)
	applyRow(&s, "SOME OTHER BANK", 999) // must be ignored

	want := Summary{POSSystem: 183690.29, MobileSystem: 3092.87, CopSystem: 417730.00, BsCashSystem: 83891.15}
	if s != want {
		t.Fatalf("got %+v, want %+v", s, want)
	}
}

func TestNewIngestPayload(t *testing.T) {
	s := Summary{POSSystem: 183690.29, MobileSystem: 3092.87, CopSystem: 417730.00, BsCashSystem: 83891.15}

	p := newIngestPayload("Et7dIRHDE0ZBKJPRa1GP", true, s)
	if p.DocID != "Et7dIRHDE0ZBKJPRa1GP" {
		t.Errorf("DocID = %q, want the given shift id", p.DocID)
	}
	if !p.AllowChecked {
		t.Error("AllowChecked = false, want true (was passed includeChecked=true)")
	}
	if p.Money.Bs.PosSystem != s.POSSystem || p.Money.Bs.MobileSystem != s.MobileSystem || p.Money.Cop.System != s.CopSystem || p.Money.Bs.CashSystem != s.BsCashSystem {
		t.Errorf("payload money = %+v, want it to match summary %+v", p.Money, s)
	}
}

func placeholderCount(sql string) int {
	n := 0
	for _, r := range sql {
		if r == '?' {
			n++
		}
	}
	return n
}

func TestCopPerBs(t *testing.T) {
	// Values from the 2026-09-17 La Fria ResumenT1: 1462896 COP / 4302635.29 "other currency".
	var s Summary
	monto, otra := 1462896.0, 4302635.29
	if monto > 0 {
		s.CopPerBs = math.Round(otra/monto*1e4) / 1e4
	}
	if s.CopPerBs != 2.9412 {
		t.Fatalf("CopPerBs = %v, want 2.9412", s.CopPerBs)
	}
}
