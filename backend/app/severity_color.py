def severity_color(sev: str) -> str:
    return {
        "GREEN": "#16a34a",
        "YELLOW": "#ca8a04",
        "RED": "#dc2626",
        "BLACK": "#111827",
    }.get(sev, "#334155")
