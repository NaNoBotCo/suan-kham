#!/usr/bin/env python3
"""English for the senses and compounds the corpus has none for, drafted by an open-weights model.

    python3 tools/en_jobs.py                   → en/jobs.jsonl (only ids not yet in en/*.json)
    ~/.claude/bin/ow --jobs en/jobs.jsonl --outdir en/out --label suan-kham-en
    python3 tools/en_jobs.py --merge           → en/drafted.json from en/out/*
"""
import json, os, sys, glob, re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(HERE, 'data', 'heads')
EN = os.path.join(HERE, 'en')

# stylecheck: allow-start — the prompt names the banned words to keep them out of the drafts
PROMPT = """You write the English side of a Thai dictionary. For each item below give its meaning in plain English: 1 to 7 words, lower case unless a proper noun, no article at the start, no quotes, no explanation. A sense is one meaning of the head word; a compound is a whole word built on it, so give what the whole word means, not its parts. Prefer the everyday English word a bilingual dictionary prints over a description: ปรับอากาศ → air-conditioned, กองทัพอากาศ → air force, หัวหน้า → boss, leader. Use the Thai definition; the literal parts are only a hint. Never use these words: honest, authentic, tourist, real, just, actually, key, vital.

Answer with one JSON object and nothing else: {"<id>": "<english>", ...} with every id below.

"""
# stylecheck: allow-end


def have():
    out = {}
    for f in glob.glob(os.path.join(EN, '*.json')):
        out.update(json.load(open(f, encoding='utf-8')))
    return out


def items():
    done = have()
    for f in sorted(glob.glob(os.path.join(D, '*.json'))):
        h = json.load(open(f, encoding='utf-8'))
        ctx = f'{h["th"]} ({h["r"]}; English for the whole word: {h["en"] or "none"})'
        for sn in h['senses']:
            sid = f'{h["s"]}#{sn["n"]}'
            if not sn['en'] and sid not in done and sn['th']:
                yield h['s'], {'id': sid, 'kind': 'sense of ' + ctx, 'thai definition': sn['th'][:300], 'how it grew': sn['vn'][:160]}
            for c in sn['c']:
                cid = f'{sid}:{c["th"]}'
                if not c['en'] and cid not in done:
                    yield h['s'], {'id': cid, 'kind': f'compound of {h["th"]}', 'word': c['th'], 'romanised': c['r'],
                                   'thai definition': c['gth'][:260], 'literal parts': c['lit']}


def jobs():
    batch, out, n = [], [], 0
    for _, it in items():
        batch.append(it)
        if len(batch) >= 45:
            out.append(batch); batch = []
    if batch:
        out.append(batch)
    with open(os.path.join(EN, 'jobs.jsonl'), 'w', encoding='utf-8') as f:
        for i, b in enumerate(out):
            f.write(json.dumps({'id': f'en{i:03d}', 'prompt': PROMPT + json.dumps(b, ensure_ascii=False, indent=0)}, ensure_ascii=False) + '\n')
            n += len(b)
    print(len(out), 'jobs', n, 'items')


def merge():
    want = {it['id'] for _, it in items()}
    got = {}
    for f in sorted(glob.glob(os.path.join(EN, 'out', '*'))):
        t = open(f, encoding='utf-8').read()
        m = re.search(r'\{.*\}', t, re.S)
        if not m:
            print('no json', f); continue
        try:
            d = json.loads(m.group(0))
        except Exception as e:
            print('bad json', f, e); continue
        for k, v in d.items():
            if k in want and isinstance(v, str) and 0 < len(v) < 90:
                got[k] = v.strip().strip('.')
    p = os.path.join(EN, 'drafted.json')
    old = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    old.update(got)
    json.dump(old, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('merged', len(got), 'of', len(want), '→', len(old), 'in drafted.json')


if __name__ == '__main__':
    merge() if '--merge' in sys.argv else jobs()
