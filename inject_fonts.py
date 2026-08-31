import os, re

d = 'src/screens'
for f in os.listdir(d):
    if f.endswith('.tsx') and f != 'DashboardScreen.tsx':
        p = os.path.join(d, f)
        with open(p, 'r', encoding='utf-8') as file:
            c = file.read()
        
        # Replace fontWeight: 'bold' with fontFamily: 'Poppins-Bold'
        c = re.sub(r"fontWeight:\s*['\"`]bold['\"`]", r"fontFamily: 'Poppins-Bold'", c)
        
        # Replace fontWeight: '600' or '500' with fontFamily: 'Poppins-Medium'
        c = re.sub(r"fontWeight:\s*['\"`](500|600)['\"`]", r"fontFamily: 'Poppins-Medium'", c)
        
        # Add Poppins-Regular where fontSize exists but no fontFamily is set yet
        lines = c.split('\n')
        out = []
        for i, line in enumerate(lines):
            out.append(line)
            # if we see fontSize and no fontFamily nearby, inject Poppins-Regular
            if 'fontSize:' in line and 'fontFamily' not in line:
                prev_line = lines[i-1] if i > 0 else ""
                next_line = lines[i+1] if i < len(lines)-1 else ""
                if 'fontFamily' not in prev_line and 'fontFamily' not in next_line:
                    indent = len(line) - len(line.lstrip())
                    out.append(' ' * indent + "fontFamily: 'Poppins-Regular',")
                
        with open(p, 'w', encoding='utf-8') as file:
            file.write('\n'.join(out))
print('Done injecting fonts')
