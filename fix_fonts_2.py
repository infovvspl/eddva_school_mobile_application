import os, re
d = 'src/screens'
for f in os.listdir(d):
    if f.endswith('.tsx') and f != 'DashboardScreen.tsx':
        p = os.path.join(d, f)
        with open(p, 'r', encoding='utf-8') as file:
            c = file.read()
        
        lines = c.split('\n')
        out = []
        for line in lines:
            if 'Poppins-Bold' in line or 'Poppins-Medium' in line:
                line = re.sub(r"fontFamily:\s*'Poppins-Regular',\s*", '', line)
            out.append(line)
            
        with open(p, 'w', encoding='utf-8') as file:
            file.write('\n'.join(out))
print('Fixed duplicates')
