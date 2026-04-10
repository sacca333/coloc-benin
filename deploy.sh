#!/bin/bash
# deploy.sh — Script de déploiement ColocBénin
set -e

echo "=== ColocBénin — Déploiement ==="

# Vérifier que .env existe
if [ ! -f .env ]; then
  echo "ERREUR : fichier .env manquant. Copiez .env.example en .env et renseignez les valeurs."
  exit 1
fi

# Pull des dernières images / rebuild
echo ">> Construction des images Docker..."
docker compose build --no-cache

echo ">> Démarrage des services..."
docker compose up -d postgres

echo ">> Attente démarrage PostgreSQL..."
sleep 5

echo ">> Migrations base de données..."
docker compose run --rm backend sh -c "npx prisma migrate deploy"

echo ">> Démarrage complet..."
docker compose up -d

echo ">> Statut des services :"
docker compose ps

echo ""
echo "=== Déploiement terminé ==="
echo "Frontend : http://localhost:3000"
echo "Backend  : http://localhost:4000"
echo "Health   : http://localhost:4000/health"
