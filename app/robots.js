import { SITE_URL } from "@/lib/site";

/** @type {import("next").MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/landing", "/login"],
      disallow: ["/api/", "/manage", "/make-team", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
