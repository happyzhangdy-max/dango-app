with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('function apToggleMark')
print(repr(c[idx:idx+180]))
