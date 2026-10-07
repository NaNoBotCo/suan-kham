#!/usr/bin/env python3
"""The Word Garden's data, from the wichaa lexicon's filed heads.

Reads manuscript-wiki/data/lexicon: filing/<slug>.json (the 180 filed heads and their rules),
entries/<slug>.json (senses, EXTENDS chains, compounds), domains.json, FILING_LOG.md (the filer's
notebook), and en/*.json here (English this project wrote for senses and compounds the corpus has
none for). Writes data/index.json and data/heads/<slug>.json. Reads the corpus, writes nothing to it.

    python3 tools/build_data.py
"""
import json, glob, os, re, collections, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import roots as R

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEX = os.environ.get('SUANKHAM_LEXICON', os.path.join(HERE, '..', 'manuscript-wiki', 'data', 'lexicon'))   # the wichaa lexicon, a sibling checkout
OUT = os.path.join(HERE, 'data')
GAP = re.compile(r'^\[')   # "[RID sense 1 — no English yet]", "[needs a gloss]"


def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def en_of(g):
    v = [x for x in (g or {}).get('en') or [] if x and not GAP.match(x)]
    return '; '.join(v[:3])


def origin(ety):
    s = (ety or {}).get('summary', '') if isinstance(ety, dict) else ''
    if not s:
        return 'unknown'
    m = re.search(r'ยืมมาจาก\s*(\S+)', s) or re.match(r'(?:จาก|มาจาก)\s*(\S+)', s)
    w = m.group(1) if m else ''
    for k, v in [('สันสกฤต', 'sanskrit'), ('บาลี', 'pali'), ('เขมร', 'khmer'), ('มอญ', 'mon'), ('จีน', 'chinese'),
                 ('เวียดนาม', 'vietnamese'), ('อังกฤษ', 'english'), ('เปอร์เซีย', 'persian'), ('มลายู', 'malay'), ('โปรตุเกส', 'portuguese')]:
        if k in w:
            return v
    if re.search(r'สืบทอดจากไท|ร่วมเชื้อสาย|^Native', s):
        return 'tai'
    if re.search(r'เทียบเขมร', s):
        return 'khmer'
    if re.search(r'เทียบจีน', s):
        return 'chinese'
    return 'other'


# ---------------------------------------------------------------- the notebook
# the log is also the filer's working diary to Nan; the garden keeps the paragraphs about words
WORKLOG = re.compile(r"\bNan(?:['’]s|\*|,|\.|:|;| should| says| asked| on\b| to\b)|publish|deploy|\bsessions? (?:is|was|running|mid)|another session|scheduled|this task|the task|\bbuild\b|Build\b|commit|launchd|cron|/Users|~/|[\w-]+\.(?:py|json|sh|md|txt)\b|DEFECT|collision|concurrency|validator|verify|\bdocs\b|nanobotco-lanna|wichaa\.net|lock\b|\bI (?:could not|cannot) fix|reported|swept|appender|appending", re.I)

def notebook(heads_th):
    """FILING_LOG.md cut into paragraphs, each with its date and section, and the heads it is about."""
    text = open(os.path.join(LEX, 'FILING_LOG.md'), encoding='utf-8').read()
    paras, date, h2, h3, buf = [], '', '', '', []
    def flush():
        if buf:
            t = '\n'.join(buf).strip()
            if t and not WORKLOG.search(t + ' ' + h3 + ' ' + h2):
                paras.append({'date': date, 'h2': h2, 'h3': h3, 'text': t})
        buf.clear()
    for line in text.split('\n'):
        if line.startswith('## '):
            flush(); h2 = line[3:].strip(); h3 = ''
            m = re.match(r'(\d{4}-\d{2}-\d{2})', h2); date = m.group(1) if m else date
        elif line.startswith('### '):
            flush(); h3 = line[4:].strip()
        elif not line.strip():
            flush()
        else:
            buf.append(line)
    flush()
    # a head is named when its spelling stands alone: not inside a longer Thai word
    TH = '฀-๿'
    pat = {th: re.compile(r'(?<![' + TH + '])' + re.escape(th) + r'(?![' + TH + '])') for th in heads_th}
    about = collections.defaultdict(list)     # th -> para ids where it is the subject
    mention = collections.defaultdict(list)   # th -> para ids where it is named
    for i, p in enumerate(paras):
        head_line = p['h3'] or p['h2']
        lead = re.match(r'\*\*([^*]+)\*\*', p['text'])
        for th, rx in pat.items():
            row = any(l.startswith('|') and rx.search(l) for l in p['text'].split('\n'))
            if rx.search(head_line) or row or (lead and lead.group(1).startswith(th) and rx.search(lead.group(1))):
                about[th].append(i)
            elif rx.search(p['text']):
                mention[th].append(i)
    return paras, about, mention


def first_filed(paras, about):
    out = {}
    for th, ids in about.items():
        ds = [paras[i]['date'] for i in ids if paras[i]['date']]
        if ds:
            out[th] = min(ds)
    return out


# ---------------------------------------------------------------- build
def main():
    slugs = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(LEX, 'filing', '*.json')))
    doms = load(os.path.join(LEX, 'domains.json'))['domains']
    en = {}
    for f in sorted(glob.glob(os.path.join(HERE, 'en', '*.json'))):
        en.update(load(f))
    E = {s: load(os.path.join(LEX, 'entries', s + '.json')) for s in slugs}
    F = {s: load(os.path.join(LEX, 'filing', s + '.json')) for s in slugs}
    th2slug = {}
    for s in slugs:
        th2slug.setdefault(E[s]['th'], s)
    # every entry in the corpus, filed or not, so a compound's part can say it is a headword
    allth = {}
    for f in glob.glob(os.path.join(LEX, 'entries', '*.json')):
        e = load(f); allth.setdefault(e['th'], os.path.basename(f)[:-5])
    paras, about, mention = notebook(list(th2slug))
    TRI = R.thairoots()
    filed_on = first_filed(paras, about)

    words = collections.defaultdict(lambda: {'as': [], 'in': []})   # any Thai string → where it stands
    edges = collections.defaultdict(set)                             # head ↔ head through a compound
    index_heads, compounds_flat, look_flat = [], [], []
    os.makedirs(os.path.join(OUT, 'heads'), exist_ok=True)

    for s in slugs:
        e, fl = E[s], F[s]
        senses, nC = [], 0
        for sn in e.get('senses', []):
            n = sn['n']; sid = f'{s}#{n}'
            cs = []
            for c in sn.get('compounds', []):
                cid = f'{sid}:{c["th"]}'
                parts = c.get('parts') or []
                other = [p for p in parts if p != e['th']]
                cs.append({
                    'th': c['th'], 'r': c.get('rtgs', ''), 'ipa': c.get('ipa', ''),
                    'en': en_of(c.get('gloss')) or en.get(cid, ''), 'enx': 0 if en_of(c.get('gloss')) else (1 if en.get(cid) else 0),
                    'gth': (c.get('gloss') or {}).get('th', ''), 'lit': c.get('lit', ''),
                    'parts': parts, 'pat': c.get('pattern') or '', 'fr': c.get('frame') or '',
                    'head': c.get('head'), 'conf': c.get('conf', ''), 'x': c.get('cross_listed') or [],
                })
                words[c['th']]['as'].append([s, n])
                for p in parts:
                    words[p]['in'].append([c['th'], s, n])
                    if p in th2slug and th2slug[p] != s:
                        edges[tuple(sorted((s, th2slug[p])))].add(c['th'])
                for x in c.get('cross_listed') or []:
                    if x in th2slug and th2slug[x] != s:
                        edges[tuple(sorted((s, th2slug[x])))].add(c['th'])
                compounds_flat.append([c['th'], c.get('rtgs', ''), cs[-1]['en'], s, n, c.get('pattern') or '', c.get('frame') or ''])
            nC += len(cs)
            g = sn.get('gloss') or {}
            senses.append({
                'n': n, 'en': en_of(g) or en.get(sid, ''), 'enx': 0 if en_of(g) else (1 if en.get(sid) else 0),
                'th': g.get('th', ''), 'pos': sn.get('pos', ''), 'posth': sn.get('pos_th', ''),
                'd': sn.get('domains') or [], 'ext': sn.get('extends'), 'via': sn.get('via'), 'vn': sn.get('via_note', ''),
                'c': cs,
            })
        un = e.get('compounds_unassigned') or []
        lookalikes = [{'th': c['th'], 'r': c.get('rtgs', ''), 'use': c.get('use'), 'note': re.sub(r'^.*?·\s*', '', c.get('note', '')),
                       'gth': (c.get('gloss') or {}).get('th', ''), 'en': en_of(c.get('gloss'))} for c in un if c.get('use') in ('false-split', 'spelling-variant', 'toponym', 'biological', 'personal-name')]
        left = [{'th': c['th'], 'r': c.get('rtgs', ''), 'gth': (c.get('gloss') or {}).get('th', '')} for c in un if not c.get('use')]
        for c in lookalikes:
            words[c['th']]['as'].append([s, 0])
            look_flat.append([c['th'], c['r'], s, c['use'], c['note'][:220]])
        dset = []
        for sn in senses:
            for d in sn['d']:
                if d not in dset:
                    dset.append(d)
        ety = e.get('etymology') or {}
        note_ids = about.get(e['th'], [])
        head = {
            's': s, 'th': e['th'], 'r': e.get('rtgs', ''), 'p': e.get('paiboon', ''), 'ipa': e.get('ipa', ''),
            'resp': e.get('syllable_respelling', ''), 'en': ', '.join((e.get('bridge_en') or [])[:4]),
            'freq': e.get('freq', ''), 'o': origin(ety), 'ety': ety.get('summary', ''),
            'roots': R.roots_for(e['th'], ety.get('summary', ''), TRI),
            'rule': fl.get('rule', ''), 'filed': filed_on.get(e['th'], ''), 'd': dset,
            'senses': senses, 'look': lookalikes, 'left': left,
            'notes': [paras[i] for i in note_ids][:40],
            'mentions': sorted({th2slug[t] for t, ids in list(mention.items()) + list(about.items()) if set(ids) & set(note_ids) and th2slug[t] != s}),
        }
        with open(os.path.join(OUT, 'heads', s + '.json'), 'w', encoding='utf-8') as f:
            json.dump(head, f, ensure_ascii=False, separators=(',', ':'))
        words[e['th']]['as'].insert(0, [s, -1])
        index_heads.append({
            's': s, 'th': e['th'], 'r': e.get('rtgs', ''), 'p': e.get('paiboon', ''), 'en': head['en'],
            'o': head['o'], 'd': dset, 'ns': len(senses), 'nc': nC, 'nl': len(lookalikes), 'filed': head['filed'],
            'sen': [[sn['n'], sn['en'], sn['ext'], sn['via'] or '', len(sn['c']), sn['vn']] for sn in senses],
            'ety': head['ety'][:140], 'nu': len(left), 'nr': len(head['roots']['from']) + len(head['roots']['cog']) + sum(len(t['der']) + 1 for t in head['roots']['tr']),
        })

    # words that stand somewhere other than as their own head: the wandering index
    W = {}
    for th, v in words.items():
        if len(v['as']) + len(v['in']) < 1:
            continue
        W[th] = {'a': v['as'][:24], 'i': v['in'][:60]}
        if th in allth:
            W[th]['e'] = allth[th]
    idx = {
        'heads': index_heads,
        'domains': dict({k: {'th': v['th'], 'en': v['en']} for k, v in doms.items()}, **{'d:toponym': {'th': 'ชื่อบ้านนามเมือง', 'en': 'place names'}, 'd:material': {'th': 'วัสดุ', 'en': 'stuff and material'}}),
        'look': look_flat,
        'edges': sorted([[a, b, len(v), sorted(v)[:6]] for (a, b), v in edges.items()], key=lambda r: -r[2]),
        'compounds': compounds_flat,
        'words': W,
        'counts': {'heads': len(slugs), 'senses': sum(h['ns'] for h in index_heads), 'compounds': len(compounds_flat),
                   'lookalikes': sum(h['nl'] for h in index_heads), 'notes': len(paras)},
    }
    th_heads = {v: k for k, v in th2slug.items()}
    notes = [{'d': p['date'], 'h2': p['h2'], 'h3': p['h3'], 't': p['text'],
              'a': sorted({th2slug[t] for t, ids in about.items() if i in ids})} for i, p in enumerate(paras)]
    with open(os.path.join(OUT, 'notes.json'), 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(idx, f, ensure_ascii=False, separators=(',', ':'))
    print(json.dumps(idx['counts']), 'edges', len(idx['edges']), 'words', len(W),
          'index KB', os.path.getsize(os.path.join(OUT, 'index.json')) // 1024)


if __name__ == '__main__':
    main()
