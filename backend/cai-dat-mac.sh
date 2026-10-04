#!/bin/bash
# Cài đặt 1 lần trên máy Mac. Chạy:  bash cai-dat-mac.sh
set -e
cd "$(dirname "$0")"
if ! command -v brew >/dev/null; then
  echo "Cần cài Homebrew trước: https://brew.sh" ; exit 1
fi
brew install ffmpeg python@3.11
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python -m playwright install chromium
python -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8'); print('Đã tải model Whisper')"
echo ""
echo "Xong. Mở file .env và dán API key Claude vào, rồi chạy:  bash chay-app.sh"
[ -f .env ] || echo "ANTHROPIC_API_KEY=" > .env
