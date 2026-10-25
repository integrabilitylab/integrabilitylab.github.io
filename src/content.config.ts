import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const people = {
  loader: glob({ pattern: "**/*.md", base: "./src/content/people" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    category: z.enum(["faculty", "postdocs", "students", "alumni"]),
    avatar: z.string().optional(),
    email: z.email().optional(),
    website: z.url().optional(),
    interests: z.array(z.string()).default([]),
    order: z.number().default(100),
  }),
};

const publications = {
  loader: glob({ pattern: "**/*.md", base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    originalTitle: z.string().optional(),
    authors: z.array(z.string()),
    year: z.number().int().positive(),
    venue: z.string().optional(),
    summary: z.string().optional(),
    arxiv: z.url().optional(),
    doi: z.string().optional(),
    inspireId: z.number().int().positive().optional(),
    order: z.number().default(100),
  }),
};

const datedContent = {
  title: z.string(),
  date: z.date(),
  summary: z.string().optional(),
  language: z.enum(["en", "zh-CN"]).default("en"),
  image: z.string().optional(),
};

const news = {
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object(datedContent),
};

const events = {
  loader: glob({ pattern: "**/*.md", base: "./src/content/events" }),
  schema: z.object({
    ...datedContent,
    location: z.string().optional(),
  }),
};

const lectures = {
  loader: glob({ pattern: "**/*.md", base: "./src/content/lectures" }),
  schema: z.object({
    ...datedContent,
    speaker: z.string().optional(),
    location: z.string().optional(),
    slides: z.url().optional(),
    video: z.url().optional(),
    videos: z
      .array(
        z.object({
          title: z.string(),
          url: z.url(),
        }),
      )
      .default([]),
  }),
};

export const collections = {
  people: defineCollection(people),
  peopleZh: defineCollection({ ...people, loader: glob({ pattern: "**/*.md", base: "./src/content/people-zh" }) }),
  publications: defineCollection(publications),
  publicationsZh: defineCollection({ ...publications, loader: glob({ pattern: "**/*.md", base: "./src/content/publications-zh" }) }),
  news: defineCollection(news),
  newsZh: defineCollection({ ...news, loader: glob({ pattern: "**/*.md", base: "./src/content/news-zh" }) }),
  events: defineCollection(events),
  eventsZh: defineCollection({ ...events, loader: glob({ pattern: "**/*.md", base: "./src/content/events-zh" }) }),
  lectures: defineCollection(lectures),
  lecturesZh: defineCollection({ ...lectures, loader: glob({ pattern: "**/*.md", base: "./src/content/lectures-zh" }) }),
};
