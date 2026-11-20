#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

rm -rf -- _site
mkdir _site
cp -R sketches/img sketches/live _site/

# The source is a page fragment. Add the document header for static hosting.
{
  printf '<!doctype html>\n<html lang="ru">\n<meta charset="utf-8" />\n'
  cat sketches/pause.html
} > _site/index.html
