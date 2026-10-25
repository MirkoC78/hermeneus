#!/bin/sh
# Pubblica Hermeneus su GitHub: invia il ramo main e copia dist/sito nel ramo gh-pages,
# da cui GitHub Pages serve il sito. Prima: node build.js, node test/run-all.js e commit.
# Uso: sh tools/pubblica.sh
set -e
cd "$(dirname "$0")/.."
if [ -n "$(git status --porcelain -- build.js src dist)" ]; then
  echo "Ci sono modifiche non ancora salvate in git: fai prima il commit."
  exit 1
fi
git push origin main
git push origin "$(git subtree split --prefix dist/sito):refs/heads/gh-pages"
echo "Inviato: il sito si aggiorna in un paio di minuti."
