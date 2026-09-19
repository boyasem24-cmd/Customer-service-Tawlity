---
name: es-monitor
description: Use when the user wants ongoing/live/recurring monitoring of ES or SPY for trading setups, as opposed to a one-off check — e.g. "watch ES for setups", "monitor ES live", "day-trade monitor", "swing monitor for ES", "alert me when there's an entry". Sets up a recurring check (via the loop skill) that re-runs es_study.py on fresh data and messages the user only when a live PotterBox signal or a newly VALIDATED structural rule is firing. Requires real outbound network access to Yahoo Finance — will not work in a network-restricted sandbox (see the preflight check below).
---

# ES / SPY live monitor

This turns `es_study.py` (see the `es-entries` skill for how to read its
CURRENT READ output) into a recurring watch instead of a one-shot report.
It leans on the `loop` skill for the actual recurring execution — don't
hand-roll a sleep loop.

## Preflight: confirm network access before starting

This only works where the session can actually reach Yahoo Finance. Some
Claude Code environments (e.g. network-restricted cloud sandboxes) proxy
outbound HTTPS and return a hard 403 for finance data domains — in that
case the loop would just fail on every tick.

Before starting a monitor, verify with:

```
python3 -c "import yfinance as yf; d=yf.download('SPY', period='1d', progress=False); print('OK' if not d.empty else 'EMPTY')"
```

If this errors or prints anything other than `OK` (connection error, 403,
empty frame), do not start the loop. Tell the user this environment can't
reach market data and that they need to run it somewhere with normal
internet access (their own machine, most local Claude Code setups). Install
`yfinance`/`pandas` first if missing (`pip install yfinance pandas`).

## Modes

The two modes trade off responsiveness against turnover/risk. Pick the mode
from how the user phrases the request; if it's genuinely unclear, ask.

| Mode    | Command                                        | Check cadence | Profile |
|---------|-------------------------------------------------|---------------|---------|
| `day`   | `python3 es_study.py --symbol ES=F --interval 5m --draws 200`  | ~15 min | Day-trading cadence: more setups, smaller/tighter targets and stops, higher turnover and transaction-cost drag. |
| `swing` | `python3 es_study.py --symbol ES=F --interval 1h --draws 200`  | ~45 min | Fewer, larger setups held longer; lower turnover, more room per stop, less sensitive to Yahoo's intraday rate limits. |

Default to **day** mode when the request is ambiguous (e.g. just "watch
ES"), since that's the more common ask.

`--interval 15m` at a ~25 min cadence is a reasonable middle ground if the
user explicitly wants something between the two.

## Starting it

Use the `loop` skill with the cadence for the chosen mode:

```
/loop 15m <prompt>     # day mode
/loop 45m <prompt>     # swing mode
```

Each firing, the `<prompt>` should have Claude:

1. Run the mode's `es_study.py` command above.
2. If the run errors, is empty, or Yahoo throttles: retry once with
   `--symbol SPY` at the same interval; if that also fails, treat the tick
   as a noop (per the loop skill's noop convention) and move on — do not
   hot-loop retries.
3. Read only the CURRENT READ section of the output.
4. Alert (send the user a message) ONLY if at least one of:
   - the PotterBox line reads `LIVE SIGNAL`, or
   - a structural rule is firing on the last bar AND tagged `[VALIDATED]`.
   A `[not significant]` row alone is never a reason to alert.
5. If nothing qualifies: say nothing, mark the tick a noop, continue. This
   is a deliberate low-noise policy the user chose — don't editorialize
   with "still nothing" messages.
6. When alerting, include: direction (long/short), which rule/box it's
   from, entry/target/stop for a PotterBox signal (or p-value, sample size
   n, and historical directional edge in points for a structural rule), the
   timestamp of the bar the signal is based on, and the same disclaimer
   `es-entries` uses — this is a backtested statistical read on historical
   data, not investment advice, and not a guarantee of future performance.

## Stopping

Stop the loop whenever the user asks to stop, pause, or cancel monitoring,
or via the loop skill's own stop mechanism. Don't restart it on your own
initiative after a user-requested stop.
