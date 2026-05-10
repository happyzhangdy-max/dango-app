with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    c = f.read()
# Find apScreen HTML
idx = c.find('apScreen')
if idx >= 0:
    # Find around it
    start = c.rfind('>', max(0, idx-2000), idx)
    end = c.find('</div>', idx)
    for _ in range(10):
        end = c.find('</div>', end+6)
    with open('ap_html.txt', 'w', encoding='utf-8') as out:
        out.write(c[max(0,idx-200):end])
    print('Wrote ap_html.txt')
