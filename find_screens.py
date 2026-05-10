with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    c = f.read()

# Find apScreen HTML (the autoplay screen with marks)
idx = c.find('id="apScreen"')
if idx >= 0:
    start = c.rfind('<', idx-200, idx)
    end = c.find('id="gApScreen"', idx)
    if end < 0: end = idx + 3000
    with open('ap_screen.txt', 'w', encoding='utf-8') as out:
        out.write(c[start:end])
    print('Wrote ap_screen.txt, len=', end-start)

# Find study screen HTML
for sid in ['studyScreen', 'studyModal', 'c3d', 'abtns']:
    idx = c.find(sid)
    if idx >= 0:
        ctx = c[max(0,idx-200):idx+500]
        with open(f'study_{sid}.txt', 'w', encoding='utf-8') as out:
            out.write(ctx)
        print(f'Found {sid}')
