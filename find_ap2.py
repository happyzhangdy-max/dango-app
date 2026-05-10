with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
# Find apSyncMarks
idx = c.find('function apSyncMarks')
if idx >= 0:
    end = c.find('function ', idx+18)
    if end < 0: end = idx + 3000
    with open('ap_code.txt', 'w', encoding='utf-8') as out:
        out.write(c[idx:min(idx+2000, end)])
    print('Wrote ap_code.txt')
