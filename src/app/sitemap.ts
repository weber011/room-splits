import { MetadataRoute } from "next";
import { propertyService } from "@/services/property.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roomsplits.com";

  // Fetch all active properties for dynamic property page indexing
  let properties: Array<{ id: string; slug: string; updatedAt?: string }> = [];
  try {
    properties = await propertyService.getAllProperties();
  } catch (err) {
    console.error("Failed to load properties for sitemap", err);
  }

  const propertyUrls: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${baseUrl}/property/${p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  return [...staticUrls, ...propertyUrls];
}
