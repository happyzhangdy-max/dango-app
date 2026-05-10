with open('inline.js', 'rb') as f:
    data = f.read()
print(f'File size: {len(data)}')
print(f'First 20 bytes: {data[:20]}')
opens = data.count(b'{')
closes = data.count(b'}')
print(f'opens={opens}, closes={closes}, diff={opens-closes}')
