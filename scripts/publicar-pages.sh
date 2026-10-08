#!/usr/bin/env bash
# Compila la demo y la publica en la rama gh-pages de este repositorio.
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm build:pages

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp -r frontend/dist/. "$tmp"
touch "$tmp/.nojekyll"

git -C "$tmp" init -q -b gh-pages
git -C "$tmp" add -A
git -C "$tmp" commit -q -m "Publicar demo"
git -C "$tmp" push -q --force "$(git remote get-url origin)" gh-pages
echo "Publicado en la rama gh-pages."
