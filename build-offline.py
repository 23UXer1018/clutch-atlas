from pathlib import Path
import re

root = Path(__file__).resolve().parent
dist = root / 'dist'
html = (dist / 'index.html').read_text()
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: '<style>' + (dist / m[1]).read_text() + '</style>', html)
html = re.sub(r'<script defer src="([^"]+)"></script>', lambda m: '<script>' + (dist / m[1]).read_text().replace('</script', '<\\/script') + '</script>', html)
# Inline scripts must execute after the body and dialog exist.
scripts = re.findall(r'<script>[\s\S]*?</script>', html)
html = re.sub(r'<script>[\s\S]*?</script>\s*', '', html)
html = html.replace('</body>', '\n'.join(scripts) + '\n</body>')
(root / '电竞地理-离线版.html').write_text(html)
print('Offline HTML created:', len(html.encode()), 'bytes')
