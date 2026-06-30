import ast, os
issues = []
checked = 0
for base in ['backend', 'tests']:
    for root, dirs, files in os.walk(base):
        if '__pycache__' in root:
            continue
        for f in files:
            if not f.endswith('.py'):
                continue
            path = os.path.join(root, f)
            checked += 1
            try:
                ast.parse(open(path, encoding='utf-8').read(), filename=path)
            except SyntaxError as e:
                issues.append(f'{path}: {e}')
print(f'Checked {checked} files')
print('CLEAN' if not issues else issues)
