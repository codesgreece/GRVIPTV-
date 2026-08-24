import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admingr", "/account/"],
    },
    sitemap: "https://grvipott.com/sitemap.xml",
  };
}
