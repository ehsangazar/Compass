# Compass

> AI-native, spec-driven development for your codebase.

Compass turns "vibe coding" into traceable engineering. Instead of asking your AI assistant to "just build it," you draft a short **change proposal**, lock down the requirements as **specs**, sketch a **design**, and break it into **tasks**. Compass scaffolds those artifacts, validates them, and feeds enriched instructions to your AI tool (Claude Code, Cursor, Codex, Gemini, and 25+ others) so the implementation phase has a real contract to build against.

## Install

```bash
npm i -g @gazarr/compass
```

Requires Node `>=20.19.0`. Available on npm as [`@gazarr/compass`](https://www.npmjs.com/package/@gazarr/compass).

## 60-second quickstart

```bash
cd your-project
compass init --tools claude        # or: cursor, codex, gemini, all, none
compass new change add-user-auth   # scaffolds compass/changes/add-user-auth/
```

Then in your AI tool of choice, run the installed slash command (Claude Code: `/compass:propose "Add user auth via OIDC"`) and let the workflow guide you through proposal, specs, design, and tasks. When the change ships:

```bash
compass archive add-user-auth      # merge specs into compass/specs/
```

## How it works

A **change** is a proposal directory under `compass/changes/<name>/`. The default `spec-driven` schema produces four artifacts:

| Artifact   | Question it answers                       |
| ---------- | ----------------------------------------- |
| `proposal` | Why are we doing this? What changes?      |
| `specs`    | What are the requirements and scenarios?  |
| `design`   | How will we build it?                     |
| `tasks`    | Step-by-step checklist for implementation |

Each artifact has an enriched prompt accessible via `compass instructions <artifact> --change <name>`. That prompt is what your AI tool consumes, so you get consistent, structured outputs instead of free-form responses. Once shipped, `compass archive` rolls the change's specs into your project's permanent `compass/specs/` directory, building a living source-of-truth for what the codebase actually does.

## Supported AI tools

Pick one or many at `compass init` time:

```
amazon-q, antigravity, auggie, bob, claude, cline, codex, forgecode, codebuddy,
continue, costrict, crush, cursor, factory, gemini, github-copilot, iflow, junie,
kilocode, kimi, kiro, opencode, pi, qoder, lingma, qwen, roocode, trae, windsurf
```

Each integration drops the relevant slash commands or skills into the right place (e.g. `.claude/skills/`, `.cursor/rules/`, `.gemini/commands/`).

## Command map

**Scaffolding**

- `compass init` — set up Compass in a project, install AI-tool integrations
- `compass new change <name>` — create a change proposal directory
- `compass instructions <artifact> --change <name>` — emit enriched AI prompt for an artifact

**Inspection**

- `compass list` — list active changes (or `--specs` for specs)
- `compass view` — interactive dashboard
- `compass show <item>` — render a change or spec
- `compass status` — artifact completion status for a change

**Validation and lifecycle**

- `compass validate [item]` — schema-check a change or spec
- `compass archive <change>` — merge a completed change's specs into the project
- `compass update` — refresh Compass instruction files after a CLI upgrade

**Configuration**

- `compass config` — view/modify global config
- `compass schemas` — list workflow schemas
- `compass schema` — manage schemas (experimental)
- `compass templates` — show resolved template paths
- `compass workspace` — set up coordination workspaces
- `compass completion install` — install shell completions
- `compass feedback "<message>"` — submit feedback

Run `compass <command> --help` for full options.

## Project status

- Version: see [CHANGELOG.md](./CHANGELOG.md)
- License: MIT
- Issues and feedback: <https://github.com/ehsangazar/compass/issues>
- Publishing and release flow: [PUBLISHING.md](./PUBLISHING.md)
