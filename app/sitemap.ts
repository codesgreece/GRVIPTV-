import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://grvipott.com";
  const routes = [
    "",
    "/paketa",
    "/kanalia",
    "/odigos-egkatastasis",
    "/syskeyes",
    "/faq",
    "/epikoinonia",
    "/oroi-xrisis",
    "/politiki-aporritou",
    "/politiki-epistrofon",
    "/sxetika",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-08-22"),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
