"""Create a page from tools/page.tpl: python3 tools/mkpage.py drills "Deal Math · Deal Drills" "desc" js/gen.js js/drills.js"""
import sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
page, title, desc, *scripts = sys.argv[1:]
tpl = (root / 'tools/page.tpl').read_text()
out = tpl.replace('__TITLE__', title).replace('__DESC__', desc).replace('__PAGE__', page)
out = out.replace('__SCRIPTS__', '\n'.join(f'<script src="{s}"></script>' for s in scripts))
(root / f'{page}.html').write_text(out)
print('wrote', page + '.html')
