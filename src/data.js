// Mỗi vòng có 1 từ khóa bí mật.
// Số câu hỏi >= số ký tự của từ khóa (không tính khoảng trắng).
// Câu thứ i (i nhỏ hơn số ký tự) trả lời đúng -> mở ký tự thứ i của từ khóa.
// Các câu dư phía sau chỉ để cộng điểm, không mở ký tự.
// answer = vị trí đáp án đúng trong mảng options (bắt đầu từ 0).

export const rounds = [
  {
    topic: "Khái niệm, hình thức và phương châm thực hiện Dân chủ xã hội chủ nghĩa ở Việt Nam",
    keyword: "DÂN CHỦ",
    questions: [
      {
        q: "Nền dân chủ xã hội chủ nghĩa ở Việt Nam được xác định vừa là mục tiêu, vừa là... của sự phát triển đất nước?",
        options: [
          "Điều kiện duy nhất",
          "Động lực",
          "Yếu tố cản trở",
          "Kết quả ngẫu nhiên",
        ],
        answer: 1,
      },
      {
        q: "Theo tư tưởng Hồ Chí Minh và đường lối của Đảng, trong chế độ dân chủ XHCN, bao nhiêu quyền hạn và lực lượng đều ở đâu?",
        options: [
          "Ở nơi giai cấp tư sản",
          "Ở nơi các tập đoàn kinh tế",
          "Ở nơi nhân dân",
          "Ở nơi các tổ chức quốc tế",
        ],
        answer: 2,
      },
      {
        q: "Hình thức dân chủ nào được thực hiện do nhân dân bằng hành động trực tiếp thực hiện quyền làm chủ nhà nước và xã hội?",
        options: [
          "Dân chủ đại diện",
          "Dân chủ gián tiếp",
          "Dân chủ trực tiếp",
          "Dân chủ tư sản",
        ],
        answer: 2,
      },
      {
        q: "Hình thức dân chủ nào được thực hiện do nhân dân \"ủy quyền\", bầu ra Quốc hội và HĐND đại diện cho quyền lực của mình?",
        options: [
          "Dân chủ trực tiếp",
          "Dân chủ gián tiếp (đại diện)",
          "Dân chủ chủ nô",
          "Dân chủ phi chính trị",
        ],
        answer: 1,
      },
      {
        q: "Nền dân chủ trên lĩnh vực kinh tế giữ vai trò gì đối với dân chủ trên lĩnh vực chính trị?",
        options: [
          "Là yếu tố phụ không đáng kể",
          "Là cơ sở, điều kiện tiên quyết để thực hiện dân chủ chính trị",
          "Cản trở dân chủ chính trị",
          "Thay thế hoàn toàn dân chủ chính trị",
        ],
        answer: 1,
      },
      {
        q: "Phương châm nổi tiếng thể hiện việc phát huy dân chủ trực tiếp ở cơ sở tại Việt Nam hiện nay là gì?",
        options: [
          "Dân làm, dân chịu, dân bỏ qua",
          "Dân biết, dân bàn, dân làm, dân kiểm tra",
          "Dân làm thay Nhà nước hoàn toàn",
          "Dân chỉ lắng nghe, không được bàn",
        ],
        answer: 1,
      },
    ],
  },
  {
    topic: "Chế độ sở hữu công hữu – Bệ đỡ kinh tế của nền Dân chủ xã hội chủ nghĩa",
    keyword: "CÔNG HỮU",
    questions: [
      {
        q: "Bản chất kinh tế của nền dân chủ xã hội chủ nghĩa lấy chế độ sở hữu nào về các tư liệu sản xuất chủ yếu làm nền tảng?",
        options: [
          "Chế độ tư hữu tư bản chủ nghĩa",
          "Chế độ công hữu (sở hữu xã hội)",
          "Chế độ chiếm hữu tư nhân phong kiến",
          "Chế độ sở hữu cá thể nhỏ lẻ",
        ],
        answer: 1,
      },
      {
        q: "Mục đích của việc thiết lập chế độ công hữu về tư liệu sản xuất chủ yếu trong nền dân chủ XHCN là gì?",
        options: [
          "Tăng cường áp bức giai cấp",
          "Triệt tiêu cơ sở sinh ra bất bình đẳng và chế độ bóc lột",
          "Phục vụ lợi ích riêng của giai cấp tư sản",
          "Tích lũy tư bản cho cá nhân",
        ],
        answer: 1,
      },
      {
        q: "Khác với nền dân chủ tư sản dựa trên tư hữu TBCN, nền dân chủ XHCN dựa trên chế độ công hữu nhằm đảm bảo quyền làm chủ thuộc về ai?",
        options: [
          "Một nhóm nhỏ nhà tư bản",
          "Giai cấp địa chủ",
          "Toàn thể nhân dân lao động",
          "Các công ty đa quốc gia",
        ],
        answer: 2,
      },
      {
        q: "Việc xóa bỏ tư hữu bóc lột và xác lập chế độ công hữu có tác dụng giải phóng yếu tố nào?",
        options: [
          "Lực lượng sản xuất",
          "Khả năng lao động sáng tạo của nhân dân",
          "Tiềm năng phát triển xã hội",
          "Cả A, B và C đều đúng",
        ],
        answer: 3,
      },
      {
        q: "Trong nền kinh tế thị trường định hướng XHCN ở Việt Nam, thành phần kinh tế nào dựa trên sở hữu công hữu toàn dân và giữ vai trò chủ đạo?",
        options: [
          "Kinh tế tư nhân",
          "Kinh tế có vốn đầu tư nước ngoài",
          "Kinh tế nhà nước",
          "Kinh tế cá thể",
        ],
        answer: 2,
      },
      {
        q: "Việc xác lập chế độ công hữu về tư liệu sản xuất chủ yếu là bệ đỡ vững chắc cho điều gì?",
        options: [
          "Quyền làm chủ thực sự của nhân dân về kinh tế và chính trị",
          "Sự duy trì chế độ bóc lột giá trị thặng dư",
          "Sự phân hóa giàu nghèo ngày càng sâu sắc",
          "Quyền lực độc tôn của giai cấp tư sản",
        ],
        answer: 0,
      },
      {
        q: "Sự khác biệt bản chất về mặt kinh tế giữa dân chủ XHCN và dân chủ tư sản thể hiện rõ nhất ở phương diện nào?",
        options: [
          "Sở hữu tư nhân về đất đai",
          "Chế độ công hữu về tư liệu sản xuất chủ yếu đối lập với chế độ tư hữu TBCN",
          "Phân phối hoàn toàn cào bằng",
          "Tự do cạnh tranh không có sự quản lý",
        ],
        answer: 1,
      },
    ],
  },
  {
    topic: "Quyền làm chủ toàn diện về kinh tế và chính trị của nhân dân lao động",
    keyword: "LÀM CHỦ",
    questions: [
      {
        q: "Quyền làm chủ kinh tế của nhân dân trong nền dân chủ XHCN thể hiện trước hết ở việc nhân dân làm chủ yếu tố nào?",
        options: [
          "Các tư liệu sản xuất chủ yếu của xã hội",
          "Nguồn tài chính của nước ngoài",
          "Tài sản tư nhân của các nhà tư bản",
          "Thị trường chứng khoán thế giới",
        ],
        answer: 0,
      },
      {
        q: "Theo nội dung bài thuyết trình (WHY), việc làm chủ về kinh tế là điều kiện tiên quyết để nhân dân thực sự làm chủ về lĩnh vực nào?",
        options: [
          "Tâm linh",
          "Chính trị",
          "Tự do cá nhân vô kỷ luật",
          "Tài chính quốc tế",
        ],
        answer: 1,
      },
      {
        q: "Nhân dân thực hiện quyền làm chủ của mình trong quá trình sản xuất kinh doanh, quản lý và... lợi ích?",
        options: [
          "Tích trữ",
          "Phân phối",
          "Chiếm đoạt",
          "Tiêu hủy",
        ],
        answer: 1,
      },
      {
        q: "Bản chất của Nhà nước và nền dân chủ xã hội chủ nghĩa ở Việt Nam được xác định là:",
        options: [
          "Của nhân dân, do nhân dân, vì nhân dân",
          "Của giai cấp tư sản, do tư sản, vì tư sản",
          "Của Nhà nước, do Nhà nước, vì Nhà nước",
          "Của các tập đoàn kinh tế lớn",
        ],
        answer: 0,
      },
      {
        q: "Ý thức làm chủ và trách nhiệm công dân của người dân trong xã hội được thể chế hóa thông qua công cụ nào?",
        options: [
          "Mệnh lệnh cá nhân",
          "Hệ thống pháp luật và chính sách của Nhà nước",
          "Quy định riêng của các tập đoàn",
          "Tập quán hủ lậu",
        ],
        answer: 1,
      },
      {
        q: "Trong tư tưởng Hồ Chí Minh, \"bao nhiêu quyền hạn và lực lượng làm chủ\" đều ở nơi nào?",
        options: [
          "Giai cấp phong kiến",
          "Nhân dân",
          "Tầng lớp quan lại",
          "Các nhà tư bản",
        ],
        answer: 1,
      },
    ],
  },
  {
    topic: "Nguyên tắc phân phối lợi ích theo lao động và bảo đảm công bằng xã hội",
    keyword: "PHÂN PHỐI",
    questions: [
      {
        q: "Nguyên tắc phân phối lợi ích chủ yếu trong nền dân chủ xã hội chủ nghĩa dựa trên cơ sở nào?",
        options: [
          "Phân phối theo vốn góp tư bản",
          "Phân phối theo kết quả lao động đóng góp",
          "Phân phối bình quân cào bằng",
          "Phân phối theo địa vị xã hội",
        ],
        answer: 1,
      },
      {
        q: "Chế độ phân phối theo lao động trong nền dân chủ XHCN nhằm thực hiện mục tiêu nào sau đây?",
        options: [
          "Duy trì bất bình đẳng xã hội",
          "Bóc lột sức lao động của công nhân",
          "Đảm bảo tính công bằng và khuyến khích cống hiến",
          "Làm cho người lao động bần cùng hóa",
        ],
        answer: 2,
      },
      {
        q: "Nguyên tắc phân phối \"Làm theo năng lực, hưởng theo lao động\" áp dụng chủ yếu ở giai đoạn nào?",
        options: [
          "Chủ nghĩa tư bản phát triển",
          "Giai đoạn thấp của hình thái kinh tế - xã hội cộng sản chủ nghĩa (Chủ nghĩa xã hội)",
          "Chế độ phong kiến",
          "Chế độ chiếm hữu nô lệ",
        ],
        answer: 1,
      },
      {
        q: "Bên cạnh phân phối theo lao động, nền kinh tế thị trường định hướng XHCN ở Việt Nam còn thực hiện hình thức phân phối nào?",
        options: [
          "Phân phối theo mức độ đóng góp vốn và các nguồn lực khác",
          "Phân phối thông qua hệ thống an sinh xã hội, phúc lợi xã hội",
          "Phân phối tùy tiện",
          "Cả A và B đều đúng",
        ],
        answer: 3,
      },
      {
        q: "Khác với phân phối tư bản chủ nghĩa (nhà tư bản chiếm đoạt giá trị thặng dư), phân phối lợi ích trong CNXH nhằm phục vụ mục tiêu tối cao là gì?",
        options: [
          "Tối đa hóa lợi nhuận cho chủ tư bản",
          "Thỏa mãn nhu cầu ngày càng cao và nâng cao đời sống của nhân dân lao động",
          "Phục vụ lợi ích nhóm",
          "Tích lũy tài sản cho Nhà nước mà không lo cho dân",
        ],
        answer: 1,
      },
      {
        q: "Sự kết hợp giữa phân phối theo lao động và phân phối qua phúc lợi xã hội góp phần giải quyết mối quan hệ nào?",
        options: [
          "Tăng trưởng kinh tế gắn liền với tiến bộ và công bằng xã hội",
          "Tăng trưởng kinh tế bằng mọi giá chấp nhận bất công",
          "Mở rộng khoảng cách giàu nghèo",
          "Triệt tiêu động lực phát triển kinh tế",
        ],
        answer: 0,
      },
      {
        q: "Trong slide WHAT của bài thuyết trình, trụ cột thứ hai về bản chất kinh tế được ghi nhận là gì?",
        options: [
          "Phân phối vốn tư bản",
          "Phân phối Lao động (lợi ích dựa trên kết quả lao động đóng góp)",
          "Phân phối bình quân",
          "Phân phối tự do không kiểm soát",
        ],
        answer: 1,
      },
      {
        q: "Việc phân phối lợi ích công bằng có tác dụng gì đối với người lao động trong nền kinh tế XHCN?",
        options: [
          "Tạo động lực cá nhân và thúc đẩy tính sáng tạo trong lao động",
          "Làm giảm năng suất lao động",
          "Khiến người lao động ỷ lại vào xã hội",
          "Triệt tiêu tinh thần hợp tác",
        ],
        answer: 0,
      },
    ],
  },
  {
    topic: "Thể chế hóa pháp luật và quản lý của Nhà nước trong nền kinh tế thị trường định hướng XHCN",
    keyword: "THỂ CHẾ",
    questions: [
      {
        q: "Để hiện thực hóa bản chất kinh tế của nền dân chủ XHCN trong thực tiễn, Nhà nước cần làm gì với đường lối của Đảng?",
        options: [
          "Giữ nguyên dưới dạng văn bản lý thuyết",
          "Thể chế hóa bằng hệ thống pháp luật và chính sách cụ thể",
          "Bỏ qua không áp dụng",
          "Nhượng quyền cho các công ty nước ngoài",
        ],
        answer: 1,
      },
      {
        q: "Việc thể chế hóa nền dân chủ XHCN bằng pháp luật nhằm đảm bảo điều gì cho nền kinh tế?",
        options: [
          "Vận hành theo định hướng xã hội chủ nghĩa và bảo vệ quyền lợi nhân dân",
          "Mở đường cho tư hữu hóa toàn bộ",
          "Loại bỏ vai trò quản lý của Nhà nước",
          "Phát triển kinh tế tự phát không quản lý",
        ],
        answer: 0,
      },
      {
        q: "Trong phần HOW của bài thuyết trình, nhiệm vụ thuộc về \"Quản lý nhà nước\" được tóm tắt là gì?",
        options: [
          "Thể chế hóa bằng pháp luật đảm bảo định hướng xã hội chủ nghĩa",
          "Tự do hóa hoàn toàn không có sự can thiệp",
          "Xóa bỏ luật pháp",
          "Chỉ tập trung thu thuế",
        ],
        answer: 0,
      },
      {
        q: "Việc xây dựng và hoàn thiện thể chế kinh tế thị trường định hướng XHCN tạo ra điều gì cho nền dân chủ?",
        options: [
          "Cơ sở kinh tế vững chắc",
          "Khó khăn cho doanh nghiệp",
          "Sự suy giảm quyền làm chủ",
          "Sự phụ thuộc vào bên ngoài",
        ],
        answer: 0,
      },
      {
        q: "Thể chế pháp luật trong nền dân chủ XHCN ở Việt Nam đặt phương châm nào làm nòng cốt trong quy chế dân chủ cơ sở?",
        options: [
          "Dân biết, dân bàn, dân làm, dân kiểm tra",
          "Dân tuân lệnh tuyệt đối",
          "Nhà nước làm thay nhân dân",
          "Cán bộ tự quyết định mọi việc",
        ],
        answer: 0,
      },
      {
        q: "Hoàn thiện thể chế kinh tế thị trường định hướng XHCN đòi hỏi phải đảm bảo vai trò chủ đạo của thành phần kinh tế nào?",
        options: [
          "Kinh tế tư nhân",
          "Kinh tế nhà nước",
          "Kinh tế tập thể",
          "Kinh tế cá thể",
        ],
        answer: 1,
      },
    ],
  },
];
