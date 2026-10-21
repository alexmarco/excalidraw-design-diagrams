# Data Model Diagrams

Use this guide for the tables of a database and how they relate: entities, fields, keys, cardinalities. You write the `.excalidraw` file directly: geometry and a role on every element. `restyle.js` then applies colors and fonts from `DESIGN.md`. The reference result is [`examples/online-shop-data-model/`](../examples/online-shop-data-model/); its PNG is an optional reference for the intended result.

## Workflow

`<skill>` is the skill directory. Each step ends when its check passes.

1. **Plan the model.** List the tables (at most six per diagram, at most four in a row), the fields worth showing (five per table, keys included, the same number in every table of a row), and every relationship with its cardinality at both ends and a one-word verb ("places"). Done when every relationship has two tables, two cardinalities and a verb, and every foreign key has a field in a table.
2. **Place the tables** following [Layout](#layout). Done when no relationship line would cross a table or another line.
3. **Draw the file.** A throwaway script that writes fixed coordinates is fine; keep it outside the project. Templates are in [element-templates.md](element-templates.md).
4. **Apply the design:** `node <skill>/scripts/restyle.js diagram.excalidraw`.
5. **Validate:** `node <skill>/scripts/validate.js diagram.excalidraw`. Done when it prints `No problems found.`
6. **Render and review:** `node <skill>/references/render_excalidraw.js diagram.excalidraw`, open the PNG and go through both checklists at the end of this guide. Fix and repeat from step 4. Done when every item passes.

## Layout

All sizes are in pixels.

- **Header:** title at the top left (font size 30, role `title`), one line below it (16, role `body`, at y 84; the title is at y 36 and the first table starts at y 150) naming the source and how to read the diagram: "Illustrative model · PK primary key · FK foreign key · 1 = exactly one, N = many". A diagram with no real source says "Illustrative".
- **Tables:** 280 wide, all the same width. Header 44 high, role `primary`, table name in font 22, role `text-on-dark`, centered, bound inside the header. One row per field, 36 high, role `table-row`, stacked with no gap. A shape of role `structure` with no fill, the size of the whole table, draws the outer border and is the shape relationships bind to.
- **Fields:** the name at 60 from the left edge of the row (after the key column), font 18, role `text-on-light`; the type right-aligned, 14 from the right edge, font 16, role `body`. Order: primary key first, foreign keys next, then the rest.
- **Grid:** put tables on a grid with the same number of fields in the tables of a row (so they share top and bottom edges), at least 240 apart horizontally and 140 vertically, so a relationship line is straight and has room for its verb and cardinalities. Keep the tables with the most relationships in the middle, and tables that relate to each other next to each other, so lines do not cross tables or each other. A loop of four tables is a square (2 × 2); a chain is a row.

## Keys

- **Key badge:** a 36 × 22 rectangle with role `key-badge`, 12 from the left edge of the row, with the text `PK` or `FK` (font 14, role `key-badge`) bound inside.
- **Primary key:** every table has one, in its first row, with a `PK` badge. Tables, join tables included, use a single-field key named `id`; no composite keys.
- **Foreign key:** each field that points to another table's key has an `FK` badge and is named `<table singular>_id` (`customer_id`), so the reader finds its target without a line. A field is never both `PK` and `FK`.
- Rows without a key leave the badge column empty so all names line up.

## Relationships

- **Line:** an arrow with role `relationship`, no arrowhead at the one end, bound to the outline shapes of the two tables at the middle of facing edges (`startBinding` and `endBinding` on `table-<name>`, which list the arrow in their `boundElements`). A horizontal or vertical line only; no elbows. Draw every arrow from the `1` table to the many table (negative x points when the many table is on the left), with `gap` 1 and `focus` 0 in both bindings, and `{ "id": "<arrow id>", "type": "arrow" }` in each table outline's `boundElements`.
- **Cardinality:** a crow foot (`endArrowhead: "crowfoot_many"`) at the many end of the line, and a text next to each end: `1`, `0..1`, `0..N` or `1..N`, role `relationship`, font 18, 40 wide. On a horizontal line the text sits above it (its bottom 10 above the line), aligned 12 from the table edge: left-aligned at the left end, right-aligned at the right end. On a vertical line it sits 12 to the right of the line, 6 from the table edge. State both ends of every relationship. `0..N` means optional, `1..N` means at least one, `0..1` means optional single.
- **Direction of the pair:** the end with the primary key is the `1` side; the end with the foreign key is the many side. A one-to-one relationship shows `1` at both ends and no crow foot.
- **Verb:** one word or short phrase centered on the line (font 18, role `relationship`) on an opaque rectangle with role `label-background` that is 20 wider than the text and 28 high; a text is about 0.55 × font size pixels wide per character. Pick a verb that reads as "one `<singular>` `<verb>` many `<plural>`" from the `1` side: "customer places orders", "order contains order lines", "product appears in order lines".

Text inside a shape (table name, badge) has `containerId` set to the shape, `verticalAlign` `middle`, and the shape lists it as `{ "id": "<text id>", "type": "text" }` in its `boundElements`.
- **Many to many:** draw the join table as a table of its own (`order_lines` between `orders` and `products`) with two `FK` fields; never a line with a crow foot at both ends.
- **Draw order** (array order is z-order): relationship lines, rows, headers, key badges, label backgrounds, outlines, then all text.

## Communication checklist

- [ ] The title names the model and the line below says where it comes from, or says "Illustrative".
- [ ] Every table has a `PK` badge on its first row and every field that points to another table has an `FK` badge.
- [ ] Every relationship shows a cardinality at both ends and a verb that reads correctly from the `1` side.
- [ ] Each foreign key has a relationship line to the table it points to, and each line matches a foreign key.
- [ ] The diagram shows five fields or fewer per table, only those that explain the relationships and the keys.
- [ ] Only `key-badge` and the base roles carry color; no error or warning color.

## Visual checklist

`validate.js` checks overlaps, padding and structure; this list covers what it cannot see.

- [ ] No clipped text: every name, type and label is fully inside its row, badge or box and readable at the rendered size.
- [ ] Relationship lines reach the edge of both tables, straight, with the crow foot visible at the many end.
- [ ] No line crosses a table or another line.
- [ ] Cardinality texts sit beside the line next to their table edge, not on the line and not on a table, and cannot be mistaken for the verb.
- [ ] Names, types and badges line up in columns across all tables.
- [ ] Tables have the same width and rows the same height; tables in a row share their top edge.
- [ ] Reading order works: the eye goes from the title to the most connected table, then along the relationships.
