import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo 5 lộ trình mẫu đan xen Miễn phí & PRO...');

  // ========================================================
  // LỘ TRÌNH 1: TIẾNG ANH CÔNG NGHỆ THÔNG TIN (IT)
  // ========================================================
  console.log('📦 Lộ trình 1: Công Nghệ Thông Tin...');
  
  const itFree1 = await prisma.vocabSet.create({
    data: {
      title: "Nhập môn Lập trình",
      description: "Các thuật ngữ căn bản mà mọi lập trình viên đều phải biết khi mới bắt đầu.",
      isPremium: false,
      category: "IT",
      difficulty: 1,
      emoji: "💻",
      emojiBg: "#e0f2fe",
    }
  });
  await prisma.word.createMany({
    data: [
      { setId: itFree1.id, word: "Variable", meaning: "Biến số", phonetic: "/ˈveəriəbl/", type: "Noun", exampleEn: "Declare a variable before using it.", exampleVi: "Khai báo một biến trước khi sử dụng nó." },
      { setId: itFree1.id, word: "Function", meaning: "Hàm số / Hàm chức năng", phonetic: "/ˈfʌŋkʃn/", type: "Noun", exampleEn: "This function returns an array.", exampleVi: "Hàm này trả về một mảng." }
    ]
  });

  const itFree2 = await prisma.vocabSet.create({
    data: {
      title: "Giao diện người dùng (UI/UX)",
      description: "Từ vựng về thiết kế layout, thành phần trang web và trải nghiệm ứng dụng.",
      isPremium: false,
      category: "IT",
      difficulty: 2,
      emoji: "🎨",
      emojiBg: "#fefeb3",
    }
  });
  await prisma.word.createMany({
    data: [
      { setId: itFree2.id, word: "Responsive", meaning: "Tương thích đa màn hình", phonetic: "/rɪˈspɒnsɪv/", type: "Adjective", exampleEn: "The website layout must be responsive.", exampleVi: "Giao diện trang web phải tương thích đa màn hình." },
      { setId: itFree2.id, word: "Component", meaning: "Thành phần giao diện", phonetic: "/kəmˈpəʊnənt/", type: "Noun", exampleEn: "Create a reusable button component.", exampleVi: "Tạo một thành phần nút bấm có thể tái sử dụng." }
    ]
  });

  const itPro1 = await prisma.vocabSet.create({
    data: {
      title: "Cấu trúc dữ liệu nâng cao",
      description: "Thuật toán tối ưu bộ nhớ và cấu trúc tổ chức dữ liệu lớn.",
      isPremium: true,
      category: "IT",
      difficulty: 4,
      emoji: "⛓️",
      emojiBg: "#f3e8ff",
    }
  });
  await prisma.word.createMany({
    data: [
      { setId: itPro1.id, word: "Algorithm", meaning: "Thuật toán", phonetic: "/ˈælɡərɪðəm/", type: "Noun", exampleEn: "An efficient algorithm saves system memory.", exampleVi: "Một thuật toán hiệu quả giúp tiết kiệm bộ nhớ hệ thống." },
      { setId: itPro1.id, word: "Recursion", meaning: "Phép đệ quy", phonetic: "/rɪˈkɜːʃn/", type: "Noun", exampleEn: "Understand recursion to solve complex tree nodes.", exampleVi: "Hiểu về đệ quy để giải quyết các nút cây phức tạp." }
    ]
  });

  const itPro2 = await prisma.vocabSet.create({
    data: {
      title: "Hệ thống Đám mây & DevOps",
      description: "Các thuật ngữ về hạ tầng Cloud, CI/CD và bảo mật máy chủ Cloud.",
      isPremium: true,
      category: "IT",
      difficulty: 5,
      emoji: "☁️",
      emojiBg: "#ecfeff",
    }
  });
  await prisma.word.createMany({
    data: [
      { setId: itPro2.id, word: "Deployment", meaning: "Sự triển khai phần mềm", phonetic: "/dɪˈplɔɪmənt/", type: "Noun", exampleEn: "Automated deployment reduces production errors.", exampleVi: "Triển khai tự động giúp giảm thiểu lỗi trên môi trường thực tế." },
      { setId: itPro2.id, word: "Scalability", meaning: "Khả năng mở rộng hệ thống", phonetic: "/ˌskeɪləˈbɪləti/", type: "Noun", exampleEn: "Cloud services offer great scalability.", exampleVi: "Dịch vụ đám mây cung cấp khả năng mở rộng hệ thống tuyệt vời." }
    ]
  });

  // ========================================================
  // LỘ TRÌNH 2: TỪ VỰNG LUYỆN THI IELTS 7.5+
  // ========================================================
  console.log('📦 Lộ trình 2: Luyện Thi IELTS...');

  const ieltsFree1 = await prisma.vocabSet.create({
    data: { title: "Chủ đề Giáo dục & Trường học", isPremium: false, category: "IELTS", difficulty: 3, emoji: "🏫" }
  });
  await prisma.word.createMany({
    data: [
      { setId: ieltsFree1.id, word: "Curriculum", meaning: "Chương trình khung môn học", phonetic: "/kəˈrɪkjələm/", type: "Noun", exampleEn: "The school is upgrading its science curriculum.", exampleVi: "Trường học đang nâng cấp chương trình môn khoa học." }
    ]
  });

  const ieltsFree2 = await prisma.vocabSet.create({
    data: { title: "Chủ đề Môi trường & Thiên nhiên", isPremium: false, category: "IELTS", difficulty: 3, emoji: "🌱" }
  });
  await prisma.word.createMany({
    data: [
      { setId: ieltsFree2.id, word: "Ecosystem", meaning: "Hệ sinh thái", phonetic: "/ˈiːkəʊsɪstəm/", type: "Noun", exampleEn: "Pollution damages the local ecosystem.", exampleVi: "Ô nhiễm làm tổn hại đến hệ sinh thái địa phương." }
    ]
  });

  const ieltsPro1 = await prisma.vocabSet.create({
    data: { title: "Chủ đề Kinh tế & Tài chính vĩ mô", isPremium: true, category: "IELTS", difficulty: 4, emoji: "📈" }
  });
  await prisma.word.createMany({
    data: [
      { setId: ieltsPro1.id, word: "Inflation", meaning: "Sự lạm phát", phonetic: "/ɪnˈfleɪʃn/", type: "Noun", exampleEn: "High inflation erodes people's purchasing power.", exampleVi: "Lạm phát cao làm xói mòn sức mua của người dân." }
    ]
  });

  const ieltsPro2 = await prisma.vocabSet.create({
    data: { title: "Chủ đề Y tế & Công nghệ Sinh học", isPremium: true, category: "IELTS", difficulty: 5, emoji: "🧬" }
  });
  await prisma.word.createMany({
    data: [
      { setId: ieltsPro2.id, word: "Biodiversity", meaning: "Đa dạng sinh học", phonetic: "/ˌbaɪəudaɪˈvɜːsəti/", type: "Noun", exampleEn: "Human activities threaten global biodiversity.", exampleVi: "Hoạt động của con người đang đe dọa đa dạng sinh học toàn cầu." }
    ]
  });

  // ========================================================
  // LỘ TRÌNH 3: TIẾNG ANH THƯƠNG MẠI (TOEIC & BUSINESS)
  // ========================================================
  console.log('📦 Lộ trình 3: Tiếng Anh Thương Mại...');

  const toeicFree1 = await prisma.vocabSet.create({
    data: { title: "Văn phòng & Đời sống Công sở", isPremium: false, category: "TOEIC", difficulty: 2, emoji: "🏢" }
  });
  await prisma.word.createMany({
    data: [
      { setId: toeicFree1.id, word: "Colleague", meaning: "Đồng nghiệp", phonetic: "/ˈkɒliːɡ/", type: "Noun", exampleEn: "She gets along well with her colleagues.", exampleVi: "Cô ấy hòa đồng rất tốt với các đồng nghiệp." }
    ]
  });

  const toeicFree2 = await prisma.vocabSet.create({
    data: { title: "Họp hành & Thảo luận dự án", isPremium: false, category: "TOEIC", difficulty: 2, emoji: "📅" }
  });
  await prisma.word.createMany({
    data: [
      { setId: toeicFree2.id, word: "Postpone", meaning: "Hoãn lại lịch trình", phonetic: "/pəʊˈspəʊn/", type: "Verb", exampleEn: "The meeting was postponed until next Monday.", exampleVi: "Cuộc họp đã được hoãn lại cho tới thứ Hai tới." }
    ]
  });

  const toeicPro1 = await prisma.vocabSet.create({
    data: { title: "Đàm phán thương lượng hợp đồng", isPremium: true, category: "TOEIC", difficulty: 4, emoji: "🤝" }
  });
  await prisma.word.createMany({
    data: [
      { setId: toeicPro1.id, word: "Negotiate", meaning: "Đàm phán, thương thảo", phonetic: "/nɪˈɡəʊʃieɪt/", type: "Verb", exampleEn: "We managed to negotiate a better price.", exampleVi: "Chúng tôi đã thành công đàm phán một mức giá tốt hơn." }
    ]
  });

  const toeicPro2 = await prisma.vocabSet.create({
    data: { title: "Chiến lược Marketing toàn cầu", isPremium: true, category: "TOEIC", difficulty: 4, emoji: "📊" }
  });
  await prisma.word.createMany({
    data: [
      { setId: toeicPro2.id, word: "Demographic", meaning: "Nhóm phân khúc nhân khẩu học", phonetic: "/ˌdeməˈɡræfɪk/", type: "Noun", exampleEn: "Our target demographic is young professionals.", exampleVi: "Phân khúc khách hàng mục tiêu của chúng tôi là giới văn phòng trẻ." }
    ]
  });

  // ========================================================
  // LỘ TRÌNH 4: TIẾNG ANH DU LỊCH & ĐỜI SỐNG
  // ========================================================
  console.log('📦 Lộ trình 4: Du Lịch & Đời Sống...');

  const travelFree1 = await prisma.vocabSet.create({
    data: { title: "Thủ tục tại Sân bay", isPremium: false, category: "THPT", difficulty: 1, emoji: "✈️" }
  });
  await prisma.word.createMany({
    data: [
      { setId: travelFree1.id, word: "Luggage", meaning: "Hành lý", phonetic: "/ˈlʌɡɪdʒ/", type: "Noun", exampleEn: "Do not leave your luggage unattended.", exampleVi: "Đừng để hành lý của bạn mà không có người trông coi." }
    ]
  });

  const travelFree2 = await prisma.vocabSet.create({
    data: { title: "Đặt phòng Khách sạn", isPremium: false, category: "THPT", difficulty: 1, emoji: "🛎️" }
  });
  await prisma.word.createMany({
    data: [
      { setId: travelFree2.id, word: "Reservation", meaning: "Sự đặt chỗ trước", phonetic: "/ˌrezəˈveɪʃn/", type: "Noun", exampleEn: "I have a reservation under the name Dung.", exampleVi: "Tôi có một phòng đặt trước dưới tên Dũng." }
    ]
  });

  const travelPro1 = await prisma.vocabSet.create({
    data: { title: "Xử lý sự cố khẩn cấp nước ngoài", isPremium: true, category: "THPT", difficulty: 3, emoji: "🚨" }
  });
  await prisma.word.createMany({
    data: [
      { setId: travelPro1.id, word: "Embassy", meaning: "Đại sứ quán", phonetic: "/ˈembəsi/", type: "Noun", exampleEn: "Go to the embassy if you lose your passport.", exampleVi: "Hãy đến đại sứ quán nếu bạn bị mất hộ chiếu." }
    ]
  });

  const travelPro2 = await prisma.vocabSet.create({
    data: { title: "Trải nghiệm Ẩm thực cao cấp", isPremium: true, category: "THPT", difficulty: 3, emoji: "🍽️" }
  });
  await prisma.word.createMany({
    data: [
      { setId: travelPro2.id, word: "Appetizer", meaning: "Món khai vị đầu bữa", phonetic: "/ˈæpɪtaɪzə(r)/", type: "Noun", exampleEn: "Would you like an appetizer before the main course?", exampleVi: "Bạn có muốn dùng món khai vị trước bữa chính không?" }
    ]
  });

  // ========================================================
  // LỘ TRÌNH 5: TIẾNG ANH GIAO TIẾP HÀNG NGÀY
  // ========================================================
  console.log('📦 Lộ trình 5: Giao Tiếp Hàng Ngày...');

  const chatFree1 = await prisma.vocabSet.create({
    data: { title: "Chào hỏi & Kết bạn mới", isPremium: false, category: "Tất cả", difficulty: 1, emoji: "👋" }
  });
  await prisma.word.createMany({
    data: [
      { setId: chatFree1.id, word: "Acquaintance", meaning: "Người quen biết sơ sơ", phonetic: "/əˈkweɪntəns/", type: "Noun", exampleEn: "He's just an acquaintance, not a close friend.", exampleVi: "Anh ấy chỉ là người quen thôi, không phải bạn thân." }
    ]
  });

  const chatFree2 = await prisma.vocabSet.create({
    data: { title: "Hỏi đường & Định vị phương hướng", isPremium: false, category: "Tất cả", difficulty: 1, emoji: "📍" }
  });
  await prisma.word.createMany({
    data: [
      { setId: chatFree2.id, word: "Intersection", meaning: "Ngã tư đường giao nhau", phonetic: "/ˈɪntəsekʃn/", type: "Noun", exampleEn: "Turn left at the next intersection.", exampleVi: "Rẽ trái ở ngã tư tiếp theo." }
    ]
  });

  const chatPro1 = await prisma.vocabSet.create({
    data: { title: "Tranh luận & Bày tỏ quan điểm", isPremium: true, category: "Tất cả", difficulty: 3, emoji: "🗣️" }
  });
  await prisma.word.createMany({
    data: [
      { setId: chatPro1.id, word: "Perspective", meaning: "Góc nhìn, quan điểm cá nhân", phonetic: "/pəˈspektɪv/", type: "Noun", exampleEn: "Try to see the issue from his perspective.", exampleVi: "Hãy cố gắng nhìn nhận vấn đề từ góc nhìn của anh ấy." }
    ]
  });

  const chatPro2 = await prisma.vocabSet.create({
    data: { title: "Thành ngữ tiếng Anh ẩn dụ", isPremium: true, category: "Tất cả", difficulty: 3, emoji: "🎭" }
  });
  await prisma.word.createMany({
    data: [
      { setId: chatPro2.id, word: "Metaphor", meaning: "Phép ẩn dụ", phonetic: "/ˈmetəfə(r)/", type: "Noun", exampleEn: "The poem uses a powerful metaphor for winter.", exampleVi: "Bài thơ sử dụng một phép ẩn dụ mạnh mẽ về mùa đông." }
    ]
  });

  console.log('✅ Đã nạp thành công 5 lộ trình (20 bộ từ đan xen)!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi chạy seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });