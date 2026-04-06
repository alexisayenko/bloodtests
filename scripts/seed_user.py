#!/usr/bin/env python3
"""
Seed script: reads JSON seed data and inserts into Supabase via REST API.

Usage:
    SUPABASE_SERVICE_KEY=sb_secret_... python scripts/seed_user.py --user natalia
    SUPABASE_SERVICE_KEY=sb_secret_... python scripts/seed_user.py --user alex
    SUPABASE_SERVICE_KEY=sb_secret_... python scripts/seed_user.py --user natalia --user-id <UUID>
"""

import argparse
import json
import os
import sys
import urllib.request
from datetime import date
from pathlib import Path

# Fix Windows console encoding for Cyrillic output
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


SUPABASE_URL = "https://hvcfhywtbsxpgjxlvxww.supabase.co"

DEFAULT_USER_IDS = {
    "alex": "f49e8347-87a5-46bf-b771-bb45ede2786f",
    "natalia": "e3b4df38-a086-4139-b3d1-b876ae4349c9",
}

# Per-user lab name corrections
LAB_FIXES = {
    "alex": {
        "2025-08": "NeoGenesis",
        "2026-01": "NeoGenesis",
    },
}

# Default lab name when place is "Unknown Lab" or missing
DEFAULT_LAB = {
    "natalia": "Поликлиника",
}


def supabase_request(path: str, *, method: str, body=None, service_key: str, prefer: str | None = None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else None
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise RuntimeError(f"Supabase {method} {path} ->{e.code}: {error_body}") from e


def main():
    parser = argparse.ArgumentParser(description="Seed blood test data into Supabase")
    parser.add_argument("--user", required=True, help="Seed data folder name (alex, natalia)")
    parser.add_argument("--user-id", help="Override target Supabase user UUID")
    args = parser.parse_args()

    service_key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not service_key:
        print("Set SUPABASE_SERVICE_KEY env var", file=sys.stderr)
        sys.exit(1)

    user_id = args.user_id or DEFAULT_USER_IDS.get(args.user)
    if not user_id:
        print(f'No default UUID for user "{args.user}". Pass --user-id.', file=sys.stderr)
        sys.exit(1)

    root = Path(__file__).resolve().parent.parent
    data_dir = root / "scripts" / "seed-data" / args.user
    results_dir = data_dir / "results-by-date"

    manifest = json.loads((results_dir / "manifest.json").read_text(encoding="utf-8"))
    print(f"Seeding data for user {args.user} ({user_id})...")
    print(f"Found {len(manifest)} test sessions in manifest")

    # Clean existing data for this user before re-seeding
    print(f"Cleaning existing data for user {user_id}...")
    try:
        supabase_request(
            f"results?user_id=eq.{user_id}",
            method="DELETE",
            service_key=service_key,
        )
        supabase_request(
            f"test_sessions?user_id=eq.{user_id}",
            method="DELETE",
            service_key=service_key,
        )
        print("  Cleaned.")
    except RuntimeError as e:
        print(f"  Warning during cleanup: {e}")

    lab_fixes = LAB_FIXES.get(args.user, {})
    today_str = date.today().isoformat()

    # Filter to real entries with actual data
    real_entries = []
    for entry in manifest:
        if entry["date"] > today_str:
            continue
        if entry.get("numericItems", 0) == 0:
            continue
        if args.user == "alex" and entry["place"] == "Unknown Lab" and entry["date"][:7] not in lab_fixes:
            continue
        real_entries.append(entry)

    print(f"Skipping {len(manifest) - len(real_entries)} future/empty/placeholder sessions")

    total_results = 0

    for entry in real_entries:
        file_name = entry["file"].replace("\\", "/").split("/")[-1]
        file_path = results_dir / file_name

        try:
            session_data = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  Skipping {file_name}: {e}")
            continue

        place = session_data.get("place")
        month_key = (session_data.get("date") or "")[:7]
        if month_key in lab_fixes:
            place = lab_fixes[month_key]
        if (not place or place == "Unknown Lab") and args.user in DEFAULT_LAB:
            place = DEFAULT_LAB[args.user]

        # Upsert test_session
        session_row = {
            "user_id": user_id,
            "date": session_data["date"],
            "place": place,
            "source_file": session_data.get("sourceFile"),
        }

        result = supabase_request(
            "test_sessions?on_conflict=user_id,date,place",
            method="POST",
            body=session_row,
            service_key=service_key,
            prefer="return=representation,resolution=merge-duplicates",
        )
        if not result or len(result) == 0:
            print(f"  Error: no session returned for {entry['date']}")
            continue

        session_id = result[0]["id"]
        print(f"  Session {session_data['date']} @ {place} ->{session_id}")

        # Insert results
        items = session_data.get("items", [])
        result_rows = []
        for item in items:
            if item.get("value") is None and item.get("rawValue") is None:
                continue
            result_rows.append({
                "session_id": session_id,
                "user_id": user_id,
                "loinc": item.get("loinc"),
                "analysis": item.get("analysis"),
                "symbol": item.get("symbol"),
                "section": item.get("section"),
                "value": item.get("value"),
                "raw_value": item.get("rawValue"),
                "value_qualifier": item.get("valueQualifier"),
                "unit": item.get("unit"),
                "ref_text": item.get("refText"),
                "ref_min": item.get("refMin"),
                "ref_max": item.get("refMax"),
                "method": item.get("method"),
            })

        if result_rows:
            try:
                supabase_request(
                    "results",
                    method="POST",
                    body=result_rows,
                    service_key=service_key,
                    prefer="return=minimal",
                )
                total_results += len(result_rows)
                print(f"    Inserted {len(result_rows)} results")
            except RuntimeError as e:
                print(f"    Error inserting results: {e}")

    print(f"\nDone! Seeded {len(real_entries)} sessions, {total_results} results.")


if __name__ == "__main__":
    main()
