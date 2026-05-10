with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.index('function renderR')
with open('debug_renderR_now.txt', 'w', encoding='utf-8') as out:
    out.write(c[idx:idx+3200])
print('done')
