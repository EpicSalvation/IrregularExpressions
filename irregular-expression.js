/* ═══════════════════════════════════════════════════
   IRREGULAR EXPRESSION — application logic
   No frameworks. Pure ES2020+.
═══════════════════════════════════════════════════ */

"use strict";

// ────────────────────────────────────────────────────
//  CAMPAIGN DATA — World 1 (full)
// ────────────────────────────────────────────────────
const CAMPAIGN = [
  {
    id: "world-1",
    title: "Log File Detective",
    subtitle: "Pull signal from noise.",
    narrative: "You're a signal analyst at the SETI Institute. An anomalous transmission was logged overnight and the data pipeline is full of noise. Your tools are a terminal and your pattern matching ability.",
    conceptsIntroduced: ["literals", "dot (any char)", "quantifiers: * + ?", "escaping with \\"],
    challenges: [

      // ─── Challenge 1-1 ──────────────────────────────
      {
        id: "1-1",
        title: "First Day",
        briefing: "Overnight telescope logs contain a mix of INFO, DEBUG, and ERROR entries. Flag every ERROR line for the lead analyst before morning standup.",
        scenario: "The telescope array ran overnight capturing candidate signals. The lead analyst needs a clean error report — only flagged errors, nothing else.",
        learnMore: "In regex, some characters have special meaning: . * + ? ^ $ { } [ ] | ( ) \\\n\nTo match them literally, prefix with a backslash: \\[ matches a literal [, \\. matches a literal dot.\n\nWithout escaping, [ opens a character class — a completely different construct. The engine won't warn you; it just does something unexpected.",
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

      // ─── Challenge 1-2 ──────────────────────────────
      {
        id: "1-2",
        title: "Static on the Line",
        briefing: "Three daemons logged the transmission window with incompatible timestamp formats. Write one pattern that matches every timestamp regardless of which separator was used.",
        scenario: "Three separate daemons each used a different date separator. The unified pipeline rejects mismatched formats. You need one pattern that absorbs all variants.",
        learnMore: "The dot (.) matches any single character except a newline. It's the broadest wildcard in the regex toolkit.\n\nUseful when you genuinely don't care what character appears — like a date separator that varies across systems.\n\nBe careful: . also matches digits, letters, symbols, and spaces. If you need a literal dot, escape it: \\.",
        type: "match",
        corpus: [
          "2024-03-15 08:42:11 LOGIN success",
          "2024/03/15 09:11:03 LOGOUT user_99",
          "2024.03.15 10:00:00 LOGIN success",
          "2024 03 15 11:45:22 TIMEOUT",
          "2024-03-15 12:00:01 LOGIN success"
        ],
        // Validation: regex must match the timestamp portion (first 19 chars)
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

      // ─── Challenge 1-3 ──────────────────────────────
      {
        id: "1-3",
        title: "Repeat Offender",
        briefing: "Brute-force attempts are hitting the authentication service. Identify every line tied to a valid numeric user ID. User IDs always end in at least one digit.",
        scenario: "Automated attempts are probing the auth service. The security team wants every session tied to a valid numeric user ID isolated for review.",
        learnMore: "\\d is shorthand for any digit 0–9. It's equivalent to the character class [0-9].\n\n+ means one or more of the preceding element. * means zero or more.\n\nuser_\\d+ requires at least one digit — it won't match user_ alone.\nuser_\\d* would match user_ with no digits, letting false positives slip through.",
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
          "user_ LOGIN failed",
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

      // ─── Challenge 1-4 ──────────────────────────────
      {
        id: "1-4",
        title: "Optional Protocol",
        briefing: "A mid-deployment change added optional severity codes to some API log lines. Match every request line whether or not the severity tag is present.",
        scenario: "A mid-deployment config change added optional severity tags to some lines. The monitoring dashboard must capture every request line regardless.",
        learnMore: "The ? quantifier makes the preceding element optional — it matches zero or one times.\n\nTo make a multi-character sequence optional, group it first with parentheses: (\\[.*\\])? makes the whole bracketed tag optional.\n\nParentheses create a capture group. If you want grouping without capturing, use (?:...) — a non-capturing group. For this challenge it doesn't matter either way.",
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

      // ─── Side Challenge 1-S ─────────────────────────
      {
        id: "1-S",
        title: "Redacted",
        briefing: "Partner observatory IP addresses were accidentally logged in a shared dataset. Identify every line containing an IP address so it can be removed before external release.",
        scenario: "The Institute's legal team discovered that partner observatory IP addresses were included in a dataset earmarked for public release. Those lines must be identified and purged.",
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
          "Error code 404 returned",
          "Version 2.0.1 deployed",
          "User 10 logged out"
        ],
        par: 20,
        baseXP: 0,
        parBonusXP: 150,
        referenceSolution: "\\d+\\.\\d+\\.\\d+\\.\\d+",
        hint: "An IP address is four groups of digits separated by dots. Dots need escaping.",
        hintCost: 10,
        conceptNote: "\\. matches a literal dot. Without the backslash, . matches anything — including the dots in version numbers, which breaks your exclusions.",
        isSideChallenge: true,
        isBoss: false
      },

      // ─── Boss Challenge 1-B ─────────────────────────
      {
        id: "1-B",
        title: "The Incident",
        briefing: "Unauthorized access occurred during the 03:00 signal processing window. Reconstruct every event from that exact hour. Don't drift into 02:xx or 04:xx.",
        scenario: "An unauthorized access event occurred during the 03:00 signal processing window. The incident response team needs every log entry from that hour for the forensic report.",
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
          "2024-01-20 02:59:58 user_7 LOGIN success",
          "2024-01-20 04:00:01 system REBOOT"
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

// ────────────────────────────────────────────────────
//  LEADERBOARD STUB DATA
//  STUB: Replace with GET /api/leaderboard in v2.
//  Pass auth: Authorization: Bearer <token>
//  Expected response shape: [{ rank, name, xp }]
// ────────────────────────────────────────────────────
const LEADERBOARD_STUB = [
  { rank: 1, name: "ghost_signal",  xp: 2840 },
  { rank: 2, name: "null_pointer",  xp: 2415 },
  { rank: 3, name: "regex_raven",   xp: 1990 },
  { rank: 4, name: "segfault_sara", xp: 1750 },
  { rank: 5, name: "bytewitch",     xp: 1340 },
  // "You" row injected dynamically from localStorage xp total
];

// ────────────────────────────────────────────────────
//  STORAGE HELPERS
// ────────────────────────────────────────────────────
const STORAGE_KEY = "rxg_progress";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { completedChallenges: [], xp: 0, scores: {} };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (_) {}
}

// ────────────────────────────────────────────────────
//  VALIDATION ENGINE
// ────────────────────────────────────────────────────
function validateAttempt(userPattern, challenge, hintUsed) {
  let regex;
  try {
    regex = new RegExp(userPattern);
  } catch (e) {
    return { valid: false, error: e.message };
  }

  const matchPasses   = challenge.mustMatch.every(s => regex.test(s));
  const excludePasses = challenge.mustNotMatch.every(s => !regex.test(s));
  const passed        = matchPasses && excludePasses;
  const atPar         = userPattern.length <= challenge.par;
  const hintPenalty   = hintUsed ? challenge.hintCost : 0;

  let xpAwarded = 0;
  if (passed) {
    xpAwarded = challenge.baseXP - hintPenalty;
    if (atPar) xpAwarded += challenge.parBonusXP;
    if (xpAwarded < 0) xpAwarded = 0;
  }

  return {
    valid: true,
    passed,
    matchPasses,
    excludePasses,
    charCount: userPattern.length,
    atPar,
    hintPenalty,
    xpAwarded
  };
}

// ────────────────────────────────────────────────────
//  LIVE HIGHLIGHTING
//  Returns array of HTML strings, one per corpus line
// ────────────────────────────────────────────────────
function highlightLine(line, regex) {
  if (!regex) return escapeHtml(line);
  const parts = [];
  let lastIndex = 0;
  let safeGuard = 0;
  // Use exec in a loop to find all matches (non-global regex via sticky trick)
  const gRegex = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  let match;
  while ((match = gRegex.exec(line)) !== null) {
    if (match.index >= lastIndex) {
      parts.push(escapeHtml(line.slice(lastIndex, match.index)));
      parts.push(`<span class="match-highlight">${escapeHtml(match[0])}</span>`);
      lastIndex = match.index + match[0].length;
    }
    if (match[0].length === 0) {
      gRegex.lastIndex++;
    }
    if (++safeGuard > 1000) break;
  }
  parts.push(escapeHtml(line.slice(lastIndex)));
  return parts.join("");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ────────────────────────────────────────────────────
//  SCREEN ROUTER
// ────────────────────────────────────────────────────
const screens = {};
document.querySelectorAll(".screen").forEach(el => {
  screens[el.id] = el;
});

let currentScreen = null;

function goTo(screenId) {
  if (currentScreen) {
    currentScreen.classList.remove("active");
  }
  const next = screens[screenId];
  if (!next) return;
  next.classList.add("active");
  currentScreen = next;
}

// Wire up all static data-goto buttons
document.querySelectorAll("[data-goto]").forEach(btn => {
  btn.addEventListener("click", () => goTo(btn.dataset.goto));
});

// ────────────────────────────────────────────────────
//  LEADERBOARD SCREEN
// ────────────────────────────────────────────────────
function renderLeaderboard() {
  const progress = loadProgress();
  const userXP   = progress.xp;
  const tbody    = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";

  // Inject "You" into stub list for display
  const entries = [...LEADERBOARD_STUB];
  if (userXP > 0) {
    entries.push({ name: "You", xp: userXP, isYou: true });
  }
  entries.sort((a, b) => b.xp - a.xp);

  entries.forEach((entry, i) => {
    const rank = i + 1;
    const tr = document.createElement("tr");
    if (entry.isYou) tr.classList.add("you-row");

    const rankClasses = ["rank-gold", "rank-silver", "rank-bronze"];
    const rankClass   = rankClasses[i] || "rank-other";
    const rankSymbols = ["①", "②", "③"];
    const rankDisplay = rankSymbols[i] || `#${rank}`;

    tr.innerHTML = `
      <td class="${rankClass}">${rankDisplay}</td>
      <td class="mono">${escapeHtml(entry.name)}${entry.isYou ? " ◀ you" : ""}</td>
      <td class="mono xp-gold">${entry.xp.toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.querySelectorAll("[data-goto='screen-leaderboard']").forEach(btn => {
  btn.addEventListener("click", renderLeaderboard);
});

document.querySelectorAll("[data-goto='screen-map']").forEach(btn => {
  btn.addEventListener("click", renderMap);
});

// ────────────────────────────────────────────────────
//  REGULARCADE STUB — progress message
// ────────────────────────────────────────────────────
function updateRegularcadeMsg() {
  const progress = loadProgress();
  const allChallenges = CAMPAIGN.flatMap(w => w.challenges);
  const total     = allChallenges.length;
  const completed = progress.completedChallenges.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const el = document.getElementById("regularcade-unlock-msg");
  if (el) el.textContent = `Unlocks after completing the campaign. You're ${pct}% there.`;
}

document.querySelectorAll("[data-goto='screen-regularcade']").forEach(btn => {
  btn.addEventListener("click", updateRegularcadeMsg);
});

// ────────────────────────────────────────────────────
//  TITLE SCREEN XP BADGE
// ────────────────────────────────────────────────────
function updateTitleBadge() {
  const progress = loadProgress();
  const el = document.getElementById("title-xp-badge");
  if (el && progress.xp > 0) {
    el.textContent = `${progress.xp} XP accumulated`;
  }
}

// ────────────────────────────────────────────────────
//  CAMPAIGN MAP — SVG node graph
// ────────────────────────────────────────────────────

// Layout constants for World 1
const MAP_LAYOUT = {
  "world-1": {
    worldNode: { x: 120, y: 300 },
    challenges: {
      "1-1": { x: 250, y: 300 },
      "1-2": { x: 380, y: 300 },
      "1-3": { x: 510, y: 300 },
      "1-4": { x: 640, y: 300 },
      "1-S": { x: 640, y: 450, side: true },
      "1-B": { x: 790, y: 300, boss: true }
    }
  }
};

function getChallengeState(challengeId, progress) {
  if (progress.completedChallenges.includes(challengeId)) return "completed";

  // Determine unlock logic
  const allChallenges = CAMPAIGN.flatMap(w => w.challenges);
  const idx = allChallenges.findIndex(c => c.id === challengeId);
  if (idx === 0) return "available"; // first challenge always available

  const ch = allChallenges[idx];
  // Side challenge 1-S unlocks alongside 1-4
  if (ch.isSideChallenge) {
    const prevId = allChallenges[idx - 1]; // challenge before it in array
    // 1-S unlocks when 1-3 is complete (alongside 1-4)
    return progress.completedChallenges.includes("1-3") ? "available" : "locked";
  }
  // Boss unlocks when all non-side, non-boss in world are complete
  if (ch.isBoss) {
    const worldChallenges = CAMPAIGN[0].challenges.filter(c => !c.isBoss && !c.isSideChallenge);
    const allDone = worldChallenges.every(c => progress.completedChallenges.includes(c.id));
    return allDone ? "available" : "locked";
  }
  // Regular: previous non-side must be complete
  const prevNormal = allChallenges.slice(0, idx).filter(c => !c.isSideChallenge && !c.isBoss);
  const prevId = prevNormal[prevNormal.length - 1];
  if (!prevId) return "available";
  return progress.completedChallenges.includes(prevId.id) ? "available" : "locked";
}

function renderMap() {
  const progress = loadProgress();
  document.getElementById("map-xp").textContent = `XP: ${progress.xp}`;
  document.getElementById("world-narrative-text").textContent = CAMPAIGN[0].narrative;

  const svg = document.getElementById("map-svg");
  svg.innerHTML = "";

  const ns = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  // Defs for glow filter
  const defs = svgEl("defs");
  defs.innerHTML = `
    <filter id="glow-teal" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;
  svg.appendChild(defs);

  const world = CAMPAIGN[0];
  const layout = MAP_LAYOUT["world-1"];

  // ── Draw connector lines ──────────────────────────
  const mainPath = ["1-1","1-2","1-3","1-4","1-B"];
  for (let i = 0; i < mainPath.length - 1; i++) {
    const a = layout.challenges[mainPath[i]];
    const b = layout.challenges[mainPath[i + 1]];
    const line = svgEl("line", {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      stroke: "#1e3a5f", "stroke-width": 2
    });
    svg.appendChild(line);
  }
  // World hub to first challenge
  {
    const w = layout.worldNode;
    const c = layout.challenges["1-1"];
    svg.appendChild(svgEl("line", { x1: w.x + 44, y1: w.y, x2: c.x - 20, y2: c.y, stroke: "#1e3a5f", "stroke-width": 2 }));
  }
  // Side challenge dashed connector
  {
    const a = layout.challenges["1-4"];
    const b = layout.challenges["1-S"];
    svg.appendChild(svgEl("line", {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      stroke: "#1e3a5f", "stroke-width": 2, "stroke-dasharray": "5 4"
    }));
  }

  // ── World hub node ─────────────────────────────────
  {
    const { x, y } = layout.worldNode;
    const g = svgEl("g", { class: "map-node-world" });

    const circle = svgEl("circle", { cx: x, cy: y, r: 44, fill: "#16213e", stroke: "#0f9b8e", "stroke-width": 3 });
    g.appendChild(circle);

    const label = svgEl("text", { x, y: y - 6, "text-anchor": "middle", fill: "#0f9b8e", "font-size": 11, "font-family": "JetBrains Mono, monospace", "font-weight": 700, "letter-spacing": "0.1" });
    label.textContent = "WORLD 1";
    g.appendChild(label);

    const sub = svgEl("text", { x, y: y + 10, "text-anchor": "middle", fill: "#7a7a9a", "font-size": 9, "font-family": "system-ui, sans-serif" });
    sub.textContent = "Log File";
    g.appendChild(sub);
    const sub2 = svgEl("text", { x, y: y + 22, "text-anchor": "middle", fill: "#7a7a9a", "font-size": 9, "font-family": "system-ui, sans-serif" });
    sub2.textContent = "Detective";
    g.appendChild(sub2);

    svg.appendChild(g);
  }

  // ── Challenge nodes ────────────────────────────────
  world.challenges.forEach(challenge => {
    const pos = layout.challenges[challenge.id];
    if (!pos) return;
    const state = getChallengeState(challenge.id, progress);

    const r       = challenge.isBoss ? 32 : challenge.isSideChallenge ? 20 : 24;
    const g       = svgEl("g", { class: `map-node node-${state}${challenge.isBoss ? " node-boss" : ""}${challenge.isSideChallenge ? " node-side" : ""}` });

    // Background glow for completed boss
    if (challenge.isBoss && state === "completed") {
      const glow = svgEl("circle", { cx: pos.x, cy: pos.y, r: r + 12, fill: "none", stroke: "rgba(245,166,35,0.2)", "stroke-width": 8 });
      g.appendChild(glow);
    }
    if (state === "completed" && !challenge.isBoss) {
      const glow = svgEl("circle", { cx: pos.x, cy: pos.y, r: r + 8, fill: "none", stroke: "rgba(15,155,142,0.15)", "stroke-width": 6 });
      g.appendChild(glow);
    }

    // Main circle
    const strokeColor = challenge.isBoss ? "#f5a623" : state === "locked" ? "#3a3a5a" : "#0f9b8e";
    const fillColor   = state === "completed"
      ? (challenge.isBoss ? "#f5a623" : "#0f9b8e")
      : state === "locked" ? "#1a1a2e" : "transparent";

    const circle = svgEl("circle", {
      cx: pos.x, cy: pos.y, r,
      fill: fillColor,
      stroke: strokeColor,
      "stroke-width": challenge.isBoss ? 3 : 2,
      ...(challenge.isSideChallenge ? { "stroke-dasharray": "4 3" } : {}),
      ...(state === "completed" && !challenge.isBoss ? { filter: "url(#glow-teal)" } : {}),
      ...(challenge.isBoss && state !== "locked" ? { filter: "url(#glow-gold)" } : {})
    });
    g.appendChild(circle);

    // ID label inside node
    const labelColor = state === "completed"
      ? "#fff"
      : state === "locked"
      ? "#3a3a5a"
      : challenge.isBoss ? "#f5a623" : "#0f9b8e";

    const idLabel = svgEl("text", {
      x: pos.x, y: pos.y + 4,
      "text-anchor": "middle",
      fill: labelColor,
      "font-size": challenge.isBoss ? 11 : challenge.isSideChallenge ? 9 : 10,
      "font-family": "JetBrains Mono, monospace",
      "font-weight": 700
    });
    idLabel.textContent = challenge.id;
    g.appendChild(idLabel);

    // Title below node
    const titleLabel = svgEl("text", {
      x: pos.x,
      y: pos.y + r + 14,
      "text-anchor": "middle",
      fill: state === "locked" ? "#3a3a5a" : "#7a7a9a",
      "font-size": 9,
      "font-family": "system-ui, sans-serif"
    });
    titleLabel.textContent = challenge.title;
    g.appendChild(titleLabel);

    // Padlock icon if locked
    if (state === "locked") {
      const lock = svgEl("text", { x: pos.x, y: pos.y + 5, "text-anchor": "middle", fill: "#3a3a5a", "font-size": 12 });
      lock.textContent = "🔒";
      g.appendChild(lock);
    }

    // Clickable only if not locked
    if (state !== "locked") {
      g.style.cursor = "pointer";
      g.addEventListener("click", () => loadChallenge(challenge.id));
    }

    svg.appendChild(g);
  });
}

// ────────────────────────────────────────────────────
//  CHALLENGE SCREEN
// ────────────────────────────────────────────────────
let activeChallengeId = null;
let hintUsed = false;
let hintRevealed = false;

function findChallenge(id) {
  for (const world of CAMPAIGN) {
    const ch = world.challenges.find(c => c.id === id);
    if (ch) return { world, challenge: ch };
  }
  return null;
}

function loadChallenge(challengeId) {
  const found = findChallenge(challengeId);
  if (!found) return;
  const { world, challenge } = found;

  activeChallengeId = challengeId;
  hintUsed     = false;
  hintRevealed = false;

  const progress = loadProgress();

  // Header
  document.getElementById("challenge-world-title").textContent = world.title;
  document.getElementById("challenge-xp").textContent = `XP: ${progress.xp}`;

  // Meta
  document.getElementById("challenge-id").textContent = challenge.id;
  document.getElementById("challenge-title").textContent = challenge.title;
  document.getElementById("challenge-type-badge").textContent = challenge.type.toUpperCase();

  // Briefing + scenario
  const briefingEl = document.getElementById("briefing-text");
  briefingEl.innerHTML = escapeHtml(challenge.briefing) +
    (challenge.scenario
      ? `<span class="briefing-scenario">${escapeHtml(challenge.scenario)}</span>`
      : "");

  // Learn more panel
  const learnSection = document.getElementById("learn-more-section");
  const learnText    = document.getElementById("learn-more-text");
  const learnPanel   = document.getElementById("learn-more-panel");
  const learnToggle  = document.getElementById("learn-more-toggle");
  const learnChevron = document.getElementById("learn-more-chevron");
  const showLearn = !challenge.isSideChallenge && !challenge.isBoss && !!challenge.learnMore;
  learnSection.hidden = !showLearn;
  if (showLearn) {
    learnText.textContent = challenge.learnMore;
    learnPanel.hidden = true;
    learnToggle.setAttribute("aria-expanded", "false");
    learnChevron.classList.remove("open");
  }

  // Corpus
  renderCorpus(challenge, null);

  // Input reset
  const input = document.getElementById("regex-input");
  input.value = "";
  document.getElementById("char-counter").textContent = `0 chars | par: ${challenge.par}`;
  document.getElementById("char-counter").className = "char-counter mono";
  document.getElementById("regex-error").textContent = "";
  document.getElementById("locked-in").textContent = "";
  document.getElementById("locked-in").classList.remove("visible");

  // Hint
  const hintCostEl = document.getElementById("hint-cost");
  hintCostEl.textContent = `−${challenge.hintCost}pts`;
  document.getElementById("hint-btn").disabled = false;
  document.getElementById("hint-panel").hidden = true;

  goTo("screen-challenge");
}

function renderCorpus(challenge, regex) {
  const container = document.getElementById("corpus-lines");
  container.innerHTML = "";

  challenge.corpus.forEach(line => {
    const div = document.createElement("div");
    div.classList.add("corpus-line");

    const isMustMatch    = challenge.mustMatch.includes(line);
    const isMustNotMatch = challenge.mustNotMatch.includes(line);

    if (isMustMatch)    div.classList.add("must-match");
    if (isMustNotMatch) div.classList.add("must-not-match");

    let matched = false;
    if (regex) {
      try { matched = regex.test(line); } catch (_) {}
    }

    if (regex) {
      if (isMustMatch) {
        div.classList.add(matched ? "line-matched" : "line-unmatched");
      } else if (isMustNotMatch) {
        div.classList.add(matched ? "line-matched" : "line-ok");
      }
      div.innerHTML = highlightLine(line, regex);
    } else {
      div.textContent = line;
    }

    container.appendChild(div);
  });
}

// Live validation on keyup
document.getElementById("regex-input").addEventListener("input", () => {
  const found = findChallenge(activeChallengeId);
  if (!found) return;
  const { challenge } = found;
  const pattern = document.getElementById("regex-input").value;

  const errorEl     = document.getElementById("regex-error");
  const counterEl   = document.getElementById("char-counter");
  const lockedInEl  = document.getElementById("locked-in");

  if (pattern === "") {
    renderCorpus(challenge, null);
    errorEl.textContent = "";
    counterEl.textContent = `0 chars | par: ${challenge.par}`;
    counterEl.className = "char-counter mono";
    lockedInEl.textContent = "";
    lockedInEl.classList.remove("visible");
    return;
  }

  let regex;
  try {
    regex = new RegExp(pattern);
    errorEl.textContent = "";
  } catch (e) {
    errorEl.textContent = `Invalid pattern: ${e.message}`;
    renderCorpus(challenge, null);
    lockedInEl.classList.remove("visible");
    return;
  }

  renderCorpus(challenge, regex);

  const len     = pattern.length;
  const atPar   = len <= challenge.par;
  const underPar = len < challenge.par;

  counterEl.textContent = `${len} chars | par: ${challenge.par}`;
  counterEl.className   = "char-counter mono" + (underPar ? " under-par" : atPar ? " at-par" : "");

  // Check if solved
  const result = validateAttempt(pattern, challenge, hintUsed);
  if (result.valid && result.passed) {
    lockedInEl.textContent = "LOCKED IN ✓";
    lockedInEl.classList.add("visible");
  } else {
    lockedInEl.textContent = "";
    lockedInEl.classList.remove("visible");
  }
});

// HINT button
document.getElementById("hint-btn").addEventListener("click", () => {
  const found = findChallenge(activeChallengeId);
  if (!found) return;
  const { challenge } = found;

  if (!hintRevealed) {
    hintRevealed = true;
    hintUsed = true;
    document.getElementById("hint-text").textContent = challenge.hint;
    document.getElementById("hint-panel").hidden = false;
    document.getElementById("hint-btn").disabled = true;
    document.getElementById("hint-btn").textContent = "HINT USED";
  }
});

// LEARN MORE toggle
document.getElementById("learn-more-toggle").addEventListener("click", () => {
  const panel   = document.getElementById("learn-more-panel");
  const toggle  = document.getElementById("learn-more-toggle");
  const chevron = document.getElementById("learn-more-chevron");
  const isOpen  = !panel.hidden;
  panel.hidden  = isOpen;
  toggle.setAttribute("aria-expanded", String(!isOpen));
  chevron.classList.toggle("open", !isOpen);
});

// SUBMIT button
document.getElementById("submit-btn").addEventListener("click", () => {
  submitAttempt();
});

// TEST button — just visual feedback, re-runs live validation
document.getElementById("test-btn").addEventListener("click", () => {
  const input = document.getElementById("regex-input");
  input.dispatchEvent(new Event("input"));
  input.focus();
});

// Back button
document.getElementById("challenge-back-btn").addEventListener("click", () => {
  renderMap();
  goTo("screen-map");
});

function submitAttempt() {
  const found = findChallenge(activeChallengeId);
  if (!found) return;
  const { world, challenge } = found;
  const pattern = document.getElementById("regex-input").value;

  const result = validateAttempt(pattern, challenge, hintUsed);

  if (!result.valid) {
    document.getElementById("regex-error").textContent = `Invalid pattern: ${result.error}`;
    return;
  }

  if (result.passed) {
    // Save progress
    const progress = loadProgress();
    if (!progress.completedChallenges.includes(challenge.id)) {
      progress.completedChallenges.push(challenge.id);
    }
    progress.xp += result.xpAwarded;
    progress.scores[challenge.id] = {
      xp: result.xpAwarded,
      regexUsed: pattern,
      charCount: result.charCount,
      hintUsed
    };
    saveProgress(progress);

    showSuccess(challenge, pattern, result, progress);
  } else {
    showFailure(challenge, result);
  }
}

// ────────────────────────────────────────────────────
//  SUCCESS SCREEN
// ────────────────────────────────────────────────────
function showSuccess(challenge, pattern, result, progress) {
  document.getElementById("success-challenge-id").textContent = `${challenge.id} — ${challenge.title}`;
  document.getElementById("concept-note-text").textContent = challenge.conceptNote;

  // Reference solution card
  const refCard = document.getElementById("reference-solution-card");
  const refCode = document.getElementById("reference-solution-code");
  if (challenge.referenceSolution) {
    refCode.textContent = challenge.referenceSolution;
    refCard.hidden = false;
  } else {
    refCard.hidden = true;
  }

  // XP rows
  document.getElementById("xp-base-val").textContent   = `+${challenge.baseXP}`;
  document.getElementById("xp-challenge-total").textContent = `+${result.xpAwarded}`;
  document.getElementById("xp-running-total").textContent   = `${progress.xp}`;

  // Par bonus row
  const parRow = document.getElementById("xp-par-row");
  if (result.atPar && challenge.parBonusXP > 0) {
    parRow.classList.add("visible");
    document.getElementById("xp-par-val").textContent = `+${challenge.parBonusXP}`;
  } else {
    parRow.classList.remove("visible");
  }

  // Hint penalty row
  const hintRow = document.getElementById("xp-hint-row");
  if (result.hintPenalty > 0) {
    hintRow.classList.add("visible");
    document.getElementById("xp-hint-val").textContent = `−${result.hintPenalty}`;
  } else {
    hintRow.classList.remove("visible");
  }

  // Par comparison line
  const parLineEl = document.getElementById("par-line");
  parLineEl.textContent = `Your regex: ${result.charCount} chars  |  Par: ${challenge.par} chars`;
  parLineEl.className   = "par-line mono" + (result.charCount < challenge.par ? " under-par" : result.charCount === challenge.par ? " at-par" : "");

  // Animate XP total
  animateCountUp(document.getElementById("xp-challenge-total"), 0, result.xpAwarded, 600, "+");
  animateCountUp(document.getElementById("xp-running-total"),   progress.xp - result.xpAwarded, progress.xp, 1000, "");

  // Wire continue button
  const nextChallenge = getNextChallenge(challenge.id);
  const continueBtn = document.getElementById("success-continue-btn");

  // Check if this was the boss
  if (challenge.isBoss) {
    continueBtn.textContent = "WORLD COMPLETE →";
    continueBtn.onclick = () => {
      showWorldComplete(findChallenge(challenge.id).world, progress);
    };
  } else if (nextChallenge) {
    continueBtn.textContent = "CONTINUE →";
    continueBtn.onclick = () => loadChallenge(nextChallenge.id);
  } else {
    continueBtn.textContent = "BACK TO MAP →";
    continueBtn.onclick = () => { renderMap(); goTo("screen-map"); };
  }

  goTo("screen-success");
}

function getNextChallenge(currentId) {
  const all = CAMPAIGN.flatMap(w => w.challenges).filter(c => !c.isSideChallenge);
  const idx = all.findIndex(c => c.id === currentId);
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
}

function animateCountUp(el, from, to, duration, prefix) {
  const start = performance.now();
  el.classList.add("xp-animate");
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const val = Math.round(from + (to - from) * eased);
    el.textContent = prefix + val;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ────────────────────────────────────────────────────
//  FAILURE SCREEN
// ────────────────────────────────────────────────────
function showFailure(challenge, result) {
  document.getElementById("failure-challenge-id").textContent = `${challenge.id} — ${challenge.title}`;

  const details = [];
  if (!result.matchPasses) {
    const missing = challenge.mustMatch.filter(s => !new RegExp(document.getElementById("regex-input").value).test(s));
    details.push(`<strong>${missing.length} required line(s) not matched:</strong>`);
    missing.forEach(s => details.push(`  &nbsp;✗ <span class="mono">${escapeHtml(s)}</span>`));
  }
  if (!result.excludePasses) {
    let pattern = document.getElementById("regex-input").value;
    let regex;
    try { regex = new RegExp(pattern); } catch (_) { regex = null; }
    const wrongMatches = regex ? challenge.mustNotMatch.filter(s => regex.test(s)) : [];
    if (wrongMatches.length) {
      details.push(`<strong>${wrongMatches.length} excluded line(s) incorrectly matched:</strong>`);
      wrongMatches.forEach(s => details.push(`  &nbsp;✗ <span class="mono">${escapeHtml(s)}</span>`));
    }
  }
  document.getElementById("failure-details").innerHTML = details.join("<br>");

  // Hint
  const hintCostEl = document.getElementById("failure-hint-cost");
  hintCostEl.textContent = `−${challenge.hintCost}pts`;

  document.getElementById("failure-hint-btn").disabled = hintUsed;
  document.getElementById("failure-hint-btn").onclick = () => {
    hintUsed = true;
    hintRevealed = true;
    document.getElementById("hint-text").textContent = challenge.hint;
    document.getElementById("hint-panel").hidden = false;
    document.getElementById("hint-btn").disabled = true;
    goTo("screen-challenge");
  };

  document.getElementById("failure-retry-btn").onclick = () => goTo("screen-challenge");

  goTo("screen-failure");
}

// ────────────────────────────────────────────────────
//  WORLD COMPLETE SCREEN
// ────────────────────────────────────────────────────
function showWorldComplete(world, progress) {
  document.getElementById("world-complete-title").textContent = world.title;

  const worldChallenges = world.challenges;
  const worldXP = worldChallenges.reduce((sum, ch) => {
    const score = progress.scores[ch.id];
    return sum + (score ? score.xp : 0);
  }, 0);
  document.getElementById("world-complete-xp").textContent = `${worldXP} XP earned this world`;

  document.getElementById("world-continue-btn").onclick = () => {
    renderMap();
    goTo("screen-map");
  };

  goTo("screen-world-complete");
}

// ────────────────────────────────────────────────────
//  INIT
// ────────────────────────────────────────────────────
function init() {
  updateTitleBadge();
  goTo("screen-title");
}

init();
