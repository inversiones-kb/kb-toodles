package main

import "testing"

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

	wantArgCount := map[string]int{
		"Datos":     8,
		"ResumenT1": 8,
		"ResumenT2": 8,
		"Ventas":    4,
		"Billetes":  1,
	}
	for name, body := range queries {
		if got, want := len(argsForCount(t, name)), wantArgCount[name]; got != want {
			t.Errorf("%s: argsFor returned %d params, want %d", name, got, want)
		}
		if got := placeholderCount(body); got != wantArgCount[name] {
			t.Errorf("%s: query has %d \"?\" placeholders, want %d", name, got, wantArgCount[name])
		}
	}
}

func argsForCount(t *testing.T, section string) []any {
	t.Helper()
	args, err := argsFor(section, "2026-01-01", "01")
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
	applyRow(&s, "SOME OTHER BANK", 999) // must be ignored

	want := Summary{POSSystem: 183690.29, MobileSystem: 3092.87, CopSystem: 417730.00}
	if s != want {
		t.Fatalf("got %+v, want %+v", s, want)
	}
}

func TestNewIngestPayload(t *testing.T) {
	s := Summary{POSSystem: 183690.29, MobileSystem: 3092.87, CopSystem: 417730.00}

	p, err := newIngestPayload("la-fria", "02", "2026-09-24", s)
	if err != nil {
		t.Fatalf("newIngestPayload: %v", err)
	}
	if p.CheckoutNumber != 2 {
		t.Errorf("CheckoutNumber = %d, want 2 (from caja %q)", p.CheckoutNumber, "02")
	}
	if p.Money.Bs.PosSystem != s.POSSystem || p.Money.Bs.MobileSystem != s.MobileSystem || p.Money.Cop.System != s.CopSystem {
		t.Errorf("payload money = %+v, want it to match summary %+v", p.Money, s)
	}

	if _, err := newIngestPayload("la-fria", "", "2026-09-24", s); err == nil {
		t.Error("newIngestPayload with empty caja: want error, got nil")
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
