Bộ kỹ năng này tương thích liền mạch với các công cụ lập trình AI như Cursor, Claude Code, OpenCode, Codex, hay Gemini CLI.

## 1. Các câu lệnh cài đặt (CLI Commands)

Bạn có thể gọi trực tiếp các package này vào môi trường làm việc thông qua `npx`. AI Agent sẽ tự động đọc file `SKILL.md` tương ứng để áp dụng quy tắc.

- **Cài đặt mặc định (Khuyên dùng):**`npx skills add Leonxlnx/taste-skill`_(Tự động tải bộ quy tắc chống rập khuôn v2 mới nhất vào thư mục của bạn)._
- **Cài đặt một Skill cụ thể:**`npx skills add Leonxlnx/taste-skill --skill "tên-skill"`_(Thay_ `tên-skill` _bằng các mã ở phần 2 dưới đây)._

---

## 2. Danh sách các Skills (Kỹ năng AI)

Mỗi skill phục vụ một mục đích hoặc phong cách hình ảnh riêng biệt. Hãy nạp đúng skill theo nhu cầu của từng vòng lặp (iteration) trong quá trình phát triển.

### Nhóm phong cách giao diện (Visual Styles)

- `taste-skill`: Kỹ năng cốt lõi (v2). AI sẽ đọc kỹ yêu cầu (brief) trước khi code để tự suy luận hướng thiết kế (ngành nghề, tệp khách hàng, cảm giác) thay vì dùng một template mặc định.
- `minimalist-skill`: Phong cách tối giản, màu sắc tiết chế, cấu trúc và phân cấp thông tin cực kỳ sắc nét.
- `soft-skill`: Ngôn ngữ thiết kế mang cảm giác cao cấp, điềm tĩnh. Sử dụng độ tương phản mềm mại, nhiều khoảng trắng và hiệu ứng chuyển động mượt mà.
- `brutalist-skill`: Phong cách thiết kế cơ khí, thô mộc. Sử dụng nghệ thuật chữ (Swiss typography) sắc nét, cấu trúc thô và độ tương phản rất mạnh.
- `stitch-skill`: Tuân thủ các quy tắc thiết kế ngữ nghĩa tương thích với Google Stitch, kèm theo định dạng xuất `DESIGN.md`.

### Nhóm quy trình & Công năng (Workflows)

- `redesign-skill`: Dành riêng cho việc cải tạo các dự án có sẵn. Yêu cầu AI phải tiến hành audit (đánh giá) thị giác kỹ lưỡng trước khi bắt tay vào cấu trúc lại code.
- `image-to-code-skill`: Tối ưu hóa cho quy trình lấy ảnh làm trung tâm. Phân tích tham chiếu thiết kế cực sâu trước khi viết frontend.
- `imagegen-frontend-web` / `imagegen-frontend-mobile`: Chuyên dùng cho các model sinh ảnh để tạo ra bản phác thảo ý tưởng giao diện web hoặc mobile chất lượng cao.
- `brandkit`: Hỗ trợ AI thiết lập một bộ nhận diện thương hiệu đồng nhất (màu sắc, typography, logo).

### Nhóm kiểm soát & Kế thừa (Utility)

- `output-skill`: **Kỹ năng bắt buộc để trị bệnh lười của AI.** Ép model phải xuất ra toàn bộ mã nguồn hoàn chỉnh, nghiêm cấm việc bỏ sót, cắt xén hoặc để lại placeholder (như `// Thêm code vào đây`).
- `gpt-taste` (hoặc `gpt-tasteskill`): Biến thể với bộ luật nghiêm ngặt hơn, được tinh chỉnh riêng để trị các thói quen xấu của mô hình GPT và Codex.
- `taste-skill-v1`: Bản thiết kế v1 cũ, được giữ lại cho các dự án legacy cần duy trì chính xác hành vi của phiên bản trước đây.

---

## 3. Các thông số điều khiển (Design Dials)

Taste-skill cho phép bạn kiểm soát AI giống như một hệ thống tham số. Bạn có thể truyền thẳng các giá trị này vào prompt (ví dụ: _"Hãy code trang này với VISUAL_DENSITY ở mức 8"_) hoặc cấu hình trong file tải về. Thang điểm chạy từ 1 đến 10.

| Thông số             | Mức 1 (Tối thiểu)                                              | Mức 10 (Tối đa)                                                       |
| -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| **DESIGN_VARIANCE**  | Đối xứng hoàn hảo, truyền thống.                               | Phá cách, bất đối xứng, lộn xộn có chủ ý nghệ thuật.                  |
| **MOTION_INTENSITY** | Tĩnh hoàn toàn, không có animation.                            | Chuyển động đậm chất điện ảnh, vật lý, mượt mà phức tạp.              |
| **VISUAL_DENSITY**   | Giao diện phòng tranh: Cực kỳ nhiều khoảng trống, thoáng đãng. | Giao diện buồng lái: Dày đặc dữ liệu, tối ưu hóa không gian hiển thị. |
