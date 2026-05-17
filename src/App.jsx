import React from "react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { articles, contacts, profile, projects } from "./site-data.js";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);

const codeLanguageAliases = {
  html: "xml",
  js: "javascript",
  jsx: "javascript",
  md: "markdown",
  py: "python",
  sh: "bash",
  ts: "typescript",
  tsx: "typescript",
  txt: "",
};

const articleMarkdownModules = import.meta.glob("./content/articles/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const articleMarkdownBySlug = Object.fromEntries(
  Object.entries(articleMarkdownModules).map(([path, source]) => [
    path.split("/").pop().replace(".md", ""),
    source,
  ]),
);

const markdownRemarkPlugins = [remarkGfm];
let mermaidRendererPromise;

const navItems = [
  { href: "#/writing", key: "writing", label: "writing" },
  { href: "#/projects", key: "projects", label: "projects" },
  { href: "#/about", key: "about", label: "about" },
  { href: "#/contact", key: "contact", label: "contact" },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlightCode(value, language) {
  const normalizedLanguage = codeLanguageAliases[language] ?? language;

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    return hljs.highlight(value, {
      ignoreIllegals: true,
      language: normalizedLanguage,
    }).value;
  }

  return escapeHtml(value);
}

function textFromChildren(children) {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (React.isValidElement(child)) {
        return textFromChildren(child.props.children);
      }

      return "";
    })
    .join("");
}

function slugifyHeading(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanHeadingTitle(value) {
  return value
    .replace(/\s+#+\s*$/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .trim();
}

function uniqueHeadingId(title, counts) {
  const baseId = slugifyHeading(title) || "section";
  const nextCount = (counts.get(baseId) ?? 0) + 1;
  counts.set(baseId, nextCount);

  return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
}

function extractArticleToc(source) {
  const headingCounts = new Map();
  const tocItems = [];
  let fenceMarker = "";

  source.split("\n").forEach((line) => {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      fenceMarker = fenceMarker === marker ? "" : fenceMarker || marker;
      return;
    }

    if (fenceMarker) return;

    const headingMatch = /^ {0,3}(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!headingMatch) return;

    const title = cleanHeadingTitle(headingMatch[2]);
    if (!title) return;

    tocItems.push({
      depth: headingMatch[1].length,
      id: uniqueHeadingId(title, headingCounts),
      title,
    });
  });

  return tocItems;
}

function getMermaidRenderer() {
  if (!mermaidRendererPromise) {
    mermaidRendererPromise = import("mermaid").then((mermaidModule) => {
      const mermaid = mermaidModule.default;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: {
          background: "#030304",
          primaryColor: "#0b0b0c",
          primaryTextColor: "#efede5",
          primaryBorderColor: "rgba(239, 237, 229, 0.35)",
          lineColor: "rgba(239, 237, 229, 0.48)",
          secondaryColor: "#101012",
          tertiaryColor: "#070708",
          fontFamily:
            "SFMono-Regular, Roboto Mono, Cascadia Code, Liberation Mono, monospace",
        },
      });

      return mermaid;
    });
  }

  return mermaidRendererPromise;
}

function StarGlyph({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 4v56M4 32h56M13 13l38 38M51 13 13 51" />
      <circle cx="32" cy="32" r="3.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="arrow-icon" viewBox="0 0 48 16" aria-hidden="true">
      <path d="M1 8h42M36 2l7 6-7 6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="copy-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="10" height="10" />
      <path d="M6 14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ProjectMark({ type }) {
  if (type === "triangle") {
    return (
      <svg className="project-mark" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 8 56 52H8L32 8Z" />
      </svg>
    );
  }

  if (type === "matrix") {
    return (
      <svg className="project-mark matrix-mark" viewBox="0 0 64 64" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, index) => {
          const x = 14 + (index % 4) * 12;
          const y = 14 + Math.floor(index / 4) * 12;
          return <circle key={index} cx={x} cy={y} r="1.8" />;
        })}
      </svg>
    );
  }

  return <StarGlyph className="project-mark star-mark" />;
}

function TagList({ tags = [], className = "" }) {
  if (!tags.length) return null;

  return (
    <span className={`tag-list ${className}`.trim()}>
      {tags.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
        </span>
      ))}
    </span>
  );
}

function SectionHeading({ title, action }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action ? (
        <a className="section-action" href={action.href}>
          {action.label}
          <ArrowIcon />
        </a>
      ) : null}
    </div>
  );
}

function CopyCodeButton({ codeRef, value }) {
  const [copyStatus, setCopyStatus] = React.useState("idle");
  const timeoutRef = React.useRef(0);

  React.useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  async function copyCode() {
    let copiedToClipboard = false;

    try {
      await navigator.clipboard.writeText(value);
      copiedToClipboard = true;
    } catch {
      const onCopy = (event) => {
        event.clipboardData?.setData("text/plain", value);
        event.preventDefault();
        copiedToClipboard = true;
      };

      document.addEventListener("copy", onCopy);
      try {
        copiedToClipboard = document.execCommand("copy") || copiedToClipboard;
      } finally {
        document.removeEventListener("copy", onCopy);
      }
    }

    let nextStatus = copiedToClipboard ? "copied" : "failed";

    if (!copiedToClipboard && codeRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(codeRef.current);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        nextStatus = "selected";
      }
    }

    setCopyStatus(nextStatus);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopyStatus("idle"), 3200);
  }

  const copied = copyStatus === "copied";
  const selected = copyStatus === "selected";
  const failed = copyStatus === "failed";

  return (
    <button
      aria-label={
        copied ? "Code copied" : selected ? "Code selected" : failed ? "Code copy failed" : "Copy code"
      }
      className="code-copy"
      data-copied={copied ? "true" : "false"}
      data-status={copyStatus}
      onClick={copyCode}
      title={copied ? "copied" : failed ? "copy unavailable" : "copy"}
      type="button"
    >
      <CopyIcon />
    </button>
  );
}

function CodeBlock({ language, value }) {
  const codeRef = React.useRef(null);

  return (
    <figure className="code-frame">
      <figcaption>
        <span>{language || "text"}</span>
        <CopyCodeButton codeRef={codeRef} value={value} />
      </figcaption>
      <pre className="code-block">
        <code
          ref={codeRef}
          className={language ? `hljs language-${language}` : "hljs"}
          dangerouslySetInnerHTML={{
            __html: highlightCode(value, language),
          }}
        />
      </pre>
    </figure>
  );
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(",", "");
}

function MermaidDiagram({ chart }) {
  const id = React.useId().replace(/:/g, "");
  const [rendered, setRendered] = React.useState({ svg: "", error: "" });

  React.useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = await getMermaidRenderer();
        const result = await mermaid.render(`mermaid-${id}`, chart);
        if (!cancelled) {
          setRendered({ svg: result.svg, error: "" });
        }
      } catch (error) {
        if (!cancelled) {
          setRendered({
            svg: "",
            error: error instanceof Error ? error.message : "Could not render diagram.",
          });
        }
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (rendered.error) {
    return (
      <div className="mermaid-frame mermaid-error" role="alert">
        <span>diagram unavailable</span>
        <code>{rendered.error}</code>
      </div>
    );
  }

  if (!rendered.svg) {
    return <div className="mermaid-frame mermaid-loading">diagram rendering</div>;
  }

  return (
    <div
      className="mermaid-frame"
      dangerouslySetInnerHTML={{ __html: rendered.svg }}
    />
  );
}

const markdownComponents = {
  a({ node, ...props }) {
    return <a {...props} />;
  },
  pre({ node, children }) {
    const child = React.Children.toArray(children).find(React.isValidElement);
    const className = child?.props?.className ?? "";
    const languageMatch = /language-([a-z0-9-]+)/i.exec(className);
    const language = languageMatch?.[1] ?? "";
    const value = String(child?.props?.children ?? "").replace(/\n$/, "");

    if (language === "mermaid") {
      return <MermaidDiagram chart={value} />;
    }

    return <CodeBlock language={language} value={value} />;
  },
  code({ node, className = "", children, ...props }) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

function createMarkdownComponents(tocItems) {
  let headingIndex = 0;

  function nextHeadingId(children) {
    const tocItem = tocItems[headingIndex];
    headingIndex += 1;
    return (tocItem?.id ?? slugifyHeading(textFromChildren(children))) || "section";
  }

  return {
    ...markdownComponents,
    h2({ node, children, ...props }) {
      return (
        <h2 {...props} id={nextHeadingId(children)}>
          {children}
        </h2>
      );
    },
    h3({ node, children, ...props }) {
      return (
        <h3 {...props} id={nextHeadingId(children)}>
          {children}
        </h3>
      );
    },
  };
}

function MarkdownArticle({ source, tocItems = [] }) {
  const components = createMarkdownComponents(tocItems);

  return (
    <div className="article-body markdown-body">
      <ReactMarkdown
        components={components}
        remarkPlugins={markdownRemarkPlugins}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

function activeHeadingId(items, anchor) {
  return validAnchorId(items, anchor) || (items[0]?.id ?? "");
}

function validAnchorId(items, anchor) {
  return items.some((item) => item.id === anchor) ? anchor : "";
}

function shouldHandleSectionClick(event) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

function ArticleToc({ baseHref, currentAnchor, items }) {
  const [activeId, setActiveId] = React.useState(activeHeadingId(items, currentAnchor));

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ block: "start" });
      setActiveId(id);
    }
  }

  function openSection(event, id) {
    if (!shouldHandleSectionClick(event)) return;

    event.preventDefault();
    const nextHash = `${baseHref}/${id}`;

    if (window.location.hash === nextHash) {
      scrollToSection(id);
      return;
    }

    window.location.hash = nextHash;
    window.requestAnimationFrame(() => scrollToSection(id));
  }

  React.useEffect(() => {
    const fallbackId = activeHeadingId(items, currentAnchor);
    setActiveId(fallbackId);

    if (!items.length) return undefined;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!headings.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-88px 0px -64% 0px",
        threshold: [0, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [currentAnchor, items]);

  if (!items.length) return null;

  const routeActiveId = validAnchorId(items, currentAnchor);
  const visibleActiveId = routeActiveId || activeId;

  return (
    <aside className="article-toc" aria-label="Article sections">
      <h2>sections</h2>
      <nav>
        {items.map((item) => (
          <a
            aria-current={visibleActiveId === item.id ? "location" : undefined}
            className={item.depth === 3 ? "is-nested" : ""}
            data-active={visibleActiveId === item.id ? "true" : "false"}
            href={`${baseHref}/${item.id}`}
            key={item.id}
            onClick={(event) => openSection(event, item.id)}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function readRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [section, slug, anchor] = hash
    .split("/")
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    });

  if (!section || section === "top" || section === "home") {
    return { name: "home", key: "home" };
  }

  if (section === "writing") {
    return slug
      ? { name: "article", slug, anchor, key: `article:${slug}` }
      : { name: "writing", key: "writing" };
  }

  if (section === "projects") {
    return slug
      ? { name: "project", slug, key: `project:${slug}` }
      : { name: "projects", key: "projects" };
  }

  if (section === "about") return { name: "about", key: "about" };
  if (section === "contact") return { name: "contact", key: "contact" };

  return { name: "not-found", key: `not-found:${section}` };
}

function useHashRoute() {
  const [route, setRoute] = React.useState(readRoute);

  React.useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  React.useEffect(() => {
    if (!route.anchor) {
      window.scrollTo(0, 0);
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const target = document.getElementById(route.anchor);
      if (target) {
        target.scrollIntoView({ block: "start" });
      } else {
        window.scrollTo(0, 0);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [route.anchor, route.key]);

  return route;
}

function useDocumentTitle(route) {
  React.useLayoutEffect(() => {
    const article = route.name === "article"
      ? articles.find((item) => item.slug === route.slug)
      : null;
    const project = route.name === "project"
      ? projects.find((item) => item.slug === route.slug)
      : null;
    let routeTitle = "";

    if (route.name === "article") {
      routeTitle = article?.title ?? "not found";
    } else if (route.name === "project") {
      routeTitle = project?.name ?? "not found";
    } else if (route.name === "not-found") {
      routeTitle = "not found";
    } else {
      routeTitle = route.name === "home" ? "" : route.name;
    }

    document.title = routeTitle ? `${routeTitle} / ${profile.name}` : profile.name;
  }, [route.name, route.slug]);
}

function Topbar({ route }) {
  const activeSection =
    route.name === "article" ? "writing" : route.name === "project" ? "projects" : route.name;

  return (
    <header className="topbar" aria-label="Primary navigation">
      <a className="brand" href="#/" aria-label="home">
        <StarGlyph className="brand-mark" />
        <span className="brand-name">{profile.handle}</span>
      </a>
      <nav className="nav-links">
        {navItems.map((item) => {
          const active = activeSection === item.key;
          return (
            <a
              aria-current={active ? "page" : undefined}
              data-active={active ? "true" : "false"}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}

function ArticleRow({ article }) {
  return (
    <a className="article-row" href={`#/writing/${article.slug}`}>
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      <span className="row-body">
        <span className="row-kicker">
          <span>{article.readingTime}</span>
          <TagList tags={article.tags} />
        </span>
        <strong>{article.title}</strong>
        <span>{article.summary}</span>
      </span>
      <ArrowIcon />
    </a>
  );
}

function ProjectRow({ project }) {
  return (
    <a className="project-row" href={`#/projects/${project.slug}`}>
      <ProjectMark type={project.mark} />
      <span className="row-body">
        <span className="row-kicker">
          <span>{project.status}</span>
          <TagList tags={project.tags} />
        </span>
        <span className="project-title">
          <strong>{project.name}</strong>
          <em>{project.updated}</em>
        </span>
        <span>{project.summary}</span>
      </span>
      <ArrowIcon />
    </a>
  );
}

function ContactBlock() {
  return (
    <>
      <p>{profile.contactIntro}</p>
      <div className="contact-list">
        {contacts.map((item) => (
          <a
            aria-label={`${item.label}: ${item.value} (opens in a new tab)`}
            href={item.href}
            key={item.label}
            rel="noreferrer noopener"
            target="_blank"
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <ArrowIcon />
          </a>
        ))}
      </div>
    </>
  );
}

function HomePage() {
  return (
    <>
      <section id="top" className="hero">
        <div className="hero-copy">
          <h1 className="sr-only">{profile.name}</h1>
          <p className="domains">{profile.domains.join(" / ")}</p>
          <p className="hero-summary">{profile.summary}</p>
          <div className="hero-actions" aria-label="Primary actions">
            <a href="#/writing">
              read writing
              <ArrowIcon />
            </a>
            <a href="#/projects">
              view projects
              <ArrowIcon />
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <img src="/assets/cosmic-stone.png" alt="" />
        </div>
      </section>

      <div className="axis" aria-hidden="true">
        <span />
        <StarGlyph />
      </div>

      <section className="content-grid" aria-label="Writing and projects">
        <div className="section-block">
          <SectionHeading
            title="latest writing"
            action={{ label: "view all", href: "#/writing" }}
          />
          <div className="row-list">
            {articles.map((article) => (
              <ArticleRow article={article} key={article.slug} />
            ))}
          </div>
        </div>

        <div className="section-block">
          <SectionHeading
            title="selected projects"
            action={{ label: "view all", href: "#/projects" }}
          />
          <div className="row-list">
            {projects.map((project) => (
              <ProjectRow project={project} key={project.slug} />
            ))}
          </div>
        </div>
      </section>

      <footer className="footer-grid">
        <section className="footer-section">
          <SectionHeading title="about" action={{ label: "read more", href: "#/about" }} />
          <p>{profile.about}</p>
        </section>

        <div className="footer-sigil" aria-hidden="true">
          <StarGlyph />
        </div>

        <section className="footer-section">
          <SectionHeading title="contact" action={{ label: "open", href: "#/contact" }} />
          <ContactBlock />
        </section>
      </footer>
    </>
  );
}

function PageHeader({ backHref = "#/", backLabel = "home", title, summary, meta }) {
  const metaClassName = meta?.startsWith("@")
    ? "page-meta preserve-case"
    : "page-meta";

  return (
    <section className="page-header">
      <a className="back-link" href={backHref}>
        <ArrowIcon />
        {backLabel}
      </a>
      {meta ? <p className={metaClassName}>{meta}</p> : null}
      <h1>{title}</h1>
      <p>{summary}</p>
    </section>
  );
}

function WritingPage() {
  return (
    <article className="page-shell">
      <PageHeader
        title="writing"
        meta="notes / essays / drafts"
        summary="Essays and working notes around software systems, learning, optimization, and mathematical structure."
      />
      <section className="page-grid">
        <div className="page-primary">
          <SectionHeading title="all articles" />
          <div className="row-list">
            {articles.map((article) => (
              <ArticleRow article={article} key={article.slug} />
            ))}
          </div>
        </div>
        <aside className="page-aside">
          <h2>draft queue</h2>
          <p>Evaluation as taste, typed interfaces for agents, geometry notes, and a short piece on software as epistemology.</p>
        </aside>
      </section>
    </article>
  );
}

function ArticlePage({ anchor, slug }) {
  const article = articles.find((item) => item.slug === slug);
  const markdown = articleMarkdownBySlug[slug];
  const tocItems = React.useMemo(
    () => (markdown ? extractArticleToc(markdown) : []),
    [markdown],
  );

  if (!article || !markdown) {
    return <NotFoundPage />;
  }

  return (
    <article className="page-shell article-page">
      <PageHeader
        backHref="#/writing"
        backLabel="writing"
        title={article.title}
        meta={`${formatDate(article.date)} / ${article.readingTime}`}
        summary={article.summary}
      />
      <div className="article-layout">
        <MarkdownArticle source={markdown} tocItems={tocItems} />
        <ArticleToc
          baseHref={`#/writing/${article.slug}`}
          currentAnchor={anchor}
          items={tocItems}
        />
      </div>
    </article>
  );
}

function ProjectsPage() {
  return (
    <article className="page-shell">
      <PageHeader
        title="projects"
        meta="research / tools / experiments"
        summary="Selected software, machine learning, and mathematical tooling work, kept sparse until the work has enough shape to explain."
      />
      <section className="page-grid">
        <div className="page-primary">
          <SectionHeading title="all projects" />
          <div className="row-list">
            {projects.map((project) => (
              <ProjectRow project={project} key={project.slug} />
            ))}
          </div>
        </div>
        <aside className="page-aside">
          <h2>working rule</h2>
          <p>Keep the public surface sparse until the work has enough shape to explain without theatre.</p>
        </aside>
      </section>
    </article>
  );
}

function ProjectPage({ slug }) {
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return <NotFoundPage />;
  }

  return (
    <article className="page-shell">
      <PageHeader
        backHref="#/projects"
        backLabel="projects"
        title={project.name}
        meta={`${project.kind} / ${project.status}`}
        summary={project.summary}
      />
      <div className="project-detail">
        <ProjectMark type={project.mark} />
        <div>
          <div className="project-meta-panel">
            <span>{project.kind}</span>
            <span>{project.status}</span>
            <span>{project.updated}</span>
            <TagList tags={project.tags} />
          </div>
          <SectionHeading title="notes" />
          <ul>
            {project.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function AboutPage() {
  return (
    <article className="page-shell">
      <PageHeader
        title="about"
        meta={profile.handle}
        summary="A compact background note for the person behind the work, the current interests, and the shape this site will collect."
      />
      <section className="about-layout">
        <div className="about-portrait">
          <img src="/assets/sj-profile.jpg" alt="Portrait of sjfbo" />
        </div>
        <div className="article-body">
          <section>
            <h2>orientation</h2>
            <p>{profile.about}</p>
          </section>
          <section>
            <h2>currently</h2>
            <dl className="current-list">
              {profile.currently.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <h2>current interests</h2>
            <p>
              Agent systems, evaluation loops, mathematical structure in learning, reliable software interfaces, and tools that make complex thought easier to inspect.
            </p>
          </section>
          <section>
            <h2>site shape</h2>
            <p>
              Writing will hold essays and research notes. Projects will hold shipped tools, experiments, and implementation logs. This page can later become a fuller bio without changing the homepage.
            </p>
          </section>
        </div>
      </section>
    </article>
  );
}

function ContactPage() {
  return (
    <article className="page-shell">
      <PageHeader
        title="contact"
        meta="signals"
        summary="A minimal contact page for notes, collaboration, and project conversations."
      />
      <section className="contact-page">
        <ContactBlock />
      </section>
    </article>
  );
}

function NotFoundPage() {
  return (
    <article className="page-shell">
      <PageHeader
        title="not found"
        meta="404"
        summary="That placeholder page does not exist yet."
      />
      <a className="section-action large-action" href="#/">
        return home
        <ArrowIcon />
      </a>
    </article>
  );
}

function RouteView({ route }) {
  if (route.name === "home") return <HomePage />;
  if (route.name === "writing") return <WritingPage />;
  if (route.name === "article") return <ArticlePage anchor={route.anchor} slug={route.slug} />;
  if (route.name === "projects") return <ProjectsPage />;
  if (route.name === "project") return <ProjectPage slug={route.slug} />;
  if (route.name === "about") return <AboutPage />;
  if (route.name === "contact") return <ContactPage />;
  return <NotFoundPage />;
}

export function App() {
  const route = useHashRoute();
  useDocumentTitle(route);

  return (
    <main className="site-shell">
      <Topbar route={route} />
      <RouteView route={route} />
    </main>
  );
}
