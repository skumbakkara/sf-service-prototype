# lwc-component-docs

Build a structured Figma documentation file for any LWC component library, with live screenshots, @api prop tables, event tables, composition graphs, and a reusable variant taxonomy.

---

## When to invoke

Use this skill when the user asks to:
- Document their LWC component library in Figma
- Create a component reference for a Lightning Web Components project
- Update or refresh existing Figma component docs after code changes

---

## Inputs

| Input | Description | Default |
|---|---|---|
| `project_path` | Absolute path to LWC project root | Current working directory |
| `figma_action` | `"create"` (new file) or an existing Figma fileKey to update | `"create"` |
| `project_name` | Display name for the library | From `package.json` name field |
| `base_url` | Running dev server URL (e.g. `http://localhost:3000`) | Must be provided |
| `namespace_filter` | Namespaces to include (comma-separated, e.g. `ui,shell`) | All found |

---

## Workflow

### Step 1 — Component discovery

Scan `{project_path}/src/modules/` for all `{name}.js` + `{name}.html` pairs.

For each component JS file, extract:
- `@api` props — field declarations, getter/setter pairs (merge to one entry, note "reactive setter"), and imperative `@api` methods
- `dispatchEvent(new CustomEvent(...))` calls — capture event name and detail shape from context
- `composed: true` flag on events — note "crosses shadow boundary"

For each component HTML file, extract:
- `<slot>` elements (default and named)
- Child LWC tags matching `namespace-component` pattern

Build a component manifest: `{ name, tag, ns, desc, props[], methods[], events[], slots[], composesOf[], usedBy[] }`

**LWC-specific gotchas:**
- `@track` is internal state — never include in @api table
- `@api get foo()` + `@api set foo(v)` = one prop entry with note "reactive setter"
- `typeAttribute0..N` pattern = injected by `primitiveCustomCell`, no @api decorators — document from JSDoc comments in the file
- `extends LightningModal` = modal component — document with `LightningModal.open()` API pattern
- Zero @api + zero events = "Internal-only component — no public API"
- Getter-only `@api` (no setter) = read-only computed value — note "computed, read-only"

**Variant taxonomy:** Group components that share a container-with-slot pattern into a single "Variants" frame. Classify by the child component injected into the slot (e.g. chart type). Saves space and communicates the composition model better than N individual frames.

### Step 2 — Figma file setup

Load the `/figma-use` skill before any `use_figma` calls.

If `figma_action === "create"`:
- Call `create_new_file` with name `"{project_name} — Component Docs"`
- Capture `FILE_KEY`

If `figma_action` is an existing fileKey:
- Call `get_metadata` to verify access
- Identify existing pages to decide whether to append or overwrite

### Step 3 — Create pages

Create 8 pages in a single `use_figma` call:
1. Cover
2. Architecture
3. Shell (or equivalent routing/chrome namespace)
4. KPI Cards (or equivalent data-display cards namespace)
5. Charts (or equivalent visualisation primitives)
6. Tables (or equivalent data grid components)
7. Filters (or equivalent filter/search panels)
8. Utilities (or equivalent cell renderers / helpers)

Set all page backgrounds to `#F5F5F5`.

### Step 4 — Build Cover page

Dark-background frame (1440×900). Include:
- Project name (large, bold)
- Tagline: "A living reference for N custom LWC components"
- Stats row: component count, category count, variant count
- Page index table (page number + name + one-line description)
- Footer: generation date, stack (LWC OSS / Vite or Salesforce org), design system version

### Step 5 — Build Architecture page

Component composition tree using `figma.createFrame()` + `figma.createLine()`:
- Node color by namespace (shell = soft purple, ui = soft blue, page = soft green)
- BFS layout: depth × 220px horizontal, sibling × 52px vertical
- Namespace legend below the tree

### Step 6 — Build category pages (parallel)

Send all 6 category `use_figma` calls **in a single message** so they run concurrently.

**Per-component frame anatomy** (720px wide, 1440px for tables):

Auto-layout vertical frame, white fill, 12px radius, 32px padding, 20px item gap:

1. Header row — component name (22px bold) + namespace badge + `<tag-name>` badge
2. One-line description (13px regular, grey)
3. Screenshot placeholder frame (grey fill, 8px radius) — replaced in Step 7
4. @api Properties table (if any props)
5. @api Methods table (if any public methods)
6. Custom Events table (if any events)
7. Slots section (if slots exist)
8. Composes → / Used by ← footer row (grey background)

**Variant frame** (for card/container families):
- Side-by-side placeholder thumbnails for each visual variant
- Table mapping: Variant name → Inner component → Instance cards

### Step 7 — Screenshots

**Source options (in order of preference):**
1. Screenshot from running local dev server via `get_visual` or browser tool
2. Screenshot from existing Figma design file via `get_screenshot` on rendered screen frames
3. Grey placeholder rect with label (fallback — mark as TODO)

**Capture strategy:**
- Full wallboard/dashboard screen → use for KPI card and chart placeholders
- Table screen → use for table component placeholders
- Filter panel → interact to open, then capture

**Embed strategy:**
- Upload PNGs with `upload_assets` (max 5 per call, get upload URLs)
- POST raw bytes to each upload URL with `Content-Type: image/png`
- Use returned `imageHash` to set `fills = [{ type: 'IMAGE', scaleMode: 'FIT', imageHash }]` on placeholder frames
- Apply per page in separate `use_figma` calls (one page switch per call)

### Step 8 — Polish and return URL

1. Verify all pages have correct frame counts
2. Take spot-check screenshots of key frames (`kpiCard`, `inProgressTable`, variants frame)
3. Return the Figma file URL: `https://www.figma.com/design/{FILE_KEY}`

---

## Table helper pattern (copy into use_figma scripts)

```js
function mkTable(heading, headers, widths, rows) {
  const wrap = figma.createAutoLayout('VERTICAL');
  wrap.itemSpacing = 6; wrap.fills = [];
  const title = figma.createText();
  title.characters = heading; title.fontSize = 12;
  title.fontName = { family: 'Inter', style: 'Semi Bold' };
  title.fills = [{ type: 'SOLID', color: { r: .36, g: .36, b: .36 } }];
  wrap.appendChild(title);
  const tbl = figma.createAutoLayout('VERTICAL');
  tbl.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  tbl.cornerRadius = 6;
  tbl.strokes = [{ type: 'SOLID', color: { r: .89, g: .89, b: .89 } }];
  tbl.strokeWeight = 1; tbl.strokeAlign = 'INSIDE'; tbl.clipsContent = true;
  wrap.appendChild(tbl);
  // Header row
  const hr = figma.createAutoLayout('HORIZONTAL');
  hr.fills = [{ type: 'SOLID', color: { r: .95, g: .95, b: .95 } }];
  hr.paddingLeft = hr.paddingRight = 12; hr.paddingTop = hr.paddingBottom = 8;
  tbl.appendChild(hr);
  for (let i = 0; i < headers.length; i++) {
    const c = figma.createText();
    c.characters = headers[i]; c.fontSize = 11;
    c.fontName = { family: 'Inter', style: 'Semi Bold' };
    c.fills = [{ type: 'SOLID', color: { r: .36, g: .36, b: .36 } }];
    c.textAutoResize = 'HEIGHT'; hr.appendChild(c);
    c.layoutSizingHorizontal = 'FIXED'; c.resize(widths[i], c.height);
  }
  // Data rows
  for (let ri = 0; ri < rows.length; ri++) {
    if (ri > 0) {
      const d = figma.createRectangle(); d.resize(10, 1);
      d.fills = [{ type: 'SOLID', color: { r: .89, g: .89, b: .89 } }];
      tbl.appendChild(d); d.layoutSizingHorizontal = 'FILL';
    }
    const dr = figma.createAutoLayout('HORIZONTAL');
    dr.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    dr.paddingLeft = dr.paddingRight = 12; dr.paddingTop = dr.paddingBottom = 8;
    tbl.appendChild(dr);
    for (let ci = 0; ci < rows[ri].length; ci++) {
      const c = figma.createText();
      c.characters = rows[ri][ci] || '—'; c.fontSize = 11;
      c.fontName = { family: 'Inter', style: 'Regular' };
      c.fills = [{ type: 'SOLID', color: { r: .1, g: .1, b: .1 } }];
      c.textAutoResize = 'HEIGHT'; dr.appendChild(c);
      c.layoutSizingHorizontal = 'FIXED'; c.resize(widths[ci], c.height);
    }
  }
  return wrap;
}
```

---

## Key rules for use_figma scripts

- Always `await figma.loadFontAsync(...)` for every font family + style used
- Append node to parent **before** setting `layoutSizingHorizontal = 'FILL'`
- `opacity` goes at the top level of a fill object, not inside `color`
- Set `figma.currentPage` with `await figma.setCurrentPageAsync(page)` — never the sync setter
- One page switch per `use_figma` call — fan multi-page work into parallel calls
- Always `return { createdNodeIds: [...] }` from every script
- Max ~10 logical operations per call — split large builds across multiple calls

---

## Verification checklist

After build, verify:
- [ ] All 8 pages exist with correct names
- [ ] Cover: stats match component count, page index is complete
- [ ] Architecture: composition tree renders, namespace legend present
- [ ] kpiCard frame: has @api props, 1 event (menuapply), slot, "Used by" all 13 metric cards
- [ ] Metric Card Variants frame: 4 variant thumbnails + mapping table
- [ ] inProgressTable frame: @api props, 5 public methods, 2 events, composes inProgressFilterPanel
- [ ] All placeholder frames have screenshots (not empty grey)
- [ ] File URL returned to user
