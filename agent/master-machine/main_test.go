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
	applyRow(&s, "SOME OTHER BANK", 999) // must be ignored

	want := Summary{POSSystem: 183690.29, MobileSystem: 3092.87, CopSystem: 417730.00}
	if s != want {
		t.Fatalf("got %+v, want %+v", s, want)
	}
}

func TestNewIngestPayload(t *testing.T) {
	s := Summary{POSSystem: 183690.29, MobileSystem: 3092.87, CopSystem: 417730.00}

	p := newIngestPayload("Et7dIRHDE0ZBKJPRa1GP", s)
	if p.DocID != "Et7dIRHDE0ZBKJPRa1GP" {
		t.Errorf("DocID = %q, want the given shift id", p.DocID)
	}
	if p.Money.Bs.PosSystem != s.POSSystem || p.Money.Bs.MobileSystem != s.MobileSystem || p.Money.Cop.System != s.CopSystem {
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
