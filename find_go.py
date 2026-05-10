with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('function go(p){closeD()')
if idx >= 0:
    print('Found at', idx)
    print(repr(c[idx:idx+200]))
else:
    idx2 = c.find('function go(')
    if idx2 >= 0:
        print('function go( at', idx2)
        print(repr(c[idx2:idx2+200]))
