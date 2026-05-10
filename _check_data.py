import sys, re
sys.stdout.reconfigure(encoding='utf-8')
c = open('data.js','r',encoding='utf-8').read()

# Extract meaning fields
meanings = re.findall(r"meaning:'([^']*)'", c)
print(f'Total meanings: {len(meanings)}')

# Check for English (ASCII-only meanings)
english = [m for m in meanings if all(ord(ch) < 128 for ch in m) and len(m) > 2]
print(f'Possible English meanings: {len(english)}')
for e in english[:30]:
    print(f'  -> "{e}"')
