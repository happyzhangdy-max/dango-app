with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
for term in ['closeD', 'showPlanModal', 'planModal', '#ol', 'closePlanModal']:
    idx = c.find(term)
    if idx >= 0:
        ctx = c[max(0,idx-30):idx+80]
        print(f'{term} found at {idx}: ...{repr(ctx)}...')
    else:
        print(f'{term} NOT found')
