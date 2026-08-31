import re
import glob

for filepath in glob.glob('src/screens/*.tsx') + ['App.tsx']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove theme from props
    # Matches: ({ theme }: any) -> ()
    # ({ onNavigate, theme }: any) -> ({ onNavigate }: any)
    # ({ onFinish, theme }: any) -> ({ onFinish }: any)
    # ({ onContinue, theme }: any) -> ({ onContinue }: any)
    content = re.sub(r'\(\{\s*theme\s*\}\s*:\s*any\)', '()', content)
    content = re.sub(r'\(\{\s*([a-zA-Z0-9_]+)\s*,\s*theme\s*\}\s*:\s*any\)', r'({ \1 }: any)', content)
    
    # Let's just blindly remove `, theme` and `theme, ` and `theme: any` from the props
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Removed theme from props")
