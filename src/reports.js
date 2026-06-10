// Builds the IFRS S2 / CBAM report HTML and exports it (print-to-PDF or .doc download).
// Same substantive structure as the standalone sample documents.
import { toast, esc } from './util.js'

export function reportHTML(type, narr = {}) {
  let body
  if (type === 'ifrs') {
    body = `<h1>Climate-related Financial Disclosures</h1>
<p class="meta">Creative Bliss Sdn Bhd — FY2026 · Prepared under IFRS S2 (ISSB) with IFRS S1 · Currency RM · Scope 2 location-based · Draft pending external assurance</p>
<h2>1. Governance</h2><p>${esc(narr.gov || '')}</p>
<p>The Board Sustainability Committee meets quarterly; a management ESG Working Group owns data, calculation and the rule-based reduction roadmap. Climate is embedded in capex appraisal via an internal shadow carbon price of RM 50/tCO2e.</p>
<h2>2. Strategy</h2><p>${esc(narr.strat || '')}</p>
<h3>2.1 Climate-related risks &amp; opportunities</h3>
<table><tr><th>Risk / opportunity</th><th>Type</th><th>Horizon</th><th>Potential effect</th></tr>
<tr><td>EU CBAM border charge</td><td>Transition — policy</td><td>Short–medium</td><td>Higher EU landed cost; margin / contract risk</td></tr>
<tr><td>MNC Scope 3 data demands</td><td>Transition — market</td><td>Short</td><td>Loss of approved-supplier status</td></tr>
<tr><td>Grid tariff &amp; carbon intensity</td><td>Transition — market</td><td>Medium</td><td>Higher Scope 2 cost &amp; emissions</td></tr>
<tr><td>Heat / flooding (Penang)</td><td>Physical</td><td>Long</td><td>Production disruption</td></tr>
<tr><td>Efficiency &amp; on-site solar</td><td>Opportunity</td><td>Medium</td><td>Lower cost &amp; emissions</td></tr></table>
<h3>2.2 Anticipated financial effects</h3>
<table><tr><th>Item</th><th class="n">Estimated effect (RM/yr)</th></tr>
<tr><td>CBAM charge on EU-bound goods</td><td class="n">50,000–200,000</td></tr>
<tr><td>Identified operational savings (3 actions)</td><td class="n">71,000 saving</td></tr>
<tr><td>Rooftop-solar pilot (capex, FY2027)</td><td class="n">1,200,000</td></tr></table>
<h3>2.3 Resilience &amp; scenario analysis</h3>
<p>Qualitative assessment against orderly (≤1.5°C), disorderly and hot-house (&gt;3°C) scenarios: the strategy is resilient provided the intensity and renewable-electricity targets are met.</p>
<h2>3. Risk Management</h2>
<p>Climate risks are identified from customer and regulatory requirements, industry sources and operational review, scored on likelihood and financial impact, and managed on the same register as enterprise risk. Reduction actions come from an explainable rule engine; ~20% of edge cases go to expert review and no figure is produced without a traceable factor.</p>
<h2>4. Metrics &amp; Targets</h2>
<h3>4.1 GHG emissions (GHG Protocol)</h3>
<table><tr><th>Scope</th><th>Description</th><th class="n">tCO2e</th></tr>
<tr><td>Scope 1</td><td>Direct — diesel &amp; gas on-site</td><td class="n">11.6</td></tr>
<tr><td>Scope 2 (location-based)</td><td>Purchased electricity</td><td class="n">88.8</td></tr>
<tr><td>Scope 3 (Cat. 1)</td><td>Purchased materials (steel)</td><td class="n">124.1</td></tr>
<tr class="tot"><td colspan="2">Total</td><td class="n">224.5</td></tr></table>
<p>Intensity 2.40 kg CO2e/part vs 2.10 benchmark (14% above). Internal carbon price RM 50/tCO2e.</p>
<h3>4.2 Targets</h3>
<table><tr><th>Target</th><th>Baseline</th><th>Goal</th></tr>
<tr><td>GHG intensity (kg/part)</td><td>2.56</td><td>2.10 by FY2027</td></tr>
<tr><td>Renewable electricity</td><td>0%</td><td>30% by FY2028</td></tr>
<tr><td>Scrap rate</td><td>9.5%</td><td>6.0% by FY2027</td></tr></table>
<h3>4.3 Transition plan</h3><p>${esc(narr.plan || '')}</p>
<h2>5. Basis of preparation</h2>
<p>Emissions = activity data × published factor; operational-control boundary; Scope 2 location-based. Factors: electricity 0.74 kg/kWh (Energy Commission/MGTC), diesel 2.68 kg/L, gas 2.02 kg/m³, steel 1.46 t/t (DEFRA/IPCC).</p>`
  } else {
    body = `<h1>CBAM Embedded Emissions Communication</h1>
<p class="meta">Creative Bliss Sdn Bhd — Q2 2026 (Apr–Jun) · Installation-operator data under Regulation (EU) 2023/956 · Actual monitored data, verification pending</p>
<h2>1. Operator &amp; installation</h2>
<table><tr><td>Installation operator</td><td>Creative Bliss Sdn Bhd</td></tr>
<tr><td>Installation &amp; address</td><td>Plant 1, Bayan Lepas Industrial Park, 11900 Penang, Malaysia</td></tr>
<tr><td>Economic activity</td><td>Cold metal stamping of steel components</td></tr></table>
<h2>2. Goods covered</h2>
<table><tr><th>CN code</th><th>Category</th><th class="n">Quantity</th><th>Origin</th></tr>
<tr><td>7326 90 98</td><td>Other articles of iron or steel</td><td class="n">96.0 t</td><td>Malaysia</td></tr>
<tr><td>— batch SB-4471</td><td>Stamped bracket</td><td class="n">18.4 t</td><td>Malaysia</td></tr></table>
<h2>3. Process &amp; precursors</h2>
<p>Cold stamping of purchased steel coil; no on-site smelting. Precursors: hot-rolled coil (0.62 t/t) and cold-rolled sheet (0.40 t/t), cradle-to-gate emissions included (complex-good treatment).</p>
<h2>4. Embedded emissions</h2>
<table><tr><th>Component</th><th>Definition</th><th class="n">tCO2e/t</th></tr>
<tr><td>Direct</td><td>On-site fuel (Scope 1 eq.)</td><td class="n">0.18</td></tr>
<tr><td>Indirect</td><td>Purchased electricity (Scope 2 eq.)</td><td class="n">0.76</td></tr>
<tr><td>Precursor</td><td>Cradle-to-gate steel</td><td class="n">1.46</td></tr>
<tr class="tot"><td colspan="2">Total specific embedded emissions</td><td class="n">2.40</td></tr></table>
<h2>5. Carbon price at origin</h2><p>No carbon pricing mechanism applied in Q2 2026; carbon price paid: RM 0. (Malaysia carbon tax under consideration.)</p>
<h2>6. Comparison vs EU default</h2>
<table><tr><th>Basis</th><th class="n">tCO2e/t</th><th>Effect</th></tr>
<tr><td>Actual (this report)</td><td class="n">2.40</td><td>Lower obligation</td></tr>
<tr><td>EU default (markup)</td><td class="n">3.15</td><td>+31% vs actual</td></tr></table>
<p>Using actual data avoids ~72 tCO2e of charged emissions on the quarter vs the default value.</p>
<h2>7. Verification</h2><p>Transitional-period actual data; accredited third-party verification to be engaged ahead of the definitive-phase requirement.</p>`
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CarbonDesk Report</title><style>body{font-family:Georgia,serif;color:#111;max-width:740px;margin:32px auto;padding:0 26px;line-height:1.55}h1{font-size:23px;color:#1b4332;border-bottom:3px solid #2d6a4f;padding-bottom:8px;margin-bottom:6px}h2{font-size:13px;text-transform:uppercase;letter-spacing:.6px;color:#2d6a4f;margin-top:22px}h3{font-size:13px;color:#333;margin:14px 0 4px}.meta{color:#666;font-size:12px;margin-bottom:6px}p{font-size:13px;margin:6px 0}table{width:100%;border-collapse:collapse;margin:8px 0;font-size:12.5px}th,td{text-align:left;padding:7px 9px;border-bottom:1px solid #ddd;vertical-align:top}th{background:#eef3ec;color:#2d6a4f;font-size:11px;text-transform:uppercase}.n{text-align:right}.tot td{font-weight:bold;border-top:2px solid #111}.foot{margin-top:28px;color:#999;font-size:11px;border-top:1px solid #ddd;padding-top:10px}</style></head><body>${body}<div class="foot">Generated by CarbonDesk · GHG Protocol method · ${type === 'ifrs' ? 'IFRS S2' : 'EU CBAM'} · Demonstration data.</div></body></html>`
}

export function exportPDF(type, narr) {
  const w = window.open('', '_blank')
  if (!w) { toast('Allow pop-ups to export PDF', '⚠'); return }
  w.document.write(reportHTML(type, narr)); w.document.close(); w.focus()
  setTimeout(() => w.print(), 500)
  toast('Opening print view — choose Save as PDF', '✓')
}
export function exportWord(type, narr) {
  const blob = new Blob(['﻿' + reportHTML(type, narr)], { type: 'application/msword' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = (type === 'ifrs' ? 'IFRS-S2_FY2026' : 'CBAM_Q2_2026') + '.doc'
  document.body.appendChild(a); a.click(); a.remove()
  toast('Word document downloaded', '✓')
}
