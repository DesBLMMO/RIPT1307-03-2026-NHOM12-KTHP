// app/api/seed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.srsProgress.deleteMany({});
    await prisma.word.deleteMany({});
    await prisma.vocabSet.deleteMany({});

    const createdSets = await Promise.all([
      prisma.vocabSet.create({
        data: {
          title: "IELTS Starter: Daily Life",
          description: "Từ vựng cơ bản IELTS cho tình huống đời sống hàng ngày.",
          category: "IELTS",
          difficulty: 2,
          words: {
            create: [
              { word: "Routine", meaning: "Thói quen", type: "Noun", phonetic: "/ruːˈtiːn/", exampleEn: "She follows a strict morning routine.", exampleVi: "Cô ấy theo một thói quen buổi sáng nghiêm ngặt." },
              { word: "Convenient", meaning: "Thuận tiện", type: "Adj", phonetic: "/kənˈviːniənt/", exampleEn: "The location is very convenient for work.", exampleVi: "Vị trí rất thuận tiện cho công việc." },
              { word: "Neighbour", meaning: "Hàng xóm", type: "Noun", phonetic: "/ˈneɪbər/", exampleEn: "Our neighbour brought us food.", exampleVi: "Hàng xóm mang đồ ăn cho chúng tôi." },
              { word: "Affordable", meaning: "Phải chăng", type: "Adj", phonetic: "/əˈfɔːrdəbəl/", exampleEn: "The tickets are affordable for students.", exampleVi: "Vé rất phải chăng cho sinh viên." },
              { word: "Bargain", meaning: "Món hời", type: "Noun", phonetic: "/ˈbɑːrɡən/", exampleEn: "I found a bargain at the market.", exampleVi: "Tôi tìm thấy một món hời ở chợ." }
            ]
          }
        }
      }),
      prisma.vocabSet.create({
        data: {
          title: "TOEIC Office Essentials",
          description: "Từ vựng TOEIC thiết yếu cho môi trường văn phòng.",
          category: "TOEIC",
          difficulty: 3,
          words: {
            create: [
              { word: "Deadline", meaning: "Hạn chót", type: "Noun", phonetic: "/ˈdedlaɪn/", exampleEn: "The deadline is next Monday.", exampleVi: "Hạn chót là thứ Hai tới." },
              { word: "Schedule", meaning: "Lịch trình", type: "Noun", phonetic: "/ˈskedʒuːl/", exampleEn: "Please check your schedule.", exampleVi: "Vui lòng kiểm tra lịch của bạn." },
              { word: "Colleague", meaning: "Đồng nghiệp", type: "Noun", phonetic: "/ˈkɑːliːɡ/", exampleEn: "My colleague helped me with the report.", exampleVi: "Đồng nghiệp của tôi đã giúp tôi với báo cáo." },
              { word: "Meeting", meaning: "Cuộc họp", type: "Noun", phonetic: "/ˈmiːtɪŋ/", exampleEn: "The meeting starts at 10 a.m.", exampleVi: "Cuộc họp bắt đầu lúc 10 giờ sáng." },
              { word: "Proposal", meaning: "Đề xuất", type: "Noun", phonetic: "/prəˈpoʊzəl/", exampleEn: "I submitted a proposal to the manager.", exampleVi: "Tôi đã nộp đề xuất cho quản lý." }
            ]
          }
        }
      }),
      prisma.vocabSet.create({
        data: {
          title: "THPT Academic Reading",
          description: "Từ vựng THPT chuyên cho bài đọc học thuật.",
          category: "THPT",
          difficulty: 4,
          words: {
            create: [
              { word: "Analyze", meaning: "Phân tích", type: "Verb", phonetic: "/ˈænəlaɪz/", exampleEn: "Students must analyze the passage.", exampleVi: "Học sinh phải phân tích đoạn văn." },
              { word: "Interpret", meaning: "Diễn giải", type: "Verb", phonetic: "/ɪnˈtɜːrprət/", exampleEn: "She can interpret complex ideas clearly.", exampleVi: "Cô ấy có thể diễn giải rõ ràng các ý tưởng phức tạp." },
              { word: "Hypothesis", meaning: "Giả thuyết", type: "Noun", phonetic: "/haɪˈpɒθəsɪs/", exampleEn: "The hypothesis was tested in the experiment.", exampleVi: "Giả thuyết đã được kiểm tra trong thí nghiệm." },
              { word: "Evaluate", meaning: "Đánh giá", type: "Verb", phonetic: "/ɪˈvæljueɪt/", exampleEn: "We need to evaluate the evidence.", exampleVi: "Chúng ta cần đánh giá bằng chứng." },
              { word: "Concept", meaning: "Khái niệm", type: "Noun", phonetic: "/ˈkɒnsept/", exampleEn: "This concept is difficult to understand.", exampleVi: "Khái niệm này khó hiểu." }
            ]
          }
        }
      }),
      prisma.vocabSet.create({
        data: {
          title: "Travel Vocabulary",
          description: "Từ vựng du lịch cơ bản cho sân bay và khách sạn.",
          category: "Travel",
          difficulty: 2,
          words: {
            create: [
              { word: "Boarding pass", meaning: "Thẻ lên máy bay", type: "Noun", phonetic: "/ˈbɔːrdɪŋ pæs/", exampleEn: "Please show your boarding pass at the gate.", exampleVi: "Vui lòng trình thẻ lên máy bay ở cổng." },
              { word: "Luggage", meaning: "Hành lý", type: "Noun", phonetic: "/ˈlʌɡɪdʒ/", exampleEn: "Your luggage must be under 20kg.", exampleVi: "Hành lý của bạn phải dưới 20kg." },
              { word: "Reservation", meaning: "Đặt chỗ", type: "Noun", phonetic: "/ˌrezərˈveɪʃən/", exampleEn: "I made a reservation for two nights.", exampleVi: "Tôi đã đặt chỗ cho hai đêm." },
              { word: "Check-in", meaning: "Làm thủ tục", type: "Noun", phonetic: "/ˈtʃek ɪn/", exampleEn: "The check-in counter is over there.", exampleVi: "Quầy làm thủ tục ở đằng kia." },
              { word: "Suite", meaning: "Phòng suite", type: "Noun", phonetic: "/swiːt/", exampleEn: "They booked a suite with a sea view.", exampleVi: "Họ đã đặt một phòng suite với tầm nhìn ra biển." }
            ]
          }
        }
      }),
      prisma.vocabSet.create({
        data: {
          title: "Health & Lifestyle",
          description: "Từ vựng về sức khỏe và lối sống lành mạnh.",
          category: "Health",
          difficulty: 3,
          words: {
            create: [
              { word: "Nutrition", meaning: "Dinh dưỡng", type: "Noun", phonetic: "/nuːˈtrɪʃən/", exampleEn: "Good nutrition is important for health.", exampleVi: "Dinh dưỡng tốt rất quan trọng cho sức khỏe." },
              { word: "Wellness", meaning: "Sức khỏe toàn diện", type: "Noun", phonetic: "/ˈwelnəs/", exampleEn: "She attends a wellness program every week.", exampleVi: "Cô ấy tham gia một chương trình chăm sóc sức khỏe mỗi tuần." },
              { word: "Exercise", meaning: "Tập thể dục", type: "Noun", phonetic: "/ˈeksərsaɪz/", exampleEn: "Regular exercise keeps you fit.", exampleVi: "Tập thể dục đều đặn giúp bạn khỏe mạnh." },
              { word: "Hydration", meaning: "Cấp nước", type: "Noun", phonetic: "/haɪˈdreɪʃən/", exampleEn: "Hydration is essential during summer.", exampleVi: "Cấp nước rất cần thiết vào mùa hè." },
              { word: "Mindfulness", meaning: "Chánh niệm", type: "Noun", phonetic: "/ˈmaɪndfəl.nəs/", exampleEn: "Mindfulness helps reduce stress.", exampleVi: "Chánh niệm giúp giảm căng thẳng." }
            ]
          }
        }
      })
    ]);

    return NextResponse.json({ success: true, message: "Đã tạo thành công nhiều bộ từ mẫu và category đa dạng!", data: createdSets });
  } catch (error: any) {
    console.error("LỖI SEED DATA:", error);
    return NextResponse.json({ success: false, error: "Lỗi nạp dữ liệu", details: error.message }, { status: 500 });
  }
}