import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pagecortex.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard/", "/api/", "/auth/", "/chat-preview/"],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/dashboard/", "/api/", "/auth/", "/chat-preview/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
