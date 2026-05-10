import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html','r',encoding='utf-8') as f:
    c = f.read()

checks = [
    ('game tab', 'go('+"'game'"+')' in c or 'go("game")' in c),
    ('game page', 'id="p-game"' in c),
    ('game script', 'game/tower-climb.js' in c),
    ('JLPT removed', 'JLPT邪修版' not in c),
    ('game CSS', '#p-game' in c),
]

all_ok = True
for name, ok in checks:
    print(f'{"✅" if ok else "❌"} {name}')
    if not ok: all_ok = False

print(f'\n{"🎉 全部通过！" if all_ok else "❌ 有检查失败"}'  )
