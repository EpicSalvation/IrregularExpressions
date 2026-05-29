# Irregular Expression — Full Product & Backend Specification

## Product Identity

**Full title:** Irregular Expression  
**Compact / logo form:** IrregEx  
**Tagline:** Pull signal from noise.

---

## Product Map

```
Irregular Expression
├── Campaign
│   ├── Worlds 1–6 (narrative-driven, sequential)
│   ├── Per-challenge community ratings (upvote/downvote)
│   └── Leaderboard (global XP ranking)
├── Regularcade  [unlocks on campaign completion]
│   ├── Mini-game types (see below)
│   ├── Curated content
│   ├── Community submissions (concept or full mini-game)
│   └── Per-mini-game community ratings (upvote/downvote)
└── Gallery  [always accessible]
    ├── Halls: Classics | Curiosities | Workhorses | Miniaturists
    ├── Framed submissions with placard (regex + 20–200 word description)
    ├── Presentation tier upgrades based on upvote count
    ├── Hall of Fame (top 2–3 per hall, display-order only updates)
    └── Per-submission community ratings (upvote/downvote)
```

---

## Technology Stack

**Frontend:** HTML / CSS / vanilla JS. No framework required.  
**Backend:** PHP + MySQL (or MariaDB). Standard LAMP stack — no exotic dependencies.  
**API style:** REST over AJAX (JSON request/response).  
**Auth:** Session-based with optional "remember me" cookie. No OAuth required for v1.  
**Real-time (Head-to-Head):** WebSocket (Ratchet for PHP, or a lightweight Node.js WS server as a sidecar). Scope for v2.

---

## Database Schema

### Users

```sql
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(32)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,          -- bcrypt
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login    DATETIME,
  is_moderator  TINYINT(1)   NOT NULL DEFAULT 0
);
```

### Progress

```sql
-- One row per user per challenge. Stores best attempt only.
CREATE TABLE progress (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL REFERENCES users(id),
  challenge_id   VARCHAR(16)  NOT NULL,          -- e.g. "1-1", "1-B", "1-S"
  xp_awarded     INT UNSIGNED NOT NULL,
  regex_used     VARCHAR(512) NOT NULL,
  char_count     INT UNSIGNED NOT NULL,
  hint_used      TINYINT(1)   NOT NULL DEFAULT 0,
  at_par         TINYINT(1)   NOT NULL DEFAULT 0,
  completed_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_challenge (user_id, challenge_id)
);
```

### Leaderboard View

```sql
-- Derived from progress. No separate table needed.
-- Query: SELECT user_id, SUM(xp_awarded) AS total_xp FROM progress GROUP BY user_id ORDER BY total_xp DESC
CREATE VIEW leaderboard AS
  SELECT
    u.username,
    SUM(p.xp_awarded) AS total_xp,
    RANK() OVER (ORDER BY SUM(p.xp_awarded) DESC) AS rank
  FROM progress p
  JOIN users u ON u.id = p.user_id
  GROUP BY p.user_id;
```

### Regularcade Mini-Games

```sql
-- Stores community-submitted and curated mini-games
CREATE TABLE minigames (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submitter_id    INT UNSIGNED REFERENCES users(id),
  type            ENUM('corpus_match','timed_drill','crossword','pattern_surgeon','head_to_head') NOT NULL,
  title           VARCHAR(128) NOT NULL,
  description     TEXT,
  -- JSON blob: stores type-specific config (corpus, mustMatch, mustNotMatch, par, grid, etc.)
  -- Kept as JSON for schema flexibility across mini-game types.
  -- Validated server-side against a type-specific schema before acceptance.
  config          JSON NOT NULL,
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  curator_note    TEXT,                          -- moderator-added annotation
  submitted_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at     DATETIME
);
```

### Gallery Submissions

```sql
CREATE TABLE gallery_submissions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submitter_id    INT UNSIGNED NOT NULL REFERENCES users(id),
  hall            ENUM('classics','curiosities','workhorses','miniaturists') NOT NULL,
  regex_pattern   VARCHAR(1024) NOT NULL,
  description     TEXT NOT NULL,                 -- 20–200 words, enforced server-side
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  curator_note    TEXT,                          -- added at Featured Exhibit tier by moderator
  submitted_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at     DATETIME
);
```

### Ratings (Unified)

```sql
-- Single table covers campaign challenges, mini-games, and gallery submissions.
-- entity_type + entity_id together identify the rated object.
CREATE TABLE ratings (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL REFERENCES users(id),
  entity_type  ENUM('challenge','minigame','gallery') NOT NULL,
  entity_id    VARCHAR(64)  NOT NULL,            -- challenge_id string OR minigame/gallery INT as string
  vote         TINYINT(1)   NOT NULL,            -- 1 = upvote, -1 = downvote
  rated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_entity (user_id, entity_type, entity_id)
);
```

---

## API Endpoints

All endpoints return JSON. All mutating endpoints require a valid session cookie.  
Error shape: `{ "error": "human-readable message" }`

### Auth

```
POST   /api/auth/register       { username, email, password }
POST   /api/auth/login          { email, password }
POST   /api/auth/logout
GET    /api/auth/me             → { id, username, xp, campaignComplete }
```

### Progress

```
GET    /api/progress            → { completedChallenges[], scores{} }
POST   /api/progress            { challengeId, xpAwarded, regexUsed, charCount, hintUsed, atPar }
```

### Leaderboard

```
GET    /api/leaderboard         → [{ rank, username, xp }]  -- top 50
GET    /api/leaderboard/me      → { rank, username, xp }    -- caller's position
```

### Regularcade

```
GET    /api/minigames           ?type=&status=approved      → [minigame]
GET    /api/minigames/:id       → minigame (with config)
POST   /api/minigames           { type, title, description, config }   -- submit
POST   /api/minigames/:id/approve    [moderator only]  { curator_note? }
POST   /api/minigames/:id/reject     [moderator only]  { reason }
```

### Gallery

```
GET    /api/gallery             ?hall=                      → [submission (no config, for listing)]
GET    /api/gallery/:id         → full submission
POST   /api/gallery             { hall, regex_pattern, description }
POST   /api/gallery/:id/approve      [moderator only]  { curator_note? }
POST   /api/gallery/:id/reject       [moderator only]  { reason }
```

### Ratings

```
POST   /api/ratings             { entity_type, entity_id, vote }   -- 1 or -1; re-posting toggles
GET    /api/ratings/summary     ?entity_type=&entity_id=            → { upvotes, downvotes, userVote }
```

---

## Scoring & Reattempt Rules

All challenges are infinitely replayable, but XP is gated to prevent trivial farming.

### Campaign Challenges
- **First completion:** Awards base XP, plus par bonus if at/under par, minus hint penalty if hint was used.
- **Reattempts:** Award **0 XP**. The reference solution is shown on first completion, so replaying to hit par would be meaningless. The player's best (shortest) solution is stored, but no additional XP is granted.
- Progress tracking stores: `xp`, `regexUsed`, `charCount`, `atPar`, `hintUsed`.

### Regularcade — Corpus Match
- **First completion:** Awards base XP, plus par bonus if at/under par. No hints available.
- **Reattempts:** Award the **par bonus only**, and only if par is achieved for the first time. No reference solution is shown, so earning par on a reattempt represents genuine skill improvement.
- Progress tracking stores: `xp`, `regexUsed`, `charCount`, `atPar`.

### Regularcade — Timed Drill
- **First completion:** Awards base XP, plus time bonus if completed under the time limit.
- **Reattempts:** Award the **time bonus only**, and only if the time limit is beaten for the first time. Partial completions (time expired) award proportional base XP on first attempt only.
- Progress tracking stores: `xp`, `time`, `solved`, `atPar`, `underTime`.

### General Principles
- XP is always additive — it is never removed or reduced retroactively.
- The stored score updates to the player's best attempt (shortest pattern / fastest time) regardless of XP.
- The server (v2) should enforce these rules; the client implements them optimistically for the offline prototype.

---

## Regularcade: Mini-Game Type Specifications

### 1. Corpus Match
Standard write-a-regex challenge. No narrative, no world framing — pure skill drill.
```json
{
  "corpus":         ["string1", "string2"],
  "mustMatch":      ["string1"],
  "mustNotMatch":   ["string2"],
  "par":            12,
  "baseXP":         50,
  "parBonusXP":     25
}
```

### 2. Timed Drill
A rapid-fire series of 5–10 corpus match challenges. Timer runs continuously across all challenges in the set. Bonus XP for completing under time.

Each sub-challenge **must include a short `briefing`** — one sentence telling the player what to match. The player doesn't have time to reverse-engineer intent from the corpus alone, but also doesn't need a paragraph. Keep briefings under ~15 words. Examples: "Match the ERROR lines.", "Match zones A, B, and C only.", "Match lines containing a dollar amount."

Auto-advance: the player's input is validated live. As soon as all mustMatch/mustNotMatch constraints pass, the drill auto-advances to the next sub-challenge (with a brief visual flash). No submit button.

```json
{
  "timeLimitSeconds": 120,
  "challenges": [
    { "briefing": "...", "corpus": [], "mustMatch": [], "mustNotMatch": [], "par": 10 }
  ],
  "baseXP":     100,
  "timeBonus":  50
}
```

### 3. Head-to-Head
Two players, same corpus, same target. Fastest correct submission wins. Requires WebSocket connection and matchmaking queue. **Scope: v2.**
```json
{
  "corpus":       [],
  "mustMatch":    [],
  "mustNotMatch": [],
  "par":          15
}
```

### 4. Regex Crossword
A grid where every row AND column must satisfy its own regex constraint. The "answer" is the set of characters that fills the grid satisfying all constraints simultaneously. Forces multi-pattern reasoning.

Grid cells contain single characters. Validation checks each row string against its row pattern, and each column string against its column pattern.

```json
{
  "grid": {
    "rows":    3,
    "cols":    3
  },
  "rowPatterns": ["^[A-Z]{3}$", "^\\d{3}$", "^[a-z]{3}$"],
  "colPatterns": ["^[A-Za-z\\d][a-z\\d][A-Z\\d]$", "..."],
  "solution":    [["A","b","C"],["1","2","3"],["x","y","z"]],
  "baseXP":      150,
  "parBonusXP":  50
}
```

### 5. Pattern Surgeon
The player is given one or more broken regex patterns and must write a regex that identifies and isolates the defective token — so that removing or replacing the matched portion repairs the pattern.

The mechanic: player's submitted regex is run against the broken pattern string(s). The match result is used to derive a repaired pattern, which is then validated against the challenge's test corpus.

**Anti-abuse rules:**
- Forbidden meta-patterns are blacklisted server-side (e.g., bare `?`, `.+`, `.*` applied to the whole pattern string)
- Where blacklisting is impractical, multiple broken patterns with the same error type are provided — the player's repair regex must work across all of them, which defeats overfitted solutions

```json
{
  "brokenPatterns": [
    "\\d+\\.{3}\\d+",
    "\\w+\\.{3}\\w+"
  ],
  // The defective token in each is .{3} — should be \\.
  // Player must write a regex that matches .{3} in each broken pattern.
  // The matched portion is replaced with the player's supplied replacement string.
  "replacementValue": "\\\\.",
  "repairedPatterns": [
    "\\d+\\.\\d+",
    "\\w+\\.\\w+"
  ],
  // Repaired patterns are validated against this corpus
  "validationCorpus": {
    "mustMatch":    ["3.14", "word.word"],
    "mustNotMatch": ["3...14", "no_dot"]
  },
  "forbiddenPatterns": [".+", ".*", "^.+$"],
  "par":       12,
  "baseXP":    100,
  "parBonusXP": 50
}
```

---

## Gallery: Presentation Tiers

Tier is computed dynamically from net upvotes at render time. No tier field stored in DB.

| Tier | Name | Net Upvotes | Visual Treatment |
|------|------|-------------|-----------------|
| 0 | Conference Poster | 0–9 | Plain border, typed label, no mat |
| 1 | Print | 10–49 | Simple frame, printed placard |
| 2 | Framed Original | 50–149 | Ornate frame, matted, engraved placard |
| 3 | Featured Exhibit | 150+ | Spotlight effect, velvet rope, curator's note shown |
| ★ | Hall of Fame | Top 2–3 per hall | Gold frame, marble placard, no voting UI shown |

**Hall of Fame rules:**
- Once inducted (top 2–3 per hall by net upvotes), induction is permanent
- Display order within the Hall of Fame updates dynamically by vote count
- Voting UI is hidden on Hall of Fame entries — the score is frozen for display purposes
- Moderators may remove Hall of Fame entries for policy violations only

**Curator's note:** At Featured Exhibit tier, a moderator may add a `curator_note` — a short annotation explaining why the pattern is notable. Displayed on the placard. Optional; not required to reach the tier.

---

## Community Submission Pipeline

### Mini-Games (Regularcade)
1. User selects a mini-game type and fills out the submission template for that type
2. Server validates config JSON against type-specific schema
3. Submission enters `pending` queue, visible to moderators only
4. Moderator approves (optionally adds curator note) or rejects (with reason)
5. Approved submissions enter the public Regularcade pool
6. Submitter is notified of approval/rejection (on-site notification, no email required for v1)

### Gallery
1. User submits regex pattern + hall selection + description (20–200 words, enforced)
2. Basic automated check: regex must be syntactically valid (server-side eval)
3. Submission enters `pending` queue
4. Moderator approves or rejects
5. Approved submissions enter the gallery at Tier 0 (Conference Poster)
6. Tier upgrades happen automatically as upvotes accumulate

### Concept Submissions
For users who have an idea but don't want to author a full challenge:
- Simple form: concept description + target skill/concept + optional example strings
- Goes into a separate `concepts` queue for moderators or staff to develop into full challenges
- No public visibility — internal pipeline only

---

## Rating System

- One vote per user per entity (upvote or downvote)
- Re-submitting the same vote toggles it off (neutral)
- Re-submitting the opposite vote changes the vote
- Net score = upvotes − downvotes
- Displayed as net score, not raw counts (keeps it clean)
- Hall of Fame entries: voting is accepted server-side but the score is not displayed on the Hall of Fame card (prevents gaming the "frozen" appearance while keeping data integrity)

---

## Moderation

Moderators are flagged by `is_moderator = 1` in the users table. No separate roles table needed for v1.

Moderator capabilities:
- Approve / reject pending mini-game and gallery submissions
- Add curator notes to approved items
- Remove Hall of Fame entries for policy violations
- Soft-delete any submission (status = 'rejected', visible to submitter with reason)

---

## v1 → v2 Integration Points

These are the backend stub replacement points from the frontend prototype:

| Stub | Replacement |
|------|-------------|
| `LEADERBOARD_STUB` constant | `GET /api/leaderboard` |
| `rxg_progress` in localStorage | `POST /api/progress` on each submission; `GET /api/progress` on load |
| No-op "Submit Score" button | Requires auth check → `POST /api/progress` |
| Regularcade locked screen | Replace with `GET /api/minigames` feed |
| Gallery locked screen | Replace with `GET /api/gallery` feed |
