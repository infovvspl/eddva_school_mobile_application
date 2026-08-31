import os

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
            
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if 'onPress=' in line or 'onPress={' in line or 'onPress={()' in line:
                block = " ".join(lines[i:i+3])
                
                # Check for dead button patterns exactly as the count script did
                if '() => {}' in block or '() => console.log' in block or '()=>{}' in block or '()=>{ }' in block or '() => null' in block or '=> null' in block or '=>{}' in block:
                    # check if the block itself is just one of these
                    print(f"{screen} L{i+1}: {line.strip()}")
                else:
                    if 'onNavigate(' not in block and 'navigation.' not in block and 'navigate(' not in block and 'goBack(' not in block and 'push(' not in block and 'setActiveTab(' not in block and 'setModalVisible(' not in block and 'login(' not in block and 'Alert.alert' not in block and 'set' not in block and 'dispatch' not in block:
                        print(f"{screen} L{i+1}: (OTHER DEAD) {line.strip()}")

if __name__ == '__main__':
    analyze()
