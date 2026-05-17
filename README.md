# sjfbo.github.io

## Run

```sh
npm install
npm run dev -- --port 5173
```

## Write Articles

Article metadata lives in `src/site-data.js`. The article body lives in a Markdown file whose filename matches the article `slug`.

Example:

```js
{
  slug: "systems-over-models",
  title: "Systems > Models: A Practical View",
  date: "2026-04-18",
  readingTime: "5 min",
  summary: "Why durable software abstractions matter more than the model du jour.",
}
```

Markdown body:

```txt
src/content/articles/systems-over-models.md
```

Supported Markdown includes normal prose, headings, lists, tables, inline code, fenced code blocks, and Mermaid diagrams.

````md
## Example

```ts
const signal = "quiet";
```

```mermaid
flowchart LR
  A[Idea] --> B[Draft]
  B --> C[Article]
```
````
