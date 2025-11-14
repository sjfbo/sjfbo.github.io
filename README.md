# Simon Bonnard — Academic Homepage

A retro academic homepage built with plain HTML and minimal CSS, emulating the aesthetic of late-1990s/early-2000s computer science faculty pages.

## Local Preview

To preview the site locally, use a simple HTTP server:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
.
├── index.html          # Homepage
├── research.html       # Research interests and overview
├── publications.html   # Full publication list
├── software.html       # Software and tools
├── teaching.html       # Teaching history
├── talks.html          # Talks and presentations
├── service.html        # Academic service
├── students.html       # Students (optional)
├── links.html          # External links (optional)
├── style.css           # Stylesheet
├── cv/                 # CV folder
│   └── SimonBonnard_CV.pdf
└── assets/             # Images and other assets
```

## Updating Content

### Last Updated Date

Update the footer date in each HTML file. The date format is `YYYY-MM-DD` (ISO 8601). Search for "Last updated:" in each file.

### Adding a CV

Place your CV PDF in the `cv/` folder and name it `SimonBonnard_CV.pdf` (or update the link in `index.html`).

### Adding Images

Place images (e.g., headshot) in the `assets/` folder. Update the `img` tag in `index.html` with the correct path and `alt` text.

### Email Obfuscation

Email addresses should be written as "name at domain dot tld" (not as `mailto:` links) to prevent scraping.

## Design Principles

- **No JavaScript**: Pure HTML and CSS only
- **Text-first**: Readable, narrow column layout
- **System fonts**: Georgia/Times for body text
- **Minimal styling**: Default link colors (blue/purple), simple borders
- **Print-friendly**: CSS includes print media queries
- **Accessible**: Semantic HTML, proper alt text, sufficient contrast

## Browser Compatibility

Designed to work in all modern browsers and degrade gracefully in older ones. The site renders cleanly without CSS enabled.


