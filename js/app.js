/* ============================================================
   TẠP HOÁ THUỶ ĐIỆP — APP LOGIC
   ============================================================ */

(() => {
  "use strict";

  // -------- STATE --------
  let cart = loadCart();
  let activeCategory = "all";
  let searchQuery = "";
  let pinnedLocation = null;
  // Lựa chọn đang ghép cho "Cơm tự chọn": mảng id món theo từng nhóm
  let comSelection = { chinh: [], rau: [], canh: [] };
  // Danh sách món trong ngày: mặc định lấy mẫu trong data.js,
  // sẽ được thay bằng dữ liệu Google Sheet nếu có cấu hình COM_SHEET_CSV_URL.
  let dishes = (typeof DAILY_DISHES !== "undefined" ? DAILY_DISHES.slice() : []);

  // -------- HELPERS --------
  const $  = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
  const IMAGE_ICON_RE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

  function resolveIconSrc(icon) {
    const normalized = String(icon).replace(/\\/g, "/").trim();

    // URL/data URI/full root path: use directly
    if (/^(https?:\/\/|data:|\/|file:\/\/)/i.test(normalized)) return normalized;

    // Absolute Windows path (e.g. E:/.../images/file.png): keep from images/ if possible
    if (/^[a-zA-Z]:\//.test(normalized)) {
      const idx = normalized.toLowerCase().lastIndexOf("/images/");
      if (idx >= 0) return normalized.slice(idx + 1); // images/filename.png
      const filename = normalized.split("/").pop();
      return filename ? `images/${filename}` : "images/";
    }

    // Relative path
    return normalized.startsWith("images/") ? normalized : `images/${normalized}`;
  }

  function renderIcon(icon, alt = "", options = {}) {
    if (!icon) return "";
    if (IMAGE_ICON_RE.test(icon)) {
      const src = resolveIconSrc(icon);
      const customSize = Number(options.size);
      const customOffsetY = Number(options.offsetY);
      const customPosition =
        typeof options.position === "string" && options.position.trim()
          ? options.position.trim()
          : "center center";
      const styles = [];
      if (Number.isFinite(customSize) && customSize > 0) {
        styles.push(`width:${customSize}px;`, `height:${customSize}px;`);
      }
      styles.push(`object-position:${customPosition};`);
      if (Number.isFinite(customOffsetY) && customOffsetY !== 0) {
        styles.push(`transform:translateY(${customOffsetY}px);`);
      }
      const inlineStyle = styles.length ? ` style="${styles.join("")}"` : "";
      return `<img src="${src}" alt="${alt}" loading="lazy"${inlineStyle} />`;
    }
    return `<span>${icon}</span>`;
  }

  // Trả về thông tin hiển thị của 1 dòng giỏ hàng.
  // - Set cơm tự chọn (item.custom): dùng dữ liệu lưu sẵn trong item.
  // - Sản phẩm thường: tra trong PRODUCTS theo id.
  function cartItemInfo(item) {
    if (item && item.custom) {
      return {
        name: item.name,
        price: item.price,
        icon: item.icon || "🍱",
        desc: (item.lines || []).join(", "),
      };
    }
    const p = PRODUCTS.find(pp => pp.id === item.id);
    return p ? { name: p.name, price: p.price, icon: p.icon, desc: p.desc } : null;
  }

  function saveCart() {
    try {
      localStorage.setItem("thuydiep_cart", JSON.stringify(cart));
    } catch (e) { /* ignore */ }
  }
  function loadCart() {
    try {
      const raw = localStorage.getItem("thuydiep_cart");
      const saved = raw ? JSON.parse(raw) : [];
      // Bỏ các món không còn hợp lệ (vd set cơm cố định cũ đã gỡ)
      return Array.isArray(saved)
        ? saved.filter(item => item && (item.custom || PRODUCTS.some(p => p.id === item.id)))
        : [];
    } catch { return []; }
  }

  // -------- TOAST --------
  function toast(message, type = "success") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    $("#toastContainer").appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // -------- APPLY SHOP CONFIG --------
  function applyConfig() {
    document.title = `${SHOP_CONFIG.name} - Cơm Phở Bún · Bia Hơi · Tạp Hoá`;
    $("#shopName").textContent = SHOP_CONFIG.name;
    $("#heroDesc").textContent =
      "Cơm bình dân, bia hơi mát lạnh, bánh kẹo tạp hoá đa dạng. Giao tận nơi - thanh toán linh hoạt.";
    $("#contactAddress").textContent = SHOP_CONFIG.address;
    $("#contactPhone").textContent = SHOP_CONFIG.hotline;
    $("#contactPhone").href = `tel:${SHOP_CONFIG.zaloPhone}`;
    $("#contactHours").innerHTML =
      `${SHOP_CONFIG.hours.weekday}<br/>${SHOP_CONFIG.hours.weekend}`;
    $("#footerYear").textContent = new Date().getFullYear();

    const zaloLink = `https://zalo.me/${SHOP_CONFIG.zaloPhone}`;
    $("#contactZalo").href = zaloLink;
    $("#contactZalo").target = "_blank";
    $("#floatingZalo").href = zaloLink;
    $("#floatingZalo").target = "_blank";
    $("#footerZalo").href = zaloLink;
    $("#footerZalo").target = "_blank";
    $("#footerPhone").href = `tel:${SHOP_CONFIG.zaloPhone}`;
    $("#footerFb").href = SHOP_CONFIG.facebook || "#";
    $("#footerFb").target = "_blank";
  }

  // -------- RENDER CATEGORIES --------
  function renderCategories() {
    const wrap = $("#categories");
    wrap.innerHTML = CATEGORIES.map(c => `
      <button class="cat-chip ${c.id === activeCategory ? "active" : ""}"
              data-cat="${c.id}" role="tab">
        <span class="cat-chip-icon">${c.icon}</span>
        <span>${c.name}</span>
      </button>
    `).join("");

    $$(".cat-chip", wrap).forEach(btn => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        renderCategories();
        renderProducts();
      });
    });
  }

  // -------- RENDER PRODUCTS --------
  function getFilteredProducts() {
    const q = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter(p => {
      const catOk = activeCategory === "all" || p.cat === activeCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.desc || "").toLowerCase().includes(q)
      );
    });
  }

  function renderProducts() {
    const grid = $("#productGrid");
    const empty = $("#emptyState");
    const builder = $("#comBuilder");
    const searchBar = $(".search-bar");

    const q = searchQuery.trim();
    const isCom = activeCategory === "com";
    // Hiện bộ "Cơm tự chọn": ở danh mục Cơm, HOẶC ở "Tất cả" (khi không tìm kiếm) -> đặt lên đầu
    const showBuilder = isCom || (activeCategory === "all" && !q);

    if (builder) {
      builder.hidden = !showBuilder;
      // Khi nhúng trong "Tất cả": dùng kiểu gọn (thanh thêm set không dính đáy)
      builder.classList.toggle("com-builder--embedded", showBuilder && !isCom);
      if (showBuilder) renderComBuilder();
    }

    // Danh mục "Cơm bình dân" -> chỉ hiện bộ chọn, ẩn lưới sản phẩm + ô tìm kiếm
    if (isCom) {
      grid.style.display = "none";
      grid.innerHTML = "";
      empty.hidden = true;
      if (searchBar) searchBar.style.display = "none";
      return;
    }
    grid.style.display = "";
    if (searchBar) searchBar.style.display = "";

    const items = getFilteredProducts();

    if (items.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    grid.innerHTML = items.map(p => {
      const inCart = cart.find(c => c.id === p.id);
      const control = inCart
        ? `<div class="qty-control" data-id="${p.id}">
             <button class="qty-btn" data-action="dec" aria-label="Giảm">−</button>
             <span class="qty-num">${inCart.qty}</span>
             <button class="qty-btn" data-action="inc" aria-label="Tăng">+</button>
           </div>`
        : `<button class="add-btn" data-add="${p.id}" aria-label="Thêm vào giỏ">+</button>`;

      return `
        <article class="product-card">
          <div class="product-image">
            ${renderIcon(p.icon, p.name, {
              size: p.iconSize,
              position: p.iconPosition,
              offsetY: p.iconOffsetY,
            })}
          </div>
          <div class="product-body">
            <h3 class="product-name">${p.name}</h3>
            <p class="product-desc">${p.desc || ""}</p>
            <div class="product-foot">
              <span class="product-price">${formatVND(p.price)}</span>
              ${control}
            </div>
          </div>
        </article>
      `;
    }).join("");

    // bind add buttons
    $$("[data-add]", grid).forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.add);
        addToCart(id);
      });
    });
    // bind qty controls
    $$(".qty-control", grid).forEach(ctrl => {
      const id = Number(ctrl.dataset.id);
      $(".qty-btn[data-action='inc']", ctrl).addEventListener("click", () => changeQty(id, +1));
      $(".qty-btn[data-action='dec']", ctrl).addEventListener("click", () => changeQty(id, -1));
    });
  }

  // -------- CƠM TỰ CHỌN (build-your-own set) --------
  function comGroups() {
    const rule = COM_SET.rule;
    return [
      { key: "chinh", label: "Món chính", icon: "🍖", need: rule.chinh },
      { key: "rau",   label: "Món rau",   icon: "🥬", need: rule.rau },
      { key: "canh",  label: "Món canh",  icon: "🍲", need: rule.canh },
    ];
  }

  function isComComplete() {
    return comGroups().every(g => comSelection[g.key].length === g.need);
  }

  function renderComBuilder() {
    const wrap = $("#comBuilder");
    if (!wrap) return;
    const groups = comGroups();
    const available = dishes.filter(d => d.available !== false);

    const groupsHtml = groups.map(g => {
      const dishes = available.filter(d => d.group === g.key);
      const chosen = comSelection[g.key];
      const cards = dishes.length
        ? dishes.map(d => {
            const sel = chosen.includes(d.id);
            return `
              <button class="dish-card ${sel ? "selected" : ""}"
                      data-dish="${d.id}" data-group="${g.key}"
                      aria-pressed="${sel}">
                <span class="dish-img">${renderIcon(d.img, d.name)}</span>
                <span class="dish-name">${d.name}</span>
                <span class="dish-check">✓</span>
              </button>`;
          }).join("")
        : `<p class="dish-empty">Hôm nay tạm hết món nhóm này 😴</p>`;

      const done = chosen.length === g.need;
      return `
        <div class="dish-group">
          <div class="dish-group-head">
            <h4>${g.icon} ${g.label}</h4>
            <span class="dish-count ${done ? "done" : ""}">${chosen.length}/${g.need}</span>
          </div>
          <div class="dish-list">${cards}</div>
        </div>`;
    }).join("");

    const complete = isComComplete();
    const progress = groups
      .map(g => `${g.label}: ${comSelection[g.key].length}/${g.need}`)
      .join("  ·  ");

    wrap.innerHTML = `
      <div class="com-head">
        <h3>🍱 Cơm tự chọn — ${formatVND(COM_SET.price)}/set</h3>
        <p>Cơm trắng + ${COM_SET.rule.chinh} món chính + ${COM_SET.rule.rau} rau + ${COM_SET.rule.canh} canh.
           Chọn món tươi hôm nay theo ý bạn nhé!</p>
      </div>
      ${groupsHtml}
      <div class="com-bar">
        <div class="com-bar-info">
          <span class="com-bar-progress">${progress}</span>
          <span class="com-bar-price">${formatVND(COM_SET.price)}</span>
        </div>
        <button class="btn btn-primary" id="addComSet" ${complete ? "" : "disabled"}>
          ${complete ? "➕ Thêm set vào giỏ" : "Chọn đủ món để thêm"}
        </button>
      </div>`;

    $$(".dish-card", wrap).forEach(btn => {
      btn.addEventListener("click", () => toggleDish(btn.dataset.group, btn.dataset.dish));
    });
    const addBtn = $("#addComSet", wrap);
    if (addBtn) addBtn.addEventListener("click", addComSetToCart);
  }

  function toggleDish(group, dishId) {
    const need = COM_SET.rule[group];
    const arr = comSelection[group];
    const idx = arr.indexOf(dishId);
    if (idx >= 0) {
      arr.splice(idx, 1);              // bỏ chọn
    } else if (need === 1) {
      comSelection[group] = [dishId];  // nhóm chỉ 1 món -> thay thế
    } else if (arr.length < need) {
      arr.push(dishId);                // còn chỗ -> thêm
    } else {
      toast(`Chỉ chọn ${need} món ở nhóm này. Bỏ bớt 1 món để đổi nhé!`, "error");
      return;
    }
    renderComBuilder();
  }

  function addComSetToCart() {
    if (!isComComplete()) return;
    const nameOf = id => {
      const d = dishes.find(x => x.id === id);
      return d ? d.name : "";
    };
    const lines = [
      ...comSelection.chinh.map(nameOf),
      ...comSelection.rau.map(nameOf),
      ...comSelection.canh.map(nameOf),
    ].filter(Boolean);

    cart.push({
      id: "comset_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      custom: true,
      qty: 1,
      name: "Set cơm tự chọn",
      price: COM_SET.price,
      icon: "🍱",
      lines,
    });
    saveCart();
    comSelection = { chinh: [], rau: [], canh: [] }; // reset cho lần chọn tiếp theo
    renderComBuilder();
    renderCart();
    bumpCartCount();
    toast("✓ Đã thêm set cơm vào giỏ");
  }

  // -------- ĐỌC THỰC ĐƠN TỪ GOOGLE SHEET --------
  // Bỏ dấu tiếng Việt + đưa về chữ thường để so khớp tên cột/giá trị linh hoạt
  function normVN(s) {
    return String(s == null ? "" : s)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .trim().toLowerCase();
  }

  // Tách CSV chuẩn (hỗ trợ ô có dấu phẩy/xuống dòng trong ngoặc kép)
  function parseCSV(text) {
    text = String(text).replace(/^\uFEFF/, ""); // bỏ BOM
    const rows = [];
    let row = [], field = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field); field = "";
      } else if (ch === "\n") {
        row.push(field); rows.push(row); row = []; field = "";
      } else if (ch !== "\r") {
        field += ch;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  // Chuyển các dòng CSV thành danh sách món
  function rowsToDishes(rows) {
    if (!rows || rows.length < 2) return [];
    const header = rows[0].map(normVN);
    const findCol = (...keys) => header.findIndex(h => keys.some(k => h.includes(k)));
    const ci = {
      group: findCol("nhom"),
      name:  findCol("ten", "mon"),
      img:   findCol("anh", "hinh", "img"),
      avail: findCol("hom nay", "con", "available", "co"),
    };
    const groupOf = v => {
      const n = normVN(v);
      if (n.includes("chinh")) return "chinh";
      if (n.includes("rau"))   return "rau";
      if (n.includes("canh"))  return "canh";
      return n;
    };
    const isGroup = g => g === "chinh" || g === "rau" || g === "canh";
    const NEGATIVE = ["", "0", "khong", "het", "no", "false", "off"];
    const out = [];
    let lastGroup = ""; // nhớ nhóm của tiêu đề mục gần nhất
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      // Nếu ô "Nhóm" có giá trị (tiêu đề mục) -> cập nhật nhóm hiện tại;
      // các dòng để trống ô Nhóm sẽ kế thừa nhóm này.
      const mapped = groupOf(ci.group >= 0 ? (r[ci.group] || "") : "");
      if (isGroup(mapped)) lastGroup = mapped;
      const name = ((ci.name >= 0 ? r[ci.name] : "") || "").trim();
      if (!name) continue; // bỏ dòng trống
      const img = (((ci.img >= 0 ? r[ci.img] : "") || "").trim()) || "🍽️";
      const availRaw = ci.avail >= 0 ? normVN(r[ci.avail]) : "x";
      out.push({
        id: "sheet_" + i,
        group: lastGroup,
        name,
        img,
        available: !NEGATIVE.includes(availRaw),
      });
    }
    return out;
  }

  async function loadDishesFromSheet() {
    const url = (typeof COM_SHEET_CSV_URL !== "undefined" && COM_SHEET_CSV_URL ? COM_SHEET_CSV_URL : "").trim();
    if (!url) return; // chưa cấu hình -> giữ danh sách mẫu
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const parsed = rowsToDishes(parseCSV(await res.text()));
      if (parsed.length) {
        dishes = parsed;
        comSelection = { chinh: [], rau: [], canh: [] };
        // Vẽ lại giao diện đang xem để cập nhật cả tab "Tất cả" lẫn "Cơm bình dân"
        renderProducts();
      }
    } catch (e) {
      console.warn("Không tải được thực đơn từ Google Sheet — dùng danh sách mẫu.", e);
    }
  }

  // -------- CART OPERATIONS --------
  function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart();
    renderProducts();
    renderCart();
    bumpCartCount();
    toast(`✓ Đã thêm "${product.name}"`);
  }

  function changeQty(id, delta) {
    const item = cart.find(c => String(c.id) === String(id));
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(c => String(c.id) !== String(id));
    }
    saveCart();
    renderProducts();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(c => String(c.id) !== String(id));
    saveCart();
    renderProducts();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderProducts();
    renderCart();
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => {
      const info = cartItemInfo(item);
      return sum + (info ? info.price * item.qty : 0);
    }, 0);
  }
  function getCartCount() {
    return cart.reduce((n, item) => n + item.qty, 0);
  }

  function bumpCartCount() {
    const el = $("#cartCount");
    el.classList.remove("bump");
    void el.offsetWidth; // restart anim
    el.classList.add("bump");
  }

  // -------- RENDER CART DRAWER --------
  function renderCart() {
    const count = getCartCount();
    $("#cartCount").textContent = count;

    const body  = $("#cartBody");
    const empty = $("#cartEmpty");
    const foot  = $("#cartFoot");

    if (cart.length === 0) {
      body.innerHTML = "";
      body.style.display = "none";
      empty.classList.add("show");
      foot.classList.add("hide");
      return;
    }
    body.style.display = "";
    empty.classList.remove("show");
    foot.classList.remove("hide");

    body.innerHTML = cart.map(item => {
      const info = cartItemInfo(item);
      if (!info) return "";
      const sub = item.custom && info.desc
        ? `<span class="cart-item-sub">${info.desc}</span>`
        : "";
      return `
        <div class="cart-item">
          <div class="cart-item-img">${renderIcon(info.icon, info.name)}</div>
          <div>
            <p class="cart-item-name">${info.name}</p>
            ${sub}
            <span class="cart-item-price">${formatVND(info.price * item.qty)}</span>
          </div>
          <div class="cart-item-controls">
            <div class="qty-control" data-id="${item.id}">
              <button class="qty-btn" data-action="dec">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" data-action="inc">+</button>
            </div>
            <button class="cart-item-remove" data-remove="${item.id}">Xoá</button>
          </div>
        </div>
      `;
    }).join("");

    // bind controls (id giữ dạng chuỗi để hỗ trợ cả set cơm tự chọn)
    $$(".cart-item", body).forEach(row => {
      const ctrl = $(".qty-control", row);
      const id = ctrl.dataset.id;
      $(".qty-btn[data-action='inc']", ctrl).addEventListener("click", () => changeQty(id, +1));
      $(".qty-btn[data-action='dec']", ctrl).addEventListener("click", () => changeQty(id, -1));
      $("[data-remove]", row).addEventListener("click", () => removeFromCart(id));
    });

    // totals
    const subtotal = getCartTotal();
    const shipping = subtotal >= SHOP_CONFIG.freeShipMin ? 0 : SHOP_CONFIG.shippingFee;
    $("#cartSubtotal").textContent = formatVND(subtotal);
    $("#cartShipping").textContent = shipping === 0 ? "Miễn phí 🎉" : formatVND(shipping);
    $("#cartTotal").textContent = formatVND(subtotal + shipping);
  }

  // -------- DRAWER + MODAL --------
  function openDrawer() {
    $("#cartDrawer").classList.add("open");
    $("#overlay").classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    $("#cartDrawer").classList.remove("open");
    $("#overlay").classList.remove("show");
    document.body.style.overflow = "";
  }
  function openCheckout() {
    if (cart.length === 0) {
      toast("Giỏ hàng đang trống!", "error");
      return;
    }
    closeDrawer();
    renderOrderSummary();
    $("#checkoutModal").classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeCheckout() {
    $("#checkoutModal").classList.remove("show");
    document.body.style.overflow = "";
  }

  function setLocationHint(message, type = "") {
    const hint = $("#locationHint");
    if (!hint) return;
    hint.textContent = message;
    hint.classList.remove("success", "error");
    if (type) hint.classList.add(type);
  }

  function setPinButtonLoading(isLoading) {
    const btn = $("#pinLocationBtn");
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "⏳ Đang định vị..." : "📍 Ghim vị trí hiện tại";
  }

  async function handlePinLocation() {
    const btn = $("#pinLocationBtn");
    const addressInput = $("#custAddress");
    if (!btn || !addressInput) return;
    if (!navigator.geolocation) {
      setLocationHint("Trình duyệt không hỗ trợ định vị trên thiết bị này.", "error");
      toast("Thiết bị không hỗ trợ định vị", "error");
      return;
    }
    if (!window.isSecureContext) {
      const msg = "Tính năng định vị cần HTTPS (hoặc localhost).";
      setLocationHint(msg, "error");
      toast(msg, "error");
      return;
    }

    let permissionState = "prompt";
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" });
        permissionState = status.state;
      } catch (e) {
        // Some browsers do not support querying geolocation permission state.
      }
    }
    if (permissionState === "denied") {
      const msg = "Quyền vị trí đang bị chặn. Hãy bật Location permission cho trình duyệt rồi thử lại.";
      setLocationHint(msg, "error");
      toast(msg, "error");
      return;
    }

    if (permissionState === "prompt") {
      setLocationHint("Vui lòng bấm Cho phép khi trình duyệt hỏi quyền vị trí...");
    }
    setPinButtonLoading(true);
    setLocationHint("Đang lấy vị trí hiện tại...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude).toFixed(6);
        const lng = Number(pos.coords.longitude).toFixed(6);
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        pinnedLocation = { lat, lng, mapsLink };
        // Chỉ lưu vị trí ghim (gửi kèm đơn), KHÔNG ghi đè ô địa chỉ của khách
        setLocationHint(`Đã ghim vị trí: ${lat}, ${lng}. Toạ độ sẽ gửi kèm đơn hàng.`, "success");
        toast("✓ Đã ghim vị trí hiện tại");
        setPinButtonLoading(false);
      },
      (error) => {
        let msg = "Không thể lấy vị trí hiện tại.";
        if (error.code === 1) msg = "Bạn đã từ chối quyền vị trí. Hãy cho phép truy cập vị trí để tiếp tục.";
        if (error.code === 2) msg = "Không xác định được vị trí. Kiểm tra GPS/dịch vụ vị trí rồi thử lại.";
        if (error.code === 3) msg = "Định vị bị quá thời gian chờ.";
        setLocationHint(msg, "error");
        toast(msg, "error");
        setPinButtonLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }
  function openImagePreview(src, alt = "") {
    const modal = $("#imagePreviewModal");
    const img = $("#imagePreviewImg");
    if (!modal || !img || !src) return;
    img.src = src;
    img.alt = alt || "Ảnh sản phẩm";
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeImagePreview() {
    const modal = $("#imagePreviewModal");
    const img = $("#imagePreviewImg");
    if (!modal || !img) return;
    modal.classList.remove("show");
    img.src = "";
    document.body.style.overflow = "";
  }

  function renderOrderSummary() {
    const items = cart.map(item => {
      const info = cartItemInfo(item);
      if (!info) return "";
      const sub = item.custom && info.desc
        ? `<div class="summary-sub">${info.desc}</div>`
        : "";
      return `
        <div class="summary-row">
          <span>${info.name} × ${item.qty}${sub}</span>
          <span>${formatVND(info.price * item.qty)}</span>
        </div>
      `;
    }).join("");
    $("#orderSummaryItems").innerHTML = items;

    const subtotal = getCartTotal();
    const shipping = subtotal >= SHOP_CONFIG.freeShipMin ? 0 : SHOP_CONFIG.shippingFee;
    $("#summaryTotal").textContent = formatVND(subtotal + shipping);
  }

  // -------- CHECKOUT: build Zalo message --------
  function buildOrderMessage(customer) {
    const lines = [];
    lines.push(`🛒 ĐƠN HÀNG MỚI - ${SHOP_CONFIG.name}`);
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push(`👤 Khách: ${customer.name}`);
    lines.push(`📞 SĐT: ${customer.phone}`);
    lines.push(`📍 Địa chỉ: ${customer.address}`);
    if (customer.pinnedLocation) {
      lines.push(`📌 Vị trí ghim: ${customer.pinnedLocation.lat}, ${customer.pinnedLocation.lng}`);
      lines.push(`🗺️ Google Maps: ${customer.pinnedLocation.mapsLink}`);
    }
    if (customer.note) lines.push(`📝 Ghi chú: ${customer.note}`);
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("🍽️ MÓN ĐÃ ĐẶT:");
    cart.forEach((item, i) => {
      const info = cartItemInfo(item);
      if (!info) return;
      lines.push(`${i+1}. ${info.name} × ${item.qty} = ${formatVND(info.price * item.qty)}`);
      if (item.custom && info.desc) lines.push(`   • Gồm: ${info.desc}`);
    });
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    const subtotal = getCartTotal();
    const shipping = subtotal >= SHOP_CONFIG.freeShipMin ? 0 : SHOP_CONFIG.shippingFee;
    lines.push(`💵 Tạm tính: ${formatVND(subtotal)}`);
    lines.push(`🚚 Phí ship: ${shipping === 0 ? "Miễn phí" : formatVND(shipping)}`);
    lines.push(`💰 TỔNG CỘNG: ${formatVND(subtotal + shipping)}`);
    lines.push(
      `💳 Thanh toán: ${customer.payMethod === "transfer"
        ? "Chuyển khoản ngân hàng"
        : "Tiền mặt khi nhận (COD)"}`
    );
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push(`⏰ Đặt lúc: ${new Date().toLocaleString("vi-VN")}`);
    lines.push("");
    lines.push("Vui lòng xác nhận đơn hàng giúp em. Cảm ơn shop!");
    return lines.join("\n");
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      } catch { return false; }
    }
  }

  // Tạo mã QR VietQR + thông tin chuyển khoản; ẩn nếu chọn COD
  function setupTransferBox(customer) {
    const box = $("#transferBox");
    if (!box) return;
    const bank = (typeof BANK_CONFIG !== "undefined") ? BANK_CONFIG : null;
    if (customer.payMethod !== "transfer" || !bank || !bank.enabled) {
      box.hidden = true;
      return;
    }
    const subtotal = getCartTotal();
    const shipping = subtotal >= SHOP_CONFIG.freeShipMin ? 0 : SHOP_CONFIG.shippingFee;
    const amount = subtotal + shipping;
    const content = `Com ${customer.name}`.trim();
    const qrUrl =
      `https://img.vietqr.io/image/${encodeURIComponent(bank.bankCode)}-` +
      `${encodeURIComponent(bank.accountNumber)}-${bank.template || "compact2"}.png` +
      `?amount=${encodeURIComponent(amount)}` +
      `&addInfo=${encodeURIComponent(content)}` +
      `&accountName=${encodeURIComponent(bank.accountName)}`;

    $("#transferQr").src = qrUrl;
    $("#transferQr").alt = `QR chuyển khoản ${formatVND(amount)}`;
    $("#bankNameOut").textContent = bank.bankName;
    $("#bankAccountOut").textContent = bank.accountNumber;
    $("#bankHolderOut").textContent = bank.accountName;
    $("#bankAmountOut").textContent = formatVND(amount);
    $("#bankContentOut").textContent = content;
    box.dataset.copy =
      `Ngân hàng: ${bank.bankName}\n` +
      `Số tài khoản: ${bank.accountNumber}\n` +
      `Chủ tài khoản: ${bank.accountName}\n` +
      `Số tiền: ${formatVND(amount)}\n` +
      `Nội dung: ${content}`;
    box.hidden = false;
  }

  async function handleCopyBank() {
    const box = $("#transferBox");
    const ok = await copyToClipboard((box && box.dataset.copy) || "");
    toast(ok ? "✓ Đã sao chép thông tin chuyển khoản" : "⚠ Không sao chép được", ok ? "success" : "error");
  }

  async function submitOrder(e) {
    e.preventDefault();
    const payChecked = document.querySelector('input[name="payMethod"]:checked');
    const customer = {
      name:    $("#custName").value.trim(),
      phone:   $("#custPhone").value.trim(),
      address: $("#custAddress").value.trim(),
      note:    $("#custNote").value.trim(),
      payMethod: payChecked ? payChecked.value : "cod",
      pinnedLocation,
    };
    if (!customer.name || !customer.phone || !customer.address) {
      toast("Vui lòng điền đủ thông tin!", "error");
      return;
    }

    const message = buildOrderMessage(customer);

    // Fill order text into success modal
    $("#orderText").value = message;
    $("#openZaloBtn").href = `https://zalo.me/${SHOP_CONFIG.zaloPhone}`;

    // Hiện/ẩn khối QR chuyển khoản theo hình thức thanh toán
    setupTransferBox(customer);

    // Try to copy in background (silent — user can also press the button)
    copyToClipboard(message);

    // Close checkout, show success
    closeCheckout();
    openSuccess();
  }

  function openSuccess() {
    $("#successModal").classList.add("show");
    document.body.style.overflow = "hidden";
    // reset copy button state
    const btn = $("#copyBtn");
    btn.classList.remove("copied");
    btn.textContent = "📋 Sao chép đơn hàng";
  }
  function closeSuccess() {
    $("#successModal").classList.remove("show");
    document.body.style.overflow = "";
    // finalize: clear cart + form once user has dismissed
    clearCart();
    $("#checkoutForm").reset();
    pinnedLocation = null;
    setLocationHint("Bấm để ghim vị trí hiện tại — toạ độ gửi kèm đơn, không ghi đè ô địa chỉ.");
  }

  async function handleCopy() {
    const text = $("#orderText").value;
    const btn = $("#copyBtn");
    const ok = await copyToClipboard(text);
    if (ok) {
      btn.classList.add("copied");
      btn.textContent = "✅ Đã sao chép!";
      toast("✓ Đã sao chép đơn hàng vào bộ nhớ tạm");
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.textContent = "📋 Sao chép đơn hàng";
      }, 2500);
    } else {
      // fallback: select the textarea for manual copy
      const ta = $("#orderText");
      ta.focus();
      ta.select();
      toast("⚠ Hãy bấm Ctrl+C (Cmd+C) để sao chép thủ công", "error");
    }
  }

  // -------- SEARCH --------
  function bindSearch() {
    const input = $("#searchInput");
    const clear = $("#searchClear");
    input.addEventListener("input", () => {
      searchQuery = input.value;
      clear.classList.toggle("show", input.value.length > 0);
      renderProducts();
    });
    clear.addEventListener("click", () => {
      input.value = "";
      searchQuery = "";
      clear.classList.remove("show");
      renderProducts();
      input.focus();
    });
    $("#searchBtn").addEventListener("click", () => {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // -------- HEADER SCROLL --------
  function bindHeaderScroll() {
    const header = $("#header");
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // -------- MOBILE MENU --------
  function bindMobileMenu() {
    const toggle = $("#menuToggle");
    const nav = $(".nav");
    toggle.addEventListener("click", () => {
      const visible = nav.style.display === "flex";
      if (visible) {
        nav.style.display = "";
      } else {
        Object.assign(nav.style, {
          display: "flex",
          position: "absolute",
          top: "var(--header-h)",
          left: "0",
          right: "0",
          background: "#fff",
          flexDirection: "column",
          padding: "12px",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        });
      }
    });
    // close on link click
    $$(".nav-link").forEach(a => a.addEventListener("click", () => {
      if (window.innerWidth <= 960) nav.style.display = "";
    }));
  }

  // -------- BIND EVENTS --------
  function bindEvents() {
    $("#cartBtn").addEventListener("click", openDrawer);
    $("#closeCart").addEventListener("click", closeDrawer);
    $("#overlay").addEventListener("click", () => {
      closeDrawer();
    });
    $("#cartEmptyClose").addEventListener("click", () => {
      closeDrawer();
      $("#menu").scrollIntoView({ behavior: "smooth" });
    });
    $("#checkoutBtn").addEventListener("click", openCheckout);
    $("#closeCheckout").addEventListener("click", closeCheckout);
    $("#checkoutModal").addEventListener("click", (e) => {
      if (e.target === $("#checkoutModal")) closeCheckout();
    });
    $("#checkoutForm").addEventListener("submit", submitOrder);

    // success modal
    $("#closeSuccess").addEventListener("click", closeSuccess);
    $("#successModal").addEventListener("click", (e) => {
      if (e.target === $("#successModal")) closeSuccess();
    });
    $("#copyBtn").addEventListener("click", handleCopy);
    $("#copyBankBtn").addEventListener("click", handleCopyBank);
    $("#pinLocationBtn").addEventListener("click", handlePinLocation);

    // product image preview
    $("#productGrid").addEventListener("click", (e) => {
      const img = e.target.closest(".product-image img");
      if (!img) return;
      openImagePreview(img.currentSrc || img.src, img.alt);
    });
    $("#closeImagePreview").addEventListener("click", closeImagePreview);
    $("#imagePreviewModal").addEventListener("click", (e) => {
      if (e.target === $("#imagePreviewModal")) closeImagePreview();
    });

    // escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeDrawer();
        closeCheckout();
        if ($("#imagePreviewModal").classList.contains("show")) closeImagePreview();
        if ($("#successModal").classList.contains("show")) closeSuccess();
      }
    });
  }

  // -------- INIT --------
  function init() {
    applyConfig();
    renderCategories();
    renderProducts();
    renderCart();
    bindSearch();
    bindEvents();
    bindHeaderScroll();
    bindMobileMenu();
    loadDishesFromSheet(); // tải thực đơn ngày từ Google Sheet (nếu có cấu hình)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
