#!/bin/bash

# Pastikan script berhenti jika ada perintah yang error
set -e

# Mengaktifkan Node.js Virtual Environment cPanel
source /home/vidt4129/nodevenv/repositories/web-kknvidyavardhana/backend/22/bin/activate

echo "========================================================"
echo "🚀 MEMULAI UPDATE & RESTART KKN VIDYA VARDHANA..."
echo "========================================================"

# 1. Menarik kode terbaru dari GitHub (paksa ikut GitHub)
echo "[1/2] Menarik kode terbaru dari GitHub..."
git fetch origin
git reset --hard origin/main

# 2. Update dependencies Backend
echo "[2/2] Menginstall/Update library Backend..."
cd backend
npm install
cd ..

# Restart Server (Passenger cPanel)
echo "Merestart Server di cPanel..."
if [ -d "backend/tmp" ]; then
    touch backend/tmp/restart.txt
else
    mkdir -p backend/tmp
    touch backend/tmp/restart.txt
fi

echo "========================================================"
echo "✅ SUKSES! Web berhasil di-update dan server di-restart!"
echo "Silakan hard-refresh (Ctrl+F5) browser Anda."
echo "========================================================"
