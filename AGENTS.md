# Agent Instructions

This repository contains an agent skill that creates `.excalidraw` diagrams and the tooling around it. Read [`README.md`](README.md) for the purpose of the project and [`docs/adr/`](docs/adr/) for the recorded design decisions before changing behavior.

## Commands

```bash
npm test    # runs the test suite with node:test
```

## Working rules

Follow the repository-wide policies in [README.md](README.md#working-rules), including test-first development, dependency approval, Conventional Commits and GitFlow. Never skip git hooks.

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human` and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
