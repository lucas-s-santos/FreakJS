#!/usr/bin/env bash
# Compila o CLI do FreakJS para todos os sistemas operacionais.
# Roda no CI (GitHub Actions) antes de criar um Release.
# Requer Bun >= 1.1.0

set -e

ENTRY="cli/index.ts"
OUT="dist/bin"

mkdir -p "$OUT"

echo "Building FreakJS binaries..."

bun build --compile --target=bun-windows-x64   "$ENTRY" --outfile "$OUT/freakjs-windows-x64.exe"
echo "  ✓ windows x64"

bun build --compile --target=bun-linux-x64     "$ENTRY" --outfile "$OUT/freakjs-linux-x64"
echo "  ✓ linux x64"

bun build --compile --target=bun-linux-arm64   "$ENTRY" --outfile "$OUT/freakjs-linux-arm64"
echo "  ✓ linux arm64"

bun build --compile --target=bun-darwin-x64    "$ENTRY" --outfile "$OUT/freakjs-darwin-x64"
echo "  ✓ macOS x64 (Intel)"

bun build --compile --target=bun-darwin-arm64  "$ENTRY" --outfile "$OUT/freakjs-darwin-arm64"
echo "  ✓ macOS arm64 (Apple Silicon)"

echo ""
echo "Binaries ready in $OUT/"
ls -lh "$OUT"
