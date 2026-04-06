# Project Plans

## Results Tab

### Fixes
- Don't display analyses marked with "x" — those are planned, not completed
- Fix the names of the laboratories
- Validate correctness of test unit conversions

### Features
- Sort by lab
- Sort by date
- Filter: show only out-of-range (bad) analyses
- Auto conversion between units (ng, mmol, etc.) — needs more thought

---

## Plan Tab

### Planning Periods / Rules
- Select beginning of the cycle (e.g., November)
- Each analysis has a testing period:
  - Once a year
  - Twice a year (every 6 months)
  - Three times a year (every 4 months)
  - Four times a year (every 3 months)
  - On special occasions (e.g., before winter, after summer)
- We already have frequency info in `info.frequency` — formalize it as a number in JSON
- Display default periods for each analysis based on that
- User should be able to correct periods manually where appropriate

### Planning Specific Analyses
- Tags/labels system for each analysis:
  - Personal reason / personal motivation
  - Research condition / research reason
  - Therapy-specific labels (e.g., "Crestor therapy: Efficacy", "Crestor therapy: Safety")
- Tags allow grouping different analyses into packages:
  - High homocysteine: B6, B9, B12, Homocysteine
  - "Purple analyses", "Red analyses"
- Manual comments for each test
- Possibility to skip the next occurrence of a specific analysis

### User Context
- Need to consider user's personal context:
  - Age (e.g., 78 years old)
  - Conditions (e.g., fatty liver, high cholesterol)
  - Therapies (e.g., Crestor therapy)
- This affects recommended frequency and which analyses to include

### View Plan Report (next 12 months)
- **Subsections:**
  1. Planning periods/rules
  2. Planning specific analyses
  3. View plan report

- **Report types:**
  - All planned analyses grouped by panels
  - Grouped by reasons/motivations
  - By months (e.g., "In April I do this, in November this")

- **Analysis card in report should contain:**
  - Panel it belongs to
  - Motivational reason(s) — each on a separate line
  - How often to do
  - When the next time is
  - Possibility to skip the next time

---

## Analytics Tab

### Structure
- Divided by panels or conditions (HPG Axis, Thyroid, etc.)

### Features
- Display relevant test history per panel/condition
- Plot values on charts
- Explain calculated indexes
- Calculate indexes (HOMA-IR, FAI, LDL/HDL ratio, etc.)
- Plot indexes on charts

### Chart Requirements
- Advanced charts showing values outside allowed range
- Reference range bands visible on charts
- Trend visualization (improving / worsening)
