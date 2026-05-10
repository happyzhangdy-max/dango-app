with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find showC function
idx = c.find('function showC')
if idx >= 0:
    end = c.find('function ', idx+12)
    if end < 0: end = idx + 2000
    with open('showc_fn.txt', 'w', encoding='utf-8') as out:
        out.write(c[idx:min(idx+2000, end)])
    print('Wrote showc_fn.txt')

# Find studyNext function
idx = c.find('function studyNext')
if idx >= 0:
    end = c.find('function ', idx+16)
    if end < 0: end = idx + 500
    with open('next_fn.txt', 'w', encoding='utf-8') as out:
        out.write(c[idx:min(idx+500, end)])
    print('Wrote next_fn.txt')
