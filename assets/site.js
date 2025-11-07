document.addEventListener('DOMContentLoaded', () => {
  buildTableOfContents();
  applyHtmlIncludes();
});

function buildTableOfContents() {
  const article = document.querySelector('.article-main');
  if (!article) return;
  const tocContainer = document.querySelector('.card.toc .toc-list');
  if (!tocContainer) return;

  const headings = article.querySelectorAll('h2, h3');
  if (!headings.length) return;

  const list = document.createElement('ul');
  list.className = 'toc-list';

  let currentH2List = list;
  let currentH2Item = null;

  headings.forEach(h => {
    if (!h.id) {
      h.id = slugify(h.textContent);
    }
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    li.appendChild(a);

    if (h.tagName === 'H2') {
      currentH2Item = li;
      list.appendChild(li);
      const nested = document.createElement('ul');
      nested.className = 'toc-sublist';
      currentH2Item.appendChild(nested);
      currentH2List = nested;
    } else if (h.tagName === 'H3') {
      if (!currentH2Item) {
        list.appendChild(li);
      } else {
        currentH2List.appendChild(li);
      }
    }
  });

  tocContainer.replaceWith(list);
}

function slugify(text) {
  return text.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function applyHtmlIncludes() {
  const includeTargets = document.querySelectorAll('[data-include]');
  includeTargets.forEach(async el => {
    const path = el.getAttribute('data-include');
    if (!path) return;
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = `<div class="muted">Failed to load include: ${path}</div>`;
    }
  });
}


