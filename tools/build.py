#!/usr/bin/env python3
"""src/ + data/ → docs/, the folder that gets published.   python3 tools/build.py"""
import os, shutil, glob

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'docs')
# empty it in place: a server pointed at docs/ keeps working across builds
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    p = os.path.join(OUT, f)
    shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
os.makedirs(os.path.join(OUT, 'data', 'heads'))
for f in glob.glob(os.path.join(HERE, 'src', '*')):
    shutil.copy(f, OUT)
for f in ['index.json', 'notes.json']:
    shutil.copy(os.path.join(HERE, 'data', f), os.path.join(OUT, 'data', f))
for f in glob.glob(os.path.join(HERE, 'data', 'heads', '*.json')):
    shutil.copy(f, os.path.join(OUT, 'data', 'heads'))
n = sum(len(fs) for _, _, fs in os.walk(OUT)); kb = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs) // 1024
print('docs/', n, 'files', kb, 'KB')

# the Artifact page: the same page without its own document skeleton (the host wraps it)
import re
src = open(os.path.join(OUT, 'index.html'), encoding='utf-8').read()
head = re.search(r'<head>(.*?)</head>', src, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', src, re.S).group(1)
head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head)
title = re.search(r'<title>.*?</title>', head).group(0)
head = head.replace(title, '')
page = title + '\n' + head.strip() + '\n<div translate="no" class="notranslate">\n' + body.strip() + '\n</div>\n'
open(os.path.join(HERE, 'artifact.html'), 'w', encoding='utf-8').write(page)
print('artifact.html', len(page))
