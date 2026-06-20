# Huawei IPD Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the supplied Huawei and IPD article on the personal blog and deploy the resulting site to the existing Ubuntu production service.

**Architecture:** Add one MDX content file that follows the repository's existing frontmatter schema. Verify the static route locally, then create and build an isolated server release before atomically switching the production symlink.

**Tech Stack:** Next.js 14, MDX, TypeScript, npm, Ubuntu, systemd, Nginx

---

### Task 1: Add the article

**Files:**
- Create: `content/blog/why-huawei-succeeds-across-industries.mdx`

- [ ] **Step 1: Create the MDX article**

Add the approved frontmatter and the user's complete supplied prose, preserving all six numbered sections and the final conclusion.

- [ ] **Step 2: Check the article metadata and body**

Run:

```bash
sed -n '1,30p' content/blog/why-huawei-succeeds-across-industries.mdx
rg -n '^## ' content/blog/why-huawei-succeeds-across-industries.mdx
```

Expected: the frontmatter contains the approved title, date, category, tags, public status, and the output lists the six numbered sections plus `最后`.

### Task 2: Verify the local production build

**Files:**
- Verify: `content/blog/why-huawei-succeeds-across-industries.mdx`

- [ ] **Step 1: Run type checking**

Run:

```bash
npm run type-check
```

Expected: exit code 0.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: exit code 0 and the generated route list contains `/blog/why-huawei-succeeds-across-industries`.

### Task 3: Preserve the source in Git

**Files:**
- Add: `content/blog/why-huawei-succeeds-across-industries.mdx`
- Add: `docs/superpowers/specs/2026-06-20-huawei-ipd-article-design.md`
- Add: `docs/superpowers/plans/2026-06-20-huawei-ipd-article.md`

- [ ] **Step 1: Review the exact change**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and only the intended article and planning documents are untracked or modified.

- [ ] **Step 2: Commit and push**

Run:

```bash
git add content/blog/why-huawei-succeeds-across-industries.mdx docs/superpowers/specs/2026-06-20-huawei-ipd-article-design.md docs/superpowers/plans/2026-06-20-huawei-ipd-article.md
git commit -m "Add Huawei IPD management article"
git push origin main
```

Expected: commit succeeds and `origin/main` receives the new commit.

### Task 4: Deploy and verify production

**Files:**
- Deploy: repository contents to `/var/www/xiang-fuxing-blog/releases/<timestamp>`
- Switch: `/var/www/xiang-fuxing-blog/current`

- [ ] **Step 1: Inspect the current production service**

Run a read-only SSH check for the active release, service status, Node version, and free disk space.

Expected: the host is reachable and `xiang-fuxing-blog.service` is active before deployment.

- [ ] **Step 2: Create and build a new release**

Copy the repository into a new timestamped release directory, excluding `.git`, `.next`, and local `node_modules`. Install from the lockfile and run the production build on the server.

Expected: server build exits with code 0 and includes the new article route.

- [ ] **Step 3: Activate the release**

Atomically update `current` to the new release and restart `xiang-fuxing-blog.service`.

Expected: systemd reports the service as active and `current` resolves to the new release directory.

- [ ] **Step 4: Verify the public article**

Request:

```text
https://xiangfuxing.tech/blog/why-huawei-succeeds-across-industries
```

Expected: HTTP 200, the HTML contains `为什么华为总能干一行成一行`, `做正确的事`, and `把事情做正确`.
