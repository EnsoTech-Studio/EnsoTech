# Audit landing page EnsoTech Studio

> Ngày audit: 14/10/2026 · Bản được audit: code hiện tại trong máy (bản redesign chưa commit), chạy local ở 1440px và 390px.
> Bản đang chạy thật (commit `926343e`) cũng dính phần lớn lỗi nội dung và lỗi animation bên dưới.

---

## 1. Tóm tắt

Trang **nhìn thì đẹp** (ảnh 3D chỉn chu, màu xanh sang) nhưng **không bán được hàng**. Lý do chính không nằm ở màu sắc hay hiệu ứng mà ở **thông điệp**:

- Đọc xong màn hình đầu tiên, một chủ shop **không biết EnsoTech làm gì, cho ai, giá bao nhiêu, bắt đầu thế nào**.
- Trên trang có **hàng chục từ tiếng Anh/thuật ngữ kỹ thuật** (roadmap, AI Agent, Workflow, Pilot, Operate, API, BI, RPA, LLM, guardrail, Trigger, Enrich data, Score lead, Missing security headers…).
- **Không có gì để tin**: không có dự án đã làm, không có người thật, không giá, không hỏi đáp.
- Form liên hệ dùng `mailto:`, trên điện thoại phần lớn người dùng **không gửi được** → mất khách.
- Có **1 lỗi nghiêm trọng**: máy bật chế độ "giảm chuyển động" thì **cả trang trắng tinh**.

**Khuyến nghị: đập đi xây lại.** Vấn đề nằm ở cấu trúc và nội dung, không sửa lặt vặt được. Code hiện tại (1 file 975 dòng + 2.176 dòng CSS) được dựng xoay quanh mấy tấm ảnh 3D trừu tượng, đổi nội dung là phải đổi bố cục. Những phần **nên giữ**: nền Next.js, SEO metadata + JSON-LD, code tracking (Meta Pixel/GA/Clarity), font Be Vietnam Pro, màu thương hiệu, logo.

---

## 2. Chấm điểm

| Hạng mục | Điểm | Nhận xét ngắn |
|---|---|---|
| Thông điệp rõ ràng | 3/10 | Không nói làm gì, cho ai, ngay màn hình đầu |
| Ngôn ngữ cho người không rành công nghệ | 2/10 | Ngập thuật ngữ tiếng Anh |
| Thẩm mỹ thị giác | 6.5/10 | Ảnh đẹp nhưng trừu tượng, kiểu "ảnh stock công nghệ" |
| Nhất quán bố cục | 4/10 | Lề lệch, khoảng trống lớn vô lý, chữ tiêu đề quá to |
| Chuyển đổi (CTA, form) | 3/10 | "Đặt lịch" lặp 6 lần, không có Zalo, form mailto |
| Niềm tin | 2/10 | Không dự án, không người thật, không giá, không FAQ |
| Mobile | 5/10 | Không vỡ layout nhưng ảnh bị cắt, quy trình bị che |
| Hiệu năng | 4/10 | ~7.5MB ảnh PNG, hiệu ứng blur nặng |
| Accessibility | 3/10 | Reduced motion → trang trắng; tab/accordion giả |
| SEO kỹ thuật | 7/10 | Metadata, JSON-LD tốt; từ khóa lệch với cách khách tìm |

---

## 3. Lỗi cần sửa ngay (kể cả nếu không xây lại)

### 3.1. Trang trắng khi bật "giảm chuyển động" — NGHIÊM TRỌNG
iPhone (Cài đặt › Trợ năng › Giảm chuyển động), Windows (Hiệu ứng hoạt ảnh tắt), nhiều máy Android tiết kiệm pin đều bật cái này. Với những người đó, **toàn bộ chữ trên trang không hiện**.

Nguyên nhân: server render các khối với `opacity: 0`, sau đó trên trình duyệt `useReducedMotion()` trả `true` → code đặt `initial={false}` và `animate={undefined}` → không có gì đưa opacity về 1 (`src/App.tsx`, mọi chỗ có `shouldReduceMotion ? false : …`).

Cách sửa: bọc app trong `<MotionConfig reducedMotion="user">` và bỏ hết các nhánh `shouldReduceMotion ? … : …`.

### 3.2. Form liên hệ dùng `mailto:`
Bấm "Gửi thông tin" chỉ mở app email. Trên điện thoại, người dùng hay không cài/không đăng nhập app mail → không gửi được, nhưng trang vẫn báo "Đã chuẩn bị email" → **khách tưởng đã gửi, bạn không nhận được gì**. Tracking cũng đếm "Lead" dù chưa gửi.

Cách sửa: gửi form về server thật (Next route handler → email qua Resend, hoặc Telegram bot, hoặc Google Sheet), và **đặt Zalo làm kênh chính**.

### 3.3. Thành phần "giả tương tác"
- **Quy trình**: 4 tab Audit / Roadmap / Pilot / Operate trông như bấm được nhưng không bấm được. Chỉ "Roadmap" có nội dung → 3/4 bước không ai đọc được. Trên mobile còn bị cắt mất Audit và Operate.
- **Giải pháp** (nền tối): 5 cột trông như accordion, chỉ mở khi rê chuột → trên điện thoại và bàn phím không mở được.

### 3.4. Điều hướng gắn nhãn sai
- "Tài nguyên" dẫn tới… đoạn quyền riêng tư ở footer.
- "Studio" dẫn tới phần "Không chỉ làm phần mềm".

---

## 4. Nội dung: viết cho người không rành công nghệ

### 4.1. Vấn đề gốc
Trang đang viết **từ góc nhìn của người làm kỹ thuật** (chúng tôi có gì: bảo mật, dữ liệu, AI) thay vì **từ góc nhìn của chủ shop** (tôi đang khổ vì cái gì, làm xong tôi được gì).

Khách hàng mục tiêu (theo footer): *doanh nghiệp nhỏ, chủ shop, startup*. Thông tin quan trọng nhất này lại chỉ xuất hiện **ở cuối trang**.

Nguyên tắc viết lại:
1. **Nói kết quả, không nói công nghệ.** "Biết hàng nào sắp hết" thay vì "Dashboard real-time".
2. **Dùng cảnh đời thường.** "Chốt đơn qua Zalo, tối ngồi nhập lại Excel" — khách đọc là thấy mình trong đó.
3. **Không tiếng Anh**, trừ từ khách đã quen (Zalo, Facebook, Excel).
4. **Trả lời 4 câu khách luôn hỏi**: làm gì? cho ai? bao nhiêu tiền / bao lâu? bắt đầu thế nào?
5. **Nói thật về đối thủ.** Khách sẽ hỏi "sao không dùng KiotViet/Sapo cho rẻ?". Trả lời thẳng điều đó tạo niềm tin hơn mọi khẩu hiệu.

### 4.2. Bảng viết lại (trước → sau)

> Những chỗ có **[cần xác nhận]** là cam kết kinh doanh, chỉ dùng nếu đúng sự thật.

| Vị trí | Hiện tại | Vấn đề | Đề xuất |
|---|---|---|---|
| Tiêu đề chính | An toàn trước. AI sau. | Hay với dân kỹ thuật, khách không hiểu bạn bán gì | **Phần mềm quản lý, làm riêng cho cửa hàng của bạn.** |
| Câu phụ | Thiết kế phần mềm, bảo mật và AI Agent theo một roadmap có kiểm soát. | "roadmap", "AI Agent" | Bán hàng, kho, khách hàng, báo cáo — gom về một chỗ, chạy đúng theo cách bạn đang làm việc. Dùng được trên máy tính và điện thoại. |
| Nút chính | Đặt lịch | Đặt lịch gì? Mất phí không? | **Tư vấn miễn phí qua Zalo** [cần xác nhận "miễn phí"] |
| Dòng tin cậy dưới nút | (không có) | | Tư vấn 30 phút miễn phí · Báo giá rõ trước khi làm · Bạn sở hữu phần mềm [cần xác nhận] |
| Phần 2 | Không chỉ làm phần mềm. … hệ sinh thái thống nhất … giá trị bền vững | Câu sáo rỗng, ai cũng nói được | **Bạn có đang gặp những chuyện này?** (danh sách nỗi đau, xem 4.3) |
| 4 trụ cột | Workflow · Security · Data · AI · guardrail | Tiếng Anh, trừu tượng | Bỏ. Ý "an toàn dữ liệu" chuyển vào phần "Vì sao chọn EnsoTech". |
| Dịch vụ 1 | Phần mềm riêng · Web - Mobile - API - Cloud | | **Phần mềm quản lý theo yêu cầu** — Bán hàng, kho, đơn hàng, khách hàng… làm đúng theo cách cửa hàng bạn đang chạy, không phải tự gò mình theo phần mềm có sẵn. |
| Dịch vụ 2 | Hệ thống và dữ liệu · Dashboard - BI - Real-time | | **Xem tình hình kinh doanh trên một màn hình** — Doanh thu hôm nay, hàng sắp hết, khách lâu chưa quay lại. Không phải chờ cuối tháng hỏi kế toán. |
| Dịch vụ 3 | AI Agent · Workflow - RPA - LLM · Trigger / Enrich data / Score lead / Notify | Toàn thuật ngữ | **Tự động hóa việc lặp lại** — Tự nhắn khách nhắc lịch hẹn, tự gom đơn từ Zalo/Facebook, tự trả lời câu hỏi thường gặp. Nhân viên rảnh tay làm việc quan trọng hơn. |
| Dịch vụ 4 | Kiểm toán bảo mật · Missing security headers · Outdated dependencies | "Kiểm toán" gợi nghĩa tài chính; nội dung toàn tiếng Anh | **Kiểm tra an toàn dữ liệu** — Ai đang xem được thông tin khách? Mật khẩu có ổn không? Mất máy thì dữ liệu còn không? Chúng tôi rà soát và chỉ ra chỗ cần vá. |
| Quy trình | Audit · Roadmap · Pilot · Operate | Tiếng Anh, khách không biết từng bước tốn gì | **1. Trò chuyện** (30 phút, miễn phí) — Bạn kể cách đang làm, chúng tôi hỏi kỹ. **2. Đề xuất & báo giá** (trong 3–5 ngày) — Làm gì, bao lâu, bao nhiêu tiền, ghi rõ trên giấy. **3. Làm thử phần quan trọng nhất** (2–4 tuần) — Dùng thử với dữ liệu thật trước khi làm hết. **4. Bàn giao & đồng hành** — Hướng dẫn nhân viên, sửa lỗi, bảo trì. [cần xác nhận mốc thời gian] |
| Giải pháp | CRM · Audit · KPI · AI · Agent | Tên viết tắt | Đổi thành ví dụ theo ngành: "Shop online bán qua Zalo & Facebook", "Spa / phòng khám có lịch hẹn", "Cửa hàng có kho & nhiều chi nhánh", "Xưởng / nhà phân phối nhỏ". Mỗi ví dụ: **Trước → Sau**. |
| Tiêu đề liên hệ | Gửi quy trình. Nhận hướng đi rõ. | Khách không có "quy trình" để gửi, nghe áp lực | **Kể cho chúng tôi nghe bạn đang vướng ở đâu.** |
| Ô form | Mô tả quy trình | | **Bạn đang mất thời gian nhất vào việc gì?** — gợi ý: *VD: Mỗi tối mất 2 tiếng nhập đơn từ Zalo vào Excel.* |
| Lựa chọn form | Phần mềm riêng / Kiểm toán bảo mật / Dashboard dữ liệu / AI Agent | | Quản lý bán hàng, kho · Xem báo cáo, doanh thu · Tự động hóa việc lặp lại · Kiểm tra an toàn dữ liệu · Chưa rõ, muốn được tư vấn |
| Ghi chú form | Chỉ dùng để tư vấn roadmap. | | Chúng tôi sẽ gọi hoặc nhắn Zalo lại trong 1 ngày làm việc. Không spam, không bán thông tin. [cần xác nhận] |
| Menu | Dịch vụ · Quy trình · Giải pháp · Studio · Tài nguyên | Nhãn mơ hồ / sai | Dịch vụ · Ví dụ · Cách làm việc · Hỏi đáp · **[Tư vấn miễn phí]** |
| Tiêu đề SEO | Phần mềm theo yêu cầu, Security Audit & AI Agent | Khách không tìm "Security Audit" | EnsoTech Studio — Làm phần mềm quản lý theo yêu cầu cho cửa hàng & doanh nghiệp nhỏ |

### 4.3. Mẫu khối "Bạn có đang gặp những chuyện này?"
- Chốt đơn qua Zalo, Facebook, tối lại ngồi nhập lại vào Excel.
- Không biết hàng nào sắp hết cho tới khi khách hỏi mua.
- Nhân viên nghỉ việc là mất luôn danh sách khách.
- Muốn biết doanh thu tuần này phải đi hỏi từng người.
- Mua phần mềm có sẵn nhưng nó không khớp cách cửa hàng mình làm.
- Lo dữ liệu khách hàng bị lộ mà không biết kiểm tra từ đâu.

> Nếu bạn gật đầu với 2 điều trở lên, chúng tôi giúp được.

### 4.4. Mẫu FAQ (phần đang thiếu hoàn toàn)
- **Làm một phần mềm như vậy tốn khoảng bao nhiêu?** — Nêu khoảng giá "từ … triệu" [cần số thật]. Không nêu giá là lý do số 1 khách bỏ đi.
- **Bao lâu thì dùng được?**
- **Tôi không rành công nghệ, nhân viên lớn tuổi, có dùng được không?**
- **Sao không dùng KiotViet, Sapo… cho rẻ?** — "Nếu phần mềm có sẵn đủ dùng, chúng tôi sẽ nói thật với bạn. Làm riêng hợp khi…"
- **Dữ liệu của tôi có an toàn không? Ai giữ dữ liệu?**
- **Làm xong rồi, hỏng thì sao? Có bảo trì không?**

---

## 5. Giao diện

### 5.1. Điểm làm tốt (giữ lại)
- Bảng màu xanh rừng + nền giấy ấm + điểm nhấn xanh chuối: sang, khác biệt so với màu xanh dương "công nghệ" đại trà.
- Font Be Vietnam Pro hiển thị tiếng Việt tốt.
- Ảnh render chỉn chu, không bị rẻ tiền.

### 5.2. Vấn đề
1. **Ảnh trừu tượng, không nói chuyện với khách.** Khiên kính, khối dữ liệu, thước kẹp cơ khí… nói "bảo mật/AI" nhưng không nói "cửa hàng của bạn sẽ gọn hơn". Chủ shop không thấy mình trong đó. Thêm nữa đây là phong cách ảnh AI đang rất phổ biến → dễ bị coi là "template".
2. **Tiêu đề quá to, chữ phụ quá nhỏ.** Ở màn 1440px, H1 ~104px, H2 ~96px; "Không chỉ / làm phần / mềm." vỡ 3 dòng, "Tạo ra sản / phẩm digital / có giá trị / thực tiễn" vỡ 4 dòng. Line-height 0.94–0.98 quá chặt cho tiếng Việt → dấu (ẩ, ỗ, ặ) sát dòng trên. Ngược lại, chữ phụ trên các tab quy trình chỉ 8–12px. Code dùng weight 850–950 nhưng font chỉ tải tới 800 → trình duyệt tự "giả đậm".
3. **Lề lệch.** Header căn trái ở 56px, nội dung các section lại ở 20px → nhìn như chưa xong.
4. **Khoảng trống vô nghĩa.** Sau phần quy trình có ~300px trống chỉ chứa 1 link "Đặt lịch". Cột phải phần dịch vụ hụt chiều cao.
5. **Dashboard giả trong phần dịch vụ.** Chữ 11–12px, toàn tiếng Anh, số "12,450,000đ" tràn khỏi ô; các con số như "Tỷ lệ thắng 72%" dễ bị hiểu là thành tích thật.
6. **Hàng 4 thẻ đều nhau** (Workflow/Security/Data/AI) — kiểu bố cục mặc định, không có điểm nhấn.
7. **CTA đơn điệu.** "Đặt lịch" xuất hiện 6 lần, cùng một chữ, không nói rõ lợi ích.
8. **Mobile**: ảnh hero bị cắt nửa; nút "Đặt lịch" + nút menu chiếm cả header, mất chữ "EnsoTech Studio"; quy trình bị che mất 2 bước.

### 5.3. Hướng thiết kế đề xuất: "Ensō — gọn, ấm, rõ ràng"
Logo là vòng tròn **Ensō** (vòng tròn thiền vẽ một nét — tượng trưng cho sự trọn vẹn và đơn giản). Đây là câu chuyện thương hiệu sẵn có, rất hợp với lời hứa "làm việc kinh doanh của bạn gọn gàng lại", và **chưa được dùng** trên trang.

- **Cảm giác**: bình tĩnh, ấm, con người — như một cuốn tạp chí tối giản, không phải phòng server.
- **Màu**: giữ xanh rừng `#042F24` cho chữ và nút, nền giấy ấm `#F8F8F1`, xanh chuối `#A8D833` chỉ dùng cho điểm nhấn (dấu chấm, gạch chân, số thứ tự). Thêm một màu đất ấm nhẹ cho khối "nỗi đau" để tạo tương phản cảm xúc.
- **Chữ**: Be Vietnam Pro, tiêu đề 700–800, H1 tối đa ~64px (mobile ~36px), line-height ≥ 1.15 cho dấu tiếng Việt. Có thể ghép một font serif có hỗ trợ tiếng Việt (VD: Lora) cho vài chữ nhấn in nghiêng.
- **Hình ảnh**: thay ảnh 3D trừu tượng bằng **ảnh chụp màn hình phần mềm thật, giao diện tiếng Việt** (đơn hàng, tồn kho, lịch hẹn) đặt trên laptop/điện thoại, và minh họa **Trước → Sau** (đống tin nhắn Zalo + Excel → một màn hình gọn). Nét vẽ Ensō dùng làm họa tiết đánh dấu section.
- **Bố cục**: 1 container thống nhất (tối đa 1200px, lề 24px mobile / 48px desktop), nhịp khoảng cách có chủ đích; mỗi section một bố cục khác nhau nhưng cùng lưới.
- **Chuyển động**: chỉ fade + trượt nhẹ khi cuộn, không blur; tôn trọng "giảm chuyển động".
- **Zalo**: nút Zalo nổi góc phải trên mobile; Zalo là kênh chính, form là kênh phụ.

### 5.4. Cấu trúc trang mới

| # | Section | Mục đích |
|---|---|---|
| 1 | **Hero** — làm gì, cho ai + nút Zalo + dòng tin cậy + ảnh phần mềm thật | Khách hiểu trong 5 giây |
| 2 | **Bạn có đang gặp những chuyện này?** | Khách thấy mình trong đó |
| 3 | **Chúng tôi giúp được gì** — 4 dịch vụ, mỗi cái kèm "Hợp với bạn nếu…" | Hiểu sản phẩm |
| 4 | **Ví dụ thực tế** — 2–3 tình huống Trước → Sau theo ngành | Hình dung kết quả |
| 5 | **Làm việc với chúng tôi thế nào** — 4 bước, có thời gian | Bớt sợ rủi ro |
| 6 | **Vì sao chọn EnsoTech** — an toàn dữ liệu từ đầu, bạn sở hữu phần mềm, nói chuyện dễ hiểu, gương mặt đội ngũ | Niềm tin |
| 7 | **Hỏi đáp** | Gỡ băn khoăn: giá, thời gian, KiotViet/Sapo |
| 8 | **Liên hệ** — Zalo / gọi / form 3 ô | Chuyển đổi |
| 9 | Footer | |

---

## 6. Kỹ thuật

| Vấn đề | Chi tiết | Cách xử lý |
|---|---|---|
| Ảnh nặng | 4 ảnh PNG ~1.5–2.2MB mỗi ảnh (~7.5MB) dùng `<img>` thường, không lazy-load, không WebP | `next/image`, WebP/AVIF, mỗi ảnh < 200KB, hero `priority` |
| File thừa | `components/RoadmapSection.jsx`, `LiquidGlassCard.tsx`, `SectionReveal.tsx` không dùng; `background.jpg`, `logo.png`, `logo_notext.png`, `logo_trans_notext.png` (~3.5MB) không dùng | Xóa |
| CSS khổng lồ | `index.css` 2.176 dòng, phần lớn chỉ phục vụ các ảnh 3D | Viết lại bằng Tailwind, CSS riêng còn vài chục dòng |
| Một component 975 dòng | Toàn bộ trang nằm trong `App.tsx` | Mỗi section một file |
| Hiệu ứng blur | `filter: blur()` trên cả section khi cuộn → giật trên điện thoại yếu | Chỉ dùng opacity + transform |
| Tracking | Đếm "Lead" ngay khi bấm gửi, kể cả khi mailto thất bại | Chỉ đếm khi server xác nhận đã nhận |
| SEO | Metadata, JSON-LD tốt nhưng từ khóa ("security audit", "Agentic AI") không phải thứ chủ shop gõ | Thêm: "phần mềm quản lý bán hàng theo yêu cầu", "làm phần mềm quản lý kho", "thuê làm phần mềm cho cửa hàng"… |

---

## 7. Cần anh/chị cung cấp trước khi xây lại

1. **Dự án đã làm** (dù 1–2 cái, kể cả nội bộ) + ảnh chụp màn hình. Nếu chưa có, đồng ý dùng "ví dụ minh họa" (ghi rõ là minh họa)?
2. **Khoảng giá** khởi điểm và **thời gian** thường gặp.
3. Các cam kết có thật không: tư vấn miễn phí? bàn giao mã nguồn / bạn sở hữu phần mềm? bảo hành bao lâu? phản hồi trong bao lâu?
4. **Đội ngũ**: tên, vai trò, ảnh (người thật làm tăng niềm tin rất mạnh với khách SME).
5. **Link Zalo** (zalo.me/0364151304 hay Zalo OA?).
6. **Form gửi về đâu**: email (qua Resend), Telegram, hay Google Sheet?
7. Khách chính là **chủ shop / doanh nghiệp nhỏ** hay **startup**? Hai nhóm cần giọng văn khác nhau; đề xuất ưu tiên chủ shop / SME.
