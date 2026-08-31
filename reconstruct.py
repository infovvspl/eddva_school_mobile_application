import json
import re

log_path = r'C:\Users\USER\.gemini\antigravity-ide\brain\d5845082-c075-475a-82a5-c6f3780d89fc\.system_generated\logs\transcript_full.jsonl'
lines = {}

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            obj = json.loads(line)
            content = obj.get('content', '')
            if 'DashboardScreen.tsx' in content and '<line_number>:' in content:
                # view_file outputs lines like "1: import React from 'react';"
                matches = re.findall(r'^(\d+):\s(.*)$', content, re.MULTILINE)
                for m in matches:
                    lines[int(m[0])] = m[1]
        except Exception as e:
            pass

with open('src/screens/DashboardScreen.tsx', 'w', encoding='utf-8') as out:
    for i in sorted(lines.keys()):
        out.write(lines[i] + '\n')

print(f'Reconstructed {len(lines)} lines')
