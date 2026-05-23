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
  { id: 101, cat: "com",      name: "Cơm Set1",          price: 35000, icon: "images/Cơm/set1.jpg", iconSize: 230, desc: "Thịt kho tàu, cá kho, chả lá lốt, rau xào" },
  { id: 102, cat: "com",      name: "Cơm Set2",          price: 35000, icon: "images/Cơm/set2.jpg", iconSize: 230, desc: "Gà xào sả ớt, thịt kho tàu, sườn chua ngọt" },
  { id: 103, cat: "com",      name: "Cơm Set3",          price: 35000, icon: "images/Cơm/set3.jpg", iconSize: 230, desc: "Tôm riêu cua, cơm trắng, rau xào" },
  { id: 104, cat: "com",      name: "Cơm Set4",          price: 35000, icon: "images/Cơm/set4.jpg", iconSize: 230, desc: "Cà ri gà, cơm trắng, dưa leo" },
  { id: 104, cat: "com",      name: "Cơm Set5",          price: 35000, icon: "images/Cơm/set5.jpg", iconSize: 230, desc: "Cà ri gà, cơm trắng, dưa leo" },
  { id: 104, cat: "com",      name: "Cơm Set6",          price: 35000, icon: "images/Cơm/set6.jpg", iconSize: 230, desc: "Cà ri gà, cơm trắng, dưa leo" },
  { id: 104, cat: "com",      name: "Cơm Set7",          price: 35000, icon: "images/Cơm/set7.jpg", iconSize: 230, desc: "Cà ri gà, cơm trắng, dưa leo" },
  { id: 104, cat: "com",      name: "Cơm Set8",          price: 35000, icon: "images/Cơm/set8.jpg", iconSize: 230, desc: "Cà ri gà, cơm trắng, dưa leo" },
  { id: 104, cat: "com",      name: "Cơm Set9",          price: 35000, icon: "images/Cơm/set9.jpg", iconSize: 230, desc: "Cà ri gà, cơm trắng, dưa leo" },
  { id: 104, cat: "com",      name: "Cơm Set10",          price: 35000, icon: "images/Cơm/set10.jpg", iconSize: 230, desc: "Cà ri gà, cơm trắng, dưa leo" },
  { id: 104, cat: "com",      name: "Cơm Set11",          price: 35000, icon: "images/Cơm/set11.jpg", iconSize: 230, desc: "Cà ri gà, cơm trắng, dưa leo" },

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
    { id: 306, cat: "bia",      name: "Lạc rang muối",           price: 20000, icon: "images/Bia/lac-rang-muoi.jpg", iconSize: 230,  iconOffsetY: -20,desc: "Đĩa lạc rang giòn rụm" },
  { id: 307, cat: "bia",      name: "Nem chua ",            price: 45000, icon: "images/Bia/nem-chua-chuan-thanh-hoa.jpg", iconSize: 260, desc: "10 chiếc, ăn kèm tương ớt" },
  { id: 308, cat: "bia",      name: "Nem bốc",           price: 35000, icon: "images/Bia/nem-boc.jpg", iconSize: 230, desc: "Chân gà nướng sa tế cay" },
  { id: 309, cat: "bia",      name: "Đậu phụ tẩm hành",        price: 25000, icon: "images/Bia/dau-phu-tam-hanh.jpg", iconSize: 230, desc: "Đậu rán vàng, hành lá phi thơm" },
  { id: 310, cat: "bia",      name: "Mực một nắng nướng",      price: 120000,icon: "images/Bia/muc-mot-ngan-nuong.jpg", iconSize: 230, desc: "Mực tươi, chấm tương ớt xanh" },
  

  // ====== NƯỚC GIẢI KHÁT ======
  { id: 401, cat: "nuoc",     name: "Coca-Cola",         price: 12000, icon: "images/Nước ngọt/coca.webp", iconSize: 230, desc: "Lon nước ngọt có ga" },
  { id: 402, cat: "nuoc",     name: "GoodMood",             price: 12000, icon: "images/Nước ngọt/goodmood.png", iconSize: 220, desc: "Lon nước ngọt có ga" },
  { id: 403, cat: "nuoc",     name: "Rock Star",          price: 12000, icon: "images/Nước ngọt/rockstar update.png", iconSize: 300, iconPosition: "center center", iconOffsetY: -100, desc: "Nước tăng lực" },
  { id: 404, cat: "nuoc",     name: "Trà xanh Không Độ",       price: 10000, icon: "images/Nước ngọt/traxanhkhongdo.png", iconSize: 230, desc: "Chai 455ml" },
  { id: 405, cat: "nuoc",     name: "Nước suối Lavie 500ml",   price: 8000,  icon: "images/Nước ngọt/lavie.png", iconSize: 230, desc: "Nước tinh khiết" },
  { id: 406, cat: "nuoc",     name: "Number 1",                price: 12000, icon: "images/Nước ngọt/number1.png", iconSize: 230, desc: "Lon tăng lực" },
  { id: 407, cat: "nuoc",     name: "Sprite",            price: 12000, icon: "images/Nước ngọt/sprite.png", iconSize: 230, desc: "Lon nước chanh có ga" },
  { id: 408, cat: "nuoc",     name: "Red Bull (Bò Húc)",       price: 15000, icon: "images/Nước ngọt/redbull.png", iconSize: 230, desc: "Tăng lực, lon 250ml" },

  // ====== BÁNH KẸO & TẠP HOÁ ======
  { id: 501, cat: "banh-keo", name: "Mì tôm Hảo Hảo (gói)",    price: 5000,  icon: "🍜", desc: "Tôm chua cay" },
  { id: 502, cat: "banh-keo", name: "Mì Omachi (gói)",         price: 7000,  icon: "🍜", desc: "Sườn hầm ngũ quả" },
  { id: 503, cat: "banh-keo", name: "Bánh Choco-pie (cái)",    price: 5000,  icon: "🍩", desc: "Bánh chocolate marshmallow" },
  { id: 504, cat: "banh-keo", name: "Bim bim Oishi",           price: 7000,  icon: "🍿", desc: "Snack tôm/cua nhiều vị" },
  { id: 505, cat: "banh-keo", name: "Snack tôm cay",           price: 8000,  icon: "🌶️", desc: "Snack vị cay nồng" },
  { id: 506, cat: "banh-keo", name: "Kẹo dẻo Haribo",          price: 25000, icon: "🍬", desc: "Gói 80g" },
  { id: 507, cat: "banh-keo", name: "Bánh quy Cosy",           price: 18000, icon: "🍪", desc: "Hộp 132g, bánh xốp kem" },
  { id: 508, cat: "banh-keo", name: "Sữa tươi Vinamilk 220ml", price: 8000,  icon: "🥛", desc: "Sữa tươi tiệt trùng" },
  { id: 509, cat: "banh-keo", name: "Sữa chua TH (hộp)",       price: 8000,  icon: "🥛", desc: "Hộp 100g" },
  { id: 510, cat: "banh-keo", name: "Trứng gà (quả)",          price: 4000,  icon: "🥚", desc: "Trứng gà công nghiệp" },
];
