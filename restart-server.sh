#!/bin/bash
# =============================================================
# SCRIPT DEPLOY OTOMATIS - KKN VIDYA VARDHANA
# Cara pakai: bash restart-server.sh
# =============================================================

# Mengaktifkan Node.js Virtual Environment cPanel (untuk backend)
source /home/vidt4129/nodevenv/repositories/web-kknvidyavardhana/backend/22/bin/activate

echo "========================================================"
echo "🚀 MEMULAI UPDATE & RESTART KKN VIDYA VARDHANA..."
echo "========================================================"

# 1. Menarik kode terbaru dari GitHub (paksa ikut GitHub)
echo ""
echo "[1/5] ⬇️  Menarik kode terbaru dari GitHub..."
git fetch origin
git reset --hard origin/main
echo "✅ Kode berhasil diperbarui dari GitHub."

# 2. Update dependencies Backend
echo ""
echo "[2/5] 📦 Menginstall/Update library Backend..."
cd backend
npm install
cd ..
echo "✅ Backend dependencies selesai."

# 3. Build Frontend
# PENTING: Dijalankan di subshell ( ) agar tidak terpengaruh nodevenv backend.
# PATH eksplisit ke node_modules/.bin agar vite ditemukan.
echo ""
echo "[3/5] 🔨 Build Frontend (React + Vite)..."
(
  cd frontend
  npm install
  PATH="./node_modules/.bin:$PATH" npm run build
)
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
  echo ""
  echo "❌ ERROR: Frontend build GAGAL! Cek log di atas."
  echo "   Pastikan node_modules/frontend sudah terinstall dengan benar."
  echo "   Web lama masih berjalan (tidak ada perubahan diterapkan)."
  exit 1
fi
echo "✅ Frontend berhasil di-build."

# 4. Deploy hasil build ke public_html
echo ""
echo "[4/5] 🚀 Menyalin hasil build ke public_html..."
cp -r frontend/dist/. /home/vidt4129/public_html/
echo "✅ Frontend berhasil di-deploy ke public_html!"

# 5. Restart Backend Node.js
echo ""
echo "[5/5] 🔄 Merestart Server Node.js..."
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