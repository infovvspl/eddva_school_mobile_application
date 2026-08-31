import os
import re

dirs = ['src']

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to do this carefully so we don't double replace.
    # We will replace them sequentially by using placeholders.
    content = content.replace('Poppins-Bold', '@@SEMI@@')
    content = content.replace('Poppins-SemiBold', '@@MED@@')
    content = content.replace('Poppins-Medium', '@@REG@@')
    
    # Now restore from placeholders
    content = content.replace('@@SEMI@@', 'Poppins-SemiBold')
    content = content.replace('@@MED@@', 'Poppins-Medium')
    content = content.replace('@@REG@@', 'Poppins-Regular')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print('Fonts reduced successfully.')
