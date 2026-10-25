import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "./i18n";

export const contentCollections = ["people", "publications", "news", "events", "lectures"] as const;
export type ContentCollection = typeof contentCollections[number];
export type LocalizedEntry<C extends ContentCollection> = CollectionEntry<C | `${C}Zh`>;

export async function localizedCollection<C extends ContentCollection>(
  collection: C,
  locale: Locale,
): Promise<LocalizedEntry<C>[]> {
  const name = locale === "zh-CN" ? `${collection}Zh` as const : collection;
  return await getCollection(name) as LocalizedEntry<C>[];
}
