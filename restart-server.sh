#!/bin/bash
# =============================================================
# SCRIPT DEPLOY OTOMATIS - KKN VIDYA VARDHANA
# Cara pakai: bash restart-server.sh
#
# Catatan: Frontend (dist/) sudah di-build di lokal dan disimpan
# di GitHub. Script ini HANYA perlu menarik kode & deploy ke server.
# =============================================================

# Mengaktifkan Node.js Virtual Environment cPanel
source /home/vidt4129/nodevenv/repositories/web-kknvidyavardhana/backend/22/bin/activate

echo "========================================================"
echo "🚀 MEMULAI UPDATE & RESTART KKN VIDYA VARDHANA..."
echo "========================================================"

# 1. Menarik kode terbaru dari GitHub (paksa ikut GitHub)
echo ""
echo "[1/4] ⬇️  Menarik kode terbaru dari GitHub..."
git fetch origin
git reset --hard origin/main
echo "✅ Kode berhasil diperbarui dari GitHub."

# 2. Update dependencies Backend
echo ""
echo "[2/4] 📦 Menginstall/Update library Backend..."
cd backend
npm install
cd ..
echo "✅ Backend dependencies selesai."

# 3. Deploy Frontend ke public_html (dari dist/ yang sudah ada di repo)
echo ""
echo "[3/4] 🚀 Menyalin Frontend ke public_html..."
cp -r frontend/dist/. /home/vidt4129/public_html/
echo "✅ Frontend berhasil di-deploy ke public_html!"

# 4. Restart Backend Node.js
echo ""
echo "[4/4] 🔄 Merestart Server Node.js..."
cd backend

# Matikan proses node lama
pkill -f "node server.js" || true

# Tunggu sebentar agar port benar-benar tertutup
sleep 2

# Jalankan proses baru di background
nohup node server.js > server.log 2>&1 &
cd ..

# Trigger Phusion Passenger restart (jika dipakai)
mkdir -p backend/tmp && touch backend/tmp/restart.txt

echo ""
echo "========================================================"
echo "✅ SUKSES! Web berhasil di-update dan server di-restart!"
echo "   Lakukan hard-refresh (Ctrl+F5) di browser Anda."
echo "========================================================"