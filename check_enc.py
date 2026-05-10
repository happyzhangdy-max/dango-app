with open('inline.js', 'rb') as f:
    data = f.read()
idx = data.find(b'erval+')
if idx >= 0:
    snippet = data[idx:idx+60]
    print('Local at erval+:', snippet)
    print('Hex:', ' '.join(f'{b:02x}' for b in snippet))
