# Terminology

## UI Components

| Term | Description |
|------|-------------|
| **Panel** | A card grouping related analyses together (e.g. Thyroid Function, Liver Function) |
| **Panel caption** | The header bar — white text on blue background |
| **Analysis entry** | An individual blood test/biomarker within a panel |
| **Decorative line** | Thin colored vertical line on the left side of a panel, color defined per panel |
| **Panel associated color** | Each panel has a unique color used for the decorative line |

## View Modes

| Mode | Description |
|------|-------------|
| **Minimal** | Shows only panel cards with name and count. Tap to expand into detailed view. |
| **Compact** | Panel cards with analysis names and LOINC codes listed underneath |
| **Detailed** | Single-column layout with full analysis info: name, long common name, description, why, frequency |

## Data Structure

| File | Purpose |
|------|---------|
| `data/analyses.json` | Catalog of all analysis types (LOINC, names, translations, info) |
| `data/panels.json` | Panel definitions with name, color, language variants, and LOINC references |
| `data/users.json` | User list mapping emails/IDs to data folders |
| `data/users/{id}/results.json` | Per-user blood test results |
| `data/users/{id}/planned.json` | Per-user planned tests |

## Analysis Entry Fields

| Field | Description |
|-------|-------------|
| `loinc` | LOINC code (binding key) |
| `longCommonName` | Official LOINC long common name |
| `displayName` | Short English display name with abbreviation |
| `lang.ru-RU` | Russian translation |
| `lang.uk-UA` | Ukrainian translation |
| `info.description` | What this biomarker is |
| `info.why` | Why to measure it |
| `info.frequency` | How often to measure |

## Panel Fields

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (kebab-case) |
| `name` | English panel name |
| `color` | Hex color for decorative line |
| `lang` | Translations (ru-RU, uk-UA) |
| `loincs` | Array of LOINC codes (flat panels) |
| `sections` | Array of sub-sections, each with name, lang, loincs (e.g. FBC) |
