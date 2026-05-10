with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find rate function and modify it
idx = c.find('function rate(q){const v=q[ci]')
if idx >= 0:
    # Find end of function
    end = c.find('}', idx)
    end = c.find('\n', end)  # skip to after the closing brace
    old = c[idx:end]
    new = 'function rate(q){const v=q[ci];const p=lp();const cur=p[v.id]||{};const r=sm2(cur,q);p[v.id]={...r,word:v.word};sp(p);if(q===0)toggleMark(v.id,"red");else if(q===3)toggleMark(v.id,"yellow");else if(q===4)toggleMark(v.id,"green");ci++;if(ci<q.length)setTimeout(showC,200);else showComp()}'
    with open('rate_patch.txt', 'w', encoding='utf-8') as out:
        out.write('OLD:\n' + old + '\n\nNEW:\n' + new)
    print('Rate function found. Ready to replace.')
    print('Old len:', len(old), 'New len:', len(new))

# Find apToggleBook
idx = c.find('function apToggleBook')
if idx >= 0:
    end = c.find('}', idx)
    end = c.find('\n', end)
    old_bm = c[idx:end]
    new_bm = 'function apToggleBook(){var v=_apQueue[_apIdx];if(!v)return;toggleBook(v.id);apSyncMarks();clearTimeout(_apTimer);speechSynthesis.cancel();_apIdx--;apShowCard()}'
    with open('ap_patch.txt', 'w', encoding='utf-8') as out:
        out.write('OLD_BM:\n' + old_bm + '\n\nNEW_BM:\n' + new_bm)
    print('apToggleBook found. Old len:', len(old_bm), 'New len:', len(new_bm))

# Find apToggleMark
idx = c.find('function apToggleMark')
if idx >= 0:
    end = c.find('}', idx)
    end = c.find('\n', end)
    old_mk = c[idx:end]
    new_mk = 'function apToggleMark(c){var v=_apQueue[_apIdx];if(!v)return;toggleMark(v.id,c);apSyncMarks();clearTimeout(_apTimer);speechSynthesis.cancel();_apIdx--;apShowCard()}'
    with open('ap_patch2.txt', 'w', encoding='utf-8') as out:
        out.write('OLD_MK:\n' + old_mk + '\n\nNEW_MK:\n' + new_mk)
    print('apToggleMark found. Old len:', len(old_mk), 'New len:', len(new_mk))
