# App "Video Hiệu Ứng Cao Cấp" (Dạng 2)

Khách kéo video nói chuyện vào trang web → app tự edit theo 7 trụ cột → khách tải MP4 1080×1920.

## Cài trên máy Mac (1 lần)
1. Giải nén thư mục này, mở **Terminal**, kéo thư mục vào để `cd` tới đó.
2. Chạy `bash cai-dat-mac.sh` (cài ffmpeg, Python, Whisper, trình dựng đồ hoạ). Mất khoảng 10 phút.
3. Mở file `.env`, dán key Claude: `ANTHROPIC_API_KEY=sk-ant-...`
4. Chạy `bash chay-app.sh` → trình duyệt tự mở `http://localhost:8000`.

## Bán theo lượt
- Thêm vào `.env`: `DANG2_REQUIRE_CODE=1`
- Tạo mã cho khách: `python cli.py tao-ma KHACH01 10` (10 video).
- Lỗi khi edit thì lượt được trả lại tự động.

## App làm gì với mỗi video
| Bước | Việc |
|---|---|
| 1 | Đưa về 9:16, 30fps (video ngang tự crop theo mặt) |
| 2 | Whisper tách lời từng từ (tiếng Việt) |
| 3 | Cắt khoảng lặng ≥0.6s, từ đệm "ừm/à", đoạn lấy đà đầu video (≤40% thời lượng) |
| 4 | Nhận diện mặt, đo năng lượng giọng từng từ |
| 5 | Claude lên kịch bản: zoom, overlay, B-roll, crop mặt, so sánh, từ khoá, thumbnail |
| 6 | Code kiểm luật: hiệu ứng cách nhau ≥6s, tổng ≤40%, crop mặt 1 lần ở giữa |
| 7 | Dựng đồ hoạ động, caption 1-3 từ, từ khoá 2 màu, SFX, xuất MP4 |

Không có API key app vẫn chạy nhưng chỉ có zoom + caption + thumbnail đơn giản.

## Đưa lên mạng cho khách dùng
Máy chủ Linux bất kỳ (VPS 4 CPU / 8GB trở lên): cài ffmpeg + `pip install -r requirements.txt` + `playwright install --with-deps chromium`, chạy
`uvicorn web.app:app --host 0.0.0.0 --port 8000` sau một tên miền có HTTPS.
Mỗi lần chỉ edit 1 video, các video khác xếp hàng.

## Bot Telegram (chạy cùng web)
1. Telegram → @BotFather → `/newbot` → đặt tên → nhận token.
2. Thêm 1 dòng vào file `.env`: `TELEGRAM_BOT_TOKEN=token_của_bạn`
3. Tắt rồi bật lại máy chủ. Khách nhắn bot, gửi video (≤ 20 MB), chọn màu, nhận video thành phẩm.
   Video lớn hơn: bot gửi link web. Web tự hiện nút "Gửi qua Telegram" khi bot chạy.
