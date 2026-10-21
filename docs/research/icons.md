# Icons as embedded SVG images, fetched on demand

Spike for [issue #26](https://github.com/alexmarco/excalidraw-design-diagrams/issues/26). Question: can the skill offer icon sets (Lucide, brand and system marks, AWS architecture icons) without carrying them in the repo?

Date of the research: 2026-10-21. Terms and URLs below were checked on that date.

## Verdict

| Set                      | Verdict                                                  |
| ------------------------ | -------------------------------------------------------- |
| Lucide                   | Safe to use.                                             |
| Simple Icons             | Usable with conditions: brand marks, user's responsibility. |
| AWS Architecture Icons   | Conditions: no explicit licence found; not recommended as a default. |

- Rendering works with no renderer change, provided each SVG has an explicit `width` and `height`.
- Fetching a pinned icon into a cache outside the repo works.
- Recommendation for the follow-up ticket: see [Recommendation](#recommendation).

## 1. Embedding mechanics

An Excalidraw `image` element references an entry of the top-level `files` map through `fileId`. The entry carries `mimeType`, `id`, `dataURL` and `created`:

```json
{
  "elements": [
    { "type": "image", "id": "img-database", "x": 0, "y": 0, "width": 64, "height": 64,
      "status": "saved", "fileId": "icon-database", "scale": [1, 1], "...": "common element fields" }
  ],
  "files": {
    "icon-database": {
      "mimeType": "image/svg+xml",
      "id": "icon-database",
      "dataURL": "data:image/svg+xml;base64,PHN2Zy4uLg==",
      "created": 1700000000000
    }
  }
}
```

Result with `node skills/excalidraw-diagram/references/render_excalidraw.js icons.excalidraw` (throwaway diagram outside the repo, four icons: Lucide `database` and `server`, Simple Icons `redis`, AWS `Lambda`):

- The PNG shows the four icons at the right position and size.
- The SVG output wraps each icon in a `<symbol><image href="data:image/svg+xml;base64,..."/></symbol>` and references it with `<use>`. The data URL survives intact, so the SVG is self-contained.
- No change to `render_excalidraw.js` or `render/` is needed.

Findings:

- **Intrinsic size is required.** The first Simple Icons render (`redis`) was clipped and oversized. Simple Icons SVGs only declare `viewBox`, and a browser draws an `<svg>` image without `width` and `height` at 300x150, which is then stretched into the element box. Adding `width="24" height="24"` fixed it. Lucide and the AWS icons already declare a size. The fetch step must therefore normalize SVGs without `width` and `height` (the prototype does).
- **Colour is baked in.** Lucide uses `stroke="currentColor"`. Inside an `<img>`-like context there is no CSS colour to inherit, so it renders black. Simple Icons default to black fill. To match a diagram palette, the embedding step would have to rewrite `currentColor` or `fill` with a fixed colour. AWS icons keep their own colours (Lambda is orange).
- **Element box.** The icon is stretched to the element `width` and `height` (`preserveAspectRatio="none"` in the output), so the element must keep the icon's aspect ratio (all sets used here are square).
- **Not tested.** Opening the file in excalidraw.com. `image` elements with SVG data URLs are supported by Excalidraw's file model (`BinaryFileData`), but this spike only exercised the local renderer.

Open point for the schema docs: `skills/excalidraw-diagram/references/json-schema.md` documents `"files": {}` but no `image` element or `files` entry yet.

### Size of an embedded icon

Measured with the files fetched or extracted in this spike. Base64 adds about a third.

| Icon                        | SVG source | As data URL (base64) |
| --------------------------- | ---------- | -------------------- |
| Lucide `database` (1.61.0)  | 408 B      | about 550 B          |
| Lucide `server` (1.61.0)    | 490 B      | about 650 B          |
| Simple Icons `redis`        | 760 B      | about 1 KB           |
| AWS `Lambda` 64 px          | 1.8 KB     | about 2.4 KB         |

A diagram with four distinct icons grew the `.excalidraw` file to 7 KB. Each distinct icon is stored once in `files` and can be referenced by several elements, so cost scales with distinct icons, not with uses.

## 2. Fetch design

Prototype: [`docs/research/icons/fetch-icons.mjs`](icons/fetch-icons.mjs).

```bash
NODE_OPTIONS=--use-system-ca node docs/research/icons/fetch-icons.mjs lucide "$CACHE" database server
NODE_OPTIONS=--use-system-ca node docs/research/icons/fetch-icons.mjs simple-icons "$CACHE" redis nginx
```

- **Pinned source.** Each set maps to an npm package and an exact version served by jsDelivr: `https://cdn.jsdelivr.net/npm/lucide-static@1.61.0/icons/<name>.svg` and `https://cdn.jsdelivr.net/npm/simple-icons@16.35.0/icons/<name>.svg`. Versions were the latest on the npm registry on the research date (lucide-static 1.61.0, simple-icons 16.35.0). This is a plain HTTPS download; nothing is installed as a dependency.
- **Cache outside the repo.** Files go to `<cacheDir>/<set>@<version>/<name>.svg`. An existing file is not downloaded again, so the version in the path is the cache key. A sensible default location is a per-user directory (for example under the user's home), passed in by the caller.
- **Only the requested icons** are downloaded. A missing name fails with the HTTP status and URL (verified with a 404 for a non-existent icon).
- **Normalization.** Adds `width` and `height` from the `viewBox` when missing (see above).
- **No dependency.** It uses Node's built-in `fetch` (Node 22 or later, as the repo requires).
- **TLS on the maintainer's machine.** `curl` needs `--ssl-no-revoke`. Node's `fetch` failed with `SELF_SIGNED_CERT_IN_CHAIN` (and once with a connect timeout) until run with `NODE_OPTIONS=--use-system-ca`, which makes Node trust the Windows certificate store. `curl --ssl-no-revoke` worked for the same URLs. A production script needs either that flag or a documented fallback to `curl`.
- **Network at diagram time.** Fetching on demand means the skill needs network access the first time an icon is used. After that, the cache makes the diagram reproducible offline. The `.excalidraw` file itself stays self-contained because the data URL is embedded.
- **AWS is a different shape.** There is no per-icon URL. AWS publishes one zip (about 14 MB, 3,620 SVG and PNG files) at a URL that contains a date and a content hash, so it changes every quarter. A fetch script would download the zip once into the cache, extract it there, and look icons up by file name (`Arch_Compute/64/Arch_AWS-Lambda_64.svg`). The pin is the hash in the URL, which must be updated by hand each release.

## 3. Licence and trademark terms

### Lucide: safe to use

- Licence: ISC for the project, MIT for the icons derived from Feather (copyright Cole Bemis). Both permissive and require keeping the copyright and permission notice in copies. Source: [LICENSE](https://github.com/lucide-icons/lucide/blob/main/LICENSE). The npm package `lucide-static` declares ISC.
- Each fetched SVG begins with an `<!-- @license lucide-static vX - ISC -->` comment, so the notice travels with the embedded file when the data URL is built from the original text. Keep that comment.
- No trademark concern: generic UI icons.
- Docs: [lucide.dev/license](https://lucide.dev/license).

### Simple Icons: usable with conditions

- Licence: the project is CC0 1.0 (public domain dedication). Source: [LICENSE.md](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md).
- The CC0 covers the project, not the brands. The [disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md) says the project is CC0 "that doesn't mean to imply that all icons within the project are also CC0", that icons may carry trademark symbols, that users are expected to obtain any permissions their use needs, and that where a brand has published guidelines the user should check them. The project says it cannot be held responsible for legal claims by a brand.
- Practical conditions: use the marks only to identify the technology in a diagram (nominative use), do not alter them, do not imply endorsement, and link or mention the brand guidelines when the project lists them. Icons can be removed from the set in major releases, which is another reason to pin the version.
- This is a reading of the published text, not legal advice.

### AWS Architecture Icons: not recommended as a default

- The [AWS Architecture Icons page](https://aws.amazon.com/architecture/icons/) says AWS allows "customers and partners to use these toolkits and assets to create architecture diagrams". The page shows only a copyright footer ("All rights reserved"). Neither the page nor the downloaded zip (checked: no licence or terms file inside) contains a licence text, prohibited uses or trademark guidance.
- The [AWS Trademark Guidelines](https://aws.amazon.com/trademark-guidelines/) do not mention architecture icons. They forbid changing "Program Content" and altering AWS logo images without written permission, and section 15 says AWS generally does not license its content in third-party publications, with limited fair use for educational or non-profit purposes. Whether the icons count as Program Content is not stated.
- Conclusion: using the unmodified icons inside an architecture diagram is what AWS says the set is for. Redistributing the icons, bundling them in this repository or recolouring or reshaping them is not covered by any text found. The on-demand fetch design (the user downloads from AWS, the skill never redistributes) is the least risky shape, and the skill should not recolour or edit AWS icons.
- A third-party summary of older guidance suggests representing non-AWS technology with a generic icon, not an AWS one. Not an official source; mentioned only as context.
- Verification needed before any implementation: ask the owner whether to check the terms linked from the AWS "Site terms" page, which the research tool could not read.

## Recommendation

Create a follow-up ticket for icon support limited to these steps:

1. **Add Lucide first.** It has a clear permissive licence, a pinned per-icon URL, a consistent 24 px stroke style that suits diagrams, and the smallest files.
2. **Add Simple Icons as a second set**, with a short note in the skill docs about brand-mark responsibility.
3. **Treat AWS as optional and later.** Only add it if the maintainer accepts the licence ambiguity. Download-only, unmodified, with the pinned zip hash in the script.
4. **Fetch script in the skill.** Promote the prototype to production (test-first, per `AGENTS.md`): take a set and names, write to a cache outside the repo, normalize `width` and `height`, and keep the `@license` comment. Decide how to handle the TLS note (`--use-system-ca` or `curl --ssl-no-revoke`).
5. **Embedding helper.** A function that reads a cached SVG and returns the `files` entry plus the `image` element (aspect ratio preserved, stable `fileId` such as `icon-<set>-<name>`). Decide whether to rewrite `currentColor` to a palette colour, which gives better UX in styled diagrams.
6. **Docs and validation.** Document `image` elements and the `files` map in `skills/excalidraw-diagram/references/json-schema.md`, and make sure `validate` accepts them. Check how `restyle` treats `image` elements, since it changes colours.
7. **Check excalidraw.com once** by opening a generated file, since this spike only tested the local renderer.

No new dependency is needed for any step.
