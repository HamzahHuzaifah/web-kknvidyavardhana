#!/bin/bash

# Pastikan script berhenti jika ada perintah yang error
set -e

# Mengaktifkan Node.js Virtual Environment cPanel
source /home/vidt4129/nodevenv/repositories/web-kknvidyavardhana/backend/22/bin/activate

echo "========================================================"
echo "🚀 MEMULAI UPDATE & RESTART KKN VIDYA VARDHANA..."
echo "========================================================"

# 1. Menarik kode terbaru dari GitHub
echo "[1/4] Menarik kode terbaru dari GitHub..."
git pull

# 2. Update dependencies Backend
echo "[2/4] Menginstall/Update library Backend..."
cd backend
npm install
cd ..

# 3. Update & Build Frontend (React)
echo "[3/4] Menginstall & Mem-build Frontend..."
cd frontend
# Kita menggunakan --include=dev karena cPanel mem-blokir vite secara default (NODE_ENV=production)
npm install --include=dev
npm run build
cd ..

# 4. Restart Server (Passenger cPanel)
echo "[4/4] Merestart Server di cPanel..."
# cPanel (Phusion Passenger) akan otomatis merestart aplikasi Node.js 
# jika mendeteksi adanya perubahan (touch) pada file tmp/restart.txt
# Asumsi root aplikasi di cPanel diset ke folder backend
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
