# sjfbo.github.io

Minimal, elegant personal site focused on systems programming notes and resources.

## Structure

- `index.html` — homepage with latest posts and links
- `articles/` — article index and individual posts
- `resources.html` — curated links
- `about.html` — about page
- `assets/styles.css` — site‑wide styling
- `.nojekyll` — disables Jekyll processing on GitHub Pages

## Writing an article

1. Create a new file under `articles/`, for example `articles/my-post.html`.
2. Copy the general structure from `articles/zero-copy-io.html`.
3. Add an entry to `articles/index.html` and optionally the homepage list in `index.html`.

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


