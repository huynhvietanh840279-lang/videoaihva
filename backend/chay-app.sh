#!/bin/bash
# Mở app. Sau đó vào trình duyệt:  http://localhost:8000
cd "$(dirname "$0")"
source .venv/bin/activate
set -a; [ -f .env ] && source .env; set +a
( sleep 2; open http://localhost:8000 ) &
uvicorn web.app:app --host 0.0.0.0 --port 8000
