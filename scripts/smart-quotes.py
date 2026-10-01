"""Curl straight quotes in article prose, leaving code, math and markers alone."""
import re, sys

PROTECT = re.compile(r"(`[^`]*`|\$\$[^$]*\$\$|\$[^$\n]*\$|:::experiment \w+:::|\[\^[\w-]+\]|\]\([^)]*\))")

def curl(text):
    text = re.sub(r"(?<=\w)'(?=\w)", "\u2019", text)
    text = re.sub(r"(^|[\s(\[\u2014-])'", "\\1\u2018", text)
    text = text.replace("'", "\u2019")
    text = re.sub(r'(^|[\s(\[\u2014-])"', "\\1\u201c", text)
    return text.replace('"', "\u201d")

for path in sys.argv[1:]:
    out, fence = [], False
    for line in open(path, encoding="utf-8").read().split("\n"):
        if re.match(r"^\s*(```|~~~)", line):
            fence = not fence
        if fence or line.startswith("```"):
            out.append(line)
            continue
        parts = PROTECT.split(line)
        out.append("".join(part if i % 2 else curl(part) for i, part in enumerate(parts)))
    open(path, "w", encoding="utf-8").write("\n".join(out))
