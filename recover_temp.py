import ast
with open('temp_DashboardScreen.txt', 'r', encoding='utf-8') as f:
    txt = f.read().strip()

if txt.startswith('"') and txt.endswith('"'):
    # ast.literal_eval safely evaluates Python string literals
    # since JSON strings are valid Python strings (mostly), we can evaluate it if we treat it as raw or regular string.
    try:
        content = ast.literal_eval(txt)
        with open('src/screens/DashboardScreen.tsx', 'w', encoding='utf-8') as out:
            out.write(content)
        print("Success using ast.literal_eval")
    except Exception as e:
        print("ast literal_eval failed:", e)
else:
    print("Not a string literal")
