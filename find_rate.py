with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find rate function
idx = c.find('function rate(')
if idx >= 0:
    end = c.find('function ', idx+12)
    if end < 0: end = idx + 500
    with open('rate_fn.txt', 'w', encoding='utf-8') as out:
        out.write(c[idx:min(idx+500, end)])
    print('Wrote rate_fn.txt')

# Find the study HTML section in index.html
with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    h = f.read()
# Find study screen HTML
idx = h.find('studyScreen')
if idx >= 0:
    start = max(0, idx-50)
    # Find the complete study screen HTML
    start2 = h.rfind('<div', start, idx)
    start2 = h.rfind('<div', 0, start2)
    end = h.find('<', idx+200)
    for _ in range(20):
        end = h.find('>', end+1)
        end = h.find('<', end)
    end2 = h.find('</div>', end)
    for _ in range(5):
        end2 = h.find('</div>', end2+6)
    with open('study_html.txt', 'w', encoding='utf-8') as out:
        out.write(h[start2:end2+6])
    print('Wrote study_html.txt')
