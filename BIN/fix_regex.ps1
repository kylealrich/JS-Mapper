$content = Get-Content 'JavaScript_Mapper.html' -Raw -Encoding UTF8
$content = $content -replace "replace\(/\[\.\*\+\?\^\`$\{\}\(\)\|\[\\\]\\\\\]/g, '\\\\[a-f0-9\-]{36}'\)", "replace(/[.*+?^`${}()|[\]\\]/g, '\\`$&')"
$content | Set-Content 'JavaScript_Mapper.html' -Encoding UTF8 -NoNewline
Write-Host "Fixed regex escaping in JavaScript_Mapper.html"
