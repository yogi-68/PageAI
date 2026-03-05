/**
 * Data Source Connector Interface
 *
 * All connectors implement this interface to provide a unified
 * way to ingest content from different sources (websites, Google Drive,
 * Notion, Gitbook, Zendesk, Confluence, etc.)
 */

export interface ConnectorDocument {
    externalId: string;
    url?: string;
    title: string;
    content: string;
    wordCount: number;
    docType: 'page' | 'article' | 'pdf' | 'doc' | 'sheet' | 'slide' | 'markdown' | 'other';
    metadata: Record<string, any>;
}

export interface ConnectorResult {
    documents: ConnectorDocument[];
    totalDocuments: number;
    errors: string[];
}

export interface DataSourceConnector {
    type: string;
    name: string;
    description: string;
    icon: string; // Lucide icon name
    configFields: ConnectorConfigField[];
    connect(config: Record<string, any>): Promise<{ success: boolean; error?: string }>;
    sync(config: Record<string, any>, options?: { maxDocuments?: number }): Promise<ConnectorResult>;
    disconnect(config: Record<string, any>): Promise<void>;
}

export interface ConnectorConfigField {
    key: string;
    label: string;
    type: 'text' | 'url' | 'password' | 'select' | 'multiselect';
    required: boolean;
    placeholder?: string;
    description?: string;
    options?: { value: string; label: string }[];
}

// ─── Connector Registry ───────────────────────────────────
const connectors: Map<string, DataSourceConnector> = new Map();

export function registerConnector(connector: DataSourceConnector): void {
    connectors.set(connector.type, connector);
}

export function getConnector(type: string): DataSourceConnector | undefined {
    return connectors.get(type);
}

export function getAllConnectors(): DataSourceConnector[] {
    return Array.from(connectors.values());
}

// ─── Available Connectors (metadata only for UI) ──────────
export const AVAILABLE_CONNECTORS = [
    {
        type: 'website',
        name: 'Website',
        description: 'Crawl and index any public website',
        icon: 'Globe',
        status: 'available' as const,
        plans: ['free', 'starter', 'growth', 'scale', 'enterprise'],
    },
    {
        type: 'sitemap',
        name: 'Sitemap',
        description: 'Import pages from XML sitemap',
        icon: 'Map',
        status: 'available' as const,
        plans: ['starter', 'growth', 'scale', 'enterprise'],
    },
    {
        type: 'file_upload',
        name: 'File Upload',
        description: 'Upload PDF, DOCX, TXT, and Markdown files',
        icon: 'Upload',
        status: 'available' as const,
        plans: ['starter', 'growth', 'scale', 'enterprise'],
    },
    {
        type: 'notion',
        name: 'Notion',
        description: 'Sync pages and databases from Notion',
        icon: 'BookOpen',
        status: 'coming_soon' as const,
        plans: ['growth', 'scale', 'enterprise'],
    },
    {
        type: 'google_drive',
        name: 'Google Drive',
        description: 'Import documents from Google Drive',
        icon: 'HardDrive',
        status: 'coming_soon' as const,
        plans: ['growth', 'scale', 'enterprise'],
    },
    {
        type: 'gitbook',
        name: 'GitBook',
        description: 'Sync documentation from GitBook',
        icon: 'Book',
        status: 'coming_soon' as const,
        plans: ['scale', 'enterprise'],
    },
    {
        type: 'zendesk',
        name: 'Zendesk',
        description: 'Import articles from Zendesk Help Center',
        icon: 'Headphones',
        status: 'coming_soon' as const,
        plans: ['scale', 'enterprise'],
    },
    {
        type: 'confluence',
        name: 'Confluence',
        description: 'Sync pages from Atlassian Confluence',
        icon: 'Layers',
        status: 'coming_soon' as const,
        plans: ['scale', 'enterprise'],
    },
    {
        type: 'api',
        name: 'Custom API',
        description: 'Ingest content via REST API endpoint',
        icon: 'Code2',
        status: 'coming_soon' as const,
        plans: ['enterprise'],
    },
] as const;

export type ConnectorType = typeof AVAILABLE_CONNECTORS[number]['type'];
