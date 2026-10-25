import { site } from "../data/site.ts";

export type Locale = "en" | "zh-CN";

export function localeFromPath(pathname: string): Locale {
  return /^\/zh-CN(?:\/|$)/.test(pathname) ? "zh-CN" : "en";
}

/** Keep the same page when switching languages, including a supplied query or anchor. */
export function localizedPath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const unprefixed = path.replace(/^\/zh-CN(?=\/|[?#]|$)/, "") || "/";
  const canonical = /^[?#]/.test(unprefixed) ? `/${unprefixed}` : unprefixed;
  return locale === "zh-CN" ? `/zh-CN${canonical}` : canonical;
}

export function collectionPath(collection: string): string {
  return collection.replace(/Zh$/, "");
}

export function translated(locale: Locale, english: string, chinese: string): string {
  return locale === "zh-CN" ? chinese : english;
}

export function localizedSite(locale: Locale) {
  if (locale === "en") return site;
  return {
    name: "量子可积实验室",
    description: "于纷繁世界，寻可积之理。",
    metaDescription: "东南大学量子可积实验室致力于可积模型、量子场论、AdS/CFT 对应与可解形变研究。了解实验室成员、研究成果、课程与学术活动。",
    nav: [
      { label: "首页", href: "/" },
      { label: "成员", href: "/people/" },
      { label: "研究成果", href: "/publications/" },
      { label: "新闻与活动", href: "/news/" },
      { label: "课程与讲座", href: "/lectures/" },
      { label: "关于我们", href: "/about/" },
    ],
    footer: [{ label: "联系我们", href: "/about/#contact" }],
  };
}
