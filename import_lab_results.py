import argparse
import csv
import json
import re
import shutil
from datetime import datetime
from pathlib import Path
from collections import defaultdict


PROFILES = {
    "alex": {
        "month_header_row": 4,
        "lab_header_rows": (6, 7),
        "data_start_row": 9,
        "value_start_col": 12,
        "col_section": 0,
        "col_symbol": 2,
        "col_source_loinc": 3,
        "col_analysis": 4,
        "col_ref_text": 5,
        "col_unit": 6,
    },
    "natalia": {
        "month_header_row": 0,
        "lab_header_rows": (1,),
        "data_start_row": 5,
        "value_start_col": 9,
        "col_section": 0,
        "col_symbol": 3,
        "col_source_loinc": None,
        "col_analysis": 4,
        "col_analysis_alt": 5,
        "col_ref_text": 6,
        "col_unit": 7,
    },
}


RAW_MANUAL_SYMBOL_TO_LOINC = {
    "WBC": "6690-2",
    "NEUT#": "751-8",
    "NEUT%": "770-8",
    "LYMPH#": "731-0",
    "LYMPH%": "736-9",
    "MONO#": "742-7",
    "MONO%": "5905-5",
    "EO#": "711-2",
    "EO%": "713-8",
    "BASO#": "704-7",
    "BASO%": "706-2",
    "RBC": "789-8",
    "HGB, Hb": "718-7",
    "HB": "718-7",
    "Hb": "718-7",
    "HCT": "4544-3",
    "MCV": "787-2",
    "MCH": "785-6",
    "MCHC": "786-4",
    "RDW-CV": "788-0",
    "RDW-SD": "21000-5",
    "PLT": "777-3",
    "MPV": "32623-1",
    "PDW": "32207-3",
    "P-LCR": "58410-2",
    "PCT": "61928-1",
    "TSH": "11580-8",
    "FT3": "3051-0",
    "FT4": "3024-7",
    "CT": "1992-7",
    "GLU": "2339-0",
    "HBA1C (NGSP)": "4548-4",
    "HBA1C (IFCC)": "59261-8",
    "ALP": "6768-6",
    "DBIL": "1968-7",
    "IBIL": "1971-1",
    "TBIL": "1975-2",
    "AST, SGOT": "1920-8",
    "ALT, SGPT": "1742-6",
    "GGT": "2324-2",
    "PCHE": "2710-2",
    "HBSAG": "5195-3",
    "ALB": "1751-7",
    "TP": "2885-2",
    "IGA": "1988-5",
    "IGG": "30522-7",
    "TC": "2093-3",
    "HDL-C": "2085-9",
    "LDL-C": "13457-7",
    "TRIG": "2571-8",
    "APOB": "1884-6",
    "APOA1": "1869-7",
    "LP(A)": "10835-7",
    "CRP": "1988-5",
    "HSCRP": "30522-7",
    "IL-6": "26881-3",
    "TNF-A": "3167-4",
    "OXLDL": "49246-0",
    "T": "14913-8",
    "FT": "2991-8",
    "SHBG": "2942-1",
    "FSH": "15067-2",
    "LH": "10501-5",
    "E2": "2243-4",
    "PRL": "15081-3",
    "DHT": "26454-9",
    "DHEA-S": "2191-5",
    "VITAMIN B1": "32700-7",
    "VITAMIN B6": "2842-3",
    "VITAMIN B9": "2284-8",
    "VITAMIN B12": "2132-9",
    "VITAMIN D": "1989-3",
    "CA": "17861-6",
    "ICA": "1994-3",
    "CL": "2075-0",
    "P": "2777-1",
    "K": "2823-3",
    "MG": "19123-9",
    "MG (RBC)": "29900-7",
    "NA": "2950-4",
    "ZN": "35937",
    "PTH": "2731-8",
    "FE": "2498-4",
    "FERR": "2276-4",
    "TIBC": "2500-7",
    "UIBC": "2501-5",
    "TRF": "3034-6",
    "APTT": "3173-2",
    "INR": "6301-6",
    "PT": "5902-2",
    "ESR": "30341-2",
    "ACTH": "2141-0",
    "RF": "11572-5",
    "IGF-1": "2484-4",
    "PSA": "2857-1",
    "ANTI-TPO": "5765-3",
    "ANTI-TG": "5380-1",
    "TRAB": "57350-7",
    "P-LCR": "58410-2",
    "P-LCC": "71696-2",
    "CK": "2157-6",
    "ACCP": "53027-9",
    "CA 125": "10334-1",
    "CEA": "2039-6",
    "EGFR": "98979-8",
    "TCA": "17861-6",
    "HBA1C(NGSP)": "4548-4",
    "HBA1C(IFCC)": "59261-8",
}


RAW_MANUAL_ANALYSIS_TO_LOINC = {
    "INSULIN TOTAL": "20448-7",
    "C-PEPTIDE": "1986-0",
    "AMYLASE": "1798-8",
    "ANTI-HCV": "16128-1",
    "LIPASE": "3040-3",
    "THROMBIN TIME": "3243-3",
    "ANTITHROMBIN (ACTIVITY)": "3174-0",
    "% IRON SATURATION (DIRECT)": "2502-3",
    "CREATINE KINASE": "2157-6",
    "ANTI CYCLIC CITRULLINATED PEPTIDE": "53027-9",
    "ESTIMATED GLOMERULAR FILTRATION RATE": "98979-8",
    "CYSTATIN-C": "33863-2",
    "ACTIVATED PARTIAL THROMBOPLASTIN TIME": "3173-2",
    "PROTHROMBIN TIME": "5902-2",
    "INTERNATIONAL NORMALIZED RATIO": "6301-6",
    "ANTI-THYROID PEROXIDASE ANTIBODIES": "5765-3",
    "ANTI-THYROGLOBULIN ANTIBODIES": "5380-1",
    "TSH RECEPTOR ANTIBODIES": "57350-7",
    "CALCITONIN": "1992-7",
    "HEPATITIS B SURFACE ANTIGEN": "5195-3",
    "VITAMIN ACTIVE-B12": "25959-2",
    "1,25-DIHYDROXYVITAMIN D": "1995-0",
    "CA 125": "10334-1",
    "CEA": "2039-6",
    "PROTHROMBIN INDEX": "5894-1",
    "ПРОТРОМБИРОВАННЫЙИНДЕКС": "5894-1",
    "GLOBULIN": "10834-0",
    "ATHEROGENIC INDEX - RISK FACTOR": "9830-1",
    "LEPTIN": "2293-7",
    "ADIPONECTIN": "56660-9",
    "HOMOCYSTEINE": "2160-0",
    "FIBRINOGEN": "3255-7",
    "THIAMINE": "32700-7",
    "PYRIDOXAL-5-PHOSPHATE": "2842-3",
    "FOLATE": "2284-8",
    "COBALAMIN": "2132-9",
    "25-HYDROXYVITAMIN D": "1989-3",
    "CALCIUM": "17861-6",
    "IONIZED CALCIUM": "1994-3",
    "CHLORIDE": "2075-0",
    "PHOSPHORUS": "2777-1",
    "POTASSIUM": "2823-3",
    "MAGNESIUM": "19123-9",
    "MAGNESIUM (ERYTHROCYTE)": "29900-7",
    "SODIUM": "2950-4",
    "ZINK": "35937",
    "PARATHYROID HORMONE": "2731-8",
    "IRON SERUM": "2498-4",
    "FERRITIN": "2276-4",
    "TOTAL IRON BINDING CAPACITY": "2500-7",
    "UNSATURATED IRON-BINDING CAPACITY": "2501-5",
    "TRANSFERRIN SERUM": "3034-6",
    "% IRON SATURATION (CALC)": "2502-3",
    "UREA": "3094-0",
    "CREATININE": "12190-5",
    "URIC ACID": "3084-1",
    "D-DIMMER": "48065-7",
    "D-DIMER": "48065-7",
    "ERYTHROCYTE SEDIMENTATION RATE": "30341-2",
    "CORTISOL": "2143-6",
    "SOMATOMEDIN C": "2484-4",
    "PROSTATE-SPECIFIC ANTIGEN": "2857-1",
    "DIHYDROTESTOSTERONE": "26454-9",
}


def normalize(text: str) -> str:
    text = text or ""
    text = text.strip()
    text = text.replace("µ", "u").replace("μ", "u").replace("α", "a")
    return re.sub(r"[^A-Za-zА-Яа-яЁё0-9%]+", "", text).upper()


MANUAL_SYMBOL_TO_LOINC = {normalize(key): value for key, value in RAW_MANUAL_SYMBOL_TO_LOINC.items()}
MANUAL_ANALYSIS_TO_LOINC = {normalize(key): value for key, value in RAW_MANUAL_ANALYSIS_TO_LOINC.items()}


def parse_number(text: str):
    if text is None:
        return None
    cleaned = text.strip()
    if not cleaned:
        return None
    if cleaned in {"x", "X", "-", "?", "—"}:
        return None
    cleaned = cleaned.replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_value(text: str):
    raw = (text or "").strip()
    if not raw or raw in {"x", "X", "-", "?", "—"}:
        return None, None, False
    match = re.fullmatch(r"([<>]=?)?\s*(-?\d+(?:\.\d+)?)", raw.replace(",", ""))
    if match:
        qualifier = match.group(1)
        value = float(match.group(2))
        return value, qualifier, qualifier is None
    return None, None, False


def parse_reference_range(text: str):
    raw = (text or "").strip()
    if not raw:
        return None, None
    normalized = raw.replace("–", "-").replace("—", "-")
    range_match = re.fullmatch(r"\s*(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*", normalized)
    if range_match:
        return float(range_match.group(1)), float(range_match.group(2))
    upper_match = re.fullmatch(r"\s*<\s*(-?\d+(?:\.\d+)?)\s*", normalized)
    if upper_match:
        return None, float(upper_match.group(1))
    lower_match = re.fullmatch(r"\s*>\s*(-?\d+(?:\.\d+)?)\s*", normalized)
    if lower_match:
        return float(lower_match.group(1)), None
    return None, None


def parse_month(text: str) -> str | None:
    month = (text or "").strip()
    if not month:
        return None
    dt = datetime.strptime(month, "%b %y")
    return dt.strftime("%Y-%m-01")


def load_catalog_lookup(analyses_path: Path):
    analyses = json.loads(analyses_path.read_text(encoding="utf-8"))
    lookup = {}
    for analysis in analyses:
        names = {analysis.get("displayName", ""), analysis.get("longCommonName", "")}
        for name in list(names):
            match = re.search(r"\(([^)]+)\)", name)
            if match:
                names.add(match.group(1))
        for name in names:
            key = normalize(name)
            if key and key not in lookup:
                lookup[key] = analysis["loinc"]
    return lookup


def resolve_loinc(symbol: str, analysis: str, loinc: str, catalog_lookup: dict[str, str]) -> str | None:
    if loinc:
        return loinc
    for key in (normalize(symbol), normalize(analysis)):
        if not key:
            continue
        if key in MANUAL_SYMBOL_TO_LOINC:
            return MANUAL_SYMBOL_TO_LOINC[key]
        if key in MANUAL_ANALYSIS_TO_LOINC:
            return MANUAL_ANALYSIS_TO_LOINC[key]
        if key in catalog_lookup:
            return catalog_lookup[key]
    return None


def cell(row: list[str], index: int) -> str:
    return row[index].strip() if index < len(row) else ""


def combine_place(*values: str) -> str | None:
    parts = []
    for value in values:
        value = (value or "").strip()
        if value and value not in parts:
            parts.append(value)
    return " / ".join(parts) if parts else None


def slugify(text: str) -> str:
    value = (text or "unknown").strip().lower()
    value = value.replace("/", " ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "unknown"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--data-dir", default="data")
    args = parser.parse_args()

    root = Path.cwd()
    data_dir = root / args.data_dir
    user_dir = root / "scripts" / "seed-data" / args.user
    imports_dir = user_dir / "imports"
    grouped_dir = user_dir / "results-by-date"
    imports_dir.mkdir(parents=True, exist_ok=True)
    grouped_dir.mkdir(parents=True, exist_ok=True)

    input_path = Path(args.input)
    copied_input_path = imports_dir / input_path.name
    shutil.copy2(input_path, copied_input_path)

    catalog_lookup = load_catalog_lookup(data_dir / "analyses.json")
    with copied_input_path.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.reader(handle, delimiter="\t"))

    profile = PROFILES.get(args.user, PROFILES["alex"])

    month_headers = rows[profile["month_header_row"]]
    lab_rows = [rows[index] for index in profile["lab_header_rows"]]

    parsed_entries = []
    grouped_entries = defaultdict(list)
    current_section = None

    for row in rows[profile["data_start_row"]:]:
        if not any(c.strip() for c in row[:max(profile["col_unit"] + 1, 7)]):
            continue
        section = cell(row, profile["col_section"]) or current_section
        current_section = section
        symbol = cell(row, profile["col_symbol"])
        source_loinc = cell(row, profile["col_source_loinc"]) if profile["col_source_loinc"] is not None else ""
        analysis = cell(row, profile["col_analysis"])
        analysis_alt = cell(row, profile["col_analysis_alt"]) if profile.get("col_analysis_alt") is not None else ""
        ref_text = cell(row, profile["col_ref_text"])
        unit = cell(row, profile["col_unit"])
        loinc = resolve_loinc(symbol, analysis or analysis_alt, source_loinc, catalog_lookup)
        ref_min, ref_max = parse_reference_range(ref_text)

        for column in range(profile["value_start_col"], len(month_headers)):
            raw_value = cell(row, column)
            if not raw_value:
                continue
            date = parse_month(cell(month_headers, column))
            if not date:
                continue
            value, qualifier, is_plain_numeric = parse_value(raw_value)
            place = combine_place(*(cell(lab_row, column) for lab_row in lab_rows))
            parsed_entry = {
                "sourceFile": copied_input_path.name,
                "section": section,
                "symbol": symbol or None,
                "analysis": analysis or None,
                "loinc": loinc,
                "date": date,
                "place": place,
                "rawValue": raw_value,
                "value": value,
                "valueQualifier": qualifier,
                "unit": unit or None,
                "refText": ref_text or None,
                "refMin": ref_min,
                "refMax": ref_max,
            }
            parsed_entries.append(parsed_entry)

    parsed_entries.sort(key=lambda item: (item["date"], item.get("section") or "", item.get("analysis") or "", item.get("rawValue") or ""))
    for entry in parsed_entries:
        grouped_entries[(entry["date"], entry["place"] or "Unknown Lab")].append(entry)

    parsed_json_path = imports_dir / (input_path.stem + ".json")
    parsed_json_path.write_text(json.dumps(parsed_entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    manifest = []
    for key in sorted(grouped_entries):
        date, place = key
        items = grouped_entries[key]
        items.sort(key=lambda item: (item.get("section") or "", item.get("analysis") or "", item.get("symbol") or ""))
        file_name = f"{date}__{slugify(place)}.json"
        group_path = grouped_dir / file_name
        payload = {
            "date": date,
            "place": place,
            "sourceFile": copied_input_path.name,
            "items": items,
        }
        group_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        manifest.append({
            "date": date,
            "place": place,
            "file": str(group_path.relative_to(user_dir)),
            "items": len(items),
            "mappedItems": sum(1 for item in items if item["loinc"]),
            "numericItems": sum(1 for item in items if item["value"] is not None),
        })

    manifest_path = grouped_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    unresolved = sorted({f"{entry['section']} | {entry['symbol'] or entry['analysis']}" for entry in parsed_entries if entry["loinc"] is None})
    print(json.dumps({
        "copiedInput": str(copied_input_path),
        "parsedJson": str(parsed_json_path),
        "resultsByDateDir": str(grouped_dir),
        "manifest": str(manifest_path),
        "parsedEntries": len(parsed_entries),
        "groupFiles": len(manifest),
        "unresolvedAnalytes": unresolved,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
