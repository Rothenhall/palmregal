var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/media/shared.ts
var MEDIA_API, ACCEPT, MAX_UPLOAD_BYTES, CLIENT_TARGET_BYTES, MAX_EDGE, WEBP_QUALITY, MAX_FILES_PER_BATCH;
var init_shared = __esm({
  "src/lib/media/shared.ts"() {
    "use strict";
    MEDIA_API = "/api/tina/media/";
    ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
    MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
    CLIENT_TARGET_BYTES = Math.floor(3.5 * 1024 * 1024);
    MAX_EDGE = 2400;
    WEBP_QUALITY = 0.82;
    MAX_FILES_PER_BATCH = 10;
  }
});

// tina/media-store.ts
var media_store_exports = {};
__export(media_store_exports, {
  PalmRegalMediaStore: () => PalmRegalMediaStore,
  compressImage: () => compressImage,
  default: () => media_store_default
});
async function apiError(res, fallback) {
  let message = fallback;
  try {
    const body = await res.json();
    if (body?.error) message = String(body.error);
  } catch {
  }
  if (res.status === 401) message = "You have been signed out. Open the dashboard and sign in again, then retry.";
  if (res.status === 413) message = "That photo is too large even after shrinking. Try a smaller one.";
  return new Error(message);
}
async function decode(file) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {
      } };
    } catch {
      throw new Error(`"${file.name}" could not be read as a photo.`);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
async function compressImage(file) {
  const img = await decode(file);
  try {
    const steps = [[MAX_EDGE, WEBP_QUALITY], [MAX_EDGE, 0.72], [1920, 0.72], [1600, 0.68], [1280, 0.62]];
    let last = null;
    for (const [edge, quality] of steps) {
      const scale = Math.min(1, edge / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("This browser cannot shrink photos. Try Chrome, Edge or Safari.");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img.source, 0, 0, canvas.width, canvas.height);
      let blob = await toBlob(canvas, "image/webp", quality);
      let ext = "webp";
      if (!blob || blob.type !== "image/webp") {
        const flat = document.createElement("canvas");
        flat.width = canvas.width;
        flat.height = canvas.height;
        const fctx = flat.getContext("2d");
        fctx.fillStyle = "#fff";
        fctx.fillRect(0, 0, flat.width, flat.height);
        fctx.drawImage(canvas, 0, 0);
        blob = await toBlob(flat, "image/jpeg", quality);
        ext = "jpg";
      }
      if (!blob) throw new Error("This browser could not shrink the photo.");
      last = { blob, ext };
      if (blob.size <= CLIENT_TARGET_BYTES) return last;
    }
    if (last && last.blob.size <= MAX_UPLOAD_BYTES) return last;
    throw new Error(`"${file.name}" is still too large after shrinking. Try a smaller photo.`);
  } finally {
    img.close();
  }
}
var stripSlashes, toBlob, PalmRegalMediaStore, media_store_default;
var init_media_store = __esm({
  "tina/media-store.ts"() {
    "use strict";
    init_shared();
    stripSlashes = (s) => (s ?? "").replace(/^\/+|\/+$/g, "");
    toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
    PalmRegalMediaStore = class {
      // Tina passes its API client; we do not need it (same-origin cookies authenticate every call).
      constructor(_api) {
        this.accept = ACCEPT;
        /** Phone photos are big; they are shrunk before upload, so allow a generous original size. */
        this.maxSize = 40 * 1024 * 1024;
        this.searchable = true;
        this.extensionFilterable = true;
      }
      /** The value saved in home.json: the website's own /img/<file> URL. */
      parse(media) {
        return media.src ?? "";
      }
      async persist(files) {
        if (files.length > MAX_FILES_PER_BATCH) throw new Error(`Please upload at most ${MAX_FILES_PER_BATCH} photos at a time.`);
        const out = [];
        for (const { file, directory } of files) {
          if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) throw new Error(`"${file.name}" is not a JPEG, PNG, WebP or AVIF photo.`);
          const { blob, ext } = await compressImage(file);
          const base = file.name.replace(/\.[^.]*$/, "") || "photo";
          const form = new FormData();
          form.append("file", blob, `${base}.${ext}`);
          form.append("filename", `${base}.${ext}`);
          form.append("directory", stripSlashes(directory));
          const res = await fetch(MEDIA_API, { method: "POST", body: form, credentials: "same-origin" });
          if (!res.ok) throw await apiError(res, `The photo could not be saved (error ${res.status}).`);
          const saved = await res.json();
          out.push(this.item(saved.directory, saved.filename, saved.src));
        }
        return out;
      }
      async list(options = {}) {
        const q = new URLSearchParams();
        q.set("directory", stripSlashes(options.directory));
        if (options.limit) q.set("limit", String(options.limit));
        if (options.offset) q.set("offset", String(options.offset));
        if (options.search) q.set("search", options.search);
        if (options.ext?.length) q.set("ext", options.ext.join(","));
        if (options.filesOnly) q.set("filesOnly", "true");
        const res = await fetch(`${MEDIA_API}?${q}`, { credentials: "same-origin", cache: "no-store" });
        if (!res.ok) throw await apiError(res, `The photos could not be loaded (error ${res.status}).`);
        const body = await res.json();
        const directory = options.directory ?? "";
        return {
          items: body.items.map((i) => i.type === "dir" ? { type: "dir", id: i.name, filename: i.name, directory } : this.item(directory, i.name, i.src, options.thumbnailSizes)),
          nextOffset: body.nextOffset
        };
      }
      async delete(media) {
        const dir = stripSlashes(media.directory);
        const path = dir ? `${dir}/${media.filename}` : media.filename;
        const res = await fetch(`${MEDIA_API}?path=${encodeURIComponent(path)}`, { method: "DELETE", credentials: "same-origin" });
        if (!res.ok) throw await apiError(res, `The photo could not be deleted (error ${res.status}).`);
      }
      // Thumbnails are the photo itself: the site's photos are already web-sized, and /img/<file> works for
      // photos that are not deployed yet too (next.config.mjs routes them to the admin-only preview proxy).
      item(directory, filename, src, sizes) {
        const thumbs = { "75x75": src, "400x400": src, "1000x1000": src };
        for (const s of sizes ?? []) thumbs[`${s.w}x${s.h}`] = src;
        return { type: "file", id: filename, filename, directory, src, thumbnails: thumbs };
      }
    };
    media_store_default = PalmRegalMediaStore;
  }
});

// tina/config.ts
import { createElement, useEffect } from "react";
import { defineConfig, AbstractAuthProvider } from "tinacms";
var AdminSessionAuth = class extends AbstractAuthProvider {
  async getUser() {
    try {
      const res = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
      const session = res.ok ? await res.json() : null;
      return session?.user ? { email: session.user.email, name: "Admin" } : false;
    } catch {
      return false;
    }
  }
  async authenticate() {
    window.location.href = "/admin/login/";
    return new Promise(() => {
    });
  }
  async getToken() {
    return { id_token: "" };
  }
  async logout() {
    window.location.href = "/admin/";
  }
  async authorize() {
    return this.getUser();
  }
};
var text = (name, label, description) => ({ type: "string", name, label, description });
var long = (name, label, description) => ({ type: "string", name, label, description, ui: { component: "textarea" } });
var photo = (name, label, description) => ({ type: "image", name, label, description });
var group = (name, label, description, fields) => ({ type: "object", name, label, description, fields });
var heading = (prefix = "", hint = "The first words of the heading") => [
  text(prefix ? `${prefix}Title` : "title", "Heading", hint),
  text(prefix ? `${prefix}Em` : "em", "Heading, second part (shown in italics)", "The italic words that finish the heading")
];
var word = (item, key, fallback) => ({ label: String(item?.[key] || fallback) });
var config_default = defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main",
  // No Tina Cloud: content API is our own route (src/app/api/tina), sign-in is ours.
  // No telemetry and no update/announcement checks: the editor never calls home.
  telemetry: "disabled",
  ui: { optOutOfUpdateCheck: true },
  clientId: null,
  token: null,
  contentApiUrlOverride: "/api/tina/gql",
  authProvider: new AdminSessionAuth(),
  // A way back to the dashboard: an entry in the editor's menu that simply leaves the editor.
  cmsCallback: (cms) => {
    const BackToDashboard = () => {
      useEffect(() => {
        window.location.href = "/admin/";
      }, []);
      return createElement("p", { style: { padding: 24 } }, "Going back to the dashboard...");
    };
    cms.alerts.setMap({
      "media:upload:failure": (e) => ({ level: "error", message: `The photo was not uploaded. ${e?.error?.message ?? ""}` }),
      "media:delete:failure": (e) => ({ level: "error", message: e?.error?.message || "The photo could not be deleted." })
    });
    cms.plugins.add({
      __type: "screen",
      name: "Back to dashboard",
      layout: "popup",
      navCategory: "Site",
      Icon: () => createElement("span", { "aria-hidden": true }, "\u2190"),
      Component: BackToDashboard
    });
    return cms;
  },
  build: { outputFolder: "admin/editor", publicFolder: "public" },
  // Photos: our own media store (tina/media-store.ts). Uploads are shrunk in the browser, then saved to public/img by
  // /api/tina/media (a GitHub commit on the live site, the local disk under `npm run dev`). Same /img/<file> form either way.
  media: {
    loadCustomStore: async () => (await Promise.resolve().then(() => (init_media_store(), media_store_exports))).default,
    accept: "image/jpeg,image/png,image/webp,image/avif"
  },
  schema: {
    collections: [
      {
        name: "home",
        label: "Homepage",
        path: "content/site",
        format: "json",
        match: { include: "home" },
        ui: {
          allowedActions: { create: false, delete: false },
          // the click-to-edit view: the real homepage, fed live data (src/app/(preview)/admin/preview)
          router: () => "/admin/preview/"
        },
        fields: [
          group("seo", "Page title and search", "How the site appears in Google results and when shared on WhatsApp or social media.", [
            text("title", "Page title", "Shown in the browser tab and as the headline in Google results."),
            long("description", "Short description", "One or two sentences shown under the title in Google results."),
            photo("image", "Sharing picture", "The picture shown when the site is shared on social media.")
          ]),
          group("general", "Resort details", "Name, phone, email, address and booking link. Used across the page.", [
            text("name", "Resort name"),
            text("tagline", "Tagline under the logo"),
            text("phone", "Phone number", "As guests should read it, e.g. +91 72059 70222. The call button uses it too."),
            text("email", "Email address"),
            text("whatsapp", "WhatsApp number", "Digits only with the country code, e.g. 917205970222. Leave empty until the resort has a WhatsApp Business number."),
            text("bookingUrl", "Booking page link", 'Where "Book direct" and "Check availability" send guests. Leave empty to send them to the enquiry form instead.'),
            long("address", "Address"),
            text("instagram", "Instagram link"),
            text("checkIn", "Check-in time", "e.g. 12 PM"),
            text("checkOut", "Check-out time", "e.g. 10 AM")
          ]),
          group("buttons", "Button wording", "The words on the main buttons that appear in several places.", [
            text("bookDirect", "Header booking button"),
            text("checkAvailability", "Availability button"),
            text("seeSuites", '"See the suites" button'),
            text("explore", '"Explore your stay" link')
          ]),
          group("nav", "Menu", "The words in the top menu and footer. The menu always links to the same sections of the page.", [
            text("suites", "Suites"),
            text("facilities", "Facilities"),
            text("gallery", "Gallery"),
            text("location", "Location"),
            text("contact", "Contact")
          ]),
          group("hero", "Opening screen", "The pictures and films that change by themselves at the very top of the page.", [
            text("eyebrow", "Small line above the headline"),
            text("place", "Place line at the bottom"),
            {
              type: "object",
              name: "slides",
              label: "Slides",
              list: true,
              description: "Each slide has a picture or a film and one line of large text. Slides play in this order, morning into night.",
              ui: { itemProps: (item) => word(item, "title", "Slide") },
              templates: [
                {
                  name: "photoSlide",
                  label: "Photo slide",
                  fields: [
                    photo("image", "Photo"),
                    text("title", "Large text", "The first words of the caption"),
                    text("em", "Large text, second part (italics)"),
                    text("alt", "Describe the picture", "Read aloud to guests who cannot see it, and used by Google."),
                    { type: "number", name: "seconds", label: "Seconds on screen" }
                  ]
                },
                {
                  name: "videoSlide",
                  label: "Film slide",
                  fields: [
                    photo("poster", "Still picture (laptop)", "Shown while the film loads. The film itself can only be changed by the website developer."),
                    photo("posterMobile", "Still picture (phone)"),
                    text("title", "Large text", "The first words of the caption"),
                    text("em", "Large text, second part (italics)"),
                    text("alt", "Describe the film", "Read aloud to guests who cannot see it, and used by Google."),
                    { type: "number", name: "seconds", label: "Seconds on screen" },
                    { type: "string", name: "video", label: "Film file (laptop)", ui: { component: "hidden" } },
                    { type: "string", name: "videoMobile", label: "Film file (phone)", ui: { component: "hidden" } }
                  ]
                }
              ]
            }
          ]),
          group("arrival", "Night film introduction", "The opening words over the night-time film that plays as you scroll.", [
            text("eyebrow", "Small line above the heading"),
            ...heading("", "The first word of the big heading"),
            text("lede", "Sentence under the heading"),
            text("ledeEm", "Sentence, italic ending"),
            text("place", "Place line at the bottom")
          ]),
          group("suitesSection", "Suites", "The suites section: its heading, each suite and what comes in every suite.", [
            text("eyebrow", "Small line above the heading"),
            ...heading(),
            long("lede", "Introduction"),
            text("exploreButton", '"Explore" button'),
            {
              type: "object",
              name: "suites",
              label: "Suites",
              list: true,
              description: "One entry per suite category. Numbers (01, 02, ...) follow the order here.",
              ui: { itemProps: (item) => word(item, "name", "New suite") },
              fields: [
                text("name", "Suite name", "The last words are shown in italics."),
                long("long", "Description"),
                text("guests", "Guests", "e.g. Up to 3. Leave empty if not decided."),
                text("size", "Size", "e.g. 627 sq ft. Leave empty if not decided."),
                text("outdoor", "Balcony or view", "e.g. 1 private balcony"),
                text("bestFor", "Best for", "e.g. Couples and small families"),
                { type: "string", name: "highlights", label: "Highlights", list: true, description: "Short points, e.g. Kitchenette." },
                {
                  type: "object",
                  name: "photos",
                  label: "Photos",
                  list: true,
                  description: "The first photo is the main one. The next two appear as smaller pictures.",
                  ui: { itemProps: (item) => word(item, "alt", "Photo") },
                  fields: [photo("src", "Photo"), text("alt", "Describe the photo", "Also shown as the caption.")]
                },
                { type: "boolean", name: "pending", label: "Still being decided", description: "Marks this suite as unfinished in draft mode only. Guests do not see it.", ui: { component: "hidden" } }
              ]
            },
            text("outroEyebrow", "Closing: small line"),
            ...heading("outro", "Closing heading"),
            {
              type: "object",
              name: "inEverySuite",
              label: "Comforts in every suite",
              list: true,
              ui: { itemProps: (item) => word(item, "label", "Comfort") },
              fields: [
                text("label", "Comfort"),
                {
                  type: "string",
                  name: "icon",
                  label: "Little picture",
                  options: [
                    { value: "i-kitchen", label: "Kitchen" },
                    { value: "i-balcony", label: "Balcony" },
                    { value: "i-sofa", label: "Sofa" },
                    { value: "p-home", label: "Home" },
                    { value: "i-ac", label: "Air conditioning" },
                    { value: "i-wifi", label: "Wi-Fi" },
                    { value: "i-parking", label: "Parking" },
                    { value: "i-pet", label: "Pet" },
                    { value: "i-guests", label: "Guests" }
                  ]
                }
              ]
            }
          ]),
          group("facilitiesSection", "Facilities", 'The "Resort delights" section: four chapters, each with its facilities.', [
            text("eyebrow", "Small line above the heading"),
            ...heading(),
            long("lede", "Introduction"),
            {
              type: "object",
              name: "groups",
              label: "Chapters",
              list: true,
              description: "Each chapter groups some facilities. The page is designed for four.",
              ui: { itemProps: (item) => ({ label: [item?.title, item?.em].filter(Boolean).join(" ") || "Chapter" }) },
              fields: [
                ...heading(),
                long("text", "Introduction to the chapter"),
                {
                  type: "object",
                  name: "items",
                  label: "Facilities",
                  list: true,
                  ui: { itemProps: (item) => word(item, "name", "Facility") },
                  fields: [
                    text("name", "Name"),
                    text("tag", "Small label next to the name", "e.g. The Pool. Optional."),
                    long("text", "Description"),
                    photo("img", "Photo", "Optional. The first two photos in a chapter are shown beside it."),
                    { type: "boolean", name: "standIn", label: "Stand-in photo", description: "Tick if the photo is only a placeholder; it is then not shown." }
                  ]
                }
              ]
            }
          ]),
          group("daySection", "A day at Palm Regal", "Five moments from morning to night, each with a photo. The page is designed for five.", [
            text("eyebrow", "Small line above the moments"),
            text("moreLink", "Link to the moments wall"),
            {
              type: "object",
              name: "moments",
              label: "Moments",
              list: true,
              ui: { itemProps: (item) => word(item, "time", "Moment") },
              fields: [
                text("time", "Time of day", "e.g. Morning"),
                ...heading(),
                long("text", "Description"),
                photo("img", "Photo"),
                text("alt", "Describe the photo")
              ]
            }
          ]),
          group("locationSection", "Location heading", "The words above the map. The map itself is part of the design.", [
            text("eyebrow", "Small line above the heading"),
            ...heading(),
            text("lede", "Sentence under the heading")
          ]),
          group("momentsSection", "Moments wall", "The wall of photos that opens large when clicked.", [
            text("eyebrow", "Small line above the heading"),
            ...heading(),
            long("lede", "Introduction"),
            {
              type: "object",
              name: "photos",
              label: "Photos",
              list: true,
              description: "Every photo here appears on the wall.",
              ui: { itemProps: (item) => word(item, "cap", "Photo") },
              fields: [
                photo("src", "Photo"),
                text("cap", "Caption"),
                text("alt", "Describe the photo"),
                { type: "string", name: "group", label: "Kind of photo", options: ["Grounds", "Suites", "Facilities", "Sea"] }
              ]
            }
          ]),
          group("faqSection", "Questions guests ask", "The FAQ section.", [
            text("eyebrow", "Small line above the heading"),
            ...heading(),
            long("lede", "Introduction"),
            text("moreLink", "Link to the contact form"),
            {
              type: "object",
              name: "faqs",
              label: "Questions",
              list: true,
              ui: { itemProps: (item) => word(item, "q", "New question") },
              fields: [
                text("q", "Question"),
                { type: "string", name: "answer", label: "Answer", list: true, description: "One entry per paragraph.", ui: { component: "textarea" } },
                { type: "string", name: "pending", label: "Note to confirm", description: "Shown only in draft mode.", ui: { component: "hidden" } }
              ]
            }
          ]),
          group("contactSection", "Contact and enquiry", "The closing section with call, email and the enquiry form.", [
            text("eyebrow", "Small line above the heading"),
            ...heading(),
            long("lede", "Introduction"),
            text("callLabel", "Label above the phone number"),
            text("writeLabel", "Label above the email address"),
            text("formEyebrow", "Enquiry form: small line"),
            text("formTitle", "Enquiry form: heading"),
            text("formEm", "Enquiry form: heading, second part (italics)")
          ]),
          group("footer", "Footer", "The text at the bottom of every page.", [
            text("aboutTitle", "About: heading"),
            long("aboutText", "About: text"),
            long("followText", "Follow us: text"),
            text("note", "Line above the big name")
          ])
        ]
      }
    ]
  }
});
export {
  config_default as default
};
