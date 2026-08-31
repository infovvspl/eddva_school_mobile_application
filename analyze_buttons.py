import os
import re

SCREEN_DIR = r"d:\school-student-portal\SchoolStudentPortalNative\src\screens"
screens = [f for f in os.listdir(SCREEN_DIR) if f.endswith('.tsx')]

def analyze():
    total_working = 0
    total_not_working = 0
    
    for screen in screens:
        path = os.path.join(SCREEN_DIR, screen)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find all onPress handlers. Let's just find onPress={...} roughly
        # We can look for `onPress={` or `onPress={() =>`
        # Actually, simpler: find "onPress" and see the lines following it.
        lines = content.split('\n')
        working = 0
        not_working = 0
        
        for i, line in enumerate(lines):
            if 'onPress=' in line or 'onPress={' in line or 'onPress={()' in line:
                # Get this line and next few lines to check for navigation or empty
                block = " ".join(lines[i:i+3])
                
                if 'navigation.' in block or 'navigate(' in block or 'goBack(' in block or 'push(' in block:
                    working += 1
                elif '() => {}' in block or '() => console.log' in block or '()=>{}' in block or '()=>{ }' in block or '() => null' in block:
                    not_working += 1
                else:
                    # Let's say if it does state update like setVisible(true) or some other logic, we can count it or print it.
                    # The prompt says "working means navigating", but some buttons open modals. We'll count them as not navigating but print them.
                    # Let's be lenient and assume if it has logic it might not be a pure "dead" button, but if user explicitly says "working means navigating", we should classify as such.
                    if 'set' in block or 'dispatch(' in block or 'handle' in block:
                         not_working += 1 # Not navigating
                    else:
                         not_working += 1

        print(f"{screen}: {working} navigating, {not_working} not navigating")
        total_working += working
        total_not_working += not_working
        
    print(f"Total: {total_working} navigating, {total_not_working} not navigating")

if __name__ == '__main__':
    analyze()
