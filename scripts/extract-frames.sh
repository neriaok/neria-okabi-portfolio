#!/usr/bin/env bash
# Usage: ./scripts/extract-frames.sh <clip.mp4> <scene-id> [frames=150]
# Turns a Flow clip into a WebP sequence at public/frames/<scene-id>/0001.webp ...
set -euo pipefail
CLIP="$1"; ID="$2"; N="${3:-150}"
OUT="public/frames/$ID"; mkdir -p "$OUT"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP")
ffmpeg -v error -i "$CLIP" -vf "fps=$N/$DUR,scale=1600:-2" -c:v libwebp -quality 72 "$OUT/%04d.webp"
COUNT=$(ls "$OUT" | wc -l)
python3 "$(dirname "$0")/make-sheets.py" "$OUT" 10 2
echo "Now set SCENES.$ID in src/config/scenes.ts:"
echo "  { type: 'frames', dir: './frames/$ID', count: $COUNT, ext: 'webp', perSheet: 10, cols: 2 }"
