import codecs

with open('temp_DashboardScreen.txt', 'r', encoding='utf-8') as f:
    content = f.read().strip()

if content.startswith('"'):
    content = content[1:]
if content.endswith('"'):
    content = content[:-1]

# Unescape using codecs
content = codecs.decode(content, 'unicode_escape')

with open('src/screens/DashboardScreen.tsx', 'w', encoding='utf-8') as out:
    out.write(content)
    
print("Recovery completed perfectly")
