import os
import glob
import re

screens_dir = 'src/screens'
files = glob.glob(os.path.join(screens_dir, '*.tsx'))

issues = []

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Look for calls to schoolApi
    # Example: schoolApi.getMyProfile()
    api_calls = re.finditer(r'schoolApi\.([a-zA-Z0-9_]+)\(', content)
    for match in api_calls:
        api_method = match.group(1)
        # Check if this call is followed by .catch or is inside a try block
        # A simple heuristic is to check the lines around the call
        start_idx = max(0, match.start() - 200)
        end_idx = min(len(content), match.end() + 200)
        context = content[start_idx:end_idx]

        has_catch = '.catch' in context
        has_try = 'try {' in context or 'try{' in context

        if not has_catch and not has_try:
            issues.append(f"{os.path.basename(file_path)}: Potential unhandled API call: schoolApi.{api_method}()")

if issues:
    print("Found potential unhandled API calls:")
    for issue in set(issues):
        print(f"- {issue}")
else:
    print("All API calls seem to be handled (have try/catch or .catch).")
