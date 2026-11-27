#!/usr/bin/env bash
# Builds the dashboard's photo library from the repository's own photographs.
# Portraits are cropped to 4:5, scenes to 16:9, and every file gets -480/-800
# variants so the `photoSrcSet` helper can serve responsive sizes.
set -euo pipefail

SRC="/home/user/nalyanya/src/assets/images"
OUT="/home/user/nalyanya/dashbaord/public/images"
MEM="$OUT/memorial"
FAM="$OUT/family"

mkdir -p "$MEM" "$FAM"

portrait() { # src dst
  convert "$1" -auto-orient -resize "800x1000^" -gravity center -extent 800x1000 \
    -quality 82 -interlace Plane "$2"
}

landscape() { # src dst
  convert "$1" -auto-orient -resize "1400x900^" -gravity center -extent 1400x900 \
    -quality 82 -interlace Plane "$2"
}

# ── Memorial portraits (4:5) ──────────────────────────────────────────────
portrait "$SRC/elder.jpg"            "$MEM/mzee-victor.jpg"
portrait "$SRC/leader-matriarch.jpg" "$MEM/esther-nanjala.jpg"
portrait "$SRC/leader-finance.jpg"   "$MEM/rebecca-auma.jpg"
portrait "$SRC/trade-farmer.jpg"     "$MEM/joseph-wafula.jpg"
portrait "$SRC/trade-photo.jpg"      "$MEM/daniel-wafula.jpg"
portrait "$SRC/trade-nurse.jpg"      "$MEM/faith-auma.jpg"
portrait "$SRC/trade-tailor.jpg"     "$MEM/mary-nanjala.jpg"
portrait "$SRC/trade-boda.jpg"       "$MEM/samuel-kipkoech.jpg"
portrait "$SRC/trade-electric.jpg"   "$MEM/hellen-nasimiyu.jpg"
portrait "$SRC/leader-foundation.jpg" "$MEM/grace-adhiambo.jpg"

# ── Memorial scenes (16:9) ────────────────────────────────────────────────
landscape "$SRC/congregation.jpg"      "$MEM/memorial-church.jpg"
landscape "$SRC/traditional-group.jpg" "$MEM/memorial-family.jpg"
landscape "$SRC/reunion.jpg"           "$MEM/memorial-reunion.jpg"
landscape "$SRC/graduation.jpg"        "$MEM/memorial-graduation.jpg"
landscape "$SRC/wedding.jpg"           "$MEM/memorial-wedding.jpg"
landscape "$SRC/family-traditional.jpg" "$MEM/memorial-home.jpg"
landscape "$SRC/savanna.jpg"           "$MEM/memorial-dusk.jpg"
landscape "$SRC/tea-hills.jpg"         "$MEM/memorial-fields.jpg"
landscape "$SRC/school.jpg"            "$MEM/memorial-school.jpg"
landscape "$SRC/choir.jpg"             "$MEM/memorial-choir.jpg"

# ── Family portraits used by the tree, the directory and the shell ───────
portrait "$SRC/elder.jpg"             "$FAM/mzee-victor.jpg"
portrait "$SRC/leader-matriarch.jpg"  "$FAM/esther-matriarch.jpg"
portrait "$SRC/leader-head.jpg"       "$FAM/brian.jpg"
portrait "$SRC/trade-nurse.jpg"       "$FAM/faith.jpg"
portrait "$SRC/leader-foundation.jpg" "$FAM/grace.jpg"
portrait "$SRC/trade-tailor.jpg"      "$FAM/naomi.jpg"
portrait "$SRC/trade-photo.jpg"       "$FAM/peter.jpg"
portrait "$SRC/trade-boda.jpg"        "$FAM/samuel.jpg"
portrait "$SRC/leader-finance.jpg"    "$FAM/ruth.jpg"
portrait "$SRC/trade-farmer.jpg"      "$FAM/joseph.jpg"
portrait "$SRC/trade-mason.jpg"       "$FAM/daniel.jpg"
portrait "$SRC/trade-electric.jpg"    "$FAM/hellen.jpg"
portrait "$SRC/trade-mechanic.jpg"    "$FAM/elias.jpg"
portrait "$SRC/graduation.jpg"        "$FAM/ethan.jpg"

# ── Family scenes ────────────────────────────────────────────────────────
landscape "$SRC/traditional-group.jpg" "$FAM/elder-stick.jpg"
landscape "$SRC/reunion.jpg"           "$FAM/reunion.jpg"
landscape "$SRC/wedding.jpg"           "$FAM/wedding.jpg"
landscape "$SRC/family-traditional.jpg" "$FAM/reunion-attire.jpg"
landscape "$SRC/grandmother.jpg"       "$FAM/sunday-lunch.jpg"
landscape "$SRC/graduation.jpg"        "$FAM/graduation.jpg"
landscape "$SRC/outdoor-graduation.jpg" "$FAM/graduation-outdoor.jpg"
landscape "$SRC/contact-writing.jpg"   "$FAM/archive.jpg"
landscape "$SRC/grandmother.jpg"       "$FAM/album.jpg"
landscape "$SRC/contact-office.jpg"    "$FAM/hands-album.jpg"
landscape "$SRC/choir.jpg"             "$FAM/harambee.jpg"
landscape "$SRC/tea-hills.jpg"         "$FAM/elgon.jpg"
landscape "$SRC/trade-nurse.jpg"       "$FAM/clinic.jpg"
landscape "$SRC/nairobi.jpg"           "$FAM/picnic.jpg"
landscape "$SRC/school.jpg"            "$FAM/meeting.jpg"
landscape "$SRC/savanna.jpg"           "$FAM/birthday.jpg"

# ── Responsive variants (480 / 800) for every generated photo ───────────
for dir in "$MEM" "$FAM"; do
  for f in "$dir"/*.jpg; do
    base="${f%.jpg}"
    [ -f "${base}-480.jpg" ] && continue
    convert "$f" -resize 480x -quality 78 "${base}-480.jpg"
    convert "$f" -resize 800x -quality 80 "${base}-800.jpg"
  done
done

echo "memorial: $(ls "$MEM" | wc -l) files · family: $(ls "$FAM" | wc -l) files"
du -sh "$MEM" "$FAM"
