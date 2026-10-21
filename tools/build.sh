#!/bin/sh
# Build for Cloudflare Pages: copies only the public site into dist/ (no docs, SQL, tools or notes).
# Cloudflare settings: Build command "sh tools/build.sh", Build output directory "dist".
set -e
rm -rf dist && mkdir -p dist
cp *.html favicon.svg _headers dist/
cp -R css js fonts dist/
rm -f dist/palettes.html
echo "built dist/ with $(find dist -type f | wc -l | tr -d ' ') files"
