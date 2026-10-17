# Phân tích image-to-code cho landing page EnsoTech Studio

## Phạm vi và nguồn hình

Nguồn thiết kế gồm sáu ảnh section riêng trong `public/assets/design-references`:

1. `section-01-hero.png`
2. `section-02-positioning.png`
3. `section-03-services.png`
4. `section-04-process.png`
5. `section-05-use-cases.png`
6. `section-06-contact-cta.png`

Đây là một landing page B2B studio cho phần mềm riêng, security audit, dashboard dữ liệu và AI Agent. Mục tiêu chuyển đổi chính là đặt lịch hoặc gửi quy trình hiện tại để nhận roadmap tư vấn.

## Hệ thống thiết kế tổng thể

### Tinh thần thị giác

Design đi theo hướng "precision instrument": các module trông như vật thể đo lường, tấm kính, thước cơ khí, tab kim loại, lớp dữ liệu trong suốt. Đây không phải SaaS dashboard thông thường. Cảm giác chính là chính xác, bình tĩnh, bảo mật, có quy trình, phù hợp với studio kỹ thuật.

### Palette

Nền chính là off-white rất ấm, gần `#F8F8F1`, pha pale mint `#EEF5EE`. Text chính là forest ink rất tối, khoảng `#062D22` đến `#0B3328`. Primary action dùng emerald sâu `#003B2C` hoặc `#064331`. Accent lime dùng tiết chế ở dấu chấm, số thứ tự và highlight, khoảng `#A4D628` đến `#B8E33D`. Border là green gray rất nhạt, khoảng `#D8E2D8`. Section use-case là dark forest photo grade, nền khoảng `#061811` đến `#0B2D20`, chữ trắng ngà và lime.

### Typography

Kiểu chữ là grotesk sạch, rất nặng ở display. H1/H2 dùng weight 800 đến 900, line-height chặt, chữ có chiều ngang rộng và cảm giác chắc. Body text nhẹ hơn, weight 400 đến 500, line-height thoáng. Các label nhỏ dùng uppercase với nhịp chữ gọn. Trong implementation cần giữ typography lớn và có độ tương phản mạnh: hero H1 lớn, section heading lớn, body text gọn, label ngắn.

### Spacing và grid

Hầu hết section dùng gutter lớn, khoảng 7 đến 8 phần trăm chiều ngang. Layout thoáng, không nhồi nhiều module nhỏ. Grid nền là kỹ thuật nhưng rất nhạt, không cạnh tranh với text. Internal spacing trong card khoảng 28 đến 44px. Section top/bottom spacing lớn, khoảng 96 đến 128px trên desktop. Mobile cần giữ breathing room nhưng giảm cỡ chữ và chuyển mọi layout về single-column.

### Radius, border và shadow

Radius trung bình, chủ yếu 18 đến 28px. Nút radius khoảng 10 đến 14px, không pill hoàn toàn. Card dùng border hairline và shadow tint xanh rất nhẹ. Các panel lớn có shadow mềm, không glow neon. Design không dùng nhiều nested cards; nếu có UI bên trong thì là mặt phẳng hoặc divider nhẹ.

### Motion suy ra

Ảnh gợi ý motion kiểu cinematic fade-through và staggered float-up. Process section có cảm giác pinned narrative do rail nằm ngang và tab active. Use-case section gợi ý smooth accordion expansion. Implementation nên dùng Framer Motion với opacity, y, x, filter blur nhẹ, không dùng scroll listener thủ công.

## Section 1: Hero

### Nội dung đọc được

Navbar gồm logo EnsoTech Studio, các link: Dịch vụ, Quy trình, Giải pháp, Studio, Về chúng tôi, Tài nguyên, và CTA Liên hệ. Hero text chính: "An toàn trước. AI sau." Supporting copy: studio đồng hành từ chiến lược đến vận hành, xây sản phẩm vững chắc, bảo mật theo chuẩn quốc tế, tự động hóa thông minh với AI Agent. CTA chính: "Đặt lịch tư vấn". Link phụ: "Xem dịch vụ".

### Bố cục

Hero là full-bleed image-as-canvas. Nav nằm trên cùng, nền trắng ngà, border-bottom rất nhẹ. Visual chính chiếm phần giữa và bên phải: shield trong suốt, data-layer block, AI Agent block, security posture screen. Text nằm bottom-left trong safe area, không nằm trong card. H1 chỉ hai dòng, rất lớn và đậm, có dấu chấm lime sau "sau". CTA nằm dưới copy, primary button bên trái, underlined secondary link bên phải.

### Chi tiết cần code

Implementation cần tránh hero left-text/right-image cứng nhắc. Dù có text bên trái và visual bên phải, visual phải đóng vai trò canvas lớn phủ nền, text bám vào foreground. Hero cần min-height khoảng 100dvh trên desktop, text nằm gần 62 đến 70 phần trăm chiều cao. Trên small laptop, H1 phải nhìn trọn và CTA vẫn trong viewport.

## Section 2: Positioning

### Nội dung đọc được

Logo EnsoTech Studio ở góc trên trái. Side rail có chữ dọc "ENSOTECH STUDIO" và câu "BUILD WARITY, SCALE WITH CONFIDENCE" trong ảnh bị sai chính tả nhẹ. Label: "02 — POSITIONING". Heading: "Không chỉ làm phần mềm." Body: "Chúng tôi thiết kế phần mềm, bảo mật, dữ liệu và AI như một hệ sinh thái thống nhất để tạo ra giá trị bền vững cho doanh nghiệp." Bốn module: Workflow, Security, Data, AI. Caption cuối: "Bốn trụ cột hoạt động đồng bộ trong mọi dự án, được thiết kế phù hợp với bối cảnh và mục tiêu kinh doanh của bạn."

### Bố cục

Đây là off-grid editorial layout. Bên trái rộng, có H2 rất lớn và body. Một vertical side rail cực mảnh nằm sát trái, tạo cảm giác editorial/dossier. Bên phải là masonry 2 cột, thẻ không đều độ cao và lệch nhịp. Card là khung giấy/kính, có corner marks và dấu cộng nhỏ. Một crop dọc màu xanh đậm nằm sau card Data tạo chiều sâu.

### Chi tiết cần code

Code cần tạo side rail thật bằng CSS, không biến thành card thường. Bốn pillar không nên là row 4 cột. Desktop dùng grid 12 cột, left 5 cột, right 7 cột. Masonry dùng CSS grid hai cột với translate-y cho nhịp chéo. Mobile bỏ rail phức tạp hoặc đặt rail thành dòng metadata ngang.

## Section 3: Services

### Nội dung đọc được

Label phải: "DỊCH VỤ". Heading: "Tạo ra sản phẩm digital có giá trị thực tiễn". Body: "EnsoTech Studio đồng hành cùng doanh nghiệp xây dựng hệ thống vững chắc, vận hành hiệu quả và sẵn sàng mở rộng." Service list: Phần mềm riêng, Kiểm toán bảo mật, Hệ thống & dữ liệu, AI Agent & tự động hóa. CTA link: "Xem tất cả dịch vụ".

### Bố cục

Section này đảo hướng: visual lớn nằm bên trái hai phần ba, caption và list nằm bên phải. Visual là bento grid nhưng không đều: panel trên rất rộng với CRM dashboard và vật thể kính; bên dưới là security report, system/data chart, AI automation flow. Các panel có border rất nhẹ, radius 14 đến 18px, nền gần trắng. Bên phải heading cao, body gọn, list icon trong vòng pale-mint.

### Chi tiết cần code

Implementation cần tạo bento bằng code, không dùng sáu card giống nhau. Top panel phải là lớn nhất. Dưới có security panel hẹp, data panel rộng, AI panel full width hoặc span 2 cột. Right caption giữ whitespace rộng, list item icon tròn pale-mint, không card riêng.

## Section 4: Process

### Nội dung đọc được

Label: "04 / 06 PROCESS". Heading: "QUY TRÌNH ĐỒNG HÀNH". Subheading: "TỪ PHÂN TÍCH ĐẾN VẬN HÀNH TỐI ƯU". Copy phải: "Một quy trình tinh gọn, đo lường được. Đảm bảo mỗi giải pháp chúng tôi kiến tạo đều chính xác, khả thi và tạo ra giá trị thực." Ba value icons: Chính xác, Thực tiễn, Bền vững. Rail tabs: 01 Audit, 02 Roadmap, 03 Pilot, 04 Operate. Active detail panel: "Xây dựng lộ trình" với bullets. Bottom caption: "Gửi quy trình để nhận roadmap".

### Bố cục

Đây là section có visual signature mạnh nhất: một thanh thước cơ khí ngang chạy suốt section. Các tab kim loại gắn trên rail, tab active màu forest. Active detail panel treo bên dưới tab 02. H2 nằm góc trái trên, copy và value icons nằm góc phải trên. Nền là giấy kỹ thuật có lưới và vài crosshair.

### Chi tiết cần code

CSS cần dựng rail ngang, ruler ticks, tab cards, active tab và detail panel. Trên mobile chuyển thành vertical timeline nhưng vẫn giữ motif ruler bằng đường ngang hoặc đường dọc có ticks. Không dùng RoadmapSection cũ vì quá card-list.

## Section 5: Use Cases

### Nội dung đọc được

Label: "05 USE CASES". Heading: "Giải pháp cho những bài toán vận hành thực tế". Từ "bài toán vận hành thực tế" là serif/italic hoặc script-like, màu lime. Body: "Mỗi doanh nghiệp một đặc thù. EnsoTech thiết kế giải pháp đúng trọng tâm, đo lường được và sẵn sàng mở rộng." CTA: "Xem các giải pháp phù hợp". Accordion slices: 01 CRM mini, 02 Audit hệ thống cũ, 03 Dashboard vận hành, 04 AI tóm tắt, 05 Agent follow-up. Active slice 02 có copy: "Đánh giá toàn diện quy trình, dữ liệu và công cụ hiện tại để xác định điểm nghẽn và rủi ro." Bottom note: "Từ đánh giá hiện trạng đến tự động hóa và AI, EnsoTech đồng hành cùng bạn trên toàn bộ hành trình chuyển đổi."

### Bố cục

Section đổi cường độ mạnh sang dark photo full-bleed. Bên trái là desk scene với laptop CRM, giấy quy trình, checklist, thẻ AI Agent. Bên phải là accordion slice layout chiếm nửa màn hình, năm cột dọc cao. Slice active sáng hơn, nền emerald. Border dọc mảnh. Text left bottom nằm trên overlay tối, không card.

### Chi tiết cần code

Implementation có thể dùng chính ảnh reference section 05 như một atmospheric background vì ảnh chứa desk scene đầy đủ. Cần overlay tối đủ mạnh để không làm embedded text cũ cạnh tranh. Accordion slice dựng bằng HTML ở foreground. Mobile chuyển thành list card tối với active item đầu hoặc giữ scroll ngang nếu đủ rộng.

## Section 6: Contact CTA

### Nội dung đọc được

Label: "BẮT ĐẦU CÙNG ENSOTECH". Heading: "Gửi quy trình. Nhận hướng đi rõ." Body: "Chúng tôi phân tích nhanh và gợi ý hướng tối ưu phù hợp với mục tiêu của bạn." Contact stack: Gọi/Zalo 0966 246 933, Email hello@ensotech.studio, Địa chỉ Hà Nội, Việt Nam. Form fields: Họ tên, Số điện thoại / Zalo, Email, Bạn muốn bắt đầu từ đâu?, Mô tả quy trình. Trust cue: "Chỉ dùng để tư vấn roadmap." CTA: "GỬI THÔNG TIN".

### Bố cục

Closing section trở lại light mode, rất tối giản. Bên trái có heading lớn, contact rows tách bằng divider ngang. Bên phải form panel lớn, radius khoảng 28px, shadow mềm, padding rộng. Input là row cao 72px, icon trái, border green-gray. Button full-width emerald gradient, chữ uppercase, mũi tên phải.

### Chi tiết cần code

Form phải giữ functional mailto hiện tại. Contact text nên dùng thông tin thật của EnsoTech trong repo: email `ensotechstudio@gmail.com`, phone `0364 151 304`, Messenger. Có thể không dùng số/email trong ảnh vì ảnh là reference thị giác, không phải source dữ liệu kinh doanh.

## Quyết định implementation

1. Giữ Next + Tailwind + Framer Motion hiện tại, không thêm dependency.
2. Dùng `background_trans.png` làm hero instrument chính vì nó sạch hơn ảnh reference có embedded text.
3. Dùng `section-05-use-cases.png` như atmospheric background mờ cho use-case section, vì section này phụ thuộc vào desk-scene photo.
4. Dựng masonry, bento, process rail, accordion và contact form bằng HTML/CSS để text thật sắc nét và responsive.
5. Bỏ layout glass/card đều nhau của bản cũ, thay bằng surface phẳng, border mảnh, shadow xanh rất nhẹ.
6. Giữ CTA chính xuyên suốt: gửi quy trình hoặc đặt lịch tư vấn.
7. Chỉnh mobile nav để cùng hệ radius, màu và motion với site mới.
8. Chỉnh token Tailwind và CSS global để giữ palette, text-wrap, tabular numbers, grid/noise/material shapes.

## Checklist fidelity trước code

- Hero dùng H1 ngắn hai dòng, text không bị nhồi.
- Positioning dùng side rail và masonry lệch nhịp.
- Services dùng bento, không phải card row đều.
- Process dùng rail ngang và tab active.
- Use cases dùng dark photo-grade và accordion slices.
- Contact dùng form panel lớn, input row cao, CTA full-width.
- Palette không drift sang purple/blue.
- Không dùng nested card wrapper lặp lại.
- Mobile chuyển thành single-column rõ ràng, không horizontal overflow.
