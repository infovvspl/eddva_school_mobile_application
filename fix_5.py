import glob
import re

for filepath in glob.glob('src/screens/*.tsx'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the broken signature
    # It looks like: const getStyles = ( backgroundColor:
    # Or const getStyles = (\n    backgroundColor:
    
    # We replace it with:
    # const getStyles = (theme: any) => StyleSheet.create({\n  container: {\n    flex: 1,\n    {matched_prop}:
    
    new_content = re.sub(r'const getStyles = \(\s+([a-zA-Z0-9_]+)\s*:', r'const getStyles = (theme: any) => StyleSheet.create({\n  container: {\n    flex: 1,\n    \1:', content)
    
    if content != new_content:
        print(f"Fixed {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

print("Done fixing broken styles!")
