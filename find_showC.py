with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find showC function - it probably generates the study buttons
idx = c.find('function showC')
if idx >= 0:
    end = c.find('\n', idx)
    end = c.find('function ', idx+20)
    if end < 0: end = idx + 3000
    print('showC:')
    print(c[idx:min(idx+3000, end)])

print('\n\n==============\n')

# Also find the HTML for study screen
term = 'studyScreen'
idx = c.find(term)
if idx >= 0:
    print(f'{term} at {idx}:', repr(c[max(0,idx-100):idx+200]))
    
term = 'studyOverlay'
idx = c.find(term)
if idx >= 0:
    print(f'{term} at {idx}:', repr(c[max(0,idx-50):idx+200]))
