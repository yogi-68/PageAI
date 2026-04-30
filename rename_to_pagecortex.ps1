$root = "C:\Users\yoges\OneDrive\Desktop\PageAI"

$files = Get-ChildItem -Path $root -Recurse -File -Include "*.ts","*.tsx","*.js","*.json","*.md","*.mjs","*.py","*.sql","*.css" |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.next\\' -and $_.FullName -notmatch '\\package-lock' }

$count = 0
foreach ($file in $files) {
  try {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content

    # URLs (most specific first)
    $content = $content -replace 'pageai-tau\.vercel\.app', 'pagecortex.vercel.app'
    $content = $content -replace 'pageai\.io', 'pagecortex.io'
    $content = $content -replace 'pageai\.com', 'pagecortex.com'
    $content = $content -replace '@pageai_io', '@pagecortex_io'
    $content = $content -replace 'github\.com/pageai\b', 'github.com/pagecortex'
    $content = $content -replace 'yogi-68/PageAI', 'yogi-68/PageCortex'

    # Internal symbols
    $content = $content -replace 'PAGEAI_API', 'PAGECORTEX_API'
    $content = $content -replace '\[PageAI\]', '[PageCortex]'

    # localStorage / theme key
    $content = $content -replace "pageai-theme", 'pagecortex-theme'

    # Widget CSS IDs / class names / keyframes / JS ids
    $content = $content -replace 'pageai-widget-container', 'pagecortex-widget-container'
    $content = $content -replace 'pageai-trigger', 'pagecortex-trigger'
    $content = $content -replace 'pageai-header-text', 'pagecortex-header-text'
    $content = $content -replace 'pageai-header', 'pagecortex-header'
    $content = $content -replace 'pageai-avatar', 'pagecortex-avatar'
    $content = $content -replace 'pageai-close', 'pagecortex-close'
    $content = $content -replace 'pageai-messages', 'pagecortex-messages'
    $content = $content -replace 'pageai-input-area', 'pagecortex-input-area'
    $content = $content -replace 'pageai-input', 'pagecortex-input'
    $content = $content -replace 'pageai-send', 'pagecortex-send'
    $content = $content -replace 'pageai-branding', 'pagecortex-branding'
    $content = $content -replace 'pageai-suggestion-chip', 'pagecortex-suggestion-chip'
    $content = $content -replace 'pageai-suggestions', 'pagecortex-suggestions'
    $content = $content -replace 'pageai-msg-bubble', 'pagecortex-msg-bubble'
    $content = $content -replace 'pageai-msg', 'pagecortex-msg'
    $content = $content -replace 'pageai-source-tag', 'pagecortex-source-tag'
    $content = $content -replace 'pageai-sources', 'pagecortex-sources'
    $content = $content -replace 'pageai-typing', 'pagecortex-typing'
    $content = $content -replace 'pageai-slide-up', 'pagecortex-slide-up'
    $content = $content -replace 'pageai-chat', 'pagecortex-chat'
    $content = $content -replace 'pageai_enqueue_widget', 'pagecortex_enqueue_widget'

    # Package names (quoted)
    $content = $content -replace '"pageai-admin"', '"pagecortex-admin"'
    $content = $content -replace '"pageai-monorepo"', '"pagecortex-monorepo"'
    $content = $content -replace '"pageai"', '"pagecortex"'

    # Brand name (PascalCase)
    $content = $content -replace 'PageAI', 'PageCortex'

    # Remaining lowercase instances
    $content = $content -replace '\bpageai\b', 'pagecortex'

    if ($content -ne $original) {
      [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
      Write-Host "Updated: $($file.FullName.Replace($root, '').TrimStart('\'))"
      $count++
    }
  } catch {
    Write-Warning "Failed: $($file.Name) - $_"
  }
}

Write-Host ""
Write-Host "Done - $count files updated."
