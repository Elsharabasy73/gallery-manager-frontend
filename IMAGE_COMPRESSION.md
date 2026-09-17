# Image Compression on Upload

## What is going on here?

When a gallery owner or employee picks a photo (gallery logo, banner, showcase
images, product images), the file used to travel to the server **exactly as the
phone/camera produced it** — typically a 4–12 MB JPEG. That made uploads slow
(especially on mobile networks) and wasted bandwidth, because the backend
downscales everything to at most 1000px wide anyway (sharp pipeline in
`galleries_manager`: banner 1000×500, logo 500×500, gallery images 1000×500,
all stored as JPEG).

Now every picker **compresses the image in the browser, at select-time, before
it ever touches the network**. A typical 5 MB phone photo arrives as a
~150–300 KB file — roughly 95% smaller — with no visible difference at the
sizes the app actually displays (cards, heroes, the 100 px logo circle).

## How it works (`src/utils/compressImage.js`)

Zero dependencies — plain Canvas API:

1. **Guard.** Non-image files are rejected. Originals over **12 MB**
   (`MAX_ORIGINAL_BYTES`) are rejected with a friendly message, because
   decoding them can run low-end phones out of memory.
2. **Skip when pointless.** Files already under the KB target are returned
   untouched — recompressing them would only lose quality for zero gain.
3. **Decode.** Via `createImageBitmap(..., { imageOrientation: 'from-image' })`
   so phone photos respect their EXIF rotation (no more sideways portraits),
   with an `<img>`-element fallback for uncommon formats.
4. **Downscale.** The bitmap is drawn onto a canvas capped at `maxDimension`
   (aspect ratio preserved, never upscaled). The canvas is pre-filled white
   because JPEG has no alpha channel — otherwise transparent PNGs would get a
   black background.
5. **Quality loop.** Encode at qualities 0.85 → 0.77 → 0.68 → 0.6 until the
   blob fits `targetKB`. Still too big? Shrink dimensions by 20% and retry
   (up to 3 rounds at the 0.6 quality floor).
6. **Output.** A new `.jpg` `File` (matching what the backend stores), keeping
   the original filename. Previews and the `FormData` upload both use this
   file.

Two helpers ship with it:

- `prepareImages(files, preset)` — batch version for multi-pickers. Fail-soft:
  oversized files are skipped and reported (`skipped: string[]`), transient
  decode failures fall back to the original file so one bad apple never blocks
  the whole selection.
- `formatSize(bytes)` — `2.4 MB` / `210 KB` formatting for UI messages.

## Size targets (`IMAGE_PRESETS`)

| Preset    | Max dimension | Target KB | Used for                              |
| --------- | ------------- | --------- | ------------------------------------- |
| `logo`    | 512 px        | ≤ 80 KB   | Gallery logo (shown at ~100 px)       |
| `banner`  | 1920 px       | ≤ 300 KB  | Cover banner (full-width hero)        |
| `gallery` | 1600 px       | ≤ 250 KB  | Gallery showcase images               |
| `product` | 1600 px       | ≤ 250 KB  | Product main + secondary images       |

Rationale: the backend stores at most 1000 px wide, so 1600/1920 px sources
give sharp plenty of pixels to downscale cleanly while uploads stay small.

## Where it is wired

| Form | File | Handlers |
| ---- | ---- | -------- |
| Create gallery | `src/pages/CreateGallery.jsx` | `handleLogo`, `handleBanner`, `handleImages` |
| My Gallery (edit) | `src/pages/DashboardPages.jsx` → `MyGallery` | `handleLogo`, `handleBanner`, `handleImages` |
| Add / edit product | `src/pages/DashboardPages.jsx` → `AddEditProduct` | `handleMain`, `handleImages` |

Each form also got, for free:

- An **"Optimizing…" indicator** + the submit/save button disabled while
  compression runs (it takes ~100–500 ms per photo).
- A **photo error line** (oversized file? skipped images?) next to the picker.
- Picker hints updated to `up to 12MB each • auto-optimized on upload`.
- **Blob-URL cleanup**: object URLs are revoked when a preview is replaced or
  removed, and the file input is reset after each pick so the same file can be
  re-selected.

## Honest limitations

- **Client compression is bypassable by design** — anyone can POST raw files
  with curl. It is a UX/bandwidth optimization, not a security boundary. If
  upload abuse ever matters, the 5-minute backend fix is
  `limits: { fileSize, files }` on the multer middleware
  (`galleries_manager/src/middlewares/uploadImage.middleware.js`, which
  currently sets no size limit).
- Very small or already-optimized files pass through unchanged — that is
  intentional.
- HEIC photos (iPhones on "High Efficiency") depend on browser decode support;
  undecodable files surface an error instead of silently uploading.
