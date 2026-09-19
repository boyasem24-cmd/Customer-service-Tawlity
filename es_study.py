#!/usr/bin/env python3
"""
ES STUDY - one command, end to end.

    pip install yfinance pandas
    python3 es_study.py                      # SPY daily, 25y  (recommended)
    python3 es_study.py --symbol ES=F        # ES daily, 5y
    python3 es_study.py --interval 5m        # 5-minute, 60 days
    python3 es_study.py --csv myfile.csv     # your own broker export

Fetches the data, runs both studies, prints a verdict. No CSV juggling.

STUDY 1  PotterBox cost-basis rule (the PDF)
           bounce a boundary, clear the 50%, reach the far side
STUDY 2  Six structural rules (close location, rejection, acceptance,
           VWAP, midpoint, 50 EMA) scored on forward returns
CURRENT READ  what's live right now: any open PotterBox signal, plus
           which structural rules are firing on the last bar - each one
           tagged VALIDATED or not against STUDY 2's significance test.
           This section is only as fresh as the data you fed it; re-run
           with current data before treating it as "right now".

Both report against an empirical null built by shuffling your own data,
because analytic nulls hid two biases in earlier versions of this code:
entry geometry inflated hit rates to 60.7% on a pure random walk, and an
unsigned null rigged the return test in a rising market. Shuffling is
the only null that survived both.
"""

import argparse, csv, math, random, sys
from statistics import mean, pstdev

PERIOD = {"1m": "7d", "5m": "60d", "15m": "60d", "30m": "60d",
          "1h": "730d", "1d": "max"}
COST = 1.25                      # ES round-turn, points


# ------------------------------------------------------------------ fetch

def fetch(symbol, interval):
    try:
        import yfinance as yf
    except ImportError:
        sys.exit("Need yfinance:\n    pip install yfinance pandas\n"
                 "Or supply your own file:  python3 es_study.py --csv bars.csv")

    period = PERIOD[interval]
    if symbol == "ES=F" and interval == "1d":
        period = "5y"            # Yahoo has no deep daily history for ES=F
    print(f"fetching {symbol} {interval} over {period} ...")
    df = yf.download(symbol, period=period, interval=interval,
                     auto_adjust=False, progress=False)
    if df is None or df.empty:
        sys.exit("No data. Yahoo throttles - wait a minute, or try --symbol SPY.")

    import pandas as pd
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df.rename(columns=str.lower).reset_index()
    df = df.rename(columns={df.columns[0]: "date"})
    keep = [c for c in ["date", "open", "high", "low", "close", "volume"]
            if c in df.columns]
    df = df[keep].dropna().sort_values("date")
    out = f"{symbol.replace('=','')}_{interval}.csv"
    df.to_csv(out, index=False)
    print(f"  {len(df):,} bars  {df['date'].iloc[0]} -> {df['date'].iloc[-1]}")
    print(f"  saved {out}\n")
    return out


def load(path):
    bars = []
    for r in csv.DictReader(open(path)):
        try:
            b = {"d": r.get("date", ""), "o": float(r["open"]), "h": float(r["high"]),
                 "l": float(r["low"]), "c": float(r["close"]),
                 "v": float(r.get("volume") or 0)}
            if b["l"] <= min(b["o"], b["c"]) and b["h"] >= max(b["o"], b["c"]):
                bars.append(b)
        except (ValueError, KeyError, TypeError):
            pass
    if len(bars) < 80:
        sys.exit(f"Only {len(bars)} usable bars. Need 80+.")
    # chronological
    if len(bars) > 2 and bars[0]["d"] > bars[-1]["d"]:
        bars.reverse()
        print("  (input was newest-first; reversed)\n")
    return bars


# ------------------------------------------------------------------ stats

def wilson(k, n, z=1.96):
    if n == 0:
        return 0.0, 0.0
    p, d = k / n, 1 + z * z / n
    c = p + z * z / (2 * n)
    m = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return (c - m) / d, (c + m) / d


def ema(v, n):
    k, out, e = 2 / (n + 1), [], None
    for x in v:
        e = x if e is None else x * k + e * (1 - k)
        out.append(e)
    return out


def atr(bars, n=20):
    out, trs = [None] * len(bars), []
    for i, b in enumerate(bars):
        tr = b["h"] - b["l"] if i == 0 else max(
            b["h"] - b["l"], abs(b["h"] - bars[i-1]["c"]), abs(b["l"] - bars[i-1]["c"]))
        trs.append(tr)
        if i == n - 1:
            out[i] = sum(trs) / n
        elif i >= n:
            out[i] = (out[i-1] * (n-1) + tr) / n
    return out


# ------------------------------------------------------- study 1: potterbox

def boxes(bars, w, mult, ap=20):
    a, out, t, scale = atr(bars, ap), [], max(w, ap), math.sqrt(w)
    while t < len(bars):
        if not a[t] or a[t] <= 0:
            t += 1; continue
        win = bars[t-w+1:t+1]
        hi, lo = max(x["h"] for x in win), min(x["l"] for x in win)
        if hi - lo <= 0 or hi - lo > mult * a[t] * scale:
            t += 1; continue
        out.append({"form": t, "hi": hi, "lo": lo, "cb": (hi+lo)/2, "rng": hi-lo})
        t += w
    return out


def study1(bars, bxs, horizon=20, tol=0.02, entry="close"):
    res = {"w": 0, "l": 0, "to": 0, "rew": [], "rsk": []}
    for bx in bxs:
        last, prev, fired = None, bars[bx["form"]]["c"], False
        for i in range(bx["form"]+1, min(bx["form"]+1+horizon*2, len(bars))):
            if fired:
                break
            b = bars[i]
            t_ = tol * bx["rng"]
            if not (bx["lo"] - t_ <= b["c"] <= bx["hi"] + t_):
                break
            side = ("long" if last == "low" and prev <= bx["cb"] < b["c"] else
                    "short" if last == "high" and prev >= bx["cb"] > b["c"] else None)
            if side:
                fill = b["c"] if entry == "close" else bx["cb"]
                tgt, stp = ((bx["hi"], bx["lo"]) if side == "long"
                            else (bx["lo"], bx["hi"]))
                res["rew"].append(abs(tgt - fill)); res["rsk"].append(abs(fill - stp))
                o = "to"
                for j in range(i+1, min(i+1+horizon, len(bars))):
                    x = bars[j]
                    ht = x["h"] >= tgt if side == "long" else x["l"] <= tgt
                    hs = x["l"] <= stp if side == "long" else x["h"] >= stp
                    if ht and hs: o = "l"; break
                    if ht: o = "w"; break
                    if hs: o = "l"; break
                res[o] += 1
                fired = True
                continue
            if b["l"] <= bx["lo"] + t_: last = "low"
            if b["h"] >= bx["hi"] - t_: last = "high"
            prev = b["c"]
    return res


def null1(bars, w, mult, draws, horizon, seed=11):
    rnd, shapes, rets = random.Random(seed), [], []
    for i, b in enumerate(bars):
        base = b["o"] or 1.0
        shapes.append(((b["h"]-b["o"])/base, (b["l"]-b["o"])/base,
                       (b["c"]-b["o"])/base, b["v"]))
        rets.append(b["o"]/bars[i-1]["c"] if i and bars[i-1]["c"] else 1.0)
    out = []
    for _ in range(draws):
        idx = list(range(len(shapes))); rnd.shuffle(idx)
        px, syn = bars[0]["o"], []
        for k, j in enumerate(idx):
            dh, dl, dc, v = shapes[j]
            o = px * rets[idx[k-1]] if k else px
            syn.append({"d": "", "o": o, "h": o*(1+dh), "l": o*(1+dl),
                        "c": o*(1+dc), "v": v})
            px = syn[-1]["c"]
        r = study1(syn, boxes(syn, w, mult), horizon)
        if r["w"] + r["l"] >= 5:
            out.append(r["w"] / (r["w"] + r["l"]))
    return sorted(out)


# ------------------------------------------------------- study 2: structure

RULES = {"A": "close location (top/bot quartile)",
         "B": "rejection of 20-bar extreme",
         "C": "acceptance beyond 20-bar extreme",
         "D": "above/below 20-bar VWAP",
         "E": "above/below 20-bar midpoint",
         "F": "touches 50 EMA"}


def compute_signals(bars):
    n = len(bars)
    e50 = ema([b["c"] for b in bars], 50)
    S = {k: [0]*n for k in RULES}
    for i, b in enumerate(bars):
        rng = b["h"] - b["l"]
        clr = (b["c"]-b["l"])/rng if rng > 0 else .5
        if i < 50:
            continue
        w = bars[i-20:i]
        hi, lo = max(x["h"] for x in w), min(x["l"] for x in w)
        tpv = sum(((x["h"]+x["l"]+x["c"])/3)*x["v"] for x in w)
        vol = sum(x["v"] for x in w)
        vwap = tpv/vol if vol > 0 else sum((x["h"]+x["l"]+x["c"])/3 for x in w)/len(w)
        S["A"][i] = 1 if clr >= .75 else -1 if clr <= .25 else 0
        S["B"][i] = 1 if (b["l"] < lo and b["c"] > lo) else -1 if (b["h"] > hi and b["c"] < hi) else 0
        S["C"][i] = 1 if b["c"] > hi else -1 if b["c"] < lo else 0
        S["D"][i] = 1 if b["c"] > vwap else -1
        S["E"][i] = 1 if b["c"] > (hi+lo)/2 else -1
        S["F"][i] = (1 if b["c"] > e50[i] else -1) if b["l"] <= e50[i] <= b["h"] else 0
    return S


def study2(bars, horizons=(1, 3, 5, 10), draws=2000):
    n = len(bars)
    S = compute_signals(bars)
    rnd, results = random.Random(5), []
    for key in RULES:
        for h in horizons:
            allr, sig, signs = [], [], []
            for i in range(50, n-h):
                r = math.log(bars[i+h]["c"]/bars[i]["c"])
                allr.append(r)
                if S[key][i]:
                    sig.append(r*S[key][i]); signs.append(S[key][i])
            if len(sig) < 20:
                continue
            m = mean(sig)
            nulls = []
            for _ in range(draws):
                idx = rnd.sample(range(len(allr)), len(signs))
                sh = signs[:]; rnd.shuffle(sh)
                nulls.append(mean(allr[i]*s for i, s in zip(idx, sh)))
            p = (sum(1 for x in nulls if abs(x) >= abs(m)) + 1)/(draws+1)
            results.append((key, h, len(sig), m, mean(nulls), p))
    return results


# ------------------------------------------------------------- current read

def potterbox_live(bars, bxs, horizon=20, tol=0.02):
    """State of the most recent box: is a signal live right now, or what
    are we waiting on. Mirrors study1()'s walk but stops at the present
    instead of requiring a resolved win/loss."""
    if not bxs:
        return None
    bx = bxs[-1]
    n = len(bars)
    if bx["form"] >= n - 1:
        return {"state": "box just formed, no bars since", "box": bx}

    last, prev = None, bars[bx["form"]]["c"]
    for i in range(bx["form"]+1, n):
        b = bars[i]
        t_ = tol * bx["rng"]
        if not (bx["lo"] - t_ <= b["c"] <= bx["hi"] + t_):
            return {"state": "box invalidated (closed outside range)", "box": bx}
        side = ("long" if last == "low" and prev <= bx["cb"] < b["c"] else
                "short" if last == "high" and prev >= bx["cb"] > b["c"] else None)
        if side:
            fill = b["c"]
            tgt, stp = ((bx["hi"], bx["lo"]) if side == "long"
                        else (bx["lo"], bx["hi"]))
            bars_since = (n - 1) - i
            if bars_since >= horizon:
                return {"state": "signal fired and already expired", "box": bx}
            for j in range(i+1, n):
                x = bars[j]
                ht = x["h"] >= tgt if side == "long" else x["l"] <= tgt
                hs = x["l"] <= stp if side == "long" else x["h"] >= stp
                if ht or hs:
                    outcome = "target hit" if ht and not hs else "stop hit"
                    return {"state": f"signal already resolved ({outcome})",
                            "box": bx, "side": side}
            return {"state": "LIVE SIGNAL", "side": side, "entry": fill,
                    "target": tgt, "stop": stp,
                    "bars_left": horizon - bars_since, "box": bx}
        if b["l"] <= bx["lo"] + t_: last = "low"
        if b["h"] >= bx["hi"] - t_: last = "high"
        prev = b["c"]
    state = "inside box, waiting for a boundary touch" if last is None else \
            f"touched the {last}, waiting for a 50% cross to arm"
    return {"state": state, "box": bx, "last_touch": last}


def latest_signals(bars, res2, alpha, px):
    """Which of the six structural rules are firing on the most recent bar,
    with each one's own historical significance attached."""
    S = compute_signals(bars)
    i = len(bars) - 1
    out = []
    for key in RULES:
        d = S[key][i]
        if d == 0:
            continue
        rows = [x for x in res2 if x[0] == key]
        if not rows:
            continue
        _, h, n_, m, _, p = min(rows, key=lambda x: x[5])
        out.append({"rule": key, "desc": RULES[key], "dir": "long" if d > 0 else "short",
                     "h": h, "n": n_, "p": p, "significant": p < alpha,
                     "edge_pts": (math.exp(m) - 1) * px})
    return out


def print_entries(bars, bxs, res2, alpha, px, horizon):
    print("=" * 78)
    print(f"CURRENT READ   as of {bars[-1]['d']}   close {px:.2f}")
    print("=" * 78)

    live = potterbox_live(bars, bxs, horizon)
    if live is None:
        print(" PotterBox   no boxes formed yet in this sample")
    else:
        bx = live["box"]
        print(f" PotterBox   box [{bx['lo']:.2f} - {bx['hi']:.2f}]  "
              f"mid {bx['cb']:.2f}  formed {bars[bx['form']]['d']}")
        if live["state"] == "LIVE SIGNAL":
            print(f"   >> LIVE {live['side'].upper()} @ {live['entry']:.2f}   "
                  f"target {live['target']:.2f}   stop {live['stop']:.2f}   "
                  f"({live['bars_left']} bars left in horizon)")
        else:
            print(f"   {live['state']}")

    sig = latest_signals(bars, res2, alpha, px)
    print("\n Structural rules firing on the last bar:")
    if not sig:
        print("   none")
    for s in sig:
        flag = "VALIDATED" if s["significant"] else "not significant"
        print(f"   {s['rule']} {s['desc']:<36} -> {s['dir']:<5}  "
              f"(h={s['h']}d n={s['n']} p={s['p']:.4f}  "
              f"hist. edge {s['edge_pts']:+.1f} pts)  [{flag}]")

    print()
    print("This is a backtested statistical read on your own data, not a")
    print("trade recommendation. 'VALIDATED' means the rule cleared its")
    print("Bonferroni-corrected significance bar in STUDY 2 above - it does")
    print("not mean it will work on the next trade. Rows marked 'not")
    print("significant' fired historically but were indistinguishable from")
    print("noise; size and risk accordingly.")


# ------------------------------------------------------------------ main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--symbol", default="SPY")
    ap.add_argument("--interval", default="1d", choices=sorted(PERIOD))
    ap.add_argument("--csv")
    ap.add_argument("--window", type=int, default=10)
    ap.add_argument("--atr-mult", type=float, default=0.75)
    ap.add_argument("--horizon", type=int, default=20)
    ap.add_argument("--draws", type=int, default=200)
    a = ap.parse_args()

    path = a.csv or fetch(a.symbol, a.interval)
    bars = load(path)
    n = len(bars)
    px = bars[-1]["c"]
    rets = [math.log(bars[i+1]["c"]/bars[i]["c"]) for i in range(n-1)]
    sd = pstdev(rets)
    mde = 2.8*sd/math.sqrt(n)

    print("=" * 78)
    print(f"ES STUDY   {n:,} bars   {bars[0]['d']}  ->  {bars[-1]['d']}")
    print("=" * 78)
    print(f"Per-bar sd {sd*100:.3f}%   min detectable effect "
          f"{mde*100:.4f}%  =  {mde*px:.2f} pts")
    if mde*px > COST*3:
        print(f"  !! MDE ({mde*px:.1f} pts) far exceeds cost ({COST} pts). Underpowered:")
        print(f"     a real but modest edge would be invisible. Want ~"
              f"{int((2.8*sd/(COST*1.5/px))**2):,} bars.")
    print()

    # ---- study 1
    bxs = boxes(bars, a.window, a.atr_mult)
    r = study1(bars, bxs, a.horizon)
    rl = study1(bars, bxs, a.horizon, entry="mid")
    print(f"STUDY 1  PotterBox cost basis        boxes {len(bxs)}   signals {r['w']+r['l']}")
    tot = r["w"] + r["l"]
    if tot:
        hit = r["w"]/tot
        rew, rsk = mean(r["rew"]), mean(r["rsk"])
        be = rsk/(rew+rsk)
        lo, _ = wilson(r["w"], tot)
        exp = (r["w"]*rew - r["l"]*rsk)/tot
        print(f"   hit {hit*100:.1f}%  R:R {rew/rsk:.2f}  breakeven {be*100:.1f}%  "
              f"expectancy {exp:+.1f} pts")
        print(f"   verdict: {'EDGE' if lo > be else 'NO EDGE (geometry alone)'}")
        if tot >= 10 and a.draws:
            nd = null1(bars, a.window, a.atr_mult, a.draws, a.horizon)
            if nd:
                pct = 100*sum(1 for x in nd if x < hit)/len(nd)
                q = lambda p: nd[min(len(nd)-1, int(p*len(nd)))]
                print(f"   shuffled null: median {q(.5)*100:.1f}%  p95 {q(.95)*100:.1f}%"
                      f"   -> you are {pct:.0f}th pct  "
                      f"{'REAL' if pct >= 95 else '(indistinguishable)'}")
        tl = rl["w"]+rl["l"]
        if tl:
            print(f"   limit-entry variant: R:R {mean(rl['rew'])/mean(rl['rsk']):.2f}  "
                  f"hit {rl['w']/tl*100:.1f}%  "
                  f"expectancy {(rl['w']*mean(rl['rew'])-rl['l']*mean(rl['rsk']))/tl:+.1f} pts")
    else:
        print("   no signals - sample too small for this rule at this resolution")
    print()

    # ---- study 2
    res = study2(bars)
    print(f"STUDY 2  Structural rules            {len(res)} tests")
    alpha = 0.05/max(1, len(res))
    for key in RULES:
        rows = [x for x in res if x[0] == key]
        if not rows:
            continue
        best = min(rows, key=lambda x: x[5])
        mark = "**" if best[5] < alpha else "  "
        print(f" {mark}{key} {RULES[key]:<36} best p={best[5]:.4f} "
              f"(h={best[1]}, n={best[2]}, edge {(math.exp(best[3])-1)*px:+.1f} pts)")
    surv = [x for x in res if x[5] < alpha]
    naive = [x for x in res if x[5] < 0.05]
    print(f"\n   Bonferroni threshold p<{alpha:.4f}. "
          f"naive p<0.05: {len(naive)} (chance: {len(res)*0.05:.1f}). "
          f"surviving: {len(surv)}")
    print()
    print("-" * 78)
    print("Read the verdict lines, not the hit rates. A rule only counts if it")
    print("beats its own shuffled null AND clears the breakeven implied by its")
    print("actual reward/risk. Both checks exist because earlier versions of")
    print("this code manufactured edge that wasn't there.")
    print()

    # ---- current read (only meaningful with fresh, up-to-date data)
    print_entries(bars, bxs, res, alpha, px, a.horizon)


if __name__ == "__main__":
    main()
