# Excalidraw JSON Structure

## Document

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

An element has a unique string `id`, a `type`, position (`x`, `y`), size (`width`, `height`), style properties, a `seed`, and in this skill a role in `customData.role`. Preserve per-element IDs and binding references when editing a diagram. Array order is drawing order: later elements are drawn on top.

## Common element types

- `rectangle`: process, action, or component
- `ellipse`: entry, exit, or external system
- `diamond`: decision or condition
- `arrow`: directed relationship
- `line`: structural or non-directed connection
- `text`: label or annotation
- `image`: an embedded picture, such as an icon. See [Images and files](#images-and-files).
- `frame`: Excalidraw's own grouping frame. The `alt` and `opt` frames of a sequence diagram are rectangles with the `frame` role instead.

## Text

Text elements use `text` and `originalText`, `fontSize`, `fontFamily`, `textAlign`, `verticalAlign`, and optionally `containerId`. Keep `text` limited to visible words. `fontFamily` takes 1, 2, 3 or 5 to 10; 5 (Excalifont) is the skill's default and `restyle.js` sets it from `DESIGN.md`.

## Images and files

An `image` element does not hold the picture. It points with `fileId` to an entry of the document's top-level `files` map, which holds the picture as a data URL. Several `image` elements may share one entry, so each distinct picture is stored once.

```json
{
  "elements": [
    { "type": "image", "id": "db-icon", "x": 0, "y": 0, "width": 48, "height": 48,
      "status": "saved", "fileId": "icon-0123456789ab", "scale": [1, 1], "...": "common element fields" }
  ],
  "files": {
    "icon-0123456789ab": {
      "mimeType": "image/svg+xml",
      "id": "icon-0123456789ab",
      "dataURL": "data:image/svg+xml;base64,PHN2Zy4uLg==",
      "created": 1700000000000
    }
  }
}
```

- `status` is `saved`; `scale` is `[1, 1]`; `width` and `height` are explicit and keep the picture's aspect ratio, because the picture is stretched to the element box.
- An SVG must declare its own `width` and `height`; without them a renderer draws it at 300 x 150.
- An `image` needs no `customData.role`, and `restyle.js` leaves it as it is: its colors are fixed when it is embedded. `validate.js` only checks that its `fileId` is in `files`.
- Do not write these entries by hand: `embedIcon` in [icons.md](icons.md) builds them.

## Lines and bindings

Line and arrow `points` are `[x, y]` coordinates relative to the element's `x` and `y`. An arrow can bind to shapes with `startBinding` and `endBinding`:

```json
{
  "elementId": "shape-id",
  "focus": 0,
  "gap": 2
}
```

Use `startArrowhead` and `endArrowhead` to select the arrow direction and style. A rounded rectangle specifies `"roundness": { "type": 3, "value": 8 }`, where `value` is the corner radius; `null` keeps the corners sharp. `roughness` takes 0, 1 or 2.
