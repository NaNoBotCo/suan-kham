"""Roots under each tree: the etymology the lexicon records (ancestor forms, cognates, comparisons)
and the ThaiRoots inventory (thairoots/index.html DATA: 257 roots, 974 derived words)."""
import json, os, re

TR = os.environ.get('SUANKHAM_THAIROOTS', os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'thairoots', 'index.html'))
LANG = {
    'ไทดั้งเดิม': 'Proto-Tai', 'ไทตะวันตกเฉียงใต้ดั้งเดิม': 'Proto-Southwestern Tai', 'ลาว': 'Lao', 'คำเมือง': 'Northern Thai', 'เขิน': 'Khün',
    'ไทลื้อ': 'Tai Lue', 'ไทดำ': 'Tai Dam', 'ไทขาว': 'Tai Dón', 'ไทใหญ่': 'Shan', 'ไทใต้คง': 'Tai Nüa', 'อาหม': 'Ahom', 'พ่าเก': 'Phake',
    'อ่ายตน': 'Aiton', 'จ้วง': 'Zhuang', 'จ้วงแบบจั่วเจียง': 'Zuojiang Zhuang', 'จ้วงแบบหนง': 'Nong Zhuang', 'จ้วงใต้': 'Southern Zhuang',
    'ภาษาจ้วงใต้': 'Southern Zhuang', 'ปู้อี': 'Bouyei', 'แสก': 'Saek', 'ญ้อ': 'Nyaw', 'อีสาน': 'Isan', 'ปักษ์ใต้': 'Southern Thai', 'ตั่ย': 'Tày',
    'สันสกฤต': 'Sanskrit', 'บาลี': 'Pali', 'เขมร': 'Khmer', 'เขมรเก่า': 'Old Khmer', 'เขมรกลาง': 'Middle Khmer', 'เขมรเก่าสมัยอังกอร์': 'Angkorian Old Khmer',
    'เขมรเก่าสมัยก่อนอังกอร์': 'pre-Angkorian Old Khmer', 'จีน': 'Chinese', 'จีนเก่า': 'Old Chinese', 'จีนยุคกลาง': 'Middle Chinese', 'สุ่ย': 'Sui',
    'ต้งใต้': 'Southern Dong', 'เบดั้งเดิม': 'Proto-Be', 'มอญ': 'Mon', 'มอญ-เขมรดั้งเดิม': 'Proto-Mon-Khmer', 'เวียดนาม': 'Vietnamese',
    'อังกฤษ': 'English', 'เปอร์เซีย': 'Persian', 'มลายู': 'Malay', 'ออสโตรนีเซียนดั้งเดิม': 'Proto-Austronesian', 'กลุ่มภาษาหมิ่น': 'Min Chinese',
    'ฮกเกี้ยน': 'Hokkien', 'แต้จิ๋ว': 'Teochew', 'กวางตุ้ง': 'Cantonese', 'โปรตุเกส': 'Portuguese', 'ฮินดี': 'Hindi', 'ทมิฬ': 'Tamil', 'อาหรับ': 'Arabic',
}
TH = '฀-๿'


def item(s):
    """'คำเมือง ᨯᩯ᩠ᨦ (แดง)' → [lang_th, lang_en, form, reading]"""
    s = s.strip().strip('.').strip()
    m = re.match(r'(?:ภาษา)?([' + TH + r'\-]+)\s+(.+)', s)
    if not m:
        return None
    lang, rest = m.group(1), m.group(2)
    if lang not in LANG and not lang.endswith('ดั้งเดิม'):
        return None
    rd = re.search(r'\(([' + TH + r'฀-๿̂\s]+)\)', rest)
    form = rest.split()[0].strip(',') if rest.split() else ''
    gl = re.search(r'“([^”]+)”', rest)
    if not form or len(form) > 40:
        return None
    return [lang, LANG.get(lang, ''), form, rd.group(1).strip() if rd else '', gl.group(1) if gl else '']


def etymology(summary):
    out = {'from': [], 'cog': [], 'cf': []}
    if not summary:
        return out
    for clause in re.split(r';|(?<=\))\.\s|\s(?=ร่วมเชื้อสายกับ)|\s(?=เทียบ)', summary):
        c = clause.strip()
        m = re.match(r'(สืบทอดจาก|ยืมมาจาก|มาจาก|จาก)(.+)', c)
        if m:
            for part in re.split(r',\s*จาก|,\s*(?=จาก)|\s*,\s*หรือ\s*|,\s*(?=[' + TH + r']+\s)', m.group(2)):
                it = item(re.sub(r'^จาก', '', part.strip()))
                if it and it not in out['from']:
                    out['from'].append(it + ([m.group(1) == 'ยืมมาจาก'] and ['loan' if m.group(1) == 'ยืมมาจาก' else 'kin']))
            continue
        m = re.match(r'ร่วมเชื้อสายกับ(.+)', c)
        if m:
            for part in re.split(r'[,，]', m.group(1)):
                it = item(part)
                if it and not any(x[2] == it[2] and x[0] == it[0] for x in out['cog']):
                    out['cog'].append(it)
            continue
        m = re.match(r'เทียบ(.+)', c)
        if m:
            for part in re.split(r'[,，]|\sและ', m.group(1)):
                it = item(part)
                if it:
                    out['cf'].append(it)
    out['cog'] = out['cog'][:16]; out['cf'] = out['cf'][:6]; out['from'] = out['from'][:4]
    return out


def thairoots():
    s = open(TR, encoding='utf-8').read()
    i = s.find('const DATA = ') + len('const DATA = ')
    D, _ = json.JSONDecoder().raw_decode(s[i:])
    by_root, by_der = {}, {}
    for kind in ('native', 'indic', 'affix'):
        for r in D[kind]:
            row = {'id': r.get('id', ''), 'kind': kind, 'root': r['root'], 'gloss': r.get('gloss', ''), 'gth': r.get('gth', ''),
                   'pali': r.get('pali', ''), 'note': r.get('note', ''), 'noteT': r.get('noteT', ''),
                   'der': [[x['t'], x.get('r', ''), x.get('g', ''), x.get('n', ''), x.get('s', '')] for x in r.get('der', []) if x.get('t')]}
            by_root.setdefault(r['root'], row)
            for x in r.get('der', []):
                if x.get('t'):
                    by_der.setdefault(x['t'], []).append(row)
    return by_root, by_der


def roots_for(th, summary, TRI):
    by_root, by_der = TRI
    out = etymology(summary)
    fam = []
    if th in by_root:
        fam.append(dict(by_root[th], rel='root'))
    for r in by_der.get(th, [])[:2]:
        fam.append(dict(r, rel='from', der=[d for d in r['der'] if d[0] != th]))
    out['tr'] = fam
    return out
