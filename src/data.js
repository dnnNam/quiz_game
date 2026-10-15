// Mỗi vòng có 1 từ khóa bí mật.
// Số câu hỏi >= số ký tự của từ khóa (không tính khoảng trắng).
// Câu thứ i (i nhỏ hơn số ký tự) trả lời đúng -> mở ký tự thứ i của từ khóa.
// Các câu dư phía sau chỉ để cộng điểm, không mở ký tự.
// answer = vị trí đáp án đúng trong mảng options (bắt đầu từ 0).

export const rounds = [
  {
    topic: "Địa danh nổi tiếng ở thủ đô", // "Hồ Gươm" = 6 ký tự -> 6 câu + 1 câu dư
    keyword: "Hồ Gươm",
    questions: [
      {
        q: "Thủ đô của Việt Nam là thành phố nào?",
        options: ["Huế", "Hà Nội", "Đà Nẵng", "Hải Phòng"],
        answer: 1,
      },
      {
        q: "Vị vua nào gắn với truyền thuyết trả gươm thần?",
        options: ["Lê Lợi", "Trần Hưng Đạo", "Quang Trung", "Lý Thái Tổ"],
        answer: 0,
      },
      {
        q: "Con vật nào trong truyền thuyết đã đòi lại gươm?",
        options: ["Rồng vàng", "Cá chép", "Rùa vàng", "Phượng hoàng"],
        answer: 2,
      },
      {
        q: "“Hoàn Kiếm” nghĩa là gì?",
        options: ["Trả lại gươm", "Rèn gươm", "Giấu gươm", "Tìm gươm"],
        answer: 0,
      },
      {
        q: "Ngọn tháp nằm giữa hồ có tên là gì?",
        options: ["Tháp Bút", "Tháp Rùa", "Tháp Chàm", "Tháp Hòa Phong"],
        answer: 1,
      },
      {
        q: "Hồ này thuộc quận nào của Hà Nội?",
        options: ["Ba Đình", "Tây Hồ", "Hoàn Kiếm", "Đống Đa"],
        answer: 2,
      },
      {
        q: "(Câu dư) Thanh gươm thần của Lê Lợi tên là gì?",
        options: ["Thuận Thiên", "Long Tuyền", "Thanh Long", "Tử Điện"],
        answer: 0,
      },
    ],
  },
  {
    topic: "Món ăn quốc hồn quốc túy", // "Phở" = 3 ký tự -> 3 câu + 2 câu dư
    keyword: "Phở",
    questions: [
      {
        q: "Sợi bánh của món này được làm từ nguyên liệu nào?",
        options: ["Bột mì", "Khoai lang", "Gạo", "Bột sắn"],
        answer: 2,
      },
      {
        q: "Nước dùng thường được ninh từ gì?",
        options: ["Xương bò", "Rau củ", "Tôm khô", "Nấm"],
        answer: 0,
      },
      {
        q: "Gia vị nào làm nên mùi thơm đặc trưng của nước dùng?",
        options: ["Sả", "Riềng", "Hoa hồi", "Nghệ"],
        answer: 2,
      },
      {
        q: "(Câu dư) Món này nổi tiếng đầu tiên ở khu vực nào?",
        options: ["Miền Tây", "Hà Nội và Nam Định", "Tây Nguyên", "Quảng Nam"],
        answer: 1,
      },
      {
        q: "(Câu dư) Món này thường ăn kèm với món gì?",
        options: ["Quẩy", "Kem", "Xôi chiên", "Bánh flan"],
        answer: 0,
      },
    ],
  },
  {
    topic: "Trang phục truyền thống", // "Áo dài" = 5 ký tự -> 5 câu
    keyword: "Áo dài",
    questions: [
      {
        q: "Trang phục này thường được xem là của ai?",
        options: ["Nam giới", "Trẻ em", "Phụ nữ Việt Nam", "Nghệ sĩ cải lương"],
        answer: 2,
      },
      {
        q: "Thân áo có mấy tà (vạt) dài?",
        options: ["1", "2", "3", "4"],
        answer: 1,
      },
      {
        q: "Thường mặc cùng loại quần nào?",
        options: ["Quần jean", "Quần short", "Quần lụa ống rộng", "Quần yếm"],
        answer: 2,
      },
      {
        q: "Nữ sinh Việt Nam thường mặc trang phục này màu gì?",
        options: ["Đỏ", "Trắng", "Đen", "Xanh lá"],
        answer: 1,
      },
      {
        q: "Kiểu cổ truyền thống của trang phục này là gì?",
        options: ["Cổ tim", "Cổ bẻ", "Cổ đứng", "Cổ thuyền"],
        answer: 2,
      },
    ],
  },
];
