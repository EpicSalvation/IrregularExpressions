# IrregularExpressions

A browser-based regex learning game. Write patterns, match signals, earn XP.

**Pull signal from noise.**

---

## What it is

Irregular Expression is a single-page puzzle game where each challenge presents a corpus of log lines and asks you to write a regular expression that matches exactly the right ones. No frameworks, no build step — pure HTML/CSS/ES2020.

---

## Current state — World 1: Log File Detective

Six challenges set at the SETI Institute, where an anomalous overnight transmission needs to be triaged from a noisy data pipeline.

| ID  | Title            | Concept covered                        |
|-----|------------------|----------------------------------------|
| 1-1 | First Day        | Escaping special characters (`\[`)     |
| 1-2 | Static on the Line | Dot wildcard as separator absorber   |
| 1-3 | Repeat Offender  | `\d+` vs `\d*` precision              |
| 1-4 | Optional Protocol | `?` optionality, grouping with `()`  |
| 1-S | Redacted *(side)* | Literal dot `\.`, IP address pattern |
| 1-B | The Incident *(boss)* | Combined: escaping + `\d` + `.*` |

### Features

- **Live highlighting** — corpus lines update as you type, showing matches in real time
- **Par scoring** — each challenge has a character-count par; beating it awards bonus XP
- **Hints** — available at an XP cost
- **Learning Mode** — collapsible concept panel on challenges 1-1 through 1-4 explaining the relevant regex construct
- **Reference solution** — revealed on the success screen after completing a challenge
- **Campaign map** — SVG node graph with unlock progression; side and boss challenges marked
- **Leaderboard** — seeded stub data; your XP injected dynamically from localStorage
- **XP persistence** — progress saved to localStorage; clear it in DevTools to reset

---

## Running it

Open `irregular-expression.html` in any modern browser. No server required.

---

## File structure

```
irregular-expression.html   — markup and screen layout
irregular-expression.css    — all styles (CSS custom properties for easy reskin)
irregular-expression.js     — campaign data, validation engine, screen logic
```

---

## Planned

- World 2 (character classes, anchors, groups)
- Regularcade mini-games (Corpus Match, Timed Drill, Head-to-Head, Regex Crossword, Pattern Surgeon)
- The Gallery — community pattern submissions
- Account system + live leaderboard API
