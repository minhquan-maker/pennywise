---
name: github-profile-readme-design
description: Minimal, honest design for the public GitHub profile README in minhquan-maker/minhquan-maker
type: project
---

# 2026-08-02 — GitHub Profile README Design

## Goal

Replace the current public profile README in `minhquan-maker/minhquan-maker` with a simpler, humbler version that better matches the user's real role and projects.

## Constraints

- Content must be **Markdown only** (no external widget services).
- Tone must be **humble and factual**: 2nd-year AI student, project lead/collaborator, not a full-stack-everything pitch.
- Emphasize practical projects the user actually works on: **AquaGuard**, **Odylytics**, **flood-rescue-cv**, **PennyWise**, and a small portfolio site.

## Proposed README Structure

1. **Intro** — Name, role as 2nd-year AI student at UTS + HCMUT, Odylytics co-founder, and mention AquaGuard work.
2. **What I'm working on** — 4-5 short project blurbs, each linking to the real repo.
3. **Tools I reach for** — Compact list of technologies actually used in the pinned projects.
4. **Contact** — GitHub, LinkedIn, email.

## Specific Copy to Use

```markdown
# Hi, I'm Quan 👋

2nd-year AI student at University of Technology Sydney and Ho Chi Minh
University of Technology. I work with AquaGuard and co-run Odylytics, a small
startup building practical AI products. This GitHub is where I keep some of
the side projects I tinker with in my own time.

## What I'm working on

- **Flood Drone CV** — A YOLOv11 pipeline that detects flood victims from
  aerial drone footage, with training, inference, and a Gradio demo.
- **PennyWise** — A personal finance tracker with a dark, lime-accented UI,
  built end-to-end with React, Express, Prisma, and a Groq-powered AI summary.
- **myportfolio** — A plain HTML/CSS/JS portfolio site, deployed on Vercel.
- **micro-market-simulator** — A Python simulator for market microstructure,
  order-book mechanics, and trading agents.

## Tools I reach for

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, Prisma, PostgreSQL/SQLite
- ML / data: Python, FastAPI, Gradio, Ultralytics YOLO
- Infra: Vercel, Render, Docker

## Get in touch

- GitHub: [@minhquan-maker](https://github.com/minhquan-maker)
- LinkedIn: [Nguyen Minh Quan](https://www.linkedin.com/in/ngminhquan)
- Email: minhquan.alex2512@gmail.com
```

## Implementation Notes

- Repo to edit: `https://github.com/minhquan-maker/minhquan-maker`
- We already cloned it locally to `/tmp/minhquan-maker-profile` for inspection.
- After approval, replace `README.md`, commit with a descriptive message, and push to `origin/main`.
- The profile will then render the new Markdown in the GitHub Overview tab without extra setup.

## Verification

- After pushing, confirm the profile overview on GitHub shows the new README.
- Keep the commit small and clear so the user can see exactly what changed.
