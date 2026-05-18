import sys
fpath = sys.argv[1] if len(sys.argv) > 1 else "www/inline.js"
with open(fpath, "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("h!=='127.0.0.1'", "h!=='127.0.0.1'&&h!==''", 1)
with open(fpath, "w", encoding="utf-8") as f:
    f.write(c)
print("Whitelist patched")
