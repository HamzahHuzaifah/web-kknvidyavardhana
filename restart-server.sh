#!/bin/bash

# Pastikan script berhenti jika ada perintah yang error
set -e

# Mengaktifkan Node.js Virtual Environment cPanel
source /home/vidt4129/nodevenv/repositories/web-kknvidyavardhana/backend/22/bin/activate

echo "========================================================"
echo "🚀 MEMULAI UPDATE & RESTART KKN VIDYA VARDHANA..."
echo "========================================================"

# 1. Menarik kode terbaru dari GitHub (paksa ikut GitHub)
echo "[1/3] Menarik kode terbaru dari GitHub..."
git fetch origin
git reset --hard origin/main

# 2. Update dependencies Backend
echo "[2/3] Menginstall/Update library Backend..."
cd backend
npm install
cd ..

# 3. Build Frontend
echo "[3/4] Menginstall library & Build Frontend..."
cd frontend
npm install
npm run build
cd ..

# 4. Deploy hasil build ke public_html (agar tampil di web)
echo "[4/4] Menyalin hasil build ke public_html..."
cp -r frontend/dist/. /home/vidt4129/public_html/
echo "✅ Frontend berhasil di-deploy ke public_html!"

# Restart Server (Nohup Background Process)
echo "[5/5] Merestart Server Node.js di latar belakang..."
cd backend

# Matikan proses node lama yang berjalan dari direktori ini (jangan gunakan killall agar tidak mengganggu web lain)
pkill -f "node server.js" || true

# Tunggu sebentar agar port 5000 benar-benar tertutup
sleep 2

# Jalankan proses baru
nohup node server.js > server.log 2>&1 &
cd ..

echo "========================================================"
echo "✅ SUKSES! Web berhasil di-update dan server di-restart!"
echo "Silakan hard-refresh (Ctrl+F5) browser Anda."
echo "========================================================"
mkdir -p backend/tmp && touch backend/tmp/restart.txt