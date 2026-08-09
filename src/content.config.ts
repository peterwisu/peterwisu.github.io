import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const about = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/about" }),
  schema: z.object({
    name: z.string(),
    title: z.string().optional(),
    avatar: z.string().optional(),
    research_interests: z.array(z.string()).default([]),
    // Academic service. Entries sharing a role are grouped onto one line.
    service: z
      .array(z.object({ role: z.string(), venue: z.string() }))
      .default([]),
    // Teaching. Same grouping behaviour: one line per role.
    teaching: z
      .array(z.object({ role: z.string(), module: z.string() }))
      .default([]),
    cv: z.string().optional(),
    social: z
      .array(
        z.object({
          platform: z.string(),
          handle: z.string(),
          url: z.string(),
        })
      )
      .default([]),
    contact: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          href: z.string(),
        })
      )
      .default([]),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    // A plain string, or {name, equal: true} to mark equal contribution.
    authors: z.array(
      z.union([
        z.string(),
        z.object({ name: z.string(), equal: z.boolean().default(false) }),
      ])
    ),
    venue: z.string(),
    year: z.number(),
    preprint: z.boolean().default(false),
    draft: z.boolean().default(false),
    pdf: z.string().optional(),
    code: z.string().optional(),
    arxiv: z.string().optional(),
    bibtex: z.string().optional(),
    project: z.string().optional(),
    abstract: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    // Emoji shown just before the title, e.g. "🥤"
    icon: z.string().optional(),
    // Small square logo, floated to the top right of the header.
    logo: z.string().optional(),
    // One-liner for the /projects index only.
    description: z.string(),
    // Highlighted TL;DR block at the top of the detail page.
    tldr: z.string().optional(),
    // e.g. "ICLR 2026" or "arXiv preprint"
    venue: z.string().optional(),
    authors: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().optional(),
          // Marker(s) tying the author to `affiliations`, e.g. "1" or "1,2"
          affiliation: z.string().optional(),
          equal: z.boolean().default(false),
        })
      )
      .default([]),
    // Either a plain string, or an object to attach a logo / link.
    affiliations: z
      .array(
        z.union([
          z.string(),
          z.object({
            name: z.string(),
            logo: z.string().optional(),
            url: z.string().optional(),
            // Set for a white/reversed monochrome logo: it gets inverted in
            // light mode and left alone in dark mode.
            invert: z.boolean().default(false),
            // Override the shared 52px height — logos differ in aspect ratio,
            // so equal height doesn't always mean equal visual weight.
            logo_height: z.number().optional(),
          }),
        ])
      )
      .default([]),
    equal_note: z.string().default("Equal contribution"),
    tech: z.array(z.string()).optional(),

    // --- Link shorthands. Each renders as a chip, in this order. ---
    paper: z.string().optional(),
    // Official venue listing, e.g. an icml.cc/virtual poster page.
    venue_site: z.string().optional(),
    arxiv: z.string().optional(),
    openreview: z.string().optional(),
    repo: z.string().optional(),
    model: z.string().optional(),
    url: z.string().optional(),
    video: z.string().optional(),
    poster: z.string().optional(),
    slides: z.string().optional(),
    // Anything else, appended to the same row.
    links: z
      .array(z.object({ label: z.string(), href: z.string() }))
      .default([]),

    // Hero image at the top of the detail page (path under /public, or a URL).
    teaser: z.string().optional(),
    teaser_caption: z.string().optional(),

    // Single-entry shorthand for `citations`.
    bibtex: z.string().optional(),
    // Use when a paper has more than one citable version (conference + arXiv).
    citations: z
      .array(z.object({ label: z.string().default(""), bibtex: z.string() }))
      .default([]),

    date: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/news" }),
  schema: z.object({
    date: z.coerce.date(),
    text: z.string(),
  }),
});

export const collections = { about, publications, projects, blog, news };
