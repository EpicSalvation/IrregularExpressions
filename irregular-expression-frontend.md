# Claude Code Prompt: Irregular Expression — Frontend Prototype

## Project Identity

**Full title:** Irregular Expression  
**Compact form:** IrregEx  
**Tagline:** Pull signal from noise.

**Sub-sections (stubs only in this build):**
- **Regularcade** — unlockable arcade of skill-specific mini-games (post-campaign)
- **Gallery** — community regex submissions presented as framed works of art

---

## Deliverable

Three files in the same directory:

```
index.html
irregular-expression.css
irregular-expression.js
```

HTML links to the CSS and JS via relative paths (`<link rel="stylesheet">` and `<script src="">`). No frameworks, no build step. No external dependencies except optionally a monospace Google Font (JetBrains Mono via CDN in the HTML `<head>` is acceptable). Must run by opening `index.html` directly in a browser — no server required.

**File responsibilities:**
- `index.html` — structure and markup only. No inline styles, no inline scripts.
- `irregular-expression.css` — all visual styling, palette variables, animations, and layout. Use CSS custom properties (`--color-bg`, `--color-accent`, etc.) defined in `:root` so the theme is easy to reskin later.
- `irregular-expression.js` — all logic: campaign data constant, validation engine, scoring, localStorage read/write, screen transitions, live highlighting, and all stub definitions (leaderboard seed data, stub API call comments).

---

## Architecture

### Screens

```
Title Screen
    └── Campaign Map (world/challenge selection)
            └── Challenge Screen (active puzzle)
                    ├── Success Screen (XP awarded, par result, concept debrief)
                    └── Failure Screen (retry / buy hint)
            └── World Complete Screen (boss defeated)
    └── Leaderboard Screen (stub — seeded with fake data)
    └── Regularcade Screen (stub — "Unlocks after completing the campaign")
    └── Gallery Screen (stub — "Coming soon")
```

### localStorage Schema

```js
{
  "rxg_progress": {
    "completedChallenges": ["1-1", "1-2"],  // challenge IDs
    "xp": 425,
    "scores": {
      "1-1": {
        "xp": 75,
        "regexUsed": "\\[ERROR\\].*",
        "charCount": 10,
        "hintUsed": false
      }
    }
  },

  // STUB: In v1 this is seeded with fake entries.
  // Replace with GET /api/leaderboard in v2.
  // Auth token passed as Authorization: Bearer <token>
  "rxg_leaderboard": [
    { "name": "ghost_signal",  "xp": 2840 },
    { "name": "null_pointer",  "xp": 2415 },
    { "name": "regex_raven",   "xp": 1990 },
    { "name": "segfault_sara", "xp": 1750 },
    { "name": "bytewitch",     "xp": 1340 }
    // "You" entry injected dynamically from localStorage
  ]
}
```

---

## Visual Design

**Overall aesthetic:** Dark terminal. Not garish hacker-movie green — muted, professional. The player is an analyst, not a script kiddie.

**Palette:**
- Background: `#1a1a2e` (deep charcoal navy)
- Surface: `#16213e` (slightly lighter panels)
- Accent: `#0f9b8e` (muted teal — primary interactive)
- Match highlight: `#f5a623` (amber — matched substrings)
- Success: `#4caf50` (green)
- Failure/error: `#e53935` (red)
- Boss accent: `#f5a623` (gold/amber)
- Text primary: `#e0e0e0`
- Text muted: `#7a7a9a`

**Typography:**
- Monospace (JetBrains Mono or system fallback) for: regex input, corpus text, challenge IDs, XP numbers
- Sans-serif (system) for: UI chrome, briefings, menus

**Match highlighting:** Matched substrings in the corpus update live as the user types. Background color changes to amber on matched characters. Non-matched required lines get a red left border. Incorrectly matched excluded lines get a red left border. When all conditions are satisfied, a green "LOCKED IN" indicator appears near the input.

---

## Campaign Map

- Visual node graph, not a list
- Worlds are large labeled circles connected by a main path
- Challenges within a world are smaller nodes branching off their world node
- **Boss node:** Larger, amber/gold color, distinct visual weight
- **Side challenge node:** Branches off at an angle with a dashed connector line
- **Completed nodes:** Filled with accent color, subtle glow
- **Locked nodes:** Muted/grayed, padlock icon
- **Current/available node:** Pulsing outline animation

Challenge nodes unlock sequentially within a world. 1-S (side challenge) unlocks alongside 1-4, not as a prerequisite for 1-B.

---

## Challenge Screen Layout

```
[World title]          [XP total]
[Challenge ID + title]

BRIEFING:
[One-line narrative text]

CORPUS:
[line 1]
[line 2]  ← highlighted if matched
[line 3]
...

YOUR PATTERN:
[ regex input field ]  [14 chars | par: 10]

[HINT -10pts]          [TEST]   [SUBMIT]

[Inline error message if regex is invalid]
```

**Live validation:** Fires on every keystroke. `TEST` is visual feedback only. `SUBMIT` locks in the attempt and triggers scoring.

---

## Scoring System

```js
// Core validation — browser's native RegExp engine
function validateAttempt(userPattern, challenge, hintUsed) {
  let regex;
  try {
    regex = new RegExp(userPattern);
  } catch (e) {
    // Invalid regex syntax — show inline error, do not score
    return { valid: false, error: e.message };
  }

  const matchPasses  = challenge.mustMatch.every(s => regex.test(s));
  const excludePasses = challenge.mustNotMatch.every(s => !regex.test(s));
  const passed       = matchPasses && excludePasses;
  const atPar        = userPattern.length <= challenge.par;
  const hintPenalty  = hintUsed ? challenge.hintCost : 0;

  let xpAwarded = 0;
  if (passed) {
    xpAwarded = challenge.baseXP - hintPenalty;
    if (atPar) xpAwarded += challenge.parBonusXP;
  }

  return {
    valid: true,
    passed,
    matchPasses,
    excludePasses,
    charCount: userPattern.length,
    atPar,
    xpAwarded
  };
}
```

---

## Success Screen

After passing a challenge:

1. **Concept debrief card** — display `challenge.conceptNote` as a brief "debrief" before the XP animation. This is where learning is reinforced, not during the challenge.

2. **XP animation** — animate XP counting up. Show:
   - Base XP awarded
   - Par bonus (if earned), with label "Under par!" in gold
   - Hint penalty (if applicable), in red
   - Total XP this challenge
   - Running total XP

3. **Par comparison line:**
   `Your regex: 14 chars | Par: 10 chars`
   - Under par: gold text
   - At par: green text
   - Over par: white text (not penalized, just noted)

4. **Continue** button advances to next challenge or World Complete screen.

---

## Campaign Data: World 1 (Full)

```js
const CAMPAIGN = [
  {
    id: "world-1",
    title: "Log File Detective",
    subtitle: "Pull signal from noise.",
    narrative: "You're a junior analyst at a security firm. Your tools are broken. All you have is raw log output and pattern matching.",
    conceptsIntroduced: ["literals", "dot (any char)", "quantifiers: * + ?", "escaping with \\"],
    challenges: [

      // ─── Challenge 1-1 ───────────────────────────────────────────
      {
        id: "1-1",
        title: "First Day",
        briefing: "The server is throwing errors. Find them.",
        type: "match",
        corpus: [
          "[INFO] Server started on port 8080",
          "[ERROR] Disk space critical",
          "[INFO] Request received from 192.168.1.1",
          "[ERROR] Connection timeout",
          "[DEBUG] Cache miss for key user_4421",
          "[INFO] Shutdown complete"
        ],
        mustMatch: [
          "[ERROR] Disk space critical",
          "[ERROR] Connection timeout"
        ],
        mustNotMatch: [
          "[INFO] Server started on port 8080",
          "[INFO] Request received from 192.168.1.1",
          "[DEBUG] Cache miss for key user_4421",
          "[INFO] Shutdown complete"
        ],
        par: 10,
        baseXP: 50,
        parBonusXP: 25,
        referenceSolution: "\\[ERROR\\].*",
        hint: "Some characters mean something special to regex. Square brackets are one of them.",
        hintCost: 10,
        conceptNote: "Brackets must be escaped with \\ to match literally. Without escaping, [ starts a character class — which means something else entirely.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 1-2 ───────────────────────────────────────────
      {
        id: "1-2",
        title: "Static on the Line",
        briefing: "Timestamps are corrupted. The separator character is different in every entry. Match them anyway.",
        type: "match",
        corpus: [
          "2024-03-15 08:42:11 LOGIN success",
          "2024/03/15 09:11:03 LOGOUT user_99",
          "2024.03.15 10:00:00 LOGIN success",
          "2024 03 15 11:45:22 TIMEOUT",
          "2024-03-15 12:00:01 LOGIN success"
        ],
        // Validation: check that regex.exec(line)[0] equals the timestamp portion,
        // not the full line — match must be the date+time only.
        mustMatch: [
          "2024-03-15 08:42:11",
          "2024/03/15 09:11:03",
          "2024.03.15 10:00:00",
          "2024 03 15 11:45:22",
          "2024-03-15 12:00:01"
        ],
        mustNotMatch: [],
        par: 18,
        baseXP: 75,
        parBonusXP: 25,
        referenceSolution: "2024.03.15.\\d\\d:\\d\\d:\\d\\d",
        hint: "The . in regex matches ANY character — including -, /, and even a space.",
        hintCost: 10,
        conceptNote: "Dot (.) is a wildcard for any single character. Here that's a feature, not a bug — it lets one pattern absorb all separator variants.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 1-3 ───────────────────────────────────────────
      {
        id: "1-3",
        title: "Repeat Offender",
        briefing: "Someone is hammering the login endpoint. Flag any line with a valid user ID — they always end in digits.",
        type: "match",
        corpus: [
          "user_9 LOGIN failed",
          "user_102 LOGIN failed",
          "user_7743 LOGIN failed",
          "admin LOGIN success",
          "user_ LOGIN failed",
          "system REBOOT initiated",
          "user_0 LOGIN success"
        ],
        mustMatch: [
          "user_9 LOGIN failed",
          "user_102 LOGIN failed",
          "user_7743 LOGIN failed",
          "user_0 LOGIN success"
        ],
        mustNotMatch: [
          "admin LOGIN success",
          "user_ LOGIN failed",     // no digits after underscore — not a valid user ID
          "system REBOOT initiated"
        ],
        par: 7,
        baseXP: 75,
        parBonusXP: 25,
        referenceSolution: "user_\\d+",
        hint: "There's a difference between 'zero or more' and 'one or more.' Does a user with no ID exist?",
        hintCost: 10,
        conceptNote: "\\d+ requires one or more digits. \\d* would also match 'user_' (zero digits) — a false positive that slips past a lazy pattern.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 1-4 ───────────────────────────────────────────
      {
        id: "1-4",
        title: "Optional Protocol",
        briefing: "The logging format changed mid-deploy. Some entries have a severity code, some don't. Match all request lines regardless.",
        type: "match",
        corpus: [
          "GET /api/users 200",
          "GET /api/users [HIGH] 200",
          "POST /api/login 401",
          "POST /api/login [LOW] 200",
          "DELETE /api/session 200",
          "DELETE /api/session [MED] 500"
        ],
        mustMatch: [
          "GET /api/users 200",
          "GET /api/users [HIGH] 200",
          "POST /api/login 401",
          "POST /api/login [LOW] 200",
          "DELETE /api/session 200",
          "DELETE /api/session [MED] 500"
        ],
        mustNotMatch: [],
        par: 28,
        baseXP: 100,
        parBonusXP: 50,
        referenceSolution: "[A-Z]+ /api/\\w+ (\\[.*\\] )?\\d+",
        hint: "The ? quantifier makes the preceding group optional — present zero or one times.",
        hintCost: 10,
        conceptNote: "? makes a preceding group or character optional. Optionality must be explicitly modeled — regex won't silently skip tokens it doesn't recognize.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Side Challenge 1-S ──────────────────────────────────────
      {
        id: "1-S",
        title: "Redacted",
        briefing: "Legal wants certain log lines purged. Find every line containing an IP address. Don't catch anything else.",
        type: "exclude",
        corpus: [
          "Connection from 10.0.0.1 established",
          "Request from 255.255.255.0 blocked",
          "Redirect to 192.168.1.100 failed",
          "Error code 404 returned",
          "Version 2.0.1 deployed",
          "User 10 logged out"
        ],
        mustMatch: [
          "Connection from 10.0.0.1 established",
          "Request from 255.255.255.0 blocked",
          "Redirect to 192.168.1.100 failed"
        ],
        mustNotMatch: [
          "Error code 404 returned",   // has digits but no IP structure
          "Version 2.0.1 deployed",    // has dots but only 3 groups
          "User 10 logged out"         // lone number, no dots
        ],
        par: 20,
        baseXP: 0,
        parBonusXP: 150,              // bonus-only challenge — no base XP
        referenceSolution: "\\d+\\.\\d+\\.\\d+\\.\\d+",
        hint: "An IP address is four groups of digits separated by dots. Dots need escaping.",
        hintCost: 10,
        conceptNote: "\\. matches a literal dot. Without the backslash, . matches anything — including the dots in version numbers, which breaks your exclusions.",
        isSideChallenge: true,
        isBoss: false
      },

      // ─── Boss Challenge 1-B ──────────────────────────────────────
      {
        id: "1-B",
        title: "The Incident",
        briefing: "A breach happened at 03:xx:xx. Pull every suspicious entry from that hour. The analyst before you already went home. You're on your own.",
        type: "match",
        corpus: [
          "2024-01-20 02:59:58 user_7 LOGIN success",
          "2024-01-20 03:00:02 user_7 FILE_ACCESS /etc/passwd",
          "2024-01-20 03:00:45 user_7 FILE_ACCESS /etc/shadow",
          "2024-01-20 03:01:12 admin LOGIN success",
          "2024-01-20 03:14:09 user_7 EXFIL 4.2MB",
          "2024-01-20 04:00:01 system REBOOT",
          "2024-01-20 03:59:59 user_7 LOGOUT"
        ],
        mustMatch: [
          "2024-01-20 03:00:02 user_7 FILE_ACCESS /etc/passwd",
          "2024-01-20 03:00:45 user_7 FILE_ACCESS /etc/shadow",
          "2024-01-20 03:01:12 admin LOGIN success",
          "2024-01-20 03:14:09 user_7 EXFIL 4.2MB",
          "2024-01-20 03:59:59 user_7 LOGOUT"
        ],
        mustNotMatch: [
          "2024-01-20 02:59:58 user_7 LOGIN success",  // one minute before — deliberate trap
          "2024-01-20 04:00:01 system REBOOT"          // one hour after — deliberate trap
        ],
        par: 22,
        baseXP: 150,
        parBonusXP: 50,
        referenceSolution: "2024-01-20 03:\\d\\d:\\d\\d.*",
        hint: "You need to match a specific hour. The hour field is fixed — what comes after it isn't.",
        hintCost: 10,
        conceptNote: "Combines escaping (- and :), \\d for digit precision, and .* for arbitrary trailing content. Precision at the timestamp prevents both false positives.",
        isSideChallenge: false,
        isBoss: true
      }

    ] // end challenges
  }  // end world-1
];   // end CAMPAIGN
```

### World 1 XP Summary

| Challenge | Base XP | Par Bonus | Max XP |
|-----------|---------|-----------|--------|
| 1-1 | 50 | 25 | 75 |
| 1-2 | 75 | 25 | 100 |
| 1-3 | 75 | 25 | 100 |
| 1-4 | 100 | 50 | 150 |
| 1-S | 0 | 150 | 150 (bonus only) |
| 1-B | 150 | 50 | 200 |
| **Total** | | | **625 + 150 bonus** |

---

## Stub Screens

### Leaderboard (v1 stub)

Seed with fake entries so the full UI is designed and visible. Mark replacement point clearly.

```js
// STUB: Replace with GET /api/leaderboard in v2.
// Pass auth token as: Authorization: Bearer <token>
// Expected response shape: [{ rank, name, xp }]
const LEADERBOARD_STUB = [
  { rank: 1, name: "ghost_signal",  xp: 2840 },
  { rank: 2, name: "null_pointer",  xp: 2415 },
  { rank: 3, name: "regex_raven",   xp: 1990 },
  { rank: 4, name: "segfault_sara", xp: 1750 },
  { rank: 5, name: "bytewitch",     xp: 1340 },
  // "You" row injected dynamically from localStorage xp total
];
```

### Regularcade (v1 stub)

Show a locked screen with the section name, tagline, and a progress indicator:
`"Unlocks after completing the campaign. You're X% there."`

Mini-game types to list as "coming soon" tiles (greyed out, with icons):
- **Corpus Match** — standard write-a-regex challenge, no narrative
- **Timed Drill** — race the clock on a rapid-fire corpus set
- **Head-to-Head** — live opponent, same corpus, fastest correct answer wins *(requires account)*
- **Regex Crossword** — fill a grid where every row and column must satisfy its own pattern
- **Pattern Surgeon** — identify and repair a broken pattern using regex itself

### Gallery (v1 stub)

Show a locked screen with a brief description of the gallery concept and the hall names:
- The Classics
- The Curiosities
- The Workhorses
- The Miniaturists

---

## Future Worlds Reference (do NOT implement in v1)

Structure the `CAMPAIGN` array and world-rendering code so adding these is purely additive.

| World | Theme | Core Concepts |
|-------|-------|---------------|
| 2 | Data Extraction Bureau | Character classes `[]`, ranges, `\d \w \s` |
| 3 | Validation Department | Anchors `^ $`, quantifiers `{n,m}` |
| 4 | The Pattern Smuggler | Groups `()`, alternation `\|`, backreferences |
| 5 | Deep Cover | Lookahead/lookbehind, non-capturing groups |
| 6 | The Gauntlet | Speed/efficiency challenges, adversarial corpus |
