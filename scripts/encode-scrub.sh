#!/usr/bin/env bash
# Usage: ./scripts/encode-scrub.sh <clip.mp4> <name> [extra ffmpeg -vf filters]
# Encodes a Flow clip for scroll scrubbing: a keyframe on every frame (instant seeks), no audio,
# fast start. Output: public/scenes/<name>.mp4
set -euo pipefail
CLIP="$1"; NAME="$2"; VF="${3:-null}"
mkdir -p public/scenes
ffmpeg -v error -y -i "$CLIP" -vf "$VF" -an -c:v libx264 -preset slow -crf 22 -g 1 -keyint_min 1 \
  -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart "public/scenes/$NAME.mp4"
echo "done → public/scenes/$NAME.mp4 ($(du -h "public/scenes/$NAME.mp4" | cut -f1))"
