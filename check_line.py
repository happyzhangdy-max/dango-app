with open('inline.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
print(f'Total lines: {len(lines)}')
if len(lines) >= 443:
    line = lines[442]  # 0-indexed
    print(f'Line 443: len={len(line)}')
    start = max(0, 193-80)
    end = min(len(line), 193+80)
    print(f'Context@{193}: [{repr(line[start:end])}]')
