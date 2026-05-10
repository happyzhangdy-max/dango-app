with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find apShowCard function
idx = c.find('function apShowCard')
if idx >= 0:
    end = c.find('function apTogglePause', idx)
    if end < 0: end = idx + 3000
    with open('ap_showcard.txt', 'w', encoding='utf-8') as out:
        out.write(c[idx:min(idx+3000, end)])
    print('Wrote ap_showcard.txt')

# Also find the auto-play timer logic
for term in ['_apTimer', 'clearTimeout(_apTimer)']:
    idx = c.find(term)
    if idx >= 0:
        ctx = c[max(0,idx-100):idx+200]
        with open(f'ap_timer_{term.replace("(","")}.txt', 'w', encoding='utf-8') as out:
            out.write(ctx)
        print(f'Found {term}')
