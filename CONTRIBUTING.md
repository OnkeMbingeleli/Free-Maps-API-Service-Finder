# Contributing to Service Finder

This guide covers everything you need to know to contribute correctly. Please read your relevant section fully before getting started.

---

## 📂 1. Core Branches & Rules

We use a two-tier branch system for development and deployment:

| Branch | Purpose | Who Can Push |
| :--- | :--- | :--- |
| **`dev`** | Main development branch. All daily feature and bugfix branches branch off from here and merge back into here. | All devs via PR |
| **`main`** | Final production branch. Code is only moved here at the end of a sprint (Sprint 1, Sprint 2) for final release. | Git Lead only (via PR) |

⚠️ **Never push directly to `dev` or `main`.** Always create a dedicated branch.

---

## 🏷️ 2. Branch Naming Rules

Always create your branch from an up-to-date `dev` branch using these exact naming rules:

| Your Role / Task | Branch Name Format | Real-World Example |
| :--- | :--- | :--- |
| **Frontend Feature** | `your-name/dev/FE-###` | `jake/dev/FE-001` |
| **Backend Feature** | `your-name/dev/BE-###` | `alex/dev/BE-001` |
| **Scrum Masters (SM)** | `your-name/SM-team/branch-purpose` | `sarah/SM-team/repo-cleanup` |
| **Quality Assurance (QA)** | `your-name/qa/test-description` | `alex/qa/map-load-test` |

---

## 💻 3. Your Daily Workflow (Terminal Commands)

Follow these exact terminal steps in order whenever you work on a task or bug fix:

### 🔄 Step A: Sync your machine with development

Before making a new branch, make sure your local machine has the latest remote updates from `dev`:

```bash
git checkout dev
git pull origin dev