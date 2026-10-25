export const SITE_TIME_ZONE = "Asia/Shanghai";

const dateFormatters = {
  short: new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: SITE_TIME_ZONE,
  }),
  long: new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: SITE_TIME_ZONE,
  }),
};

export function formatDate(date: Date, month: "short" | "long" = "short", locale: "en" | "zh-CN" = "en") {
  if (locale === "zh-CN") return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "long", day: "numeric", timeZone: SITE_TIME_ZONE,
  }).format(date);
  return dateFormatters[month].format(date);
}

export function formatYear(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: SITE_TIME_ZONE,
  }).format(date);
}
