# Excalidraw Design Diagrams

Tooling for an agent skill that creates and visually validates Excalidraw diagrams (`.excalidraw` files) that explain workflows, architectures and concepts.

The baseline skill lives in [`skill/`](skill/). Its rendering tools are documented in [`skill/references/README.md`](skill/references/README.md).

## Requirements

- Node.js 22.18 or later.
- Google Chrome or Chromium, for rendering. Set `CHROME_PATH` if it is not in a default location.

## Commands

```bash
npm install # installs the renderer and the spec parser dependencies
npm test    # runs the test suite with node:test
```

## Usage

The skill works in three steps: generate, render, restyle. In the commands below, `<skill>` is the skill directory (`skill/` in this repository), and you run them from your project root.

```bash
# 1. Generate a first draft from a sequence spec; the .excalidraw file is written beside the spec
node <skill>/scripts/generate_sequence.js diagrams/login.yaml

# 2. Render a PNG to review and an SVG for documentation, written beside the file
node <skill>/references/render_excalidraw.js diagrams/login.excalidraw

# 3. After changing DESIGN.md, reapply the role styles, then render again
node <skill>/scripts/restyle.js diagrams/login.excalidraw
```

- The `.excalidraw` file is the source of truth. The generator refuses to overwrite it, and later edits are made in the file.
- Sequence diagrams: the spec format and the visual checklist are in [`skill/references/sequence.md`](skill/references/sequence.md).
- Render options (`--output`, `--scale`, `--width`) are listed in [`skill/references/README.md`](skill/references/README.md).
- Colors and strokes come from `DESIGN.md`. The generator and `restyle.js` use the file given with `--design`, else the project's `DESIGN.md` (or `docs/DESIGN.md`), else the base design in [`skill/DESIGN.md`](skill/DESIGN.md).
- A real example, the authentication flow of `databricks-agent-kit`, is in [`examples/databricks-auth/`](examples/databricks-auth/): the spec, the generated file, and its PNG and SVG renders.

## Install the skill manually

The skill is not installed automatically. To use it as a Claude Code user skill:

1. Run `npm install` in this repository. The skill's scripts load their dependencies from this repository's `node_modules`.
2. Link the `skill/` directory into your skills folder as `excalidraw-diagram`. Use a link, not a copy, because a copy cannot reach `node_modules`:
   - Windows (Command Prompt or PowerShell, which creates a junction without administrator rights):
     `mklink /J "%USERPROFILE%\.claude\skills\excalidraw-diagram" "C:\path\to\this\repository\skill"`
   - macOS or Linux: `ln -s /path/to/this/repository/skill ~/.claude/skills/excalidraw-diagram`
3. Start a new Claude Code session and check that the skill is listed.

The link follows this repository, so a `git pull` updates the skill. To remove it, delete only the link: use `rmdir` on a Windows junction, or `rm` on a symbolic link. Recursive deletion (`rm -r`, `Remove-Item -Recurse`) follows the link into the repository and must not be used.

## Working rules

- Develop test-first: write a failing test, then the minimal code that passes it, one slice at a time.
- Ask before adding any new dependency, and explain why it is needed. The renderer depends on `@excalidraw/utils` and `esbuild`, pinned to exact versions.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages, one logical change per commit.
- Follow GitFlow: branch `feature/*` and `bugfix/*` from `develop`, branch `hotfix/*` from `main`, and never commit directly to `main`.

Architecture decisions are recorded in [`docs/adr/`](docs/adr/).
