with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find apToggleBook
idx = c.find('function apToggleBook')
if idx >= 0:
    end = c.find('function ', idx+18)
    if end < 0: end = idx + 1000
    with open('ap_toggle.txt', 'w', encoding='utf-8') as out:
        out.write(c[idx:min(idx+1000, end)])
    print('Wrote ap_toggle.txt')

# Find apToggleMark
idx = c.find('function apToggleMark')
if idx >= 0:
    end = c.find('function ', idx+20)
    if end < 0: end = idx + 1000
    with open('ap_mark.txt', 'w', encoding='utf-8') as out:
        out.write(c[idx:min(idx+1000, end)])
    print('Wrote ap_mark.txt')
