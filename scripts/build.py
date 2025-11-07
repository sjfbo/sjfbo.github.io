#!/usr/bin/env python3
import os
import re
import sys
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES_DIR = ROOT / "articles"
TEMPLATES_DIR = ROOT / "templates"
ARTICLE_TEMPLATE_FILE = TEMPLATES_DIR / "article.html"
INDEX_FILE = ROOT / "index.html"
ARTICLES_INDEX_FILE = ARTICLES_DIR / "index.html"

try:
  import markdown as md
  def render_markdown(text: str) -> str:
    return md.markdown(text, extensions=["fenced_code", "codehilite", "tables", "toc"])
except Exception:
  def render_markdown(text: str) -> str:
    # Very naive Markdown fallback (headings, code fences, paragraphs, lists)
    lines = text.splitlines()
    html = []
    in_code = False
    in_list = False
    code_buf = []
    def flush_paragraph(buf):
      if buf:
        html.append("<p>" + " ".join(buf).strip() + "</p>")
        buf.clear()
    para = []
    for line in lines:
      if line.strip().startswith("```"):
        if in_code:
          html.append("<pre><code>" + ("\n".join(code_buf)) + "</code></pre>")
          code_buf = []
          in_code = False
        else:
          flush_paragraph(para)
          in_code = True
        continue
      if in_code:
        code_buf.append(line)
        continue
      if re.match(r"^###\s+", line):
        flush_paragraph(para)
        html.append("<h3>" + re.sub(r"^###\s+", "", line) + "</h3>")
        continue
      if re.match(r"^##\s+", line):
        flush_paragraph(para)
        html.append("<h2>" + re.sub(r"^##\s+", "", line) + "</h2>")
        continue
      if re.match(r"^#\s+", line):
        flush_paragraph(para)
        html.append("<h1>" + re.sub(r"^#\s+", "", line) + "</h1>")
        continue
      if re.match(r"^\s*-\s+", line):
        if not in_list:
          flush_paragraph(para)
          html.append("<ul>")
          in_list = True
        html.append("<li>" + re.sub(r"^\s*-\s+", "", line) + "</li>")
        continue
      else:
        if in_list:
          html.append("</ul>")
          in_list = False
      if not line.strip():
        flush_paragraph(para)
      else:
        para.append(line.strip())
    flush_paragraph(para)
    if in_list:
      html.append("</ul>")
    return "\n".join(html)

def read_file(path: Path) -> str:
  return path.read_text(encoding="utf-8")

def write_file(path: Path, content: str):
  path.parent.mkdir(parents=True, exist_ok=True)
  path.write_text(content, encoding="utf-8")

def parse_front_matter(text: str):
  fm = {}
  body = text
  if text.startswith("---"):
    parts = text.split("\n", 1)[1].split("\n---\n", 1)
    if len(parts) == 2:
      fm_text, body = parts
      for line in fm_text.splitlines():
        if ":" in line:
          k, v = line.split(":", 1)
          fm[k.strip()] = v.strip()
  return fm, body

def slugify(s: str) -> str:
  s = s.lower().strip()
  s = re.sub(r"[^\w\s-]", "", s)
  s = re.sub(r"\s+", "-", s)
  s = re.sub(r"-+", "-", s)
  return s

def format_tags(tags_raw: str) -> str:
  if not tags_raw:
    return ""
  tags = [t.strip() for t in re.split(r"[,\s]+", tags_raw) if t.strip()]
  if not tags:
    return ""
  return " · " + ", ".join(tags)

def build_article(md_path: Path, tpl: str):
  raw = read_file(md_path)
  fm, body_md = parse_front_matter(raw)
  title = fm.get("title") or md_path.stem.replace("-", " ").title()
  date = fm.get("date") or datetime.date.today().isoformat()
  tags = fm.get("tags", "")
  description = fm.get("summary") or ""
  slug = fm.get("slug") or md_path.stem
  html_body = render_markdown(body_md)

  # ensure sidebar include stub exists
  ensure_include_stub(slug)

  page = (
    tpl.replace("{{ title }}", title)
       .replace("{{ description }}", description)
       .replace("{{ date }}", date)
       .replace("{{ slug }}", slug)
       .replace("{{ tags_line }}", format_tags(tags))
       .replace("{{ content }}", html_body)
  )
  out_file = ARTICLES_DIR / f"{slug}.html"
  write_file(out_file, page)
  # summary for listings
  summary = description or re.sub("<[^<]+?>", "", html_body).strip()
  summary = (summary[:160] + "…") if len(summary) > 160 else summary
  return {
    "title": title,
    "date": date,
    "tags": tags,
    "slug": slug,
    "url": f"/articles/{slug}.html",
    "summary": summary
  }

def ensure_include_stub(slug: str):
  includes_dir = ROOT / "includes"
  includes_dir.mkdir(parents=True, exist_ok=True)
  stub_path = includes_dir / f"{slug}-links.html"
  if not stub_path.exists():
    write_file(stub_path, "<h3>resources</h3>\n<ul>\n  <!-- add links here -->\n</ul>\n")

def replace_between_markers(html: str, start_marker: str, end_marker: str, replacement: str) -> str:
  pattern = re.compile(rf"({re.escape(start_marker)})([\s\S]*?)({re.escape(end_marker)})", re.MULTILINE)
  return pattern.sub(rf"\1\n{replacement}\n\3", html)

def render_list_items(posts, max_items=None) -> str:
  items = []
  for p in posts[:max_items] if max_items else posts:
    meta = f"{p['date']}"
    if p['tags']:
      meta += f" · {p['tags']}"
    items.append(
      '          <li class="list-item">\n'
      f'            <a class="post" href="{p["url"]}">\n'
      f'              <span class="post-title">{p["title"]}</span>\n'
      f'              <span class="post-meta">{meta}</span>\n'
      '            </a>\n'
      '          </li>'
    )
  return "        <ul class=\"list\">\n" + "\n".join(items) + "\n        </ul>"

def main():
  tpl = read_file(ARTICLE_TEMPLATE_FILE)
  md_files = sorted([p for p in ARTICLES_DIR.glob("*.md") if p.name != "_template.md"])
  posts = []
  for md_path in md_files:
    posts.append(build_article(md_path, tpl))
  # sort by date desc (string ISO sorts OK)
  posts.sort(key=lambda p: p["date"], reverse=True)

  if INDEX_FILE.exists():
    idx_html = read_file(INDEX_FILE)
    posts_block = render_list_items(posts, max_items=5)
    idx_html = replace_between_markers(idx_html, "<!-- posts:start -->", "<!-- posts:end -->", posts_block)
    write_file(INDEX_FILE, idx_html)

  if ARTICLES_INDEX_FILE.exists():
    art_idx_html = read_file(ARTICLES_INDEX_FILE)
    all_posts_block = render_list_items(posts)
    art_idx_html = replace_between_markers(art_idx_html, "<!-- all-posts:start -->", "<!-- all-posts:end -->", all_posts_block)
    write_file(ARTICLES_INDEX_FILE, art_idx_html)

  print(f"Built {len(posts)} article(s).")

if __name__ == "__main__":
  sys.exit(main())


