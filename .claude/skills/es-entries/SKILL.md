---
name: es-entries
description: Use when the user asks for a one-off ES (E-mini S&P 500 futures) or SPY trade entry, setup, or "current read" — e.g. "give me ES entries", "any SPY setups right now", "run the ES study", "check the PotterBox". Runs es_study.py to backtest the PotterBox and six structural rules against fresh data, then reports whether anything is live right now and whether that rule has historical, statistically-validated edge. For ongoing/recurring monitoring instead of a single check (e.g. "watch ES", "monitor for setups", "alert me"), use the es-monitor skill instead.
---

# ES / SPY entries

`es_study.py` (repo root) is a self-contained backtest-and-report tool. It
fetches OHLCV data, runs two studies, and — as of the "CURRENT READ" section
added for this skill — reports what's live on the most recent bar. Use it
instead of eyeballing a chart or guessing at a setup.

## Running it

```
python3 es_study.py                      # SPY daily, deepest history (recommended default)
python3 es_study.py --symbol ES=F        # ES front-month continuous, ~5y daily
python3 es_study.py --interval 5m        # 5-minute bars, last 60 days (needs ES=F or a liquid symbol)
python3 es_study.py --csv path.csv       # user-supplied OHLCV export (date,open,high,low,close,volume)
```

If `yfinance` isn't installed, install it first: `pip install yfinance pandas`.
If Yahoo throttles (empty result / rate-limit error), wait ~60s and retry, or
fall back to `--symbol SPY` (much deeper history, same underlying signal).

For anything other than daily bars, be aware `ES=F` intraday history on
Yahoo is short (60 days) — that's normal, not a bug.

## Reading the output for "entries"

Read top to bottom, but the answer to "any entries?" lives in the last
section, **CURRENT READ**:

1. **PotterBox line** — at most one thing can be live: either a box is
   `LIVE SIGNAL` (direction, entry, target, stop, bars left in the horizon
   before it expires) or it's in some waiting/invalidated state. Only ever
   report a PotterBox entry when the state is literally `LIVE SIGNAL`.
2. **Structural rules firing on the last bar** — each rule that has a
   nonzero signal on the most recent bar is listed with its direction and a
   `[VALIDATED]` or `[not significant]` tag. `VALIDATED` means that rule's
   best horizon cleared the Bonferroni-corrected significance bar computed
   in STUDY 2 above it, against this same dataset. Only surface
   `[not significant]` rows as "worth watching, not confirmed" — never
   present them as validated edge.

Before answering, also check the STUDY 1 verdict line (`EDGE` vs
`NO EDGE (geometry alone)`) and STUDY 2's `surviving: N` count. If nothing
survived (`surviving: 0`) and the PotterBox verdict is `NO EDGE`, say so
plainly — "no validated setup right now" is a correct and useful answer, not
a failure to find one.

## What to tell the user

- State the live setup (or that there isn't one) first, then the supporting
  numbers (p-value, sample size n, historical directional edge in points).
- Never drop the distinction between `VALIDATED` and `not significant` —
  that distinction is the entire point of this tool (see the script's
  docstring on why earlier versions manufactured fake edge).
- This is a backtested statistical read on historical data, not investment
  advice, and not a guarantee of future performance. Make that explicit,
  briefly, when giving an entry — don't bury it only in the script's own
  disclaimer.
- The read is only as current as the data pulled. If it's being run for a
  live decision, use the default (fetch, not a stale `--csv`) so the last
  bar is recent, and note the "as of" date/close printed at the top of
  CURRENT READ.
- `--draws` defaults to 200 for the shuffled null in STUDY 1; that's fine
  for a quick check, but if the PotterBox verdict is borderline, mention
  that a higher `--draws` (e.g. 1000+) would tighten the significance
  estimate at the cost of runtime.
