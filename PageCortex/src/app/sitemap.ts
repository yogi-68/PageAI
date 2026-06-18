import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pagecortex.com";

    return [
        // ─── Core pages ────────────────────────────────────────
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/careers`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },

        // ─── Product & docs ────────────────────────────────────
        {
            url: `${baseUrl}/docs`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/api-reference`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/changelog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },

        // ─── Use Cases (SEO landing pages) ─────────────────────
        {
            url: `${baseUrl}/use-cases`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/use-cases/ai-assistant-for-website`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.95,
        },
        {
            url: `${baseUrl}/use-cases/ai-chatbot-for-website`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.95,
        },
        {
            url: `${baseUrl}/use-cases/chatbot-for-saas`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/use-cases/no-code-chatbot-builder`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/use-cases/chatbase-alternative`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/use-cases/embed-chatbot-on-website`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },

        // ─── Blog ──────────────────────────────────────────────
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog/ai-presales-assistants-boosting-saas-conversions`,
            lastModified: new Date("2025-05-10"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/complete-guide-rag-powered-chatbots`,
            lastModified: new Date("2025-05-05"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/saas-chatbot-conversion-metrics`,
            lastModified: new Date("2025-04-28"),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog/pricing-page-ai-assistant`,
            lastModified: new Date("2025-04-20"),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog/embed-chatbot-any-website`,
            lastModified: new Date("2025-04-15"),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog/pagecortex-vs-chatbase-vs-intercom`,
            lastModified: new Date("2025-04-10"),
            changeFrequency: "monthly",
            priority: 0.8,
        },

        // ─── Auth (low priority) ──────────────────────────────
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
