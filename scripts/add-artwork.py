#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Helper script for the artist to add new artworks to the gallery portfolio.
Handles image conversion to WebP, metadata generation (EN/RU/ES), aspect ratio,
and validation with automated build.

Usage:
  # Interactive mode:
  py -3 scripts/add-artwork.py

  # Command line mode:
  py -3 scripts/add-artwork.py --title "Dragon Sorceress" --cat commission --year 2026 --images art1.png --labels "Full Render"
"""

import sys
import os
import json
import shutil
import argparse
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO_FILE = ROOT / "assets" / "portfolio-data.js"
GALLERY_DIR = ROOT / "assets" / "gallery"

def load_portfolio():
    raw = PORTFOLIO_FILE.read_text(encoding="utf-8")
    data = json.loads(raw.split(" = ", 1)[1].rstrip(";\n"))
    return raw, data

def save_portfolio(data):
    formatted = "const PORTFOLIO_WORKS = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
    PORTFOLIO_FILE.write_text(formatted, encoding="utf-8")

def get_next_id(works):
    return max(w["id"] for w in works) + 1

def process_image(src_path, dest_filename):
    src = Path(src_path)
    if not src.is_file():
        raise FileNotFoundError(f"Source file not found: {src_path}")
    
    dest = GALLERY_DIR / dest_filename
    with Image.open(src) as img:
        width, height = img.size
        # Convert and save as optimized WebP if needed
        if src.suffix.lower() == ".webp":
            shutil.copy2(src, dest)
        else:
            img.save(dest, "WEBP", quality=92, method=6)
    
    return f"/assets/gallery/{dest_filename}", f"{width} / {height}"

def main():
    parser = argparse.ArgumentParser(description="Add new artwork to Nek'tahr gallery")
    parser.add_argument("--title", help="Artwork title (English)")
    parser.add_argument("--cat", choices=["commission", "adopt", "ych", "other"], help="Artwork category")
    parser.add_argument("--year", type=int, default=2026, help="Year of creation")
    parser.add_argument("--images", nargs="+", help="Path(s) to source images")
    parser.add_argument("--labels", nargs="+", help="Stage label(s), e.g. Sketch 'Color Sketch' 'Full Render'")
    parser.add_argument("--nsfw", nargs="+", type=bool, default=[], help="True/False per image for 18+ content")
    parser.add_argument("--dry-run", action="store_true", help="Preview output without saving")
    args = parser.parse_args()

    raw, works = load_portfolio()
    next_id = get_next_id(works)

    # Interactive mode if arguments are missing
    title = args.title
    if not title:
        print(f"=== Add New Artwork to Portfolio (Next ID: {next_id}) ===")
        title = input("Artwork Title (EN) [e.g. Dragon Slayer]: ").strip()
        if not title:
            print("Title cannot be empty.")
            return

    cat = args.cat
    if not cat:
        print("Categories: 1) commission  2) adopt  3) ych  4) other")
        cat_choice = input("Select category [1-4, default 1]: ").strip() or "1"
        cat_map = {"1": "commission", "2": "adopt", "3": "ych", "4": "other"}
        cat = cat_map.get(cat_choice, "commission")

    year = args.year

    image_paths = args.images
    if not image_paths:
        imgs_input = input("Source image file path(s) [space-separated]: ").strip()
        image_paths = [p.strip().strip("'\"") for p in imgs_input.split() if p.strip()]
        if not image_paths:
            print("At least one image is required.")
            return

    # Process images
    slug = "".join(c if c.isalnum() else "-" for c in title.lower()).strip("-")
    web_images = []
    aspect = "1 / 1"
    source_names = []
    nsfw_flags = []

    for i, p in enumerate(image_paths):
        p_path = Path(p)
        source_names.append(p_path.name)
        dest_name = f"gal-{cat}-{slug}-{i+1}.webp" if len(image_paths) > 1 else f"gal-{cat}-{slug}.webp"
        web_path, asp = process_image(p_path, dest_name)
        web_images.append(web_path)
        if i == 0:
            aspect = asp
        
        # Check if user flagged NSFW
        is_nsfw = "nsfw" in p_path.name.lower()
        if i < len(args.nsfw):
            is_nsfw = args.nsfw[i]
        nsfw_flags.append(is_nsfw)

    # Labels
    raw_labels = args.labels or (["Full Render"] if len(image_paths) == 1 else [f"Stage {i+1}" for i in range(len(image_paths))])
    while len(raw_labels) < len(image_paths):
        raw_labels.append(f"Stage {len(raw_labels)+1}")

    full_title = f"{title} · {year}"
    record = {
        "id": next_id,
        "title": full_title,
        "titles": {
            "en": full_title,
            "ru": full_title,
            "es": full_title
        },
        "type": "single" if len(image_paths) == 1 else "stages",
        "images": web_images,
        "labels": {
            "en": raw_labels,
            "ru": raw_labels,
            "es": raw_labels
        },
        "nsfw": nsfw_flags,
        "thumb": 0,
        "gallery": True,
        "cat": cat,
        "aspect": aspect,
        "sourceFiles": source_names
    }

    print("\nGenerated record:")
    print(json.dumps(record, indent=2, ensure_ascii=False))

    if args.dry_run:
        print("\n[Dry Run] Changes were not saved.")
        return

    works.append(record)
    save_portfolio(works)
    print(f"\nSuccessfully added artwork ID {next_id} to portfolio-data.js!")

    # Synchronize build and run validation
    print("Running scripts/build.py...")
    import subprocess
    subprocess.run([sys.executable, str(ROOT / "scripts" / "build.py")], check=True)
    print("Running npm test...")
    subprocess.run(["npm", "test"], shell=True, check=True)
    print("\nAll tests passed! New artwork is ready to be committed and deployed.")

if __name__ == "__main__":
    main()
