// Toàn bộ chữ trên trang, chép nguyên văn từ CONTENT.md. Không sửa chữ ở đây khi chưa sửa CONTENT.md.
// Dấu [cần xác nhận] / [X] giữ nguyên: <Rich> trong voyage/ui.tsx tô chúng thành dấu son để soát.
// Khi chủ trang xác nhận, sửa chuỗi tương ứng ở đây là dấu tự biến mất.

export type Link = { label: string; href: string }

export const SITE = {
  name: 'EnsoTech Studio',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://enso.io.vn',
  title: 'Làm phần mềm quản lý theo yêu cầu | EnsoTech Studio',
  description:
    'Làm phần mềm quản lý bán hàng, kho, lịch hẹn và ứng dụng cho khách hàng — đúng cách bạn đang làm việc. Dễ dùng, an toàn dữ liệu. Tư vấn qua Zalo.',
  ogTitle: 'Phần mềm làm riêng cho việc kinh doanh của bạn',
  ogDescription: 'Dễ dùng từ ngày đầu — nhân viên lớn tuổi cũng dùng được.',
  keywords: [
    'làm phần mềm quản lý theo yêu cầu',
    'phần mềm quản lý bán hàng theo yêu cầu',
    'làm phần mềm quản lý kho',
    'thuê làm phần mềm cho cửa hàng',
    'làm app đặt lịch cho spa, phòng khám',
    'làm website chăm sóc khách hàng',
    'kiểm tra bảo mật website',
  ],
  services: [
    'Phần mềm quản lý theo yêu cầu',
    'Website & ứng dụng cho khách hàng',
    'Tự động hóa việc lặp lại',
    'Kiểm tra an toàn dữ liệu',
  ],
}

export const CONTACT = {
  phone: '0364 151 304',
  phoneHref: 'tel:+84364151304',
  phoneE164: '+84364151304',
  zaloHref: 'https://zalo.me/0364151304',
  messengerHref: 'https://m.me/61590018866554',
  email: 'ensotechstudio@gmail.com',
  emailHref: 'mailto:ensotechstudio@gmail.com',
}

export const NAV = [
  { id: 'dich-vu', label: 'Dịch vụ' },
  { id: 'du-an', label: 'Dự án' },
  { id: 'cach-lam-viec', label: 'Cách làm việc' },
  { id: 'hoi-dap', label: 'Hỏi đáp' },
] as const

export const NAV_CTA = 'Nhắn Zalo tư vấn'
export const FLOATING_CTA = 'Nhắn tư vấn'

// Nhãn cho trình đọc màn hình / nút biểu tượng, không hiện thành chữ trên trang.
export const UI = {
  menu: 'Menu',
  home: 'EnsoTech Studio',
}

export const HERO = {
  eyebrow: 'Phần mềm làm riêng cho doanh nghiệp nhỏ',
  title: 'Phần mềm làm riêng cho việc kinh doanh của bạn — dễ dùng từ ngày đầu.',
  sub: 'Bán hàng, kho, lịch hẹn, khách hàng, báo cáo — gom về một chỗ, chạy đúng theo cách bạn đang làm. Dùng trên máy tính và điện thoại; nhân viên lớn tuổi cũng dùng được.',
  primary: 'Nhắn Zalo tư vấn',
  secondary: 'Xem dự án đã làm ↓',
  trust: ['Tư vấn miễn phí', 'Báo giá rõ trước khi làm', 'Bạn sở hữu phần mềm và dữ liệu'],
}

export const PAIN = {
  eyebrow: 'Nghe có quen không?',
  title: 'Bạn có đang gặp những chuyện này?',
  items: [
    'Chốt đơn qua Zalo, Facebook, tối lại ngồi chép vào Excel.',
    'Không biết hàng nào sắp hết, cho tới khi khách hỏi mua.',
    'Ngày nào cũng trả lời đi trả lời lại mấy câu hỏi giống nhau của khách.',
    'Nhân viên nghỉ việc là mất luôn danh sách khách.',
    'Muốn biết doanh thu tuần này phải đi hỏi từng người.',
    'Đã mua phần mềm có sẵn, nhưng nó không khớp cách cửa hàng mình làm.',
    'Giữ số điện thoại, địa chỉ, hồ sơ của khách, nhưng không chắc có an toàn không.',
  ],
  closing: 'Gật đầu với từ 2 điều trở lên? Đó là lúc một phần mềm làm riêng bắt đầu đáng tiền.',
  link: 'Kể chúng tôi nghe bạn đang vướng chỗ nào →',
}

export type Service = {
  title: string
  text: string
  bullets: string[]
  fit: string
  link?: Link
  result?: string
}

export const SERVICES = {
  eyebrow: 'Chúng tôi làm gì',
  title: 'Bạn kể cách bạn làm việc. Phần còn lại để chúng tôi lo.',
  lead: 'Bạn không cần biết công nghệ, cũng không cần chuẩn bị tài liệu gì.',
  fitLabel: 'Hợp với bạn nếu:',
  resultLabel: 'Bạn nhận được:',
  items: [
    {
      title: 'Phần mềm quản lý theo yêu cầu',
      text: 'Bán hàng, kho, đơn hàng, lịch hẹn, khách hàng — làm đúng theo cách bạn đang chạy, kèm màn hình báo cáo để xem tình hình mỗi ngày.',
      bullets: [
        'Nhập đơn một lần, kho tự trừ',
        'Biết ngay hàng nào sắp hết',
        'Xem doanh thu hôm nay trên điện thoại',
        'Chia quyền nhân viên: ai xem gì, ai sửa gì',
      ],
      fit: 'đang dùng Excel + Zalo và bắt đầu rối, hoặc phần mềm có sẵn không khớp cách làm của bạn.',
    },
    {
      title: 'Website & ứng dụng cho khách hàng của bạn',
      text: 'Nơi khách tự tra cứu, đặt lịch, theo dõi đơn, xem hướng dẫn — thay vì nhắn hỏi bạn từng chút.',
      bullets: [
        'Đặt lịch hẹn trực tuyến',
        'Tra cứu đơn hàng, bảo hành bằng số điện thoại',
        'Cẩm nang hướng dẫn có video, có nút đọc to',
        'Khách tự ghi nhận và theo dõi, ví dụ nhật ký sức khỏe',
      ],
      fit: 'khách hỏi đi hỏi lại cùng một chuyện, hoặc bạn muốn chăm sóc khách sau khi bán.',
      link: { label: 'Xem dự án tuchamsocgan.vn →', href: '/du-an/tuchamsocgan' },
    },
    {
      title: 'Tự động hóa việc lặp lại',
      text: 'Việc ngày nào cũng làm y chang nhau thì để máy làm. Nhân viên rảnh tay cho việc quan trọng hơn.',
      bullets: [
        'Tự nhắn Zalo nhắc lịch hẹn, nhắc tái khám',
        'Gom đơn từ Zalo, Facebook về một danh sách',
        'Trợ lý AI trả lời câu hỏi thường gặp, chuyển cho người thật khi cần',
        'Báo cáo tự gửi vào điện thoại mỗi sáng',
      ],
      fit: 'nhân viên mất hàng giờ mỗi ngày để chép, dán, nhắn tin.',
    },
    {
      title: 'Kiểm tra an toàn dữ liệu',
      text: 'Rà soát website, phần mềm và cách bạn đang lưu thông tin khách. Chỉ ra chỗ hở và cách vá, nói bằng lời dễ hiểu.',
      bullets: [
        'Ai đang xem được dữ liệu khách hàng?',
        'Nhân viên nghỉ việc đã bị khóa tài khoản chưa?',
        'Mất máy, hỏng máy thì dữ liệu còn không?',
        'Website có lỗ hổng phổ biến nào không?',
      ],
      fit: 'bạn đang giữ thông tin khách (số điện thoại, địa chỉ, hồ sơ sức khỏe), hoặc từng bị mất fanpage hay mất dữ liệu.',
      result: 'một bản báo cáo ngắn, xếp theo việc nào cần vá trước.',
    },
  ] satisfies Service[],
}

export type Step = { title: string; text?: string; list?: string[] }

export const PROJECT = {
  eyebrow: 'Dự án đã làm',
  caption: 'Dự án thật: tuchamsocgan.vn',
  title: 'Một trang web mà người bệnh lớn tuổi cũng tự dùng được',
  lead: 'Cổng thông tin và nhật ký sức khỏe cho người bệnh điều trị ung thư gan bằng phương pháp TACE.',
  facts: [
    ['Khách hàng', 'Khoa Ngoại Gan – Mật – Tụy, Bệnh viện Đại học Y Dược TP.HCM'],
    ['Lĩnh vực', 'Y tế'],
    ['Dùng trên', 'Máy tính và điện thoại'],
    ['Thời gian làm', '3 tháng'],
    ['Xem trang thật', 'tuchamsocgan.vn'],
  ] as [string, string][],
  liveUrl: 'https://tuchamsocgan.vn',
  problemTitle: 'Bài toán',
  problem:
    'Người bệnh điều trị TACE phần lớn đã lớn tuổi. Về nhà, họ và người nhà có rất nhiều câu hỏi: trước thủ thuật phải nhịn ăn bao lâu, sau TACE bị sốt có sao không, khi nào phải quay lại viện. Thông tin phải rõ ràng, đáng tin, và đọc được — kể cả với người mắt kém, không quen dùng điện thoại.',
  doneTitle: 'Chúng tôi đã làm',
  done: [
    { title: 'Nút "Đọc to" ở mọi phần.', text: 'Người mắt mỏi, khó đọc chữ nhỏ chỉ cần bấm để nghe.' },
    {
      title: 'Nhật ký sức khỏe, chạm là xong.',
      list: [
        'Chọn triệu chứng bằng biểu tượng.',
        'Chấm mức đau bằng gương mặt từ 0 đến 10.',
        'Nói thay vì gõ.',
        'Xem lại diễn biến qua biểu đồ.',
      ],
    },
    {
      title: 'Lời khuyên nhanh khi có triệu chứng.',
      text: 'Hệ thống gợi ý nên làm gì trong tình huống thường gặp, và luôn nhắc khi nào cần gọi bác sĩ. Không thay thế bác sĩ.',
    },
    {
      title: 'Hành trình điều trị 4 bước.',
      text: 'Từ hội chẩn, nhập viện, làm TACE đến xuất viện — người bệnh biết trước mình sẽ trải qua những gì.',
    },
    {
      title: 'Cẩm nang 8 chuyên mục.',
      text: 'Có video hướng dẫn, hỏi đáp, góc chia sẻ của người bệnh, tìm kiếm bằng giọng nói. Nội dung do bác sĩ, dược sĩ, điều dưỡng của khoa biên soạn.',
    },
  ] satisfies Step[],
  quotesTitle: 'Người dùng nói gì',
  quotes: [
    { text: 'Tôi thấy được quan tâm, giảm lo lắng hơn.', by: 'Người bệnh điều trị TACE, chia sẻ trên tuchamsocgan.vn' },
    { text: 'Trang web giúp tôi tham khảo thông tin dễ dàng, để chuẩn bị tốt.', by: 'Người bệnh điều trị TACE, chia sẻ trên tuchamsocgan.vn' },
  ],
  numbersLabel: 'Con số:',
  numbers: 'hơn 100 người dùng',
  bridge:
    'Điều này liên quan gì đến cửa hàng của bạn? Nếu người bệnh lớn tuổi tự dùng được, nhân viên của bạn cũng dùng được — không cần học lâu.',
  live: 'Xem trang thật ↗',
  similar: 'Tôi muốn làm một cái tương tự',
  /** Mô tả ảnh chụp trang thật cho trình đọc màn hình. `done` theo đúng thứ tự `done` ở trên. */
  shots: {
    home: 'Ảnh chụp tuchamsocgan.vn trên máy tính: thanh menu, lời nhắc nút đọc to và các chuyên mục cẩm nang.',
    phone: 'Ảnh chụp tuchamsocgan.vn trên điện thoại: nhật ký "Sức khỏe hôm nay" với các triệu chứng chọn nhanh.',
    done: [
      'Ảnh chụp trên điện thoại: hành trình điều trị TACE, có nút loa để nghe đọc to.',
      'Ảnh chụp nhật ký sức khỏe: chọn triệu chứng bằng biểu tượng và chấm mức đau bằng gương mặt từ 0 đến 10.',
      'Ảnh chụp phần lời khuyên nhanh khi có triệu chứng.',
      'Ảnh chụp hành trình điều trị TACE 4 bước, từ hội chẩn đến xuất viện.',
      'Ảnh chụp các chuyên mục cẩm nang chăm sóc.',
    ],
  },
}

export const SCENARIOS = {
  eyebrow: 'Có thể làm cho bạn',
  title: 'Những bài toán tương tự chúng tôi giải được',
  tag: 'Minh họa',
  before: 'Trước:',
  after: 'Sau:',
  items: [
    {
      title: 'Shop online bán qua Zalo & Facebook',
      before: 'Đơn chốt rải rác trong tin nhắn, tối ngồi chép vào Excel. Có hôm sót đơn. Khách hỏi "đơn em tới đâu rồi" là phải lục lại.',
      after: 'Đơn từ Zalo, Facebook vào chung một danh sách, kho tự trừ, khách tự tra đơn bằng số điện thoại.',
    },
    {
      title: 'Spa, phòng khám có lịch hẹn',
      before: 'Lịch ghi sổ, khách quên hẹn, lễ tân gọi nhắc từng người.',
      after: 'Khách đặt lịch trên điện thoại và tự nhận tin nhắc trước một ngày. Chủ xem lịch cả tuần ở bất cứ đâu. Sau liệu trình, khách có trang hướng dẫn chăm sóc tại nhà, giống tuchamsocgan.vn.',
    },
    {
      title: 'Cửa hàng có kho và vài chi nhánh',
      before: 'Mỗi chi nhánh một file, cuối tháng mới biết lời lỗ. Hàng bên này hết, bên kia lại tồn.',
      after: 'Một màn hình xem tồn kho mọi chi nhánh, chuyển hàng qua lại vài lần chạm, doanh thu từng nơi theo ngày.',
    },
  ],
}

export const PROCESS = {
  eyebrow: 'Làm việc thế nào',
  title: 'Rõ ràng từng bước, không bất ngờ về tiền',
  steps: [
    {
      title: 'Trò chuyện',
      meta: '30 phút, miễn phí',
      text: 'Bạn kể cách đang làm, chúng tôi hỏi kỹ — qua Zalo, điện thoại hoặc gặp trực tiếp. Bạn sẽ biết có nên làm hay không, kể cả khi câu trả lời là "phần mềm có sẵn là đủ".',
    },
    {
      title: 'Đề xuất & báo giá',
      meta: 'trong 1–3 ngày',
      text: 'Làm những gì, bao lâu, bao nhiêu tiền — ghi rõ trên giấy. Chưa đồng ý thì chưa mất gì.',
    },
    {
      title: 'Làm thử phần quan trọng nhất',
      meta: '2–4 tuần',
      text: 'Bạn dùng thử với công việc thật trước khi làm hết. Chưa hợp thì chỉnh, và bạn chưa phải trả cho cả hệ thống.',
    },
    {
      title: 'Bàn giao & đồng hành',
      meta: '',
      text: 'Hướng dẫn tận tay cho bạn và nhân viên. Sửa lỗi miễn phí trong 3 tháng. Hỗ trợ qua Zalo khi cần.',
    },
  ],
  cta: 'Bắt đầu bằng một cuộc trò chuyện →',
}

export const WHY = {
  eyebrow: 'Vì sao là chúng tôi',
  title: 'Đơn giản là ưu tiên số một',
  items: [
    {
      title: 'Dễ dùng trước hết.',
      text: 'Chúng tôi thiết kế cho người bận rộn, không rành máy tính. Bằng chứng: người bệnh lớn tuổi tự dùng được tuchamsocgan.vn.',
    },
    {
      title: 'Nói tiếng Việt đời thường.',
      text: 'Không thuật ngữ, không vòng vo. Bạn hỏi gì, chúng tôi trả lời sao cho bạn hiểu.',
    },
    {
      title: 'An toàn dữ liệu từ ngày đầu.',
      text: 'Kiểm tra bảo mật là một dịch vụ chúng tôi làm riêng, nên phần mềm của bạn được làm theo cùng tiêu chuẩn: chia quyền, sao lưu, bảo vệ mật khẩu.',
    },
    {
      title: 'Bạn là chủ phần mềm và dữ liệu.',
      text: 'Muốn xuất dữ liệu ra Excel lúc nào cũng được. Bàn giao mã nguồn nếu bạn muốn.',
    },
    {
      title: 'Nói thật khi không cần làm riêng.',
      text: 'Nếu KiotViet, Sapo hay Google Sheet đủ dùng, chúng tôi sẽ nói thẳng.',
    },
  ],
  enso: 'Ensō là vòng tròn vẽ bằng một nét trong thiền Nhật Bản, tượng trưng cho sự trọn vẹn và đơn giản. Đó cũng là cách chúng tôi muốn phần mềm của bạn: khép kín, gọn gàng, không thừa.',
  team: 'Đội ngũ kỹ sư chuyên nghiệp',
}

export type Faq = { q: string; a?: string; list?: string[] }

export const FAQ = {
  eyebrow: 'Hỏi đáp',
  title: 'Những câu khách hay hỏi',
  items: [
    {
      q: 'Làm một phần mềm như vậy tốn bao nhiêu?',
      a: 'Tùy độ lớn. Một phần mềm nhỏ, VD quản lý đơn và kho cho một cửa hàng, thường từ 3 triệu. Hệ thống nhiều chi nhánh hoặc có ứng dụng cho khách thì từ 20 triệu. Giá cụ thể từng dự án khác nhau, cần trao đổi chi tiết. Bạn nhận báo giá sau buổi trò chuyện đầu, trước khi quyết định bất cứ điều gì.',
    },
    {
      q: 'Bao lâu thì dùng được?',
      a: 'Phần quan trọng nhất thường dùng thử được sau 2–4 tuần. Phần còn lại làm dần theo thứ tự bạn cần.',
    },
    {
      q: 'Sao không dùng KiotViet, Sapo cho rẻ?',
      a: 'Nếu phần mềm có sẵn đủ dùng, bạn nên dùng — chúng tôi sẽ nói thật. Làm riêng đáng tiền khi:',
      list: [
        'cách làm của bạn đặc thù;',
        'bạn đang chắp vá 3–4 công cụ;',
        'hoặc bạn cần thứ phần mềm có sẵn không có, như ứng dụng riêng cho khách.',
      ],
    },
    {
      q: 'Tôi và nhân viên không rành công nghệ, có dùng được không?',
      a: 'Được — đây là điều chúng tôi chú trọng nhất. Mỗi màn hình chỉ làm một việc, chữ to, nút rõ. Chúng tôi hướng dẫn tận tay đến khi mọi người tự làm được.',
    },
    {
      q: 'Dữ liệu của tôi để ở đâu, có an toàn không?',
      list: [
        'Lưu trên máy chủ ở Việt Nam hoặc dịch vụ đám mây, tùy yêu cầu của bạn.',
        'Sao lưu định kỳ theo yêu cầu của bạn.',
        'Chỉ người bạn cho phép mới xem được.',
        'Dữ liệu là của bạn.',
      ],
    },
    {
      q: 'Làm xong rồi, hỏng thì sao?',
      a: 'Sửa lỗi miễn phí trong 3 tháng. Sau đó có gói bảo trì hằng tháng, giá do hai bên trao đổi, hoặc gọi khi cần.',
    },
    {
      q: 'Sau này muốn thêm tính năng thì sao?',
      a: 'Thêm được. Phần mềm được làm theo từng phần nên mở rộng dễ, và mỗi lần thêm đều báo giá trước.',
    },
    {
      q: 'Có phải trả hết tiền một lần không?',
      a: 'Không. Thanh toán theo từng giai đoạn, thông thường 30% – 40% – 30%.',
    },
    {
      q: 'Tôi ở tỉnh khác, có làm được không?',
      a: 'Được. Phần lớn công việc trao đổi qua Zalo và gọi video. Khi cần, chúng tôi gặp trực tiếp tại TP.HCM.',
    },
  ] satisfies Faq[],
}

export const CONTACT_SECTION = {
  eyebrow: 'Bắt đầu',
  title: 'Kể cho chúng tôi nghe bạn đang vướng ở đâu.',
  lead: 'Không cần chuẩn bị gì. Một tin nhắn Zalo là đủ — chúng tôi sẽ hỏi phần còn lại.',
  channels: [
    { label: 'Zalo (nhanh nhất)', value: 'Nhắn Zalo 0364 151 304', href: CONTACT.zaloHref },
    { label: 'Gọi điện', value: '0364 151 304', href: CONTACT.phoneHref, note: 'Giờ làm việc 9h – 18h, thứ 2 – thứ 6' },
    { label: 'Messenger', value: 'Nhắn qua Facebook', href: CONTACT.messengerHref },
    { label: 'Email', value: 'ensotechstudio@gmail.com', href: CONTACT.emailHref },
  ],
}

export const FORM = {
  title: 'Hoặc để lại số, chúng tôi gọi lại',
  name: { label: 'Tên của bạn', placeholder: 'VD: Chị Lan' },
  phone: { label: 'Số điện thoại / Zalo', placeholder: 'VD: 0912 345 678' },
  need: { label: 'Bạn đang mất thời gian nhất vào việc gì?', placeholder: 'VD: Mỗi tối mất 2 tiếng nhập đơn từ Zalo vào Excel.' },
  quickLabel: 'Chọn nhanh (không bắt buộc):',
  quick: [
    'Quản lý bán hàng, kho',
    'Ứng dụng cho khách hàng',
    'Tự động hóa việc lặp lại',
    'Kiểm tra an toàn dữ liệu',
    'Chưa rõ, muốn được tư vấn',
  ],
  submit: 'Gửi — chúng tôi gọi lại',
  note: 'Chúng tôi gọi hoặc nhắn Zalo lại trong 1 ngày làm việc. Số của bạn chỉ dùng để tư vấn, không chia sẻ cho ai.',
  errors: {
    name: 'Bạn cho chúng tôi biết tên để tiện xưng hô nhé.',
    phone: 'Số điện thoại chưa đúng, bạn kiểm tra lại giúp nhé.',
  },
  sending: 'Đang gửi…',
  successTitle: 'Đã nhận!',
  success: 'Chúng tôi sẽ liên hệ bạn trong 1 ngày làm việc. Gấp thì nhắn Zalo 0364 151 304 nhé.',
  failure: 'Chưa gửi được. Bạn thử lại, hoặc nhắn thẳng Zalo 0364 151 304.',
}

// Không có trong CONTENT.md: thước đo hành trình ở đáy màn hình, theo hướng "Thuỷ mặc" chủ trang đã chọn (aria-hidden).
export const HUD = {
  toGate: (m: number) => `Còn ${m} m tới Vũ Môn`,
  climb: (m: number) => `Vượt thác ${m} m`,
  dragon: 'Hoá rồng',
}

// Chữ trong bản dựng lại giao diện tuchamsocgan.vn (trang trí, aria-hidden): chỉ dùng chuỗi đã trích trong CONTENT.md mục 5.
export const MOCK = {
  readAloud: 'Đọc to nội dung cho ông/bà',
  health: 'Sức khỏe hôm nay',
  advice: 'Lời khuyên nhanh từ hệ thống tư vấn thông minh',
  journey: 'Hành trình điều trị TACE',
}

export const FOOTER = {
  description:
    'Làm phần mềm và ứng dụng theo yêu cầu cho cửa hàng, doanh nghiệp nhỏ, spa và phòng khám — dễ dùng, an toàn dữ liệu.',
  contactTitle: 'Liên hệ',
  contact: [
    { label: 'Zalo / điện thoại 0364 151 304', href: CONTACT.zaloHref },
    { label: 'ensotechstudio@gmail.com', href: CONTACT.emailHref },
    { label: 'Messenger', href: CONTACT.messengerHref },
  ],
  linksTitle: 'Liên kết',
  legal: '© 2026 EnsoTech Studio',
  legalNote: 'TP.HCM',
  privacyTitle: 'Bảo mật thông tin',
  privacy: 'Thông tin bạn gửi chỉ dùng để tư vấn. Chúng tôi không bán hay chia sẻ cho bên thứ ba.',
}
