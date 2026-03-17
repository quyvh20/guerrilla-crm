# Guerrilla CRM - Hướng dẫn Cài đặt & Khởi chạy

Dự án CRM này được thiết kế với 3 thành phần chính: 
1. **Go Backend Server** (API xử lý dữ liệu chính)
2. **AI Worker** (Cloudflare Worker phân tích Data/Chat bằng AI)
3. **Chrome Extension** (Bắt thông tin chat đa kênh trực tiếp từ trình duyệt)

Dưới đây là các bước để khởi chạy từng thành phần:

---

## 1. Chạy Go Backend Server

Backend được code bằng ngôn ngữ Go.

- **Yêu cầu:** Đã cài đặt Golang.
- **Biến môi trường:** Nếu mở rộng, bạn có thể thiết lập file `.env` chung thư mục với file `main.go`. Có thể cần `AI_WORKER_URL` là endpoint của worker ở bước 2.

**Các bước khởi chạy:**
1. Mở terminal vào thư mục gốc của project \`guerrilla-crm\`.
2. Chạy ứng dụng bằng lệnh:
   ```bash
   go run main.go
   ```
=> Mặc định server sẽ hoạt động trên cổng `http://localhost:3000`

---

## 2. Chạy AI Worker (Cloudflare)

Worker đóng vai trò giao tiếp với Cloudflare AI theo cấu hình ở file `wrangler.toml`.

- **Yêu cầu:** Đã cài đặt Node.js và npx. 

**Các bước khởi chạy dev local:**
1. Mở thêm 1 tab terminal khác, trỏ vào thư mục `ai-worker`:
   ```bash
   cd ai-worker
   ```
2. Chạy giả lập bằng Wrangler Cloudflare:
   ```bash
   npx wrangler dev
   ```
=> Thường Wrangler sẽ khởi chạy giả lập chạy tại cổng `http://localhost:8787`.

---

## 3. Cài đặt Chrome Extension

Extension này sẽ bắt sự kiện khung chat từ các hệ thống lớn như Zalo, Messenger, WhatsApp,...

**Các bước thêm vào Chrome:**
1. Mở trình duyệt Chrome/Edge/Cốc Cốc, trên thanh địa chỉ truy cập vào:
   ```text
   chrome://extensions/
   ```
2. Nhìn góc trên bên phải, **bật chế độ "Developer mode"** (Chế độ dành cho nhà phát triển).
3. Ấn nút **"Load unpacked"** (Tải tiện ích đã giải nén) xuất hiện trên cùng sát bên trái.
4. Trỏ tới và **chọn nguyên thư mục `chrome-extension`** trong dự án `guerrilla-crm` của bạn.
5. Vây là xong! Bạn sẽ thấy icon Guerrilla CRM hiện lên, và nó bắt đầu hoạt động khi bạn mở tab như Zalo Web / Facebook Messenger. 

---
*Lưu ý: Bạn phải chạy đồng thời cả bước 1 và bước 2 để toàn bộ hệ thống lưu trữ đồng bộ mượt mà!*
