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
      const sizeStyle =
        Number.isFinite(customSize) && customSize > 0
          ? ` style="width:${customSize}px;height:${customSize}px;"`
          : "";
      return `<img src="${src}" alt="${alt}" loading="lazy"${sizeStyle} />`;
    }
    return `<span>${icon}</span>`;
  }

  function saveCart() {
    try {
      localStorage.setItem("thuydiep_cart", JSON.stringify(cart));
    } catch (e) { /* ignore */ }
  }
  function loadCart() {
    try {
      const raw = localStorage.getItem("thuydiep_cart");
      return raw ? JSON.parse(raw) : [];
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
            ${renderIcon(p.icon, p.name, { size: p.iconSize })}
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
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(c => c.id !== id);
    }
    saveCart();
    renderProducts();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
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
      const p = PRODUCTS.find(pp => pp.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
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
      const p = PRODUCTS.find(pp => pp.id === item.id);
      if (!p) return "";
      return `
        <div class="cart-item">
          <div class="cart-item-img">${renderIcon(p.icon, p.name)}</div>
          <div>
            <p class="cart-item-name">${p.name}</p>
            <span class="cart-item-price">${formatVND(p.price * item.qty)}</span>
          </div>
          <div class="cart-item-controls">
            <div class="qty-control" data-id="${p.id}">
              <button class="qty-btn" data-action="dec">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" data-action="inc">+</button>
            </div>
            <button class="cart-item-remove" data-remove="${p.id}">Xoá</button>
          </div>
        </div>
      `;
    }).join("");

    // bind controls
    $$(".cart-item", body).forEach(row => {
      const ctrl = $(".qty-control", row);
      const id = Number(ctrl.dataset.id);
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
        const pinText = `Ghim vị trí: ${lat}, ${lng} (${mapsLink})`;
        const current = addressInput.value
          .replace(/\n?Ghim vị trí:.*$/gm, "")
          .trim();
        addressInput.value = current ? `${current}\n${pinText}` : pinText;
        setLocationHint("Đã ghim vị trí thành công.", "success");
        addressInput.focus();
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
      const p = PRODUCTS.find(pp => pp.id === item.id);
      if (!p) return "";
      return `
        <div class="summary-row">
          <span>${p.name} × ${item.qty}</span>
          <span>${formatVND(p.price * item.qty)}</span>
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
      const p = PRODUCTS.find(pp => pp.id === item.id);
      if (!p) return;
      lines.push(`${i+1}. ${p.name} × ${item.qty} = ${formatVND(p.price * item.qty)}`);
    });
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    const subtotal = getCartTotal();
    const shipping = subtotal >= SHOP_CONFIG.freeShipMin ? 0 : SHOP_CONFIG.shippingFee;
    lines.push(`💵 Tạm tính: ${formatVND(subtotal)}`);
    lines.push(`🚚 Phí ship: ${shipping === 0 ? "Miễn phí" : formatVND(shipping)}`);
    lines.push(`💰 TỔNG CỘNG: ${formatVND(subtotal + shipping)}`);
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

  async function submitOrder(e) {
    e.preventDefault();
    const customer = {
      name:    $("#custName").value.trim(),
      phone:   $("#custPhone").value.trim(),
      address: $("#custAddress").value.trim(),
      note:    $("#custNote").value.trim(),
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
    setLocationHint("Bấm để lấy vị trí hiện tại và chèn vào phần địa chỉ giao hàng.");
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
