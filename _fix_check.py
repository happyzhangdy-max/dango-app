import sys, re
sys.stdout.reconfigure(encoding='utf-8')
c = open('data.js','r',encoding='utf-8').read()

# Check CJK range
def has_cjk(s):
    for ch in s:
        cp = ord(ch)
        if 0x4E00 <= cp <= 0x9FFF or 0x3400 <= cp <= 0x4DBF:
            return True
    return False

meanings = re.findall(r"meaning:'([^']*)'", c)
cn = [m for m in meanings if has_cjk(m)]
en = [m for m in meanings if not has_cjk(m) and len(m) > 1]
print(f'Total: {len(meanings)}')
print(f'Chinese: {len(cn)}')
print(f'Non-Chinese: {len(en)}')
print()
print('Sample English meanings:')
for e in en[:15]:
    print(f'  "{e}"')
