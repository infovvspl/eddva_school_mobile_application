import os, re
d = 'src/screens'
for f in os.listdir(d):
    if f.endswith('.tsx') and f != 'DashboardScreen.tsx':
        p = os.path.join(d, f)
        with open(p, 'r', encoding='utf-8') as file:
            c = file.read()
        
        # 1. Remove the standalone fontFamily lines that were injected
        lines = c.split('\n')
        out = []
        for line in lines:
            if re.match(r"^\s*fontFamily: 'Poppins-Regular',\s*$", line):
                continue
            out.append(line)
        c = '\n'.join(out)
        
        # 2. Inject inside the object before fontSize
        # First remove any existing fontFamily we injected in the line
        c = re.sub(r"fontFamily:\s*'Poppins-(Bold|Medium|Regular)',\s*", '', c)
        
        # Replace fontWeight: '800'/'bold' with fontFamily: 'Poppins-Bold'
        c = re.sub(r"fontWeight:\s*['\"`](800|900|bold)['\"`]?,?", r"fontFamily: 'Poppins-Bold',", c)
        # Replace fontWeight: '500'/'600'/'700' with fontFamily: 'Poppins-Medium'
        c = re.sub(r"fontWeight:\s*['\"`](500|600|700)['\"`]?,?", r"fontFamily: 'Poppins-Medium',", c)
        
        # Inject Poppins-Regular into lines that have fontSize but no fontFamily yet
        def inject_font(m):
            return "fontFamily: 'Poppins-Regular', " + m.group(0)
        
        c = re.sub(r"(?<!fontFamily:\s'Poppins-Bold',\s)(?<!fontFamily:\s'Poppins-Medium',\s)fontSize:\s*\d+", inject_font, c)
        
        with open(p, 'w', encoding='utf-8') as file:
            file.write(c)
print('Fixed fonts')
