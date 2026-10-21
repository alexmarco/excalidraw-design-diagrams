# Icons in Diagrams

Use this guide when icons would help the reader of an architecture or concept diagram: a technology recognized at a glance (PostgreSQL, Redis, nginx) or kinds of component told apart (server, worker, browser). Icons come from two sets, fetched on demand and embedded in the `.excalidraw` file: Lucide for generic components and Simple Icons for named technologies. Draw the diagram itself with its own guide, such as [architecture.md](architecture.md), and add the icons on top. The reference result is [`examples/web-app-icons/`](https://github.com/alexmarco/excalidraw-design-diagrams/tree/main/examples/web-app-icons/); its PNG shows the intended result, and this guide is enough to draw without opening it. How `image` elements and `files` look in the JSON is in [json-schema.md](json-schema.md#images-and-files).

## When to use icons

Icons are optional. Add them when each one answers a question the label alone does not: which technology is this, or what kind of component is this. A diagram that reads well from its labels stays without icons.

- Put an icon on every component of the diagram, or on none; a mix reads as "the iconless ones are less important".
- Icons mark components only. Arrows, zones, notes and titles stay without icons.
- One icon per component. The label always stays, because the icon alone is not read.

## Workflow

`<skill>` is the skill directory. Each step ends when its check passes.

1. **Choose the icons.** For each component pick a set and a name: Simple Icons for a named technology (`postgresql`, `redis`, `nginx`), Lucide for a generic component (`server`, `globe`, `cog`, `database`). Names are the lowercase slugs shown on lucide.dev/icons and simpleicons.org. Done when every component has one set and one name, or the diagram has no icons.
2. **Fetch them:** `node <skill>/scripts/fetch_icons.js lucide globe server cog`, and the same for `simple-icons`. It prints the path of each SVG. The first use of an icon needs network access; after that it is read from the cache. A `404` means the name does not exist in the pinned version: pick another icon. Done when every name has a path.
3. **Draw the diagram** following its own guide, leaving the icon tile free ([Placement](#placement)).
4. **Embed each icon** in the throwaway drawing script. `embedIcon` returns the `files` entry and the `image` element; storing the entry under its `fileId` keeps one copy per distinct icon, however many elements use it.

   ```js
   import { readFileSync } from 'node:fs';
   import { embedIcon } from 'file:///<skill>/scripts/icon_embed.js'; // an absolute file URL; the script lives outside the project

   const { fileId, file, element } = embedIcon({
     svgText: readFileSync(pathPrintedByFetchIcons, 'utf8'),
     id: 'api-icon', x: tileX + 8, y: tileY + 8, size: 32,
     color: '#1e3a5f', // Lucide only: the stroke color of the `structure` role
   });
   document.files[fileId] = file;
   elements.push(element);
   ```

   Done when `document.files` has one entry per distinct icon and every `image` has an explicit width and height.
5. **Apply the design, validate, render and review** as the diagram's own guide says, then go through both checklists below. `restyle.js` leaves images as they are, so the icon colors do not follow a later change of `DESIGN.md`: run the drawing script again after changing it.

## Placement

All sizes are in pixels.

- **Tile:** a 48 × 48 rounded rectangle with the role `label-background` (white), inside the component box, 16 from its left edge and 12 from its top. The tile keeps every icon legible on any box color and on a dark canvas.
- **Icon:** 32 × 32, centered on the tile (8 from each side).
- **Component box:** 280 × 72, wider than the 220 of the plain architecture guide. The name and the descriptor stay centered in the box, so the name has at most 12 characters (20 px) and the descriptor at most 16 (15 px); shorter text avoids the tile.
- **Order:** array order is z-order. Draw the tile after the box and before the icon; the icon comes before the texts.
- **Color:** Lucide draws with `currentColor`, which renders black unless you pass `color`. Pass the stroke color of the `structure` role from the resolved design (`resolveDesign().components.structure.strokeColor`), so the icons match the diagram. Simple Icons are black, which suits the white tile; do not pass `color` for them (`embedIcon` refuses it).
- **Size:** every icon in the diagram has the same size.

## Licences

- **Lucide** is ISC. Each SVG starts with a licence comment; `embedIcon` keeps it inside the embedded file. Do not strip it.
- **Simple Icons** is CC0, but the marks belong to their brands. Show a brand mark unmodified (no recolor, crop or distortion) and only to identify that technology. Do not use one to suggest endorsement. Where a brand publishes guidelines, check them.
- **Credit line:** under the last zone, one line (role `body`, 14): `Icons: Lucide (ISC), Simple Icons (CC0). Brand marks identify the technology and belong to their owners.`
- **The repository:** never save icon files in the project; only the copies embedded in a `.excalidraw` file belong there. The cache is outside the repository, in the user's cache folder; set `EXCALIDRAW_ICON_CACHE` to move it.
- AWS architecture icons are out of scope.

## Communication checklist

- [ ] Each icon identifies a technology or a kind of component; none is decoration.
- [ ] Every component has a label and an icon, or the diagram has no icons.
- [ ] Brand marks sit only on the technology they belong to.
- [ ] The credit line is present when the diagram has icons.

## Visual checklist

`validate.js` checks that each `image` points to an entry of `files`; this list covers the rest.

- [ ] Every icon is visible and not clipped, with its true proportions, not stretched.
- [ ] Each icon sits fully on its white tile, and the tile fully inside its box.
- [ ] No label touches or crosses a tile.
- [ ] All icons have the same size and the same position inside their boxes.
- [ ] Lucide icons use the diagram's dark line color; brand marks keep their own shape and are not recolored.
- [ ] The icons are readable at the rendered size.
- [ ] The diagram's own checklists still pass.
