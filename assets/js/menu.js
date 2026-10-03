import { supabase, isConfigured } from "./supabase.js";
import { formatPrice, formatDate, normalize, slugify, escapeHtml, debounce, storage } from "./utils.js";

const CACHE_KEY = "mpw:menu:v1";

const els = {
  toolbar: document.getElementById("toolbar"),
  chips: document.getElementById("chips"),
  sidenav: document.getElementById("sidenav"),
  sections: document.getElementById("sections"),
  search: document.getElementById("search"),
  searchClear: document.getElementById("search-clear"),
  reviews: document.getElementById("reviews-link"),
  priceNote: document.getElementById("price-note"),
  mastheadNote: document.getElementById("masthead-note"),
  contact: document.getElementById("contact"),
  year: document.getElementById("year"),
  dialog: document.getElementById("item-dialog"),
};

const state = {
  categories: [],
  settings: null,
  query: "",
  itemsById: new Map(),
};

const icons = {
  flame:
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17.5c3 0 5-2 5-5 0-3.5-3-5-3.5-8.5C9 6 8 8 8 10c-1-.5-1.6-1.5-1.8-2.5C5.5 8.7 5 10.3 5 12.5c0 3 2 5 5 5Z"/></svg>',
  info:
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v4.5M10 6.5v.01"/></svg>',
  wheat:
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 18V7"/><path d="M10 11c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Zm0-4C8 7 7 5.5 7 3.5 9 3.5 10 5 10 7Zm0 0c2 0 3-1.5 3-3.5-2 0-3 1.5-3 3.5Z"/></svg>',
};

/* ---------------- Data ---------------- */

async function fetchMenu() {
  const [{ data: categories, error }, { data: settings }] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "id, name, subtitle, sort_order, menu_items(id, name, description, price, calories, allergens, not_celiac_safe, photo_url, sort_order)",
      )
      .eq("is_visible", true)
      .eq("menu_items.is_available", true)
      .order("sort_order")
      .order("name")
      .order("sort_order", { referencedTable: "menu_items" })
      .order("name", { referencedTable: "menu_items" }),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (error) throw error;
  return { categories: categories ?? [], settings: settings ?? null };
}

/* ---------------- Rendering ---------------- */

function sectionId(category) {
  return `kategori-${slugify(category.name)}`;
}

function highlight(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const chars = [...text];
  const folded = chars.map((ch) => normalize(ch));
  if (folded.some((f) => f.length !== 1)) return safe;
  const at = folded.join("").indexOf(query);
  if (at < 0) return safe;
  const end = at + query.length;
  return (
    escapeHtml(chars.slice(0, at).join("")) +
    `<mark>${escapeHtml(chars.slice(at, end).join(""))}</mark>` +
    escapeHtml(chars.slice(end).join(""))
  );
}

function itemCard(item, query) {
  const hasPhoto = Boolean(item.photo_url);
  const tags = [];
  if (item.calories) tags.push(`<span class="tag">${item.calories} kcal</span>`);

  return `
    <li>
      <button class="item${hasPhoto ? "" : " item--no-photo"}" type="button" data-item="${item.id}">
        <span class="item__text">
          <span class="item__name">${highlight(item.name, query)}</span>
          ${item.description ? `<span class="item__desc">${escapeHtml(item.description)}</span>` : ""}
          <span class="item__foot">
            <span class="item__price">${formatPrice(item.price)}</span>
            ${tags.join("")}
          </span>
        </span>
        ${
          hasPhoto
            ? `<span class="item__media"><img src="${escapeHtml(item.photo_url)}" alt="" width="232" height="232" loading="lazy" decoding="async" data-loading></span>`
            : ""
        }
      </button>
    </li>`;
}

function matches(item, query) {
  if (!query) return true;
  return normalize(`${item.name} ${item.description ?? ""}`).includes(query);
}

function render() {
  const query = normalize(state.query.trim());
  state.itemsById.clear();

  const visible = state.categories
    .map((category) => {
      category.menu_items.forEach((item) => state.itemsById.set(item.id, { ...item, category: category.name }));
      return { ...category, items: category.menu_items.filter((item) => matches(item, query)) };
    })
    .filter((category) => category.items.length > 0);

  els.sections.setAttribute("aria-busy", "false");

  if (!state.categories.length) {
    els.sections.innerHTML = stateBlock("Menü hazırlanıyor", "Şu anda gösterilecek ürün yok. Biraz sonra tekrar bakın.");
    renderNav([]);
    return;
  }

  if (!visible.length) {
    els.sections.innerHTML = stateBlock(
      "Sonuç bulunamadı",
      `“${escapeHtml(state.query.trim())}” için menüde bir şey çıkmadı. Farklı bir kelime deneyin.`,
      '<button class="btn" type="button" data-action="clear-search">Aramayı temizle</button>',
    );
    renderNav([]);
    return;
  }

  els.sections.innerHTML = visible
    .map(
      (category, index) => `
      <section class="section" id="${sectionId(category)}" aria-labelledby="${sectionId(category)}-title" style="animation-delay:${Math.min(index, 4) * 60}ms">
        <header class="section__head">
          <h2 class="section__title" id="${sectionId(category)}-title">${escapeHtml(category.name)}</h2>
          <span class="section__count">${category.items.length} ürün</span>
          ${category.subtitle ? `<p class="section__subtitle">${escapeHtml(category.subtitle)}</p>` : ""}
        </header>
        <ul class="items" role="list">
          ${category.items.map((item) => itemCard(item, query)).join("")}
        </ul>
      </section>`,
    )
    .join("");

  els.sections.querySelectorAll("img[data-loading]").forEach((img) => {
    const done = () => img.removeAttribute("data-loading");
    if (img.complete && img.naturalWidth) done();
    img.addEventListener("load", done, { once: true });
    img.addEventListener(
      "error",
      () => {
        const card = img.closest(".item");
        img.parentElement.remove();
        card?.classList.add("item--no-photo");
      },
      { once: true },
    );
  });

  renderNav(visible);
  observeSections();
}

function stateBlock(title, text, action = "") {
  return `
    <div class="state">
      <h2 class="state__title">${title}</h2>
      <p class="state__text">${text}</p>
      ${action}
    </div>`;
}

function renderNav(categories) {
  els.chips.innerHTML = categories
    .map((c) => `<a class="chip" href="#${sectionId(c)}" data-target="${sectionId(c)}">${escapeHtml(c.name)}</a>`)
    .join("");
  els.sidenav.innerHTML = categories
    .map(
      (c) => `
      <li>
        <a href="#${sectionId(c)}" data-target="${sectionId(c)}">
          <span>${escapeHtml(c.name)}</span>
          <span class="sidenav__count">${c.items.length}</span>
        </a>
      </li>`,
    )
    .join("");
}

function renderSettings(settings) {
  if (!settings) return;
  const date = settings.prices_updated_on ? formatDate(settings.prices_updated_on) : "";
  const note = [settings.price_note, date && `Fiyatlar ${date} itibarıyla günceldir`].filter(Boolean).join(" · ");
  els.priceNote.textContent = note;
  if (els.mastheadNote) els.mastheadNote.textContent = note;
  if (settings.reviews_url) els.reviews.href = settings.reviews_url;

  const contact = [];
  if (settings.address) contact.push(escapeHtml(settings.address));
  if (settings.phone) {
    contact.push(`<a href="tel:${escapeHtml(settings.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(settings.phone)}</a>`);
  }
  if (settings.instagram_url) {
    contact.push(`<a href="${escapeHtml(settings.instagram_url)}" target="_blank" rel="noopener">Instagram</a>`);
  }
  els.contact.innerHTML = contact.join(" · ");
}

/* ---------------- Scroll spy ---------------- */

let sectionObserver;
let activeId = "";

function setActive(id) {
  if (!id || id === activeId) return;
  activeId = id;
  document.querySelectorAll("[data-target]").forEach((link) => {
    link.setAttribute("aria-current", String(link.dataset.target === id));
  });
  const chip = els.chips.querySelector(`[data-target="${id}"]`);
  if (chip) {
    const left = chip.offsetLeft - els.chips.clientWidth / 2 + chip.clientWidth / 2;
    els.chips.scrollTo({ left, behavior: "smooth" });
  }
}

function observeSections() {
  sectionObserver?.disconnect();
  activeId = "";
  const offset = els.toolbar.offsetHeight + 16;
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: `-${offset}px 0px -55% 0px`, threshold: 0 },
  );
  els.sections.querySelectorAll(".section").forEach((section) => sectionObserver.observe(section));
  const first = els.sections.querySelector(".section");
  if (first) setActive(first.id);
}

function trackToolbar() {
  const setOffset = () => document.documentElement.style.setProperty("--scroll-offset", `${els.toolbar.offsetHeight + 12}px`);
  setOffset();
  new ResizeObserver(setOffset).observe(els.toolbar);

  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  els.toolbar.before(sentinel);
  new IntersectionObserver(([entry]) => els.toolbar.classList.toggle("is-stuck", !entry.isIntersecting)).observe(sentinel);
}

/* ---------------- Item sheet ---------------- */

function openItem(id, trigger) {
  const item = state.itemsById.get(id);
  if (!item) return;
  const d = els.dialog;
  d.querySelector("#sheet-category").textContent = item.category;
  d.querySelector("#sheet-title").textContent = item.name;
  d.querySelector("#sheet-price").textContent = formatPrice(item.price);
  const desc = d.querySelector("#sheet-desc");
  desc.textContent = item.description ?? "";
  desc.hidden = !item.description;

  const media = d.querySelector("#sheet-media");
  media.innerHTML = item.photo_url
    ? `<img src="${escapeHtml(item.photo_url)}" alt="${escapeHtml(item.name)}" width="560" height="420" decoding="async">`
    : "";
  media.querySelector("img")?.addEventListener("error", () => (media.innerHTML = ""), { once: true });

  const facts = [];
  if (item.calories) facts.push(`<li>${icons.flame}<span>Yaklaşık <strong>${item.calories} kcal</strong></span></li>`);
  if (item.allergens) facts.push(`<li class="is-warn">${icons.info}<span>${escapeHtml(item.allergens)}. Alerjendir.</span></li>`);
  if (item.not_celiac_safe) {
    facts.push(
      `<li class="is-warn">${icons.wheat}<span>Glutensiz hammadde kullanılır ancak çapraz bulaşma riski nedeniyle çölyak hastaları için uygun değildir.</span></li>`,
    );
  }
  d.querySelector("#sheet-facts").innerHTML = facts.join("");

  d.returnFocus = trigger;
  d.showModal();
  d.querySelector(".sheet__panel").scrollTop = 0;
}

function bindDialog() {
  const d = els.dialog;
  d.addEventListener("click", (event) => {
    if (event.target === d || event.target.closest("[data-close]")) d.close();
  });
  d.addEventListener("close", () => d.returnFocus?.focus({ preventScroll: true }));
}

/* ---------------- Events ---------------- */

function bindEvents() {
  els.sections.addEventListener("click", (event) => {
    const card = event.target.closest("[data-item]");
    if (card) openItem(card.dataset.item, card);
    if (event.target.closest('[data-action="clear-search"]')) clearSearch();
    if (event.target.closest('[data-action="retry"]')) load();
  });

  const onSearch = debounce(() => {
    state.query = els.search.value;
    els.searchClear.hidden = !state.query;
    render();
  }, 120);
  els.search.addEventListener("input", onSearch);
  els.search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.search.value) clearSearch();
  });
  els.searchClear.addEventListener("click", clearSearch);
}

function clearSearch() {
  els.search.value = "";
  state.query = "";
  els.searchClear.hidden = true;
  render();
  els.search.focus();
}

/* ---------------- Boot ---------------- */

async function load() {
  const cached = storage.get(CACHE_KEY);
  if (cached?.categories?.length && !state.categories.length) {
    state.categories = cached.categories;
    state.settings = cached.settings;
    renderSettings(state.settings);
    render();
  }

  if (!isConfigured) {
    console.warn("Supabase URL is not set. Edit assets/js/config.js.");
    if (!state.categories.length) showError();
    return;
  }

  try {
    const fresh = await fetchMenu();
    state.categories = fresh.categories;
    state.settings = fresh.settings;
    storage.set(CACHE_KEY, fresh);
    renderSettings(state.settings);
    render();
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  } catch (error) {
    console.error("Menu load failed", error);
    if (!state.categories.length) showError();
  }
}

function showError() {
  els.sections.setAttribute("aria-busy", "false");
  els.sections.innerHTML = stateBlock(
    "Menü yüklenemedi",
    "Bağlantıda bir sorun oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.",
    '<button class="btn btn--primary" type="button" data-action="retry">Tekrar dene</button>',
  );
}

els.year.textContent = new Date().getFullYear();
trackToolbar();
bindDialog();
bindEvents();
load();
