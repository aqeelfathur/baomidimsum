import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://baomidimsum.web.id",
      lastModified: new Date(),
    },
    {
      url: "https://baomidimsum.web.id/order",
      lastModified: new Date(),
    },
  ];
}