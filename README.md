# sjfbo.github.io

Minimal, elegant personal site focused on systems programming notes and resources.

## Structure

- `index.html` — homepage with latest posts and links
- `articles/` — article index and individual posts
- `resources.html` — curated links
- `about.html` — about page
- `assets/styles.css` — site‑wide styling
- `assets/site.js` — tiny enhancements (table of contents, HTML includes)
- `.nojekyll` — disables Jekyll processing on GitHub Pages
- `templates/article.html` — HTML wrapper for markdown‑rendered articles
- `scripts/build.py` — converts `articles/*.md` to `.html` and updates listings

## Writing an article

Prefer Markdown. Create a new file under `articles/`, e.g. `articles/my-post.md`, starting from `_template.md`:

```md
---
title: Your Post Title
date: 2025-01-01
tags: os, performance
summary: One-line summary for listings and meta description.
slug: your-post-slug
---
```

Then write in Markdown. Headings (`##`, `###`) will be used for the table of contents.

### Build to HTML

```bash
python3 scripts/build.py
```

This will:
- Render each `articles/*.md` to `articles/<slug>.html` using `templates/article.html`
- Auto-update the “Latest articles” on `index.html` (top 5)
- Auto-update the full list on `articles/index.html`

Tip: Install Python Markdown for better rendering (tables, fenced code). The script falls back to a basic converter if not installed:

```bash
python3 -m pip install markdown
```

### Optional: Table of contents

Add this card to the article sidebar; it will auto-generate from `<h2>/<h3>`:

```html
<div class="card toc">
  <h3>table of contents</h3>
  <ul class="toc-list"></ul>
</div>
```

### Optional: Sidebar includes

You can inject external HTML into the sidebar with a single attribute:

```html
<div class="card" data-include="/includes/your-snippet.html"></div>
```

Create the file under `includes/your-snippet.html` and it will be fetched on load.

## Local preview

You can open `index.html` directly in a browser, or run a tiny static server:

```bash
python3 -m http.server 8000
open http://localhost:8000
```

## Customize

- Update titles, descriptions, and links in the header/footer.
- Add or remove sections on `index.html` and `resources.html`.
- Tweak colors/spacing in `assets/styles.css` (supports dark mode).


