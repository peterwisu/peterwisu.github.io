# peterwisu.github.io

Personal academic site. [Astro](https://astro.build) static site, deployed to
GitHub Pages by [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on
every push to `main`.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built site
```

## How the site is organised

Content is **markdown, not code**. Pages read from
[src/content/](src/content/) — to add a paper, a project, or a news item you
add a markdown file, you don't edit a `.astro` page.

```
src/
├── content/           ← everything you write lives here
│   ├── about/index.md       bio, socials, contact, research interests
│   ├── publications/*.md    entries on /research
│   ├── projects/*.md|.mdx   pages under /projects
│   ├── news/*.md            the News list on /about
│   └── blog/*.md            posts under /blogs
├── content.config.ts  ← the schema for each of the above
├── pages/             ← routes
├── layouts/           ← BaseLayout: sidebar, nav, theme toggle
├── components/        ← React widgets for .mdx project pages
├── styles/global.css  ← the whole theme, monochrome light/dark
└── config.ts          ← feature flags: showGames / showBlog / showProjects
public/
└── projects/<name>/   ← images, GIFs and videos for a project page
```

Two rules that apply everywhere:

- **A leading `_` hides a file completely.** `_DRAFT-example.md` is never
  loaded, never built. That's how the templates stay in the repo without
  appearing on the site.
- **`draft: true` hides a file from the site** but keeps it valid. Use it for
  work in progress.

---

## Adding a new project / paper page

**1. Copy the template.** The filename becomes the URL.

```sh
cp src/content/projects/_DRAFT-example.md src/content/projects/my-paper.md
#                                                            └─ /projects/my-paper
```

**2. Make a folder for its assets** and drop figures, GIFs or videos in it:

```sh
mkdir -p public/projects/my-paper
```

Anything under `public/` is served with `public` stripped from the path, so
`public/projects/my-paper/fig1.gif` → `/projects/my-paper/fig1.gif`. **Always
reference assets with a leading slash** — relative paths break, because project
pages sit one level deep.

**3. Fill in the frontmatter.** Only `title` and `description` are required;
every other field is optional and simply doesn't render when absent.

| field | what it does |
| --- | --- |
| `title` | h1, and the link text on `/projects` |
| `description` | one-liner on the `/projects` index **only** |
| `tldr` | the highlighted TL;DR block near the top of the page |
| `venue` | the pill above the title, e.g. `"ICML 2026"` |
| `authors` | `{name, url?, affiliation?, equal?}` — `affiliation` is the superscript marker, e.g. `"1"` or `"1,2"` |
| `affiliations` | list; item *n* is what superscript *n* refers to |
| `equal_note` | footnote for authors marked `equal: true` (default "Equal contribution") |
| `teaser` / `teaser_caption` | hero figure above the writeup |
| `citations` | `{label, bibtex}` list → BibTeX section with a copy button |
| `bibtex` | shorthand when there's only one entry |
| `date` | sort order on `/projects`, newest first |
| `tech` | small `·`-separated list under the title |
| `draft` | `true` hides the page entirely |

**Links.** Set a field and its chip appears; omit it and it doesn't. They
always render in this order:

| field | chip |
| --- | --- |
| `paper` | paper |
| `arxiv` | arXiv |
| `openreview` | OpenReview |
| `repo` | code |
| `model` | model |
| `url` | demo |
| `video` | video |
| `poster` | poster |
| `slides` | slides |
| `links: [{label, href}]` | anything else, appended |

**4. Write the body.** Everything below the frontmatter is plain markdown,
split into `##` sections. Images, tables, code blocks, blockquotes and captioned
`<figure>` blocks are all styled.

**5. Check it** at `http://localhost:4321/projects/my-paper`.

**6. Optionally link it from `/research`.** Publications have a `project:`
field — set `project: "/projects/my-paper"` in the matching
`src/content/publications/*.md` and the entry gains a "project" link.

[src/content/projects/cola.md](src/content/projects/cola.md) is a real,
filled-in example of all of the above.

### What to actually write

The page is a **findings page**, not a second copy of the paper. Assume the
reader gives it 90 seconds:

- **TL;DR** — one sentence carrying the whole result.
- **Teaser** — the money figure. It does more work than any paragraph.
- **Sections with claim headings.** `## Audio-visual tokens can be dropped
  after transfer` beats `## Token pruning analysis`. Someone scanning only the
  headings should come away with the argument.
- **Leave out** related work, implementation detail, and exhaustive ablations.
  That's what the PDF link is for.

---

## Interactive widgets

Rename the file from `.md` to `.mdx` and React components can be used inline.
`@astrojs/react` and `@astrojs/mdx` are already installed and configured.

```mdx
import FigureSlider from "../../components/FigureSlider.tsx";

<FigureSlider client:visible name="Layer" frames={[
  { src: "/projects/my-paper/layer-01.png", label: "1",  caption: "Early layers attend locally." },
  { src: "/projects/my-paper/layer-32.png", label: "32", caption: "Late layers concentrate." }
]} />
```

`client:visible` ships the component's JavaScript only when the reader scrolls
it into view, so the rest of the page stays static HTML. `client:load` if you
need it interactive immediately.

[src/components/FigureSlider.tsx](src/components/FigureSlider.tsx) is a working
example — copy it as the starting point for a new widget. Style widgets with
the CSS variables (`var(--tn-fg)`, `var(--tn-border)`, …) rather than fixed
colours, and they follow the light/dark toggle for free.

### Figures that move

- **Animated SVG** is the best option for diagrams: a few KB, sharp at any zoom,
  and it can follow the theme. In draw.io, `flowAnimation=1` in an edge's
  **Edit Style** gives a flowing line that survives **File → Export as → SVG**.
- **GIF** works and needs nothing special — an `<img>` autoplays and loops. It's
  large (~1 MB is typical) and its background is baked in, so it will be a
  bright rectangle in dark mode.
- **mp4/webm** is roughly 10× smaller than the same GIF:
  `ffmpeg -i in.gif -movflags faststart -pix_fmt yuv420p out.mp4`, then
  `<video autoplay muted loop playsinline>`.
- Anything that loops forever should be gated behind
  `prefers-reduced-motion` — [global.css](src/styles/global.css) already does
  this for page transitions.

---

## Adding a publication

Add a file to [src/content/publications/](src/content/publications/):

```yaml
---
title: "..."
authors: ["Suharitdamrong, W.", "Atito, S."]   # your name is auto-bolded
venue: "ICML"
year: 2026
preprint: false   # true → moves it to the Preprints section
draft: false      # true → hidden
arxiv: "..."      # arxiv / pdf / code / bibtex / project → link chips
---
```

`/research` groups non-preprints by year under **Publications**, then lists
preprints under **Preprints**.

## Adding a news item

One file per item in [src/content/news/](src/content/news/); they render newest
first on `/about`.

```yaml
---
date: 2026-04-30
text: "CoLA accepted at ICML 2026"
---
```

## Feature flags

[src/config.ts](src/config.ts) toggles whole sections. `showProjects: false`
makes `/projects` say the section is unavailable and stops the detail pages
from being built at all.

## Theme

[src/styles/global.css](src/styles/global.css) is the entire design: a
monochrome palette defined once as `--tn-*` variables, with Tailwind's colour
tokens remapped onto them. Light is the default; dark applies only when
`localStorage.theme === "dark"`, set by the sidebar toggle.

---

**Cleanup note:** `src/content/projects/demo-paper-page.mdx` and
`public/projects/demo/` exist purely to demonstrate the layout and the widget.
Delete both once you no longer need the reference.
