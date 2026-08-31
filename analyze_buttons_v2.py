import os
import re

SCREEN_DIR = r"d:\school-student-portal\SchoolStudentPortalNative\src\screens"
screens = [f for f in os.listdir(SCREEN_DIR) if f.endswith('.tsx')]

def analyze():
    total_navigating = 0
    total_dead = 0
    
    for screen in screens:
        path = os.path.join(SCREEN_DIR, screen)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = content.split('\n')
        navigating = 0
        dead = 0
        
        for i, line in enumerate(lines):
            if 'onPress=' in line or 'onPress={' in line or 'onPress={()' in line:
                block = " ".join(lines[i:i+3])
                
                # navigating or working
                if 'onNavigate(' in block or 'navigation.' in block or 'navigate(' in block or 'goBack(' in block or 'push(' in block or 'setActiveTab(' in block or 'setModalVisible(' in block or 'login(' in block:
                    navigating += 1
                elif '() => {}' in block or '() => console.log' in block or '()=>{}' in block or '()=>{ }' in block or '() => null' in block or '=> null' in block or '=>{}' in block:
                    dead += 1
                else:
                    # check if there is some other state update or alert
                    if 'Alert.alert' in block or 'set' in block or 'dispatch' in block:
                        navigating += 1
                    else:
                        dead += 1

        print(f"{screen}: {navigating} working, {dead} not working")
        total_navigating += navigating
        total_dead += dead
        
    print(f"Total: {total_navigating} working, {total_dead} not working")

if __name__ == '__main__':
    analyze()
