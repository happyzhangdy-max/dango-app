with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    c = f.read()
idx = c.find('.ol')
if idx >= 0:
    ctx = c[max(0,idx-50):idx+300]
    with open('css_ol.txt', 'w', encoding='utf-8') as out:
        out.write(ctx)
    print('Wrote css_ol.txt')
