with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    c = f.read()
idx = c.find('planModal')
if idx >= 0:
    from_idx = c.rfind('<!--', 0, idx)
    to_idx = c.find('-->', from_idx)
    ctx = c[from_idx:c.find('<!--', from_idx+1)]
    with open('plan_modal_html.txt', 'w', encoding='utf-8') as out:
        out.write(ctx[:3000])
    print(f'Wrote {min(3000, len(ctx))} chars to plan_modal_html.txt')
