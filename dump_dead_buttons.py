import os
import re

SCREEN_DIR = r"d:\school-student-portal\SchoolStudentPortalNative\src\screens"
screens = [f for f in os.listdir(SCREEN_DIR) if f.endswith('.tsx')]

def analyze():
    for screen in screens:
        path = os.path.join(SCREEN_DIR, screen)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if 'onPress=' in line or 'onPress={' in line or 'onPress={()' in line:
                block = " ".join(lines[i:i+3])
                
                # Check for dead button patterns
                if '() => {}' in block or '() => console.log' in block or '()=>{}' in block or '()=>{ }' in block or '() => null' in block or '=> null' in block or '=>{}' in block:
                    print(f"File: {screen}, Line {i+1}: {line.strip()}")

if __name__ == '__main__':
    analyze()
