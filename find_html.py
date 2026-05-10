with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
for t in ['planModal', '#ol', 'overlay', 'closeD', 'showPlanModal', 'planOverlay', 'planDaysInput']:
    if t in c:
        ctx = c[max(0,c.find(t)-30):c.find(t)+120]
        print(f'{t} in HTML: ...{repr(ctx)}...')
    else:
        print(f'{t} NOT in HTML')
