# Data Model

## Overview

```
data/
  analyses.json              # Shared catalog of all analysis types
  panels.json                # Panel definitions with colors and LOINC refs
  users.json                 # User directory
  users/
    alex/
      results.json           # Alex's blood test results
      planned.json           # Alex's planned tests
    user2/
      results.json
      planned.json
```

## analyses.json

Array of analysis type objects. Each analysis is identified by its LOINC code.

```json
{
  "loinc": "11580-8",
  "longCommonName": "Thyrotropin [Units/volume] in Serum or Plasma",
  "displayName": "TSH",
  "lang": {
    "ru-RU": "Тиреотропный гормон (ТТГ)",
    "uk-UA": "Тиреотропний гормон (ТТГ)"
  },
  "info": {
    "description": "Pituitary hormone that controls thyroid gland activity.",
    "why": "Primary screening test for hypothyroidism and hyperthyroidism.",
    "frequency": "Annually; every 6-8 weeks when adjusting thyroid medication"
  }
}
```

## panels.json

Array of panel objects. Panels reference analyses by LOINC code.

### Flat panel (most panels)
```json
{
  "id": "thyroid",
  "name": "Thyroid Function",
  "color": "#fbbf24",
  "lang": { "ru-RU": "Щитовидная железа", "uk-UA": "Щитоподібна залоза" },
  "loincs": ["11580-8", "3051-0", "3024-7"]
}
```

### Sectioned panel (e.g. FBC)
```json
{
  "id": "fbc",
  "name": "Full Blood Count (FBC)",
  "color": "#fca5a5",
  "lang": { "ru-RU": "Общий анализ крови (ОАК)", "uk-UA": "Загальний аналіз крові (ЗАК)" },
  "sections": [
    {
      "name": "Leukocytes and Differentials",
      "lang": { "ru-RU": "Лейкоциты и лейкоцитарная формула" },
      "loincs": ["6690-2", "751-8", "731-0"]
    }
  ]
}
```

## results.json (per user)

Flat array of individual result entries. Each entry references an analysis by LOINC code.

```json
{
  "loinc": "11580-8",
  "value": 2.5,
  "unit": "mIU/mL",
  "refMin": 0.4,
  "refMax": 4.0,
  "place": "City Lab",
  "date": "2025-12-10",
  "method": "ECLIA"
}
```

## planned.json (per user)

```json
{
  "id": "plan1",
  "plannedDate": "2026-06-15",
  "testType": "Complete Blood Count",
  "notes": "Follow-up for iron levels"
}
```

## users.json

```json
[
  { "id": "alex", "name": "Alex", "email": "alex@example.com" }
]
```
