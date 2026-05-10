with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    c = f.read()
import re
# Find all pointer-events:all occurrences
for m in re.finditer(r'pointer-events:\s*all', c):
    start = max(0, m.start()-100)
    end = min(len(c), m.end()+100)
    ctx = c[start:end].replace('\n', '\\n')
    print(f'Found at {m.start()}: ...{ctx}...')
    print('---')
