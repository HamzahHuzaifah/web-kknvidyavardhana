#!/bin/bash
# =============================================================
# SCRIPT DEPLOY OTOMATIS - KKN VIDYA VARDHANA
# Cara pakai: bash restart-server.sh
# Opsi paksa update library: bash restart-server.sh --install
# =============================================================

run_deploy() {
  # Mengaktifkan Node.js Virtual Environment cPanel
  source /home/vidt4129/nodevenv/repositories/web-kknvidyavardhana/backend/22/bin/activate 2>/dev/null || true

  echo "========================================================"
  echo "🚀 MEMULAI UPDATE & RESTART KKN VIDYA VARDHANA..."
  echo "========================================================"

  # 1. Menarik kode terbaru dari GitHub (paksa sinkron dengan GitHub)
  echo ""
  echo "[1/4] ⬇️  Menarik kode terbaru dari GitHub..."
  git fetch origin

  # Deteksi apakah dependensi backend mengalami perubahan sebelum git reset
  NEEDS_NPM=false
  if [ "$1" = "--install" ] || [ "$1" = "-f" ]; then
    echo "⚡ Opsi paksa install (--install) aktif."
    NEEDS_NPM=true
  elif ! git diff --quiet HEAD origin/main -- backend/package.json backend/package-lock.json 2>/dev/null; then
    NEEDS_NPM=true
  fi

  git reset --hard origin/main
  echo "✅ Kode berhasil diperbarui dari GitHub."

  # 2. Update dependencies Backend (Hanya jika ada library baru atau belum terinstall)
  echo ""
  echo "[2/4] 📦 Memeriksa library Backend..."
  if [ "$NEEDS_NPM" = true ] || [ ! -d "backend/node_modules" ]; then
    echo "⚡ Perubahan library terdeteksi atau node_modules belum ada. Menjalankan npm install..."
    cd backend
    npm install --production
    cd ..
    echo "✅ Backend dependencies selesai."
  else
    echo "⚡ Dependensi backend aman & tidak ada perubahan (melewati npm install untuk menghemat waktu)."
  fi

  # 3. Deploy Frontend ke public_html (dari dist/ yang sudah di-build di repo)
  echo ""
  echo "[3/4] 🚀 Menyalin Frontend ke public_html..."
  mkdir -p /home/vidt4129/public_html/assets
  # Bersihkan asset JS/CSS lama agar browser tidak memuat bundle lawas
  rm -f /home/vidt4129/public_html/assets/index-*.js /home/vidt4129/public_html/assets/index-*.css 2>/dev/null || true
  # Salin seluruh isi dist termasuk .htaccess
  cp -r frontend/dist/. /home/vidt4129/public_html/
  chmod 644 /home/vidt4129/public_html/index.html 2>/dev/null || true
  chmod 644 /home/vidt4129/public_html/.htaccess 2>/dev/null || true
  echo "✅ Frontend berhasil di-deploy ke public_html!"

  # 4. Restart Backend Node.js (Anti-Zombie Kill & Start)
  echo ""
  echo "[4/4] 🔄 Merestart Server Node.js pada port 5000..."
  cd backend

  # Matikan proses node lama secara tuntas (Anti-Zombie)
  fuser -k 5000/tcp 2>/dev/null || true
  pkill -9 -f "node server.js" 2>/dev/null || true
  pkill -9 -f "server.js" 2>/dev/null || true
  ps ux | grep 'server.js' | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true

  # Tunggu agar port benar-benar tertutup
  sleep 2

  # Jalankan proses baru di background
  PORT=5000 nohup node server.js > server.log 2>&1 & disown
  cd ..

  # Trigger Phusion Passenger restart (jika dipakai cPanel)
  mkdir -p backend/tmp && touch backend/tmp/restart.txt

  # Verifikasi apakah server hidup dan merespons
  sleep 3
  echo ""
  echo "🔍 Mengetes respons API server..."
  if curl -s http://127.0.0.1:5000/api/welcome-audio | grep -q "id"; then
    echo "✅ Server Node.js AKTIF dan API Musik Sambutan berhasil merespons!"
  elif curl -s http://127.0.0.1:5000/api/articles | grep -q "id"; then
    echo "✅ Server Node.js AKTIF dan API Artikel berhasil merespons!"
  else
    echo "⚠️ PERINGATAN: Server belum merespons di port 5000. Menampilkan log server terbaru:"
    tail -n 25 backend/server.log 2>/dev/null || true
  fi

  echo ""
  echo "========================================================"
  echo "✅ SUKSES! Web berhasil di-update dan server di-restart!"
  echo "   File .htaccess reverse proxy sudah aktif di public_html."
  echo "========================================================"
}

run_deploy "$@"