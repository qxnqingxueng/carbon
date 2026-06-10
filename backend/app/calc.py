# GHG Protocol calculation engine (Python). Mirrors the frontend calc.js.
FACTORS = {"elec": 0.74, "diesel": 2.68, "gas": 2.02, "steel": 1.46}


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def compute(inp, suppliers, F=None):
    F = F or FACTORS
    e = _num(inp.get("elec")) * F["elec"] / 1000   # Scope 2 (t)
    d = _num(inp.get("diesel")) * F["diesel"] / 1000  # Scope 1
    g = _num(inp.get("gas")) * F["gas"] / 1000        # Scope 1
    s = sum(_num(x.get("t")) * (_num(x.get("f")) or F["steel"]) for x in (suppliers or []))  # Scope 3
    tot = e + d + g + s
    parts = _num(inp.get("parts"))
    per_part = (tot * 1000 / parts) if parts else 0
    return {
        "scope1": round(d + g, 1),
        "scope2": round(e, 1),
        "scope3": round(s, 1),
        "total": round(tot, 1),
        "perPart": round(per_part, 2),
    }


def simulate(inp, suppliers, sim, F=None):
    F = F or FACTORS
    c = compute(inp, suppliers, F)
    scrap_now = _num(inp.get("scrap"))
    cut = max(0.0, scrap_now - _num(sim.get("scrapTgt")))
    e = _num(inp.get("elec")) * F["elec"] / 1000
    s = c["scope3"]
    e2 = e * (1 - _num(sim.get("solar")) / 100)
    s2 = s * (1 - cut / 100)
    proj = e2 + c["scope1"] + s2
    co2_saved = max(0.0, (c["total"] - proj)) * 12
    rm = (_num(sim.get("solar")) / 40) * 40000 + (_num(sim.get("shift")) / 100) * 42000 + (cut / 3.5) * 21000
    return {"projTotal": round(proj, 1), "co2Saved": round(co2_saved), "rm": round(rm)}
