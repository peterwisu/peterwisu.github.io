import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const about = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/about" }),
  schema: z.object({
    name: z.string(),
    title: z.string().optional(),
    avatar: z.string().optional(),
    research_interests: z.array(z.string()).default([]),
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
    authors: z.array(z.string()),
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
    description: z.string(),
    tech: z.array(z.string()).optional(),
    repo: z.string().optional(),
    url: z.string().optional(),
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
