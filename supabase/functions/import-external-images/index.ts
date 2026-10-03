// import-external-images
//
// Copies menu photos that still live on third-party hosts (Cloudinary,
// Delivery Hero, ...) into the public "menu-items" bucket and points the
// menu item at the new Storage URL. Works in small batches so a single call
// stays well under the function time limit; the admin panel calls it in a loop
// until `remaining` is 0.
//
// Auth: caller must send a signed-in user's access token whose email is in
// public.admins. The function itself uses the service role to write.
// Body (optional): { "exclude": ["<menu_item uuid>", ...] } to skip items that
// already failed in this run.

import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "menu-items";
const BATCH_SIZE = 8;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Giriş yapmanız gerekiyor." }, 401);

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const email = userData?.user?.email?.toLowerCase();
  if (userError || !email) return json({ error: "Oturum geçersiz." }, 401);

  const { data: adminRow, error: adminError } = await admin
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (adminError) return json({ error: adminError.message }, 500);
  if (!adminRow) return json({ error: "Bu işlem için yönetici yetkisi gerekiyor." }, 403);

  // Items that failed in earlier batches are skipped so the loop can finish.
  let exclude: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.exclude)) {
      exclude = body.exclude.filter((id: unknown) =>
        typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id)
      );
    }
  } catch {
    // empty body is fine
  }

  const storagePrefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
  const NIL_UUID = "00000000-0000-0000-0000-000000000000";
  const pending = () =>
    admin
      .from("menu_items")
      .select("id, name, photo_url", { count: "exact" })
      .is("photo_path", null)
      .not("photo_url", "is", null)
      .not("photo_url", "like", `${storagePrefix}%`)
      .not("id", "in", `(${(exclude.length ? exclude : [NIL_UUID]).join(",")})`);

  const { data: items, error: listError } = await pending().order("created_at").limit(BATCH_SIZE);
  if (listError) return json({ error: listError.message }, 500);

  const imported: string[] = [];
  const failed: { id: string; name: string; reason: string }[] = [];

  for (const item of items ?? []) {
    try {
      const res = await fetch(item.photo_url!, {
        headers: { "User-Agent": "MedipointMenuImporter/1.0" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
      const ext = ALLOWED_TYPES[type];
      if (!ext) throw new Error(`Desteklenmeyen dosya türü: ${type || "bilinmiyor"}`);

      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.byteLength > MAX_BYTES) throw new Error("Dosya 5 MB sınırını aşıyor");

      const path = `items/${item.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await admin.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType: type, cacheControl: "31536000", upsert: false });
      if (uploadError) throw uploadError;

      const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
      const { error: updateError } = await admin
        .from("menu_items")
        .update({ photo_url: pub.publicUrl, photo_path: path })
        .eq("id", item.id);
      if (updateError) {
        await admin.storage.from(BUCKET).remove([path]);
        throw updateError;
      }
      imported.push(item.id);
    } catch (err) {
      failed.push({
        id: item.id,
        name: item.name,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  exclude.push(...failed.map((f) => f.id));
  const { count } = await pending().limit(1);

  return json({ imported: imported.length, failed, remaining: count ?? 0 });
});
