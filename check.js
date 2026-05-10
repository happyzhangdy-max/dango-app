// Just a test script to check syntax
const fs = require('fs');
const code = fs.readFileSync('inline.js', 'utf8');
try {
    new Function(code);
    console.log('✅ Syntax OK');
} catch(e) {
    console.log('❌ Syntax error:', e.message);
    // Find position
    const m = e.stack.match(/:(\d+):(\d+)/);
    if (m) {
        const line = parseInt(m[1]);
        const col = parseInt(m[2]);
        const lines = code.split('\n');
        console.log(`Line ${line}, Col ${col}:`);
        for (let i = Math.max(0, line-3); i < Math.min(lines.length, line+2); i++) {
            console.log(`${i+1}: ${lines[i].substring(0, 200)}`);
        }
    }
}
