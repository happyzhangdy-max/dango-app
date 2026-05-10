with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find auto-play functions
for fn in ['function apShowCard', 'function apTogglePause', 'function startAutoPlay', 'function apSyncMarks', 'function apDone']:
    idx = c.find(fn)
    if idx >= 0:
        print(fn, 'found at', idx)
    else:
        print(fn, 'NOT found')

# Find study functions
for fn in ['function startStudy', 'function showC', 'function studyNext', 'function studySel', 'function startStudyFromWall']:
    idx = c.find(fn)
    if idx >= 0:
        print(fn, 'found at', idx)
    else:
        print(fn, 'NOT found')

# Find the study buttons HTML
for term in ['简单', '跳过', '不会', '还行', '记住', 'study-btns']:
    idx = c.find(term)
    if idx >= 0:
        ctx = c[max(0,idx-80):idx+80]
        print(f'"{term}" found at {idx}: {repr(ctx)}')
    else:
        print(f'"{term}" NOT found')
