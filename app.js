const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// URL do backend no Railway. (Local: "http://127.0.0.1:7920")
const BACKEND_URL = "https://web-production-33e1d.up.railway.app";

const reviews = [
  {
    name: "Lucas P.",
    text: "Produto veio certo, entregue antes do prazo.",
    avatar: "assets/original/a1.png",
    photos: ["assets/original/r01.webp", "assets/original/r15.webp"]
  },
  {
    name: "Marcio F.",
    text: "Top demais",
    avatar: "assets/original/a2.png",
    photos: ["assets/original/r13.jpeg", "assets/original/r16.webp"]
  },
  {
    name: "Gustavo M.",
    text: "Tava previsto pra ser entregue dia 14/05 e chegou dia 12/05. Ela é simplesmente linda demais.",
    avatar: "assets/original/a3.png",
    photos: ["assets/original/r03.webp"]
  },
  {
    name: "Luana S.",
    text: "Camiseta de qualidade!",
    avatar: "assets/original/a4.png",
    photos: ["assets/original/r14.jpeg"]
  },
  {
    name: "Natan B.",
    text: "O produto é de boa qualidade!!",
    avatar: "assets/original/a5.png",
    photos: ["assets/original/r05.webp"]
  },
  {
    name: "Luciano A.",
    text: "Sempre gostei mais da amarela, camiseta bonita demais",
    avatar: "assets/original/a6.png",
    photos: ["assets/original/r06.webp"]
  }
];

const shirtState = [
  { size: "", model: "", color: "", name: "", number: "" },
  { size: "", model: "", color: "", name: "", number: "" }
];

const TIERS = {
  1: { shirts: 1, price: 67.9, old: 129.9, flags: 0, label: "1 Camisa oficial" },
  2: { shirts: 2, price: 97.9, old: 259.8, flags: 0, label: "2 Camisas (leve a 2ª por R$ 30)" },
  3: { shirts: 3, price: 147.9, old: 389.7, flags: 2, label: "3 Camisas + 2 bandeirões" }
};
const PERSO_UNIT = 9.9;
const PRICES = { shipping: { free: 0 } };
const SHIPPING_LABEL = { free: "Frete Grátis TikTok Full" };
const BUMPS = {
  acessorios: { price: 32.9, label: "Copo Stanley Brasil Copa" },
  caneca: { price: 43.9, label: "Boné Seleção Oficial 2026" },
  entregaSegura: { price: 15.9, label: "Entrega Segura" }
};

const orderState = {
  tier: 1,
  personalize: false,
  shipping: "free",
  bumps: { acessorios: false, caneca: false, entregaSegura: false }
};

function bumpsTotal() {
  return Object.keys(BUMPS).reduce((sum, key) => sum + (orderState.bumps[key] ? BUMPS[key].price : 0), 0);
}

const brl = (value) => value.toFixed(2).replace(".", ",");

function currentShirtCount() {
  return TIERS[orderState.tier].shirts;
}

function persoTotal() {
  return orderState.personalize ? PERSO_UNIT * currentShirtCount() : 0;
}

function computeTotal() {
  return TIERS[orderState.tier].price + persoTotal() + bumpsTotal() + PRICES.shipping[orderState.shipping];
}

function ensureShirtState() {
  const target = currentShirtCount();
  while (shirtState.length < target) {
    shirtState.push({ size: "", model: "", color: "", name: "", number: "" });
  }
  shirtState.length = target;
}

function persistOrder() {
  const payload = {
    tier: orderState.tier,
    qty: TIERS[orderState.tier].shirts,
    flags: TIERS[orderState.tier].flags,
    shirts: shirtState,
    personalize: orderState.personalize,
    bumps: orderState.bumps,
    shipping: orderState.shipping,
    total: computeTotal(),
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem("cbf_order", JSON.stringify(payload));
  } catch (error) {
    /* localStorage indisponível — ignora no protótipo */
  }
  return payload;
}

let currentSlide = 0;
let remainingSeconds = 9 * 60 + 52;

function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function startCountdown() {
  const countdown = $("#countdown");
  countdown.textContent = formatTime(remainingSeconds);
  setInterval(() => {
    remainingSeconds = remainingSeconds > 0 ? remainingSeconds - 1 : 9 * 60 + 52;
    countdown.textContent = formatTime(remainingSeconds);
  }, 1000);
}

function setupGallery() {
  const track = $("#galleryTrack");
  const slides = $$(".slide", track);
  const dots = $("#galleryDots");

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir para imagem ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dots.appendChild(dot);
  });

  function updateFromScroll() {
    const width = track.clientWidth || 1;
    currentSlide = Math.round(track.scrollLeft / width);
    $("#slideIndex").textContent = String(currentSlide + 1);
    $$("#galleryDots button").forEach((dot, index) => dot.classList.toggle("active", index === currentSlide));
  }

  function goToSlide(index) {
    const safeIndex = (index + slides.length) % slides.length;
    track.scrollTo({ left: safeIndex * track.clientWidth, behavior: "smooth" });
    currentSlide = safeIndex;
    updateFromScroll();
  }

  $(".gallery-prev").addEventListener("click", () => goToSlide(currentSlide - 1));
  $(".gallery-next").addEventListener("click", () => goToSlide(currentSlide + 1));
  track.addEventListener("scroll", () => requestAnimationFrame(updateFromScroll), { passive: true });
  updateFromScroll();
}

function renderReviews() {
  const list = $("#reviewList");
  list.innerHTML = reviews
    .map((review) => {
      return `
        <article class="review">
          <img class="review-avatar-img" src="${review.avatar}" alt="Foto de ${review.name}" />
          <div><b>${review.name}</b></div>
          <span class="stars">★★★★★</span>
          <p>${review.text}</p>
          <div class="review-media">
            ${review.photos.map((photo, index) => `<img src="${photo}" alt="Foto da avaliação de ${review.name} ${index + 1}" />`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥"];

function shirtTemplate(index) {
  const number = index + 1;
  return `
    <section class="shirt-card" data-shirt="${index}">
      <h3>${CIRCLED[index] || number} Camiseta ${number}</h3>
      ${optionBlock(index, "size", "Tamanho", ["PP", "P", "M", "G", "GG", "XL", "XXL"])}
      ${optionBlock(index, "model", "Modelo", ["Masculino", "Feminino"])}
      ${optionBlock(index, "color", "Cor", ["Amarelo", "Azul"])}
    </section>
  `;
}

function persoBumpTemplate(count) {
  const price = brl(PERSO_UNIT * count);
  let rows = "";
  for (let i = 0; i < count; i += 1) {
    rows += `
      <div class="perso-row">
        <label>Camisa ${i + 1} — Nome
          <input data-perso="name" data-shirt="${i}" maxlength="18" placeholder="EX: NEYMAR" />
        </label>
        <label>Nº
          <input data-perso="number" data-shirt="${i}" maxlength="2" inputmode="numeric" placeholder="10" />
        </label>
      </div>`;
  }
  const qtyLabel = count === 1 ? "a camisa" : `as ${count} camisas`;
  const btnText = orderState.personalize
    ? `✓ Personalização ativada · +R$ ${price}`
    : `Quero personalizar ${qtyLabel} · +R$ ${price}`;
  return `
    <section class="perso-bump" id="persoBump">
      <div class="perso-inner">
        <div class="perso-head">
          <b>⚡ Personalize sua paixão</b>
          <span>Seu nome + número nas costas — só <strong>+R$ 9,90 por camisa</strong></span>
        </div>
        <button class="perso-cta ${orderState.personalize ? "is-on" : ""}" type="button" id="persoToggle">${btnText}</button>
        <div class="perso-fields ${orderState.personalize ? "is-open" : ""}" id="persoFields">
          ${rows}
        </div>
      </div>
    </section>
  `;
}

function optionBlock(index, key, label, options) {
  return `
    <div class="option-block" data-key="${key}">
      <span class="option-label">${label}: <b data-label="${key}">Selecione</b></span>
      <div class="pill-row">
        ${options.map((value) => `<button class="pill" type="button" data-shirt="${index}" data-key="${key}" data-value="${value}">${value}</button>`).join("")}
      </div>
    </div>
  `;
}

function setupDrawer() {
  $$(".open-selector").forEach((button) => button.addEventListener("click", openDrawer));
  $("#selectorOverlay").addEventListener("click", closeDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  $("#drawerBuyBtn").addEventListener("click", openCheckout);

  ensureShirtState();
  renderShirtForms();
}

function renderShirtForms() {
  const container = $("#shirtForms");
  if (!container) return;
  const count = currentShirtCount();
  let html = "";
  for (let i = 0; i < count; i += 1) html += shirtTemplate(i);
  html += persoBumpTemplate(count);
  container.innerHTML = html;
  wireShirtForms();
  restoreShirtForms();
}

function wireShirtForms() {
  $$(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const shirtIndex = Number(pill.dataset.shirt);
      const key = pill.dataset.key;
      const value = pill.dataset.value;
      shirtState[shirtIndex][key] = value;

      const card = $(`[data-shirt="${shirtIndex}"].shirt-card`);
      $$(`.pill[data-key="${key}"]`, card).forEach((item) => item.classList.toggle("active", item === pill));
      $(`[data-label="${key}"]`, card).textContent = value;
      validateDrawer();
      persistOrder();
    });
  });

  const toggle = $("#persoToggle");
  const fields = $("#persoFields");
  if (toggle && fields) {
    toggle.addEventListener("click", () => {
      if (orderState.personalize) return;
      orderState.personalize = true;
      fields.classList.add("is-open");
      toggle.classList.add("is-on");
      toggle.textContent = `✓ Personalização ativada · +R$ ${brl(persoTotal())}`;
      persistOrder();
      setTimeout(() => $("[data-perso='name'][data-shirt='0']")?.focus(), 260);
    });
  }

  $$("[data-perso]").forEach((input) => {
    input.addEventListener("input", () => {
      const shirtIndex = Number(input.dataset.shirt);
      const field = input.dataset.perso;
      input.value = field === "number" ? input.value.replace(/\D/g, "").slice(0, 2) : input.value.toUpperCase();
      shirtState[shirtIndex][field] = input.value;
      persistOrder();
    });
  });
}

function restoreShirtForms() {
  shirtState.forEach((shirt, index) => {
    const card = $(`[data-shirt="${index}"].shirt-card`);
    if (!card) return;
    ["size", "model", "color"].forEach((key) => {
      if (!shirt[key]) return;
      const pill = $(`.pill[data-key="${key}"][data-value="${shirt[key]}"]`, card);
      if (pill) pill.classList.add("active");
      const label = $(`[data-label="${key}"]`, card);
      if (label) label.textContent = shirt[key];
    });
    if (orderState.personalize) {
      const nameInput = $(`[data-perso="name"][data-shirt="${index}"]`);
      const numInput = $(`[data-perso="number"][data-shirt="${index}"]`);
      if (nameInput) nameInput.value = shirt.name || "";
      if (numInput) numInput.value = shirt.number || "";
    }
  });
}

function openDrawer() {
  $("#selectorOverlay").hidden = false;
  requestAnimationFrame(() => $("#selectorOverlay").classList.add("show"));
  $("#selectorDrawer").classList.add("open");
  $("#selectorDrawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  $("#selectorOverlay").classList.remove("show");
  $("#selectorDrawer").classList.remove("open");
  $("#selectorDrawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => {
    if (!$("#selectorOverlay").classList.contains("show")) $("#selectorOverlay").hidden = true;
  }, 240);
}

function validateDrawer() {
  const ready = shirtState.every((shirt) => shirt.size && shirt.model && shirt.color);
  $("#drawerBuyBtn").disabled = !ready;
}

function shirtLine(shirt, index) {
  const base = `${shirt.size || "M"} · ${shirt.model || "Masculino"} · ${shirt.color || "Amarelo"}`;
  const custom =
    orderState.personalize && shirt.name ? ` · ${shirt.name}${shirt.number ? " " + shirt.number : ""}` : "";
  return `Camisa ${index + 1}: ${base}${custom}`;
}

function renderCheckout() {
  const variant = $("#checkoutVariant");
  if (variant) variant.innerHTML = shirtState.map(shirtLine).join("<br>");

  const shippingCost = PRICES.shipping[orderState.shipping];
  const total = computeTotal();

  const tier = TIERS[orderState.tier];
  const itemPrice = $(".item-summary strong");
  if (itemPrice) itemPrice.textContent = `R$ ${brl(tier.price)}`;

  const summary = $(".order-total");
  if (summary) {
    const lines = [`<p><span>${tier.label}</span><b>R$ ${brl(tier.price)}</b></p>`];
    if (tier.flags > 0) {
      lines.push(`<p><span>${tier.flags} Bandeirões Brasil (brinde)</span><b>Grátis</b></p>`);
    }
    if (orderState.personalize) {
      lines.push(`<p><span>Personalização (${currentShirtCount()} ${currentShirtCount() === 1 ? "camiseta" : "camisetas"})</span><b>+R$ ${brl(persoTotal())}</b></p>`);
    }
    Object.keys(BUMPS).forEach((key) => {
      if (orderState.bumps[key]) {
        lines.push(`<p><span>${BUMPS[key].label}</span><b>+R$ ${brl(BUMPS[key].price)}</b></p>`);
      }
    });
    lines.push(
      `<p><span>Frete (${SHIPPING_LABEL[orderState.shipping]})</span><b>${
        shippingCost === 0 ? "Grátis" : "R$ " + brl(shippingCost)
      }</b></p>`
    );
    lines.push(`<p class="total"><span>Total a pagar</span><b>R$ ${brl(total)}</b></p>`);
    summary.innerHTML = `<h2>Resumo do pedido</h2>${lines.join("")}<small>Pagamento via Pix • aprovação instantânea</small>`;
  }

  const payBtn = $("#payBtn");
  if (payBtn) payBtn.textContent = `Pagar R$ ${brl(total)}`;
}

function openCheckout() {
  closeDrawer();
  $("#productPage").hidden = true;
  $("#checkoutPage").hidden = false;
  $(".bottom-bar").hidden = true;
  $("#checkoutBar").hidden = false;

  persistOrder();
  renderCheckout();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToProduct() {
  $("#checkoutPage").hidden = true;
  $("#productPage").hidden = false;
  $(".bottom-bar").hidden = false;
  $("#checkoutBar").hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

let pollTimer = null;

function collectCheckoutData() {
  return {
    customer: {
      name: $("#name").value.trim(),
      cpf: $("#cpf").value.replace(/\D/g, ""),
      email: $("#email").value.trim(),
      phone: $("#phone").value.replace(/\D/g, ""),
    },
    address: {
      cep: $("#cep").value.trim(),
      street: $("#street").value.trim(),
      number: $("#addrNumber").value.trim(),
      complement: $("#complement").value.trim(),
      city: $("#city").value.trim(),
      uf: $("#uf").value.trim().toUpperCase(),
    },
    order: {
      tier: orderState.tier,
      personalize: orderState.personalize,
      bumps: orderState.bumps,
      shipping: orderState.shipping,
      shirts: shirtState,
    },
  };
}

async function payWithPix() {
  const payBtn = $("#payBtn");
  payBtn.disabled = true;
  payBtn.textContent = "Gerando Pix…";
  try {
    const resp = await fetch(`${BACKEND_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectCheckoutData()),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Falha ao gerar Pix");

    // preenche o modal com o Pix real
    $("#pixAmount").textContent = `R$ ${brl(data.amount_cents / 100)}`;
    $("#pixCodeField").value = data.pix_code;
    $("#pixQr").src =
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
      encodeURIComponent(data.pix_code);
    $("#pixStatus").textContent = "⏳ Aguardando pagamento…";
    $("#pixStatus").className = "pix-status";
    $("#pixDialog").showModal();

    startPolling(data.external_id);
  } catch (err) {
    alert("Erro ao gerar o Pix: " + err.message);
  } finally {
    payBtn.disabled = false;
    renderCheckout();
  }
}

// Troque pelo número real do WhatsApp da loja (DDI+DDD+número, só dígitos).
const WHATSAPP_NUMERO = "5511999999999";

function startPolling(externalId) {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/orders/${externalId}`);
      const o = await r.json();
      if (o.status === "paid" || o.status === "shipped") {
        clearInterval(pollTimer);
        showThanksPage(externalId);
      }
    } catch (e) {
      /* rede — tenta de novo no próximo tick */
    }
  }, 3000);
}

function showThanksPage(externalId) {
  if ($("#pixDialog").open) $("#pixDialog").close();
  $("#productPage").hidden = true;
  $("#checkoutPage").hidden = true;
  $(".bottom-bar").hidden = true;
  $("#checkoutBar").hidden = true;
  $("#thanksPage").hidden = false;

  $("#thanksOrderId").textContent = "#" + externalId.slice(-8).toUpperCase();

  const msg = encodeURIComponent(
    `Olá! Acabei de pagar meu pedido ${externalId} e quero receber o código de rastreio 📦`
  );
  $("#thanksWhatsBtn").href = `https://wa.me/${WHATSAPP_NUMERO}?text=${msg}`;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupCheckout() {
  $("#backToProduct").addEventListener("click", backToProduct);
  $("#payBtn").addEventListener("click", () => {
    if (!$("#checkoutForm").reportValidity()) return;
    payWithPix();
  });
  $("#closePix").addEventListener("click", () => {
    $("#pixDialog").close();
    if (pollTimer) clearInterval(pollTimer);
  });
  $("#pixCopyBtn").addEventListener("click", () => {
    const field = $("#pixCodeField");
    if (navigator.clipboard) navigator.clipboard.writeText(field.value);
    const btn = $("#pixCopyBtn");
    btn.textContent = "Copiado!";
    setTimeout(() => (btn.textContent = "Copiar"), 1800);
  });

  const shippingKeys = ["free"];
  $$('input[name="shipping"]').forEach((input, index) => {
    input.addEventListener("change", () => {
      $$('.option-group input[name="shipping"]').forEach((item) => {
        item.closest(".radio-card").classList.toggle("active", item.checked);
      });
      orderState.shipping = shippingKeys[index] || "free";
      persistOrder();
      renderCheckout();
    });
  });

  $$(".co-bump, .ship-bump").forEach((label) => {
    const key = label.dataset.bump;
    const input = $("input", label);
    input.addEventListener("change", () => {
      orderState.bumps[key] = input.checked;
      label.classList.toggle("is-on", input.checked);
      persistOrder();
      renderCheckout();
    });
  });

  addMask($("#cpf"), "cpf");
  addMask($("#phone"), "phone");
  addMask($("#cep"), "cep");
  setupCepAutofill();
}

function setupCepAutofill() {
  const cep = $("#cep");
  cep.addEventListener("input", async () => {
    const digits = cep.value.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const d = await r.json();
      if (d.erro) return;
      if (d.logradouro) $("#street").value = d.logradouro;
      if (d.localidade) $("#city").value = d.localidade;
      if (d.uf) $("#uf").value = d.uf;
      $("#addrNumber").focus();
    } catch (e) {
      /* offline — usuário preenche manual */
    }
  });
}

function addMask(input, type) {
  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "");
    if (type === "cpf") {
      input.value = digits
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    if (type === "phone") {
      input.value = digits
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
    }
    if (type === "cep") {
      input.value = digits.slice(0, 8).replace(/(\d{5})(\d{1,3})$/, "$1-$2");
    }
  });
}

function setupMisc() {
  $("#bookmarkBtn").addEventListener("click", (event) => event.currentTarget.classList.toggle("saved"));
  $("#addCartBtn").addEventListener("click", () => {
    const count = $("#cartCount");
    count.textContent = String(Number(count.textContent) + 1);
  });
}

function selectTier(tier) {
  orderState.tier = tier;
  ensureShirtState();

  $$("[data-tier]").forEach((el) => el.classList.remove("is-selected"));
  const el = $(`[data-tier="${tier}"]`);
  if (el) el.classList.add("is-selected");

  const t = TIERS[tier];
  const drawerPrice = $("#drawerPrice");
  if (drawerPrice) drawerPrice.textContent = `R$ ${brl(t.price)}`;
  const drawerCount = $("#drawerCount");
  if (drawerCount) {
    drawerCount.textContent =
      t.shirts === 1 ? "Escolha sua camiseta (1 unidade)" : `Escolha suas camisetas (${t.shirts} unidades)`;
  }

  renderShirtForms();
  validateDrawer();
  persistOrder();
}

function confettiBurst() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const colors = ["#009c3b", "#FFDF00", "#002776", "#ffffff", "#00e676"];
  const parts = Array.from({ length: 90 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 140,
    y: window.innerHeight * 0.38,
    vx: (Math.random() - 0.5) * 9,
    vy: Math.random() * -10 - 4,
    size: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.4
  }));
  let frame = 0;
  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach((p) => {
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
    frame += 1;
    if (frame < 95) requestAnimationFrame(tick);
    else canvas.remove();
  })();
}

function playChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const audio = new AC();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audio.destination);
      const start = audio.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  } catch (error) {
    /* áudio bloqueado — ignora */
  }
}

let lockTimerStarted = false;
function startLockTimer() {
  if (lockTimerStarted) return;
  lockTimerStarted = true;
  const wrap = $("#upgLockTimer");
  const time = $("#upgLockTime");
  if (!wrap || !time) return;
  wrap.hidden = false;
  let secs = 15 * 60;
  const render = () => {
    time.textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  };
  render();
  const id = setInterval(() => {
    secs = secs > 0 ? secs - 1 : 0;
    render();
    if (secs === 0) clearInterval(id);
  }, 1000);
}

function makeScratch(wrap, onReveal) {
  const canvas = $(".scratch-canvas", wrap);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let revealed = false;

  function paint() {
    const rect = wrap.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, "#b8b8b8");
    grad.addColorStop(0.35, "#e2e2e2");
    grad.addColorStop(0.65, "#c8c8c8");
    grad.addColorStop(1, "#a4a4a4");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.arc((i * rect.width) / 5, rect.height / 2 + Math.sin(i) * 7, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 3;
    ctx.fillText("👆 Raspe e descubra a oferta", rect.width / 2, rect.height / 2);
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "destination-out";
  }
  paint();

  let drawing = false;
  const pos = (event) => {
    const rect = canvas.getBoundingClientRect();
    const point = event.touches ? event.touches[0] : event;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };
  const scratch = (point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
    ctx.fill();
  };
  const cleared = () => {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let empty = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 80) {
      total += 1;
      if (data[i] === 0) empty += 1;
    }
    return empty / total;
  };
  const check = () => {
    if (revealed || cleared() <= 0.03) return;
    revealed = true;
    canvas.style.transition = "opacity 0.4s";
    canvas.style.opacity = "0";
    confettiBurst();
    playChime();
    startLockTimer();
    setTimeout(() => {
      canvas.style.display = "none";
      if (onReveal) onReveal();
    }, 400);
  };

  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    scratch(pos(event));
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    scratch(pos(event));
    check();
  });
  canvas.addEventListener("pointerup", () => {
    drawing = false;
  });
  canvas.addEventListener("pointerleave", () => {
    drawing = false;
  });
}

function setupUpgrade() {
  const section = $(".upgrade-section");
  if (!section) return;

  $(".upg-tier[data-tier='1']").addEventListener("click", () => selectTier(1));

  const combo = $(".upg-scratch-combo");
  if (combo) {
    makeScratch($(".scratch-wrap", combo), () => {
      combo.classList.add("is-revealed");
    });
    $$(".upg-tier-row", combo).forEach((row) => {
      row.addEventListener("click", () => selectTier(Number(row.dataset.tier)));
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  startCountdown();
  setupGallery();
  renderReviews();
  setupDrawer();
  setupCheckout();
  setupMisc();
  setupUpgrade();
});
