# Analysis Tab — Roadmap

## Phase 1: Charts (Time Series)
- [ ] Plot biomarker values over time (line charts)
- [ ] Select a biomarker by LOINC code, see its history across all blood tests
- [ ] Show reference range as shaded band on the chart
- [ ] Out-of-range values highlighted
- [ ] Multiple biomarkers on the same chart for comparison
- [ ] Charting library: Chart.js (CDN) or lightweight SVG/Canvas

## Phase 2: Calculated Indexes
- [ ] HOMA-IR (Homeostatic Model Assessment of Insulin Resistance): fasting glucose x fasting insulin / 405
- [ ] Free Androgen Index (FAI): total testosterone / SHBG x 100
- [ ] LDL/HDL ratio
- [ ] Total Cholesterol / HDL ratio (Atherogenic Index)
- [ ] Triglycerides / HDL ratio
- [ ] eGFR calculation (CKD-EPI formula)
- [ ] Display calculated indexes alongside raw values

## Phase 3: Trend Analysis
- [ ] Trend arrows (improving / worsening / stable) for each biomarker
- [ ] Comparison between two selected dates (side by side)
- [ ] Percentage change calculations
- [ ] Alert badges for consistently out-of-range values

## Phase 4: Reports
- [ ] Summary dashboard with key health indicators
- [ ] Export to PDF
- [ ] Shareable link for doctor review
