with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
# Find planModal section
idx = c.find('planModal')
if idx >= 0:
    # Find the full div
    end = c.find('</div>', idx)
    while True:
        next_end = c.find('</div>', end+6)
        if next_end > end + 500:
            break
        end = next_end
    end += 6
    # Keep looking for more modal content
    end2 = c.find('</div>', end)
    end2 = c.find('</div>', end2+6)
    end2 = c.find('</div>', end2+6)
    end2 = c.find('</div>', end2+6) 
    end2 += 6
    
    # Alternative: find the comment close
    comment_end = c.find('-->', idx)
    # Find from last comment before to closing
    from_idx = c.rfind('<!--', 0, idx)
    to_idx = c.find('-->', from_idx)
    
    ctx = c[from_idx:c.find('<!--', from_idx+1)]
    print('PLAN MODAL:')
    print(ctx[:2000])
