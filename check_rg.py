with open('inline.js', 'rb') as f:
    data = f.read()
idx = data.find(b'function renderG')
if idx >= 0:
    next_fn = data.find(b'\r\nfunction ', idx + 50)
    if next_fn < 0:
        next_fn = len(data)
    snippet = data[idx:next_fn]
    opens = snippet.count(b'{')
    closes = snippet.count(b'}')
    print(f'renderG at {idx}, len={len(snippet)}, opens={opens}, closes={closes}, diff={opens-closes}')
    print('=== renderG content ===')
    print(snippet.decode('utf-8', errors='replace'))
