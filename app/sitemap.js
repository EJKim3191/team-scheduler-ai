import { SITE_URL } from "@/lib/site";

/** @type {import("next").MetadataRoute.Sitemap} */
export default function sitemap() {
  return [
    {
      url: `${SITE_URL}/landing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
