"""Group the A7 Blocked cases by what would unblock them (used by review.py and the run's report.md)."""
import re

ORDER = ["fault injection", "credits", "uninstall / new account", "daily limit", "language", "paid tier",
         "template full generation (REQ-019)", "other"]


def group(r):
    n, a = r["Needs"], r["Actual"]
    t = f"{n} {a}".lower()
    if "full-generation" in n:
        return "template full generation (REQ-019)"
    if re.search(r"daily (free )?chat (allowance|limit)|remote-config|chat-count", t):
        return "daily limit"
    if re.search(r"fault-injection|slow-generation|stt-failure", n) or re.search(r"no failed (clip|scene)|no fault switch", a, re.I):
        return "fault injection"
    if "new-account" in n or re.search(r"fresh install|uninstall|reinstall|first ai mini drama use|once per user|not the first video", a, re.I):
        return "uninstall / new account"
    if "app-language" in n or re.search(r"system language|app language", a, re.I):
        return "language"
    if "paid-tier" in n:
        return "paid tier"
    if re.search(r"low-balance|purchase|balance \d+|credits kept|not bought", t):
        return "credits"
    return "other"
