# HVA Video Studio

Web edit video nói chuyện bằng AI: khách kéo video vào, máy chủ tự cắt khoảng lặng, zoom theo cảm xúc,
chèn hoạt hoạ minh hoạ, caption động, từ khoá 2 màu, crop bám mặt, so sánh trước/sau, rồi trả về MP4 1080×1920.

- **Web**: https://videoaihva.lovable.app
- **Sửa trong Lovable**: https://lovable.dev/projects/0de4f500-0237-47af-8d5f-96356929a5ca

## Cấu trúc
| Thư mục | Là gì | Chạy ở đâu |
|---|---|---|
| `src/` | Giao diện web (TanStack Start) | Lovable |
| `backend/` | Máy chủ edit video (Python, ffmpeg, Whisper, Claude) | Render hoặc VPS (Docker) |

## Nối web với máy chủ edit
1. Đưa `backend/` lên Render: render.com → **New → Blueprint** → chọn repo này (dùng `render.yaml`).
   Nhập `ANTHROPIC_API_KEY` khi được hỏi. Cần gói có ít nhất 2 CPU / 4GB RAM.
2. Lấy địa chỉ máy chủ (vd `https://hva-video-api.onrender.com`).
3. Trong Lovable, thêm biến môi trường `VITE_API_URL` = địa chỉ đó rồi Publish lại.
   Chưa đặt biến này thì web chạy **chế độ xem thử** (tiến trình mô phỏng, không tạo video).
4. Tạo mã cho khách (Shell của Render, thư mục `/app`): `python cli.py tao-ma KHACH01 10`.

Sửa giá, bộ màu, số Zalo trong `src/config/site.ts`.

## Chạy thử trên máy
```sh
bun install && bun run dev          # giao diện
cd backend && bash cai-dat-mac.sh   # máy chủ edit (macOS)
```
