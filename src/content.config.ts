import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const people = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/people" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    avatar: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    interests: z.array(z.string()).default([]),
    order: z.number().default(100),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    year: z.number(),
    venue: z.string().optional(),
    summary: z.string().optional(),
    arxiv: z.string().url().optional(),
    doi: z.string().optional(),
    order: z.number().default(100),
  }),
});

const datedContent = {
  title: z.string(),
  date: z.date(),
  summary: z.string().optional(),
  image: z.string().optional(),
};

const news = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/news" }),
  schema: z.object(datedContent),
});

const events = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/events" }),
  schema: z.object({
    ...datedContent,
    location: z.string().optional(),
  }),
});

const lectures = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/lectures" }),
  schema: z.object({
    ...datedContent,
    speaker: z.string().optional(),
    location: z.string().optional(),
    slides: z.string().url().optional(),
    video: z.string().url().optional(),
  }),
});

export const collections = {
  people,
  publications,
  news,
  events,
  lectures,
};
