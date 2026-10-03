import { supabase, isConfigured } from "./supabase.js";
import { STORAGE_BUCKET, SUPABASE_URL } from "./config.js";
import { formatPrice, normalize, escapeHtml, debounce, toast } from "./utils.js";

const $ = (id) => document.getElementById(id);

const views = {
  boot: $("view-boot"),
  login: $("view-login"),
  denied: $("view-denied"),
  app: $("view-app"),
};

const state = {
  user: null,
  loaded: false,
  categories: [],
  items: [],
  settings: null,
  filters: { q: "", category: "", status: "" },
  editing: null,
  photo: { blob: null, url: null, removed: false },
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;

const icons = {
  image:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  pencil:
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 3.5a2.1 2.1 0 0 1 3 3L7 16l-4 1 1-4 9.5-9.5Z"/></svg>',
  up: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5-5 5 5"/></svg>',
  down: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>',
};

/* ================= Views ================= */

function show(name) {
  for (const [key, el] of Object.entries(views)) el.hidden = key !== name;
}

function setBusy(button, busy) {
  if (!button) return;
  button.toggleAttribute("disabled", busy);
  button.setAttribute("aria-busy", String(busy));
}

function fieldError(id, message) {
  const input = $(id);
  const error = $(`${id}-error`);
  if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message ?? "";
  return !message;
}

function friendlyError(error) {
  const msg = error?.message ?? String(error ?? "");
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.";
  if (/JWT|session|expired/i.test(msg)) return "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.";
  if (error?.code === "42501" || /row-level security|permission denied/i.test(msg)) {
    return "Bu işlem için yetkiniz yok.";
  }
  return msg || "Beklenmeyen bir hata oluştu.";
}

/* ================= Auth ================= */

async function init() {
  if (!isConfigured) {
    show("login");
    $("login-error").textContent =
      "Supabase bağlantısı ayarlanmamış. assets/js/config.js dosyasındaki SUPABASE_URL değerini girin.";
    document.querySelector("#login-form button[type=submit]").disabled = true;
    return;
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      state.user = null;
      state.loaded = false;
      show("login");
    }
  });

  const { data } = await supabase.auth.getSession();
  if (data.session) await enter(data.session.user);
  else show("login");
}

async function enter(user) {
  state.user = user;
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) {
    show("login");
    $("login-error").textContent = friendlyError(error);
    return;
  }
  if (!isAdmin) {
    $("denied-email").textContent = user.email;
    $("denied-sql").textContent = `insert into public.admins (email)\nvalues ('${(user.email ?? "").toLowerCase()}');`;
    show("denied");
    return;
  }
  $("user-email").textContent = user.email;
  show("app");
  selectTab(tabFromHash());
  if (!state.loaded) await loadAll();
}

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("login-email").value.trim();
  const password = $("login-password").value;
  $("login-error").textContent = "";

  const ok = [
    fieldError("login-email", !email ? "E-posta gerekli." : /^\S+@\S+\.\S+$/.test(email) ? null : "Geçerli bir e-posta girin."),
    fieldError("login-password", password ? null : "Şifre gerekli."),
  ].every(Boolean);
  if (!ok) return;

  const button = event.submitter;
  setBusy(button, true);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  setBusy(button, false);

  if (error) {
    $("login-error").textContent = /invalid login credentials/i.test(error.message)
      ? "E-posta veya şifre hatalı."
      : /email not confirmed/i.test(error.message)
        ? "E-posta adresi henüz doğrulanmamış."
        : friendlyError(error);
    return;
  }
  $("login-password").value = "";
  await enter(data.user);
});

async function signOut() {
  await supabase.auth.signOut();
  show("login");
}

/* ================= Data ================= */

async function loadAll() {
  $("items-list").innerHTML = skeletonRows();
  const [cats, items, settings] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("menu_items").select("*").order("sort_order").order("name"),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  const error = cats.error || items.error || settings.error;
  if (error) {
    $("items-list").innerHTML = emptyBlock(
      "Veriler yüklenemedi",
      escapeHtml(friendlyError(error)),
      '<button class="btn btn--primary" type="button" data-action="reload">Tekrar dene</button>',
    );
    return;
  }
  state.categories = cats.data;
  state.items = items.data;
  state.settings = settings.data;
  state.loaded = true;
  renderAll();
}

function renderAll() {
  renderCategoryOptions();
  renderItems();
  renderCategories();
  renderSettings();
}

function categoryName(id) {
  return state.categories.find((c) => c.id === id)?.name ?? "Kategorisiz";
}

function isExternal(item) {
  return Boolean(item.photo_url) && !item.photo_path && !item.photo_url.startsWith(STORAGE_PREFIX);
}

/* ================= Tabs ================= */

const TABS = ["items", "categories", "settings"];

function tabFromHash() {
  const tab = location.hash.slice(1);
  return TABS.includes(tab) ? tab : "items";
}

function selectTab(tab) {
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.setAttribute("aria-selected", String(btn.dataset.tab === tab));
  });
  TABS.forEach((name) => ($(`tab-${name}`).hidden = name !== tab));
  if (location.hash.slice(1) !== tab) history.replaceState(null, "", `#${tab}`);
}

/* ================= Items list ================= */

function skeletonRows(count = 6) {
  return `<ul class="rows" aria-hidden="true">${'<li class="skeleton row-skeleton"></li>'.repeat(count)}</ul>`;
}

function emptyBlock(title, text, action = "") {
  return `<div class="empty"><h2 class="empty__title">${title}</h2><p class="empty__text">${text}</p>${action}</div>`;
}

function renderCategoryOptions() {
  const filter = $("items-category");
  const current = filter.value;
  filter.innerHTML =
    '<option value="">Tüm kategoriler</option>' +
    state.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  filter.value = state.categories.some((c) => c.id === current) ? current : "";

  $("f-category").innerHTML = state.categories
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}${c.is_visible ? "" : " (gizli)"}</option>`)
    .join("");
}

function filteredItems() {
  const q = normalize(state.filters.q.trim());
  return state.items.filter((item) => {
    if (state.filters.category && item.category_id !== state.filters.category) return false;
    if (state.filters.status === "available" && !item.is_available) return false;
    if (state.filters.status === "hidden" && item.is_available) return false;
    if (state.filters.status === "no-photo" && item.photo_url) return false;
    if (q && !normalize(`${item.name} ${item.description ?? ""}`).includes(q)) return false;
    return true;
  });
}

function renderItems() {
  const total = state.items.length;
  const hidden = state.items.filter((i) => !i.is_available).length;
  $("items-summary").textContent = total
    ? `${total} ürün · ${state.categories.length} kategori${hidden ? ` · ${hidden} gizli` : ""}`
    : "";

  const list = $("items-list");

  if (!state.categories.length) {
    list.innerHTML = emptyBlock(
      "Önce bir kategori ekleyin",
      "Ürünler kategorilere bağlıdır. Kategoriler sekmesinden ilk kategorinizi oluşturun.",
      '<button class="btn btn--primary" type="button" data-tab-link="categories">Kategorilere git</button>',
    );
    return;
  }

  if (!total) {
    list.innerHTML = emptyBlock(
      "Menü henüz boş",
      "İlk ürününüzü ekleyin. Fotoğrafı yüklediğinizde otomatik olarak küçültülüp depoya kaydedilir.",
      '<button class="btn btn--primary" type="button" data-action="new-item">Ürün ekle</button>',
    );
    return;
  }

  const items = filteredItems();
  if (!items.length) {
    list.innerHTML = emptyBlock(
      "Eşleşen ürün yok",
      "Filtreleri değiştirin ya da aramayı temizleyin.",
      '<button class="btn" type="button" data-action="clear-filters">Filtreleri temizle</button>',
    );
    return;
  }

  const groups = state.categories
    .map((category) => ({ category, items: items.filter((i) => i.category_id === category.id) }))
    .filter((g) => g.items.length);

  list.innerHTML = groups
    .map(
      ({ category, items }) => `
      <section class="group">
        <header class="group__head">
          <h2 class="group__title">${escapeHtml(category.name)}</h2>
          <span class="group__count">${items.length}</span>
          ${category.is_visible ? "" : '<span class="row__badge">Kategori gizli</span>'}
        </header>
        <ul class="rows">${items.map(itemRow).join("")}</ul>
      </section>`,
    )
    .join("");
}

function itemRow(item) {
  const thumb = item.photo_url
    ? `<img class="row__thumb" src="${escapeHtml(item.photo_url)}" alt="" width="52" height="52" loading="lazy" decoding="async">`
    : `<span class="row__thumb row__thumb--empty">${icons.image}</span>`;
  const badges = [];
  if (!item.is_available) badges.push('<span class="row__badge">Gizli</span>');
  if (!item.photo_url) badges.push('<span class="row__badge">Fotoğraf yok</span>');
  else if (isExternal(item)) badges.push('<span class="row__badge row__badge--soft" title="Fotoğraf harici sunucuda">Harici foto</span>');

  return `
    <li class="row${item.is_available ? "" : " is-hidden"}" data-id="${item.id}">
      ${thumb}
      <button class="row__main" type="button" data-action="edit-item">
        <span class="row__name">${escapeHtml(item.name)}</span>
        <span class="row__meta">
          <span class="row__price">${formatPrice(item.price)}</span>
          ${item.calories ? `<span>${item.calories} kcal</span>` : ""}
          ${badges.join("")}
        </span>
      </button>
      <div class="row__actions">
        <label class="switch" title="Menüde göster">
          <input type="checkbox" data-action="toggle-available" ${item.is_available ? "checked" : ""}>
          <span class="switch__track"></span>
          <span class="visually-hidden">Menüde göster: ${escapeHtml(item.name)}</span>
        </label>
        <button class="btn btn--icon btn--sm btn--ghost" type="button" data-action="edit-item" aria-label="Düzenle: ${escapeHtml(item.name)}">${icons.pencil}</button>
      </div>
    </li>`;
}

async function toggleAvailable(id, value, input) {
  const item = state.items.find((i) => i.id === id);
  if (!item) return;
  input.disabled = true;
  const { error } = await supabase.from("menu_items").update({ is_available: value }).eq("id", id);
  input.disabled = false;
  if (error) {
    input.checked = !value;
    toast(friendlyError(error), { type: "error" });
    return;
  }
  item.is_available = value;
  renderItems();
  toast(value ? `${item.name} menüde gösteriliyor` : `${item.name} menüden gizlendi`);
}

/* ================= Item drawer ================= */

const drawer = $("item-drawer");
const form = $("item-form");

function resetPhoto() {
  if (state.photo.url?.startsWith("blob:")) URL.revokeObjectURL(state.photo.url);
  state.photo = { blob: null, url: null, removed: false };
}

function paintPhoto(url) {
  const preview = $("photo-preview");
  const drop = $("photo-drop");
  if (url) {
    preview.src = url;
    preview.hidden = false;
    $("photo-empty").hidden = true;
    drop.classList.add("has-image");
    $("photo-remove").hidden = false;
  } else {
    preview.removeAttribute("src");
    preview.hidden = true;
    $("photo-empty").hidden = false;
    drop.classList.remove("has-image");
    $("photo-remove").hidden = true;
  }
}

function openDrawer(item = null) {
  if (!state.categories.length) {
    toast("Önce bir kategori ekleyin.", { type: "error" });
    selectTab("categories");
    return;
  }
  state.editing = item;
  resetPhoto();
  form.reset();
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.setAttribute("aria-invalid", "false"));
  form.querySelectorAll(".field__error").forEach((el) => (el.textContent = ""));
  $("item-form-error").textContent = "";
  $("photo-input").value = "";

  $("drawer-title").textContent = item ? "Ürünü düzenle" : "Yeni ürün";
  form.querySelector('[data-action="delete-item"]').hidden = !item;

  $("f-name").value = item?.name ?? "";
  $("f-category").value = item?.category_id ?? (state.filters.category || state.categories[0].id);
  $("f-price").value = item ? String(item.price).replace(".", ",") : "";
  $("f-description").value = item?.description ?? "";
  $("f-calories").value = item?.calories ?? "";
  $("f-sort").value = item?.sort_order ?? "";
  $("f-allergens").value = item?.allergens ?? "";
  $("f-available").checked = item ? item.is_available : true;
  $("f-celiac").checked = item?.not_celiac_safe ?? false;
  paintPhoto(item?.photo_url ?? null);

  drawer.showModal();
  drawer.querySelector(".drawer__body").scrollTop = 0;
  if (!item) $("f-name").focus();
}

function closeDrawer() {
  drawer.close();
}

drawer.addEventListener("close", () => {
  resetPhoto();
  state.editing = null;
});

drawer.addEventListener("click", (event) => {
  if (event.target === drawer || event.target.closest("[data-close]")) closeDrawer();
});

/* Photo picking + client-side compression */

async function loadImage(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall through to <img> decoding */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressImage(file, maxSide = 1600, quality = 0.82) {
  const source = await loadImage(file);
  const width = source.width ?? source.naturalWidth;
  const height = source.height ?? source.naturalHeight;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();

  const toBlob = (type) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await toBlob("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
  if (!blob) throw new Error("Görsel işlenemedi.");
  return blob;
}

async function acceptPhoto(file) {
  $("photo-error").textContent = "";
  if (!file) return;
  if (!/^image\/(jpeg|png|webp|avif|heic|heif)$/i.test(file.type) && !/\.(jpe?g|png|webp|avif|heic)$/i.test(file.name)) {
    $("photo-error").textContent = "Lütfen JPG, PNG veya WebP formatında bir görsel seçin.";
    return;
  }
  if (file.size > MAX_SOURCE_BYTES) {
    $("photo-error").textContent = "Görsel 25 MB'tan büyük. Daha küçük bir dosya seçin.";
    return;
  }
  try {
    $("photo-drop").setAttribute("aria-busy", "true");
    const blob = await compressImage(file);
    if (blob.size > MAX_UPLOAD_BYTES) {
      $("photo-error").textContent = "Görsel küçültüldükten sonra bile 5 MB'tan büyük.";
      return;
    }
    resetPhoto();
    state.photo.blob = blob;
    state.photo.url = URL.createObjectURL(blob);
    paintPhoto(state.photo.url);
  } catch {
    $("photo-error").textContent = "Bu görsel açılamadı. Farklı bir dosya deneyin.";
  } finally {
    $("photo-drop").removeAttribute("aria-busy");
  }
}

$("photo-input").addEventListener("change", (event) => acceptPhoto(event.target.files?.[0]));

$("photo-remove").addEventListener("click", () => {
  resetPhoto();
  state.photo.removed = true;
  $("photo-input").value = "";
  paintPhoto(null);
});

const drop = $("photo-drop");
["dragenter", "dragover"].forEach((type) =>
  drop.addEventListener(type, (event) => {
    event.preventDefault();
    drop.classList.add("is-dragging");
  }),
);
["dragleave", "drop"].forEach((type) =>
  drop.addEventListener(type, (event) => {
    event.preventDefault();
    drop.classList.remove("is-dragging");
  }),
);
drop.addEventListener("drop", (event) => acceptPhoto(event.dataTransfer?.files?.[0]));

/* Save */

function parseNumber(raw) {
  const cleaned = String(raw ?? "")
    .trim()
    .replace(/[₺\s]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  return cleaned === "" ? null : Number(cleaned);
}

function validateItemForm() {
  const name = $("f-name").value.trim();
  const price = parseNumber($("f-price").value);
  const calories = parseNumber($("f-calories").value);
  const sort = parseNumber($("f-sort").value);

  const ok = [
    fieldError("f-name", name ? null : "Ürün adı gerekli."),
    fieldError("f-category", $("f-category").value ? null : "Kategori seçin."),
    fieldError(
      "f-price",
      price === null ? "Fiyat gerekli." : Number.isFinite(price) && price >= 0 ? null : "Geçerli bir fiyat girin.",
    ),
    fieldError(
      "f-calories",
      calories === null || (Number.isInteger(calories) && calories >= 0) ? null : "Kaloriyi tam sayı olarak girin.",
    ),
  ].every(Boolean);

  if (!ok) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    return null;
  }

  return {
    name,
    category_id: $("f-category").value,
    price: Math.round(price * 100) / 100,
    description: $("f-description").value.trim() || null,
    calories,
    allergens: $("f-allergens").value.trim() || null,
    is_available: $("f-available").checked,
    not_celiac_safe: $("f-celiac").checked,
    sort: Number.isInteger(sort) ? sort : null,
  };
}

function nextSortOrder(categoryId) {
  const orders = state.items.filter((i) => i.category_id === categoryId).map((i) => i.sort_order);
  return (orders.length ? Math.max(...orders) : 0) + 10;
}

async function removeObject(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) console.warn("Could not delete old photo", path, error);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  $("item-form-error").textContent = "";
  const values = validateItemForm();
  if (!values) return;

  const editing = state.editing;
  const id = editing?.id ?? crypto.randomUUID();
  const { sort, ...fields } = values;
  const payload = {
    ...fields,
    sort_order:
      sort ??
      (editing && editing.category_id === fields.category_id ? editing.sort_order : nextSortOrder(fields.category_id)),
  };

  const button = $("item-save");
  setBusy(button, true);

  let uploadedPath = null;
  try {
    if (state.photo.blob) {
      const ext = state.photo.blob.type === "image/webp" ? "webp" : "jpg";
      uploadedPath = `items/${id}/${Date.now().toString(36)}.${ext}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(uploadedPath, state.photo.blob, {
        contentType: state.photo.blob.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) {
        uploadedPath = null;
        throw error;
      }
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadedPath);
      payload.photo_url = data.publicUrl;
      payload.photo_path = uploadedPath;
    } else if (state.photo.removed) {
      payload.photo_url = null;
      payload.photo_path = null;
    }

    const query = editing
      ? supabase.from("menu_items").update(payload).eq("id", id)
      : supabase.from("menu_items").insert({ id, ...payload });
    const { data: saved, error } = await query.select().single();
    if (error) throw error;

    const photoReplaced = Boolean(uploadedPath) || state.photo.removed;
    if (editing?.photo_path && photoReplaced && editing.photo_path !== saved.photo_path) {
      removeObject(editing.photo_path);
    }

    if (editing) state.items = state.items.map((i) => (i.id === id ? saved : i));
    else state.items.push(saved);
    state.items.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "tr"));

    uploadedPath = null;
    closeDrawer();
    renderItems();
    renderCategories();
    toast(editing ? "Değişiklikler kaydedildi" : `${saved.name} menüye eklendi`);
  } catch (error) {
    if (uploadedPath) removeObject(uploadedPath);
    $("item-form-error").textContent = friendlyError(error);
  } finally {
    setBusy(button, false);
  }
});

/* Delete */

const confirmDialog = $("confirm-dialog");

function confirmAction({ title, text, ok = "Sil" }) {
  $("confirm-title").textContent = title;
  $("confirm-text").textContent = text;
  $("confirm-ok").textContent = ok;
  confirmDialog.returnValue = "";
  confirmDialog.showModal();
  return new Promise((resolve) => {
    confirmDialog.addEventListener("close", () => resolve(confirmDialog.returnValue === "ok"), { once: true });
  });
}

async function deleteItem(item) {
  const yes = await confirmAction({
    title: "Ürün silinsin mi?",
    text: `“${item.name}” menüden kalıcı olarak silinecek. Sadece geçici olarak kaldırmak istiyorsanız “Menüde göster” anahtarını kapatın.`,
  });
  if (!yes) return;
  const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
  if (error) {
    toast(friendlyError(error), { type: "error" });
    return;
  }
  removeObject(item.photo_path);
  state.items = state.items.filter((i) => i.id !== item.id);
  closeDrawer();
  renderItems();
  renderCategories();
  toast(`${item.name} silindi`);
}

/* ================= Categories ================= */

function renderCategories() {
  const list = $("category-list");
  if (!state.categories.length) {
    list.innerHTML = `<li>${emptyBlock("Henüz kategori yok", "Yukarıdan ilk kategorinizi ekleyin. Örneğin “Kahvaltılıklar” veya “Sıcak Kahveler”.")}</li>`;
    return;
  }
  list.innerHTML = state.categories
    .map((c, index) => {
      const count = state.items.filter((i) => i.category_id === c.id).length;
      return `
      <li class="cat" data-id="${c.id}">
        <div class="cat__order">
          <button class="btn btn--icon btn--sm" type="button" data-action="move-up" aria-label="Yukarı taşı: ${escapeHtml(c.name)}" ${index === 0 ? "disabled" : ""}>${icons.up}</button>
          <button class="btn btn--icon btn--sm" type="button" data-action="move-down" aria-label="Aşağı taşı: ${escapeHtml(c.name)}" ${index === state.categories.length - 1 ? "disabled" : ""}>${icons.down}</button>
        </div>
        <div class="cat__fields">
          <label class="visually-hidden" for="cat-name-${c.id}">Kategori adı</label>
          <input class="input cat__name" id="cat-name-${c.id}" data-field="name" value="${escapeHtml(c.name)}" maxlength="80" required>
          <label class="visually-hidden" for="cat-sub-${c.id}">Alt başlık</label>
          <input class="input" id="cat-sub-${c.id}" data-field="subtitle" value="${escapeHtml(c.subtitle ?? "")}" placeholder="Alt başlık (opsiyonel)" maxlength="200">
        </div>
        <div class="cat__foot">
          <span>${count} ürün</span>
          <label class="switch">
            <input type="checkbox" data-field="is_visible" ${c.is_visible ? "checked" : ""}>
            <span class="switch__track"></span>
            Görünür
          </label>
          <button class="btn btn--sm btn--ghost drawer__delete" type="button" data-action="delete-category" ${count ? `disabled title="İçinde ürün olan kategori silinemez"` : ""}>Sil</button>
        </div>
      </li>`;
    })
    .join("");
}

async function updateCategory(id, patch, input) {
  const category = state.categories.find((c) => c.id === id);
  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) {
    toast(error.code === "23505" ? "Bu isimde bir kategori zaten var." : friendlyError(error), { type: "error" });
    if (input) {
      const field = Object.keys(patch)[0];
      if (input.type === "checkbox") input.checked = category[field];
      else input.value = category[field] ?? "";
    }
    return;
  }
  Object.assign(category, patch);
  renderCategoryOptions();
  renderItems();
  toast("Kategori güncellendi");
}

async function moveCategory(id, delta) {
  const order = [...state.categories];
  const from = order.findIndex((c) => c.id === id);
  const to = from + delta;
  if (to < 0 || to >= order.length) return;
  [order[from], order[to]] = [order[to], order[from]];

  const changes = order
    .map((c, i) => ({ category: c, sort_order: (i + 1) * 10 }))
    .filter(({ category, sort_order }) => category.sort_order !== sort_order);

  const previous = state.categories;
  state.categories = order;
  changes.forEach(({ category, sort_order }) => (category.sort_order = sort_order));
  renderCategories();
  $("category-list").querySelector(`[data-id="${id}"] [data-action="${delta < 0 ? "move-up" : "move-down"}"]`)?.focus();

  const results = await Promise.all(
    changes.map(({ category, sort_order }) => supabase.from("categories").update({ sort_order }).eq("id", category.id)),
  );
  const failed = results.find((r) => r.error);
  if (failed) {
    toast(friendlyError(failed.error), { type: "error" });
    state.categories = previous;
    await loadAll();
    return;
  }
  renderCategoryOptions();
  renderItems();
}

$("category-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("category-name").value.trim();
  if (!fieldError("category-name", name ? null : "Kategori adı gerekli.")) return;
  if (state.categories.some((c) => normalize(c.name) === normalize(name))) {
    fieldError("category-name", "Bu isimde bir kategori zaten var.");
    return;
  }
  const button = event.submitter;
  setBusy(button, true);
  const sort_order = (state.categories.length ? Math.max(...state.categories.map((c) => c.sort_order)) : 0) + 10;
  const { data, error } = await supabase.from("categories").insert({ name, sort_order }).select().single();
  setBusy(button, false);
  if (error) {
    fieldError("category-name", error.code === "23505" ? "Bu isimde bir kategori zaten var." : friendlyError(error));
    return;
  }
  state.categories.push(data);
  $("category-name").value = "";
  renderAll();
  toast(`${data.name} eklendi`);
});

$("category-list").addEventListener("change", (event) => {
  const input = event.target.closest("[data-field]");
  if (!input) return;
  const id = input.closest("[data-id]").dataset.id;
  const field = input.dataset.field;
  let value = input.type === "checkbox" ? input.checked : input.value.trim();
  if (field === "name" && !value) {
    toast("Kategori adı boş olamaz.", { type: "error" });
    input.value = state.categories.find((c) => c.id === id).name;
    return;
  }
  if (field === "subtitle") value = value || null;
  updateCategory(id, { [field]: value }, input);
});

$("category-list").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const id = button.closest("[data-id]").dataset.id;
  if (button.dataset.action === "move-up") moveCategory(id, -1);
  if (button.dataset.action === "move-down") moveCategory(id, 1);
  if (button.dataset.action === "delete-category") {
    const category = state.categories.find((c) => c.id === id);
    const yes = await confirmAction({ title: "Kategori silinsin mi?", text: `“${category.name}” kalıcı olarak silinecek.` });
    if (!yes) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast(error.code === "23503" ? "İçinde ürün olan kategori silinemez." : friendlyError(error), { type: "error" });
      return;
    }
    state.categories = state.categories.filter((c) => c.id !== id);
    renderAll();
    toast(`${category.name} silindi`);
  }
});

/* ================= Settings ================= */

const settingsForm = $("settings-form");

function renderSettings() {
  const s = state.settings ?? {};
  settingsForm.price_note.value = s.price_note ?? "Fiyatlara tüm vergiler dahildir";
  settingsForm.prices_updated_on.value = s.prices_updated_on ?? "";
  settingsForm.reviews_url.value = s.reviews_url ?? "";
  settingsForm.instagram_url.value = s.instagram_url ?? "";
  settingsForm.phone.value = s.phone ?? "";
  settingsForm.address.value = s.address ?? "";
  renderImportStatus();
}

function validUrl(value) {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = {
    id: 1,
    price_note: settingsForm.price_note.value.trim() || "Fiyatlara tüm vergiler dahildir",
    prices_updated_on: settingsForm.prices_updated_on.value || null,
    reviews_url: settingsForm.reviews_url.value.trim() || null,
    instagram_url: settingsForm.instagram_url.value.trim() || null,
    phone: settingsForm.phone.value.trim() || null,
    address: settingsForm.address.value.trim() || null,
  };
  const ok = [
    fieldError("s-reviews", validUrl(values.reviews_url) ? null : "https:// ile başlayan bir bağlantı girin."),
    fieldError("s-instagram", validUrl(values.instagram_url) ? null : "https:// ile başlayan bir bağlantı girin."),
  ].every(Boolean);
  if (!ok) return;

  const button = event.submitter;
  setBusy(button, true);
  const { data, error } = await supabase.from("site_settings").upsert(values).select().single();
  setBusy(button, false);
  if (error) {
    toast(friendlyError(error), { type: "error" });
    return;
  }
  state.settings = data;
  toast("Ayarlar kaydedildi");
});

/* Copy external photos into Storage via the edge function */

function renderImportStatus() {
  const external = state.items.filter(isExternal).length;
  const button = document.querySelector('[data-action="import-images"]');
  $("import-status").textContent = external
    ? `${external} ürünün fotoğrafı harici sunucuda.`
    : "Tüm fotoğraflar menu-items deposunda.";
  button.disabled = external === 0;
}

async function importImages(button) {
  const total = state.items.filter(isExternal).length;
  if (!total) return;
  const bar = $("import-progress");
  const exclude = [];
  let imported = 0;
  setBusy(button, true);
  bar.hidden = false;
  bar.style.setProperty("--value", "0%");

  try {
    for (;;) {
      const { data, error } = await supabase.functions.invoke("import-external-images", { body: { exclude } });
      if (error) {
        let message = error.message;
        try {
          message = (await error.context?.json())?.error ?? message;
        } catch {
          /* keep default message */
        }
        throw new Error(message);
      }
      imported += data.imported;
      exclude.push(...data.failed.map((f) => f.id));
      const done = imported + exclude.length;
      bar.style.setProperty("--value", `${Math.min(100, Math.round((done / Math.max(total, done + data.remaining)) * 100))}%`);
      $("import-status").textContent = `${imported} fotoğraf aktarıldı${exclude.length ? `, ${exclude.length} aktarılamadı` : ""}. Kalan: ${data.remaining}`;
      if (data.remaining === 0 || (data.imported === 0 && data.failed.length === 0)) break;
    }
    const { data: items } = await supabase.from("menu_items").select("*").order("sort_order").order("name");
    if (items) state.items = items;
    renderItems();
    renderImportStatus();
    toast(
      exclude.length
        ? `${imported} fotoğraf aktarıldı, ${exclude.length} fotoğraf kaynağından indirilemedi`
        : `${imported} fotoğraf depoya aktarıldı`,
    );
  } catch (error) {
    toast(friendlyError(error), { type: "error" });
    $("import-status").textContent = `Aktarım durdu: ${friendlyError(error)}`;
  } finally {
    setBusy(button, false);
    bar.hidden = true;
  }
}

/* ================= Global events ================= */

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab], [data-tab-link]");
  if (tab) {
    selectTab(tab.dataset.tab ?? tab.dataset.tabLink);
    return;
  }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  const row = event.target.closest(".row[data-id]");
  const item = row && state.items.find((i) => i.id === row.dataset.id);

  switch (action) {
    case "signout":
      signOut();
      break;
    case "recheck":
      supabase.auth.getUser().then(({ data }) => data.user && enter(data.user));
      break;
    case "reload":
      loadAll();
      break;
    case "new-item":
      openDrawer();
      break;
    case "edit-item":
      if (item) openDrawer(item);
      break;
    case "delete-item":
      if (state.editing) deleteItem(state.editing);
      break;
    case "clear-filters":
      state.filters = { q: "", category: "", status: "" };
      $("items-search").value = "";
      $("items-category").value = "";
      $("items-status").value = "";
      renderItems();
      break;
    case "today": {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      settingsForm.prices_updated_on.value = local.toISOString().slice(0, 10);
      break;
    }
    case "import-images":
      importImages(event.target.closest("button"));
      break;
  }
});

$("items-list").addEventListener("change", (event) => {
  const input = event.target.closest('[data-action="toggle-available"]');
  if (input) toggleAvailable(input.closest("[data-id]").dataset.id, input.checked, input);
});

$("items-search").addEventListener(
  "input",
  debounce((event) => {
    state.filters.q = event.target.value;
    renderItems();
  }, 120),
);
$("items-category").addEventListener("change", (event) => {
  state.filters.category = event.target.value;
  renderItems();
});
$("items-status").addEventListener("change", (event) => {
  state.filters.status = event.target.value;
  renderItems();
});

// Clear a field's error as soon as the user edits it.
document.addEventListener("input", (event) => {
  const input = event.target;
  if (input.getAttribute?.("aria-invalid") !== "true") return;
  input.setAttribute("aria-invalid", "false");
  const error = document.getElementById(`${input.id}-error`);
  if (error) error.textContent = "";
});

window.addEventListener("hashchange", () => {
  if (!views.app.hidden) selectTab(tabFromHash());
});

init();
