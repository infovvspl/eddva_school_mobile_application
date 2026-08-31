import os
import re

SCREEN_DIR = r"d:\school-student-portal\SchoolStudentPortalNative\src\screens"
screens = [f for f in os.listdir(SCREEN_DIR) if f.endswith('.tsx')]

def analyze():
    for screen in screens:
        path = os.path.join(SCREEN_DIR, screen)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(path, 'r', encoding='utf-16') as f:
                content = f.read()
            
        # Find all onPress={...} blocks using regex, handling nested braces (to some extent)
        matches = re.finditer(r'onPress=\{([^}]*)\}', content)
        for match in matches:
            block = match.group(1).strip()
            # If the block is very short and doesn't contain navigation or meaningful logic
            if 'navigation' not in block and 'Navigate' not in block and 'set' not in block and 'dispatch' not in block and 'Alert' not in block and 'login(' not in block:
                # Get line number
                line_no = content[:match.start()].count('\n') + 1
                print(f"{screen} L{line_no}: onPress={{{block}}}")

if __name__ == '__main__':
    analyze()
