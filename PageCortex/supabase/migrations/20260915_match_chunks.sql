-- ============================================
-- Vector-only fallback search (match_chunks)
-- Used by rag.ts's vectorOnlySearch() when hybrid_search errors,
-- and by the Growth Hub content generator.
-- Mirrors hybrid_search's user/data-source scoping but ranks by
-- vector similarity alone (no full-text component).
-- ============================================

CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_count INTEGER DEFAULT 12,
  filter_user_id UUID DEFAULT NULL,
  filter_data_source_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  content TEXT,
  token_count INTEGER,
  heading TEXT,
  page_url TEXT,
  page_title TEXT,
  doc_type TEXT,
  metadata JSONB,
  vector_score FLOAT,
  text_score FLOAT,
  combined_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.content,
    c.token_count,
    c.heading,
    c.page_url,
    c.page_title,
    c.doc_type,
    c.metadata,
    (1 - (c.embedding <=> query_embedding)) AS vector_score,
    0::FLOAT AS text_score,
    (1 - (c.embedding <=> query_embedding)) AS combined_score
  FROM public.chunks c
  WHERE (filter_user_id IS NULL OR c.user_id = filter_user_id)
    AND (filter_data_source_ids IS NULL OR c.data_source_id = ANY(filter_data_source_ids))
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
