# Excalidraw Design Diagrams

Tooling for an agent skill that creates and visually validates Excalidraw diagrams (`.excalidraw` files) that explain workflows, architectures and concepts.

The baseline skill lives in [`skill/`](skill/). Its rendering tools are documented in [`skill/references/README.md`](skill/references/README.md).

## Requirements

- Node.js 22.18 or later.
- Google Chrome or Chromium, for rendering. Set `CHROME_PATH` if it is not in a default location.

## Commands

```bash
npm install # installs the renderer and the DESIGN.md parser dependencies
npm test    # runs the test suite with node:test
```

## Usage

The agent draws the `.excalidraw` file itself, following the guide for the diagram type, and the scripts do the mechanical work. In the commands below, `<skill>` is the skill directory (`skill/` in this repository), and you run them from your project root.

```bash
# 1. Apply colors, fonts and corner radius from DESIGN.md to every element, by its role
node <skill>/scripts/restyle.js diagrams/login.excalidraw

# 2. Check structure, overlapping text and padding; exits with 1 and lists each problem
node <skill>/scripts/validate.js diagrams/login.excalidraw

# 3. Render a PNG to review and an SVG for documentation, written beside the file
node <skill>/references/render_excalidraw.js diagrams/login.excalidraw
```

- The `.excalidraw` file is the source of truth; later changes are edits to it. After changing `DESIGN.md`, run the three steps again.
- Sequence diagrams: layout, frames, notes and the checklists are in [`skill/references/sequence.md`](skill/references/sequence.md).
- Render options (`--output`, `--scale`, `--width`) are listed in [`skill/references/README.md`](skill/references/README.md).
- Styles come from `DESIGN.md`. `restyle.js` and `validate.js` use the file given with `--design`, else the project's `DESIGN.md` (or `docs/DESIGN.md`) next to the diagram, else the base design in [`skill/DESIGN.md`](skill/DESIGN.md).
- The reference example, an OAuth 2.0 authorization code flow with PKCE, is in [`skill/examples/oauth-pkce/`](skill/examples/oauth-pkce/).

## Install the skill manually

The skill is not installed automatically. To use it:

1. Run `npm install` at the repository root, the folder that contains `package.json`.
2. Put the `skill/` folder in your Claude Code skills folder (`~/.claude/skills/excalidraw-diagram`). You can link it, so a `git pull` updates it, or copy the whole repository there and point to its `skill/` folder; the scripts need the repository's `node_modules`, so copying `skill/` alone does not work.
3. Start a new Claude Code session and check that the skill is listed.

## Working rules

- Develop test-first: write a failing test, then the minimal code that passes it, one slice at a time.
- Ask before adding any new dependency, and explain why it is needed. The renderer depends on `@excalidraw/utils` and `esbuild`, pinned to exact versions.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages, one logical change per commit.
- Follow GitFlow: branch `feature/*` and `bugfix/*` from `develop`, branch `hotfix/*` from `main`, and never commit directly to `main`.

Architecture decisions are recorded in [`docs/adr/`](docs/adr/).
