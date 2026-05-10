with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    h = f.read()

# Find the study buttons around "跳过"
idx = h.find('跳过')
if idx >= 0:
    start = h.rfind('<div', 0, idx)
    end = h.find('</div>', idx)
    for _ in range(8):
        end = h.find('</div>', end+6)
    with open('study_btns_html.txt', 'w', encoding='utf-8') as out:
        out.write(h[start:end+6])
    print(f'Wrote study_btns_html.txt ({end+6-start} chars)')
