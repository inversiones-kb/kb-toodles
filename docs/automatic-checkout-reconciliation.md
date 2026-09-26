# Automatic Checkout Reconciliation

## The problem

Every cash register in the store runs through two separate systems that never talked to each other: the point-of-sale software (ADN), which records every real sale, card swipe, and mobile payment as it happens, and the app cashiers use to close out their shift, where they manually type in how much cash, card, and mobile payment they believe they collected. Reconciling the two meant an admin manually comparing a printed POS report against whatever the cashier typed — slow, easy to fudge, and easy to get honestly wrong.

## The solution: a bot that reads the register directly

A small background agent — internally called **master-machine** — runs quietly on the same computer as each store's point-of-sale database. Every morning, before the store even opens, it:

1. **Finds every shift that closed the day before**, at every checkout register in the store — including stores that run two shifts per register in a single day (a morning cashier and an afternoon cashier sharing one till).
2. **Queries the real point-of-sale database directly**, scoped to the *exact* time window that shift was open — not the whole business day, the precise minutes that cashier was responsible for.
3. **Pulls the true totals** for cash sales, card/POS terminal batches, and mobile payments (Banesco) straight from the source of truth, with no manual re-typing possible.
4. **Pushes those numbers automatically** into the cashier's shift record in the app, matched to the exact shift, and marks it ready for review.

By the time a manager opens the app in the morning, every shift from the day before already shows the cashier's declared cash count *side by side* with the real, independently-sourced system total — no manual report-pulling, no retyping, no guessing which numbers to trust.

## Daily sync, hands-off

This isn't a one-time script — it's a standing daily job:

- It runs automatically every morning on a fixed schedule, store by store.
- If a store's computer happens to be off at the scheduled time, the job simply runs as soon as the machine is back on — nothing gets skipped, nothing needs to be re-triggered by hand.
- It runs quietly in the background under the machine's own system account, so it doesn't depend on anyone being logged in.

## Why it matters

- **No more manual reconciliation.** The number a manager sees for "what the system says we made" is pulled straight from the register, not typed by a person.
- **Shift-accurate, not just day-accurate.** Two cashiers sharing a register on the same day each get their own correct slice of the day's totals — no double-counting, no gaps.
- **Runs itself.** Once set up, nobody has to remember to run a report or open the point-of-sale software — the numbers are simply there every morning.
- **Same system, every store.** One consistent, automatic process across every branch, instead of ad hoc manual checks that vary by who's on shift.
