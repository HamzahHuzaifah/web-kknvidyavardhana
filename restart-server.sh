#!/bin/bash

# Pastikan script berhenti jika ada perintah yang error
set -e

# Mengaktifkan Node.js Virtual Environment cPanel
source /home/vidt4129/nodevenv/repositories/web-kknvidyavardhana/backend/22/bin/activate

echo "========================================================"
echo "🚀 MEMULAI UPDATE & RESTART KKN VIDYA VARDHANA..."
echo "========================================================"

# 1. Menarik kode terbaru dari GitHub (paksa ikut GitHub)
echo "[1/4] Menarik kode terbaru dari GitHub..."
git fetch origin
git reset --hard origin/main

# 2. Update dependencies Backend
echo "[2/4] Menginstall/Update library Backend..."
cd backend
npm install
cd ..

# 3. Update & Build Frontend (React)
echo "[3/4] Menginstall & Mem-build Frontend..."
cd frontend
# Hapus node_modules lama agar reinstall dari awal (paksa cPanel menginstall fresh)
rm -rf node_modules
npm install
# Gunakan npx --yes agar otomatis konfirmasi tanpa perlu input manual
npx --yes vite build
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
