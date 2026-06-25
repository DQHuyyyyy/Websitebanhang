/* ============================================================
   DỮ LIỆU SHOP - CHỈNH SỬA FILE NÀY ĐỂ CẬP NHẬT WEBSITE
   ============================================================
   - SHOP_CONFIG: Thông tin shop (tên, SĐT Zalo, địa chỉ, giờ mở cửa)
   - CATEGORIES: Danh mục sản phẩm
   - PRODUCTS: Danh sách sản phẩm
   ============================================================ */

const SHOP_CONFIG = {
  name: "Tạp Hoá Thuỷ Điệp",
  tagline: "Cơm - Phở - Bún · Bia hơi & Đồ nhậu · Tạp hoá Bánh kẹo",
  description:
    "Tươi ngon mỗi ngày · Giao hàng tận nơi · Phục vụ tận tâm",
  // ⚠️ THAY SỐ ĐIỆN THOẠI ZALO CỦA BẠN VÀO ĐÂY
  zaloPhone: "0365982450",
  hotline: "0365982450",
  
  address: "B1.1 liền kề 10, khu đô thị Thanh Hà, Hà Đông, Hà Nội",
  hours: {
    weekday: "06:00 - 22:00 (Thứ 2 - Thứ 6)",
    weekend: "06:00 - 23:00 (Thứ 7, Chủ nhật)",
  },
  facebook: "https://facebook.com/taphoathuydiep",
  // Phí giao hàng mặc định (đ)
  shippingFee: 15000,
  // Đơn tối thiểu miễn phí ship (đ)
  freeShipMin: 200000,
};

const CATEGORIES = [
  { id: "all",      name: "Tất cả",                icon: "🛒" },
  { id: "com",      name: "Cơm bình dân",         icon: "🍚" },
  { id: "pho-bun",  name: "Phở & Bún",             icon: "🍜" },
  { id: "bia",      name: "Bia hơi & Đồ nhậu",     icon: "🍺" },
  { id: "nuoc",     name: "Nước giải khát",        icon: "🥤" },
  { id: "banh-keo", name: "Bánh kẹo & Tạp hoá",    icon: "🍪" },
];

const PRODUCTS = [
  // ====== CƠM BÌNH DÂN ======
  // Mục "Cơm bình dân" giờ dùng cơ chế "Cơm tự chọn":
  // khách tự ghép món trong ngày thành set 35k.
  // => Cấu hình ở COM_SET + DAILY_DISHES tại CUỐI FILE này, không khai báo set cố định ở đây nữa.

  // ====== PHỞ & BÚN ======
  { id: 201, cat: "pho-bun",  name: "Phở bò",              price: 35000, icon: "images/Bun/phở bò.webp", iconSize: 230, desc: "Nước dùng đậm đà, bò tái mềm" },
  { id: 202, cat: "pho-bun",  name: "Phở gà",             price: 35000, icon: "images/Bun/Phở gà.webp", iconSize: 230, desc: "Thịt bò chín nạm gầu, bánh phở dai" },
  { id: 203, cat: "pho-bun",  name: "Bún riêu cua",                  price: 35000, icon: "images/Bun/Bún riêu.jpg", iconSize: 230, desc: "Gà ta thả vườn, nước trong ngọt thanh" },
  // ====== BIA HƠI & ĐỒ NHẬU ======
  { id: 301, cat: "bia",      name: "Bia hơi Hà Nội can 1L",           price: 35000,  icon: "images/Bia/keg-30-lit-2155.png", iconSize: 230, desc: "Bia hơi Hà Nội mát lạnh" },
  { id: 302, cat: "bia",      name: "Bia hơi Hà Nội can 5L",       price: 175000, icon:  "images/Bia/keg-30-lit-2155.png", iconSize: 230, desc: "Bia hơi Hà Nội mát lạnh" },
  { id: 303, cat: "bia",      name: "Bia hơi Hà Nội can 10L",         price: 350000, icon:  "images/Bia/keg-30-lit-2155.png", iconSize: 230,  desc: "Bia hơi Hà Nội mát lạnh" },
  { id: 304, cat: "bia",      name: "Bia hơi Hà Nội can 20L",          price: 700000, icon:  "images/Bia/keg-30-lit-2155.png", iconSize: 230, desc: "Bia hơi Hà Nội mát lạnh" },
  { id: 305, cat: "bia",      name: "Lạc Luộc",             price: 20000, icon: "images/Bia/dau-phong-luoc-1.jpg", iconSize: 290, iconOffsetY: -20, desc: "Lạc luộc béo ngậy" },
    { id: 306, cat: "bia",      name: "Lạc rang muối",           price: 20000, icon: "images/Bia/lac_rang.jpeg", iconSize: 290,  iconOffsetY: -20,desc: "Đĩa lạc rang giòn rụm" },
  { id: 307, cat: "bia",      name: "Nem chua ",            price: 45000, icon: "images/Bia/nem-chua-chuan-thanh-hoa.jpg", iconSize: 260, desc: "10 chiếc, ăn kèm tương ớt" },
  { id: 308, cat: "bia",      name: "Nem bốc",           price: 35000, icon: "images/Bia/nem_thinh.jpeg", iconSize: 230, desc: "Chân gà nướng sa tế cay" },
  { id: 309, cat: "bia",      name: "Cá chỉ vàng",        price: 25000, icon: "images/Bia/ca_chi_vang.png", iconSize: 230, desc: "Cá chỉ vàng + tương ớt" },
  { id: 310, cat: "bia",      name: "Mực nướng",      price: 120000,icon: "images/Bia/muc_nuong.jpg", iconSize: 230, desc: "Mực tươi, chấm tương ớt xanh" },
  

  // ====== NƯỚC GIẢI KHÁT ======
  { id: 401, cat: "nuoc",     name: "Coca-Cola",         price: 12000, icon: "images/Nước ngọt/coca.webp", iconSize: 230, desc: "Lon nước ngọt có ga" },
  { id: 402, cat: "nuoc",     name: "GoodMood",             price: 10000, icon: "images/Nước ngọt/goodmood.png", iconSize: 220, desc: "Lon nước ngọt có ga" },
  { id: 403, cat: "nuoc",     name: "Rock Star",          price: 15000, icon: "images/Nước ngọt/rockstar update.png", iconSize: 300, iconPosition: "center center", iconOffsetY: -100, desc: "Nước tăng lực" },
  { id: 405, cat: "nuoc",     name: "Nước suối NumberOne 500ml",   price: 7000,  icon: "images/Nước ngọt/nuoc loc num1.png", iconSize: 230, desc: "Nước tinh khiết" },
  { id: 406, cat: "nuoc",     name: "Number 1",                price: 10000, icon: "images/Nước ngọt/number1.png", iconSize: 230, desc: "Lon tăng lực" },
  { id: 407, cat: "nuoc",     name: "Trà xanh không độ",            price: 10000, icon: "images/Nước ngọt/khong do.png", iconSize: 230, desc: "Lon nước chanh có ga" },
  { id: 408, cat: "nuoc",     name: "Red Bull (Bò Húc)",       price: 15000, icon: "images/Nước ngọt/redbull.jpeg", iconSize: 230, desc: "Tăng lực, lon 250ml" },
  { id: 409, cat: "nuoc",     name: "Cà phê Boss",             price: 15000, icon: "images/Nước ngọt/Boss.png", iconSize: 230, desc: "Cà phê lon Suntory Boss" },
  { id: 410, cat: "nuoc",     name: "Olong TEA+ Đào",          price: 10000, icon: "images/Nước ngọt/OOL_Peach_bottle.png", iconSize: 230, desc: "Trà Olong hương đào, chai 450ml" },
  { id: 411, cat: "nuoc",     name: "Revive Chanh Muối",       price: 10000, icon: "images/Nước ngọt/Revive_vang.png", iconSize: 230, desc: "Nước bù khoáng chanh muối" },
  { id: 412, cat: "nuoc",     name: "Sting Gold (Vàng)",       price: 10000, icon: "images/Nước ngọt/StingGold.png", iconSize: 230, desc: "Nước tăng lực hương nhân sâm" },
  { id: 413, cat: "nuoc",     name: "Sting Đỏ",                price: 10000, icon: "images/Nước ngọt/StingRed.png", iconSize: 230, desc: "Nước tăng lực hương dâu" },
  { id: 414, cat: "nuoc",     name: "Trà Tea+ Chanh",          price: 10000, icon: "images/Nước ngọt/Tea+ Huong Vi Chanh.png", iconSize: 230, desc: "Trà Olong hương chanh" },
  { id: 415, cat: "nuoc",     name: "Trà Tea+ Chanh 450ml",    price: 1000, icon: "images/Nước ngọt/Tea+_Lemon_Bottle_450ml.png", iconSize: 230, desc: "Trà Olong hương chanh, chai 450ml" },
  { id: 416, cat: "nuoc",     name: "Trà Tea+ Không Đường",    price: 10000, icon: "images/Nước ngọt/Tea+_NoSugar_Bottle_450ml.png", iconSize: 230, desc: "Trà Olong không đường, chai 450ml" },
  { id: 417, cat: "nuoc",     name: "Trà Tea+ Olong",          price: 10000, icon: "images/Nước ngọt/TeaPlus.png", iconSize: 230, desc: "Trà Olong thanh mát" },
  { id: 418, cat: "nuoc",     name: "Mirinda Twister Cam",     price: 10000, icon: "images/Nước ngọt/Twister_cam.png", iconSize: 230, desc: "Nước cam ép có ga" },
  { id: 419, cat: "nuoc",     name: "Mirinda Twister Dâu",     price: 10000, icon: "images/Nước ngọt/Twister_dau.png", iconSize: 230, desc: "Nước ngọt hương dâu có ga" },

  // ====== BÁNH KẸO & TẠP HOÁ ======
  { id: 501, cat: "banh-keo", name: "Mì tôm Hảo Hảo (gói)",    price: 5000,  icon: "images/LinhTinh/HaoHao.jpg", iconSize: 230, desc: "Tôm chua cay" },
  { id: 503, cat: "banh-keo", name: "Bánh Choco-pie (2 cái)",  price: 8000,  icon: "images/LinhTinh/chocopie2cai.jpeg", iconSize: 230, desc: "Bánh chocolate marshmallow" },
  { id: 511, cat: "banh-keo", name: "Mì Kokomi (gói)",         price: 4000,  icon: "images/LinhTinh/Kokomi.jpg", iconSize: 230, desc: "Mì ăn liền tôm chua cay" },
  { id: 512, cat: "banh-keo", name: "Sữa tươi TH true MILK 220ml", price: 9000, icon: "images/LinhTinh/TH true milk.jpg", iconSize: 230, desc: "Sữa tươi tiệt trùng" },
  { id: 513, cat: "banh-keo", name: "Bánh Custas (2 cái)",     price: 10000, icon: "images/LinhTinh/custas2cai.jpeg", iconSize: 230, desc: "Bánh bông lan trứng" },
  { id: 514, cat: "banh-keo", name: "Bánh xốp Nabati",         price: 12000, icon: "images/LinhTinh/nabati.jpeg", iconSize: 230, desc: "Bánh xốp phô mai" },
];

/* ============================================================
   CƠM TỰ CHỌN (SET 35K) — CƠ CHẾ LINH HOẠT THEO NGÀY
   ============================================================
   COM_SET   : Giá + công thức 1 set (mấy món chính/rau/canh).
   DAILY_DISHES : Danh sách MÓN trong ngày. Mỗi ngày bếp chỉ cần
                  đổi "available" (có/hết) — sau này lấy từ Google Sheet.
   - group : "chinh" | "rau" | "canh"
   - img   : đường dẫn ảnh (vd "images/Mon/thit-kho.jpg") HOẶC 1 emoji.
             (Hiện đang dùng emoji mẫu; thay bằng ảnh thật sau.)
   - available : true = còn món hôm nay, false = tạm hết.
   ============================================================ */
const COM_SET = {
  price: 35000,
  // 1 set = cơm trắng + 3 món chính + 1 rau + 1 canh
  rule: { chinh: 3, rau: 1, canh: 1 },
};

/* ⚙️ GOOGLE SHEET — để bếp cập nhật món mỗi ngày (xem HUONG_DAN_THUC_DON.md)
   - Để TRỐNG "" => web dùng danh sách mẫu DAILY_DISHES bên dưới.
   - Dán link CSV "Publish to web" của Google Sheet vào đây để bật chế độ tự cập nhật. */
const COM_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1wuvrrNztXRwmped8QXcV9xNyL3OYfUJwOs5aHHATZQo/export?format=csv&gid=0";

const DAILY_DISHES = [
  // ----- MÓN CHÍNH -----
  { id: "c01", group: "chinh", name: "Thịt kho tàu",        img: "🍖", available: true },
  { id: "c02", group: "chinh", name: "Cá kho tộ",           img: "🐟", available: true },
  { id: "c03", group: "chinh", name: "Trứng chiên",         img: "🍳", available: true },
  { id: "c04", group: "chinh", name: "Gà rang gừng",        img: "🍗", available: true },
  { id: "c05", group: "chinh", name: "Đậu sốt cà chua",     img: "🍅", available: true },
  { id: "c06", group: "chinh", name: "Thịt rang cháy cạnh", img: "🥓", available: true },
  { id: "c07", group: "chinh", name: "Tôm rim",             img: "🦐", available: true },
  { id: "c08", group: "chinh", name: "Chả lá lốt",          img: "🌿", available: false }, // ví dụ món tạm hết
  // ----- MÓN RAU -----
  { id: "r01", group: "rau",   name: "Rau muống xào tỏi",   img: "🥬", available: true },
  { id: "r02", group: "rau",   name: "Su su luộc",          img: "🥒", available: true },
  { id: "r03", group: "rau",   name: "Bắp cải luộc",        img: "🥗", available: true },
  // ----- MÓN CANH -----
  { id: "s01", group: "canh",  name: "Canh chua",           img: "🍲", available: true },
  { id: "s02", group: "canh",  name: "Canh rau ngót",       img: "🥣", available: true },
  { id: "s03", group: "canh",  name: "Canh bí đỏ",          img: "🎃", available: true },
];
