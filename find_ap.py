with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find apSyncMarks
idx = c.find('function apSyncMarks')
if idx >= 0:
    end = c.find('function ', idx+18)
    if end < 0: end = idx + 3000
    print('apSyncMarks:')
    print(c[idx:min(idx+2000, end)])

print('\n\n=========\n')

# Find auto-play screen click handlers (bookmark, color marks)
idx = c.find('apScreen')
if idx >= 0:
    end = c.find('function ', idx+10)
    print('apScreen context:', repr(c[max(0,idx-100):min(len(c), idx+500)]))
