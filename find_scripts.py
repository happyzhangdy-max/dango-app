with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    c = f.read()
import re
for m in re.finditer(r'script src="([^"]+)"', c):
    print(m.group(1))
