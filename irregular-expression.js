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
          "[INFO] Shutdown complete",
          "[INFO] Last ERROR cleared at 07:58"
        ],
        mustMatch: [
          "[ERROR] Disk space critical",
          "[ERROR] Connection timeout"
        ],
        mustNotMatch: [
          "[INFO] Server started on port 8080",
          "[INFO] Request received from 192.168.1.1",
          "[DEBUG] Cache miss for key user_4421",
          "[INFO] Shutdown complete",
          "[INFO] Last ERROR cleared at 07:58"
        ],
        par: 3,
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
          "2024-03-15 12:00:01 LOGIN success",
          "2024-03-14 22:01:55 TELESCOPE park sequence"
        ],
        // Validation: regex must match the timestamp portion (first 19 chars)
        mustMatch: [
          "2024-03-15 08:42:11",
          "2024/03/15 09:11:03",
          "2024.03.15 10:00:00",
          "2024 03 15 11:45:22",
          "2024-03-15 12:00:01"
        ],
        mustNotMatch: [
          "2024-03-14 22:01:55"
        ],
        par: 10,
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
          "user_0 LOGIN success",
          "session timeout after 30 seconds"
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
          "system REBOOT initiated",
          "session timeout after 30 seconds"
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
          "DELETE /api/session [MED] 500",
          "[ERROR] /api/users endpoint unreachable"
        ],
        mustMatch: [
          "GET /api/users 200",
          "GET /api/users [HIGH] 200",
          "POST /api/login 401",
          "POST /api/login [LOW] 200",
          "DELETE /api/session 200",
          "DELETE /api/session [MED] 500"
        ],
        mustNotMatch: [
          "[ERROR] /api/users endpoint unreachable"
        ],
        par: 10,
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
        par: 16,
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
          "2024-01-20 03:59:59 user_7 LOGOUT",
          "2024-01-20 14:03:22 system HEALTH check passed"
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
          "2024-01-20 04:00:01 system REBOOT",
          "2024-01-20 14:03:22 system HEALTH check passed"
        ],
        par: 4,
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
  ,

  // ═══════════════════════════════════════════════════
  //  WORLD 2
  // ═══════════════════════════════════════════════════
  {
    id: "world-2",
    title: "Data Extraction Bureau",
    subtitle: "Structure the signal.",
    narrative: "The anomaly is confirmed. The Bureau of Signal Intelligence has assumed control of the decryption effort. The transmission contains structured data — field codes, payloads, validity markers. Your tools are the same. The noise is different.",
    conceptsIntroduced: ["character classes []", "ranges [a-z] [A-Z] [0-9]", "shorthand \\d \\w \\s", "negated classes [^]"],
    challenges: [

      // ─── Challenge 2-1 ──────────────────────────────
      {
        id: "2-1",
        title: "Valid Bands",
        briefing: "The relay array received signals on seven frequency bands. Bureau protocol only processes four: L, S, X, and C. Filter out the rest.",
        scenario: "The relay station logs are mixed. Non-standard bands weren't part of the observation window and must be excluded before the batch hits the processing pipeline.",
        learnMore: "A character class [abc] matches any single character from the listed set.\n\n[LSXC] matches L, S, X, or C — exactly one character from that group.\n\nOrder inside the brackets doesn't matter. [LSXC] and [CXSL] are identical.\n\nThis is more precise than (L|S|X|C) and more readable for character-level choices.",
        type: "match",
        corpus: [
          "BAND_L: 1420 MHz hydrogen line candidate",
          "BAND_S: 2.4 GHz sweep complete",
          "BAND_X: 10.5 GHz anomaly flagged",
          "BAND_C: 5.8 GHz carrier detected",
          "BAND_K: 18 GHz no signal",
          "BAND_Q: 45 GHz calibration fault",
          "SATELLITE_XS3: telemetry packet received"
        ],
        mustMatch: [
          "BAND_L: 1420 MHz hydrogen line candidate",
          "BAND_S: 2.4 GHz sweep complete",
          "BAND_X: 10.5 GHz anomaly flagged",
          "BAND_C: 5.8 GHz carrier detected"
        ],
        mustNotMatch: [
          "BAND_K: 18 GHz no signal",
          "BAND_Q: 45 GHz calibration fault",
          "SATELLITE_XS3: telemetry packet received"
        ],
        par: 7,
        baseXP: 75,
        parBonusXP: 25,
        referenceSolution: "BAND_[LSXC]",
        hint: "A character class lets you list the exact characters you want to accept — no more, no less.",
        hintCost: 10,
        conceptNote: "Character classes [abc] match any one character from the set. [LSXC] is more precise than .* and more compact than four separate alternatives.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 2-2 ──────────────────────────────
      {
        id: "2-2",
        title: "Lower Register",
        briefing: "Bureau sector codes are always lowercase letters. Entries using uppercase or mixed-case codes are from the legacy admin system. Match only valid signal sectors.",
        scenario: "Two systems are writing to the same log. The downstream parser only handles the lowercase sector identifiers — admin entries would corrupt the analysis run.",
        learnMore: "A range like [a-z] matches any single lowercase letter. [A-Z] matches any uppercase letter. [0-9] is equivalent to \\d.\n\nRanges work because letters and digits have a defined order in ASCII/Unicode. [a-z] means 'any character from a to z inclusive.'\n\nYou can combine ranges and literals in one class: [a-zA-Z0-9] matches any alphanumeric character.",
        type: "match",
        corpus: [
          "SECTOR_alpha: signal detected",
          "SECTOR_beta: no signal",
          "SECTOR_gamma: weak signal",
          "SECTOR_ALPHA: admin override",
          "SECTOR_Beta: entry malformed",
          "SECTOR_s1gma: entry malformed"
        ],
        mustMatch: [
          "SECTOR_alpha: signal detected",
          "SECTOR_beta: no signal",
          "SECTOR_gamma: weak signal"
        ],
        mustNotMatch: [
          "SECTOR_ALPHA: admin override",
          "SECTOR_Beta: entry malformed",
          "SECTOR_s1gma: entry malformed"
        ],
        par: 8,
        baseXP: 75,
        parBonusXP: 25,
        referenceSolution: "_[a-z]+:",
        hint: "A range like [a-z] matches any single lowercase letter. + means one or more.",
        hintCost: 10,
        conceptNote: "[a-z]+ matches one or more consecutive lowercase letters. The range is more compact than listing every letter. Uppercase and digit characters fall outside it.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 2-3 ──────────────────────────────
      {
        id: "2-3",
        title: "Word Characters",
        briefing: "Calibration records store values as #key#value pairs. Valid keys use only letters, digits, and underscores. Find the well-formed records.",
        scenario: "A sensor batch arrived with inconsistent key formatting. Only records with properly-formed keys can be trusted for downstream analysis.",
        learnMore: "\\w is shorthand for [a-zA-Z0-9_] — any letter, digit, or underscore.\n\n\\d is shorthand for [0-9]. \\s is shorthand for whitespace (space, tab, newline).\n\nThese shorthands are faster to type and immediately readable to anyone who knows regex. \\w+ is 'one or more word characters.'",
        type: "match",
        corpus: [
          "RECORD#freq_1#1420",
          "RECORD#amp_2#0087",
          "RECORD#phase_3#2741",
          "RECORD#fr eq_1#1420",
          "RECORD#amp-2#0087",
          "RECORD#phase.3#2741"
        ],
        mustMatch: [
          "RECORD#freq_1#1420",
          "RECORD#amp_2#0087",
          "RECORD#phase_3#2741"
        ],
        mustNotMatch: [
          "RECORD#fr eq_1#1420",
          "RECORD#amp-2#0087",
          "RECORD#phase.3#2741"
        ],
        par: 7,
        baseXP: 100,
        parBonusXP: 25,
        referenceSolution: "#\\w+#",
        hint: "\\w matches any letter, digit, or underscore — the characters a valid identifier is made of.",
        hintCost: 10,
        conceptNote: "\\w is shorthand for [a-zA-Z0-9_]. It excludes spaces, hyphens, dots, and other punctuation — exactly the characters that make a key malformed here.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 2-4 ──────────────────────────────
      {
        id: "2-4",
        title: "Contaminated Fields",
        briefing: "Cosmic ray interference can flip bits in transmission, producing characters that have no business in a clean data record. Match any line containing such a character.",
        scenario: "The integrity checker flagged several readings as potentially corrupted. Lines containing non-letter, non-digit, non-space characters need to be quarantined for re-request.",
        learnMore: "A negated class [^abc] matches any single character NOT in the listed set.\n\n[^\\w ] matches any character that is neither a word character (\\w) nor a space.\n\nNegated classes invert the logic of a character class. They're useful when it's easier to describe what you don't want than what you do.",
        type: "match",
        corpus: [
          "reading ALPHA 421",
          "reading BETA 808",
          "reading GAMMA 133",
          "reading ALPHA@421",
          "reading BETA#808",
          "reading GAMMA!133"
        ],
        mustMatch: [
          "reading ALPHA@421",
          "reading BETA#808",
          "reading GAMMA!133"
        ],
        mustNotMatch: [
          "reading ALPHA 421",
          "reading BETA 808",
          "reading GAMMA 133"
        ],
        par: 8,
        baseXP: 100,
        parBonusXP: 50,
        referenceSolution: "[^\\w ]",
        hint: "A negated class [^...] matches anything NOT in the set. What characters should a clean record never contain?",
        hintCost: 10,
        conceptNote: "[^\\w ] matches any character that is not a word character and not a space. One such character anywhere in the line is enough to flag it as contaminated.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Side Challenge 2-S ─────────────────────────
      {
        id: "2-S",
        title: "Transcription Errors",
        briefing: "Automated digit readers occasionally confuse numerals with similar-looking letters — 0 as o, 1 as l, 5 as s. Any reading containing a lowercase character must be flagged for re-capture.",
        type: "exclude",
        corpus: [
          "READING:449821",
          "READING:003847",
          "READING:120044",
          "READING:44982l",
          "READING:oo3847",
          "READING:12s044"
        ],
        mustMatch: [
          "READING:44982l",
          "READING:oo3847",
          "READING:12s044"
        ],
        mustNotMatch: [
          "READING:449821",
          "READING:003847",
          "READING:120044"
        ],
        par: 5,
        baseXP: 0,
        parBonusXP: 200,
        referenceSolution: "[a-z]",
        hint: "Every legitimate reading uses only digits in the value field. What character class covers any lowercase letter?",
        hintCost: 10,
        conceptNote: "[a-z] matches any single lowercase letter. In a field that should be purely numeric, one lowercase character anywhere in the line is enough to flag it as a transcription error.",
        isSideChallenge: true,
        isBoss: false
      },

      // ─── Boss Challenge 2-B ─────────────────────────
      {
        id: "2-B",
        title: "The Decoder Ring",
        briefing: "A genuine data record has a band code [LSXC], a lowercase sector name, a colon, then an uppercase hex payload. Pull only the real records from the noise.",
        scenario: "The full signal dump contains valid bureau records, legacy admin entries, and corrupted data — all in the same stream. The decoder needs clean input. You need to extract it.",
        type: "match",
        corpus: [
          "Lalpha:A4F3C2",
          "Sbeta:0B9E1D",
          "Xgamma:FFD700",
          "Kdelta:A1B2C3",
          "Lalpha:a4f3c2",
          "SBETA:A4F3C2",
          "Lsigma:!DEAD!"
        ],
        mustMatch: [
          "Lalpha:A4F3C2",
          "Sbeta:0B9E1D",
          "Xgamma:FFD700"
        ],
        mustNotMatch: [
          "Kdelta:A1B2C3",
          "Lalpha:a4f3c2",
          "SBETA:A4F3C2",
          "Lsigma:!DEAD!"
        ],
        par: 17,
        baseXP: 175,
        parBonusXP: 75,
        referenceSolution: "[LSXC][a-z]+:[0-9A-F]+",
        hint: "A valid record has four distinct parts. Each part has its own character constraint.",
        hintCost: 10,
        conceptNote: "Combines character classes, ranges, and quantifiers: band [LSXC], sector [a-z]+, literal colon, and hex payload [0-9A-F]+. Each constraint eliminates a different class of invalid entry.",
        isSideChallenge: false,
        isBoss: true
      }

    ] // end challenges
  },  // end world-2

  // ═══════════════════════════════════════════════════════════
  // WORLD 3 — The Validation Department
  // ═══════════════════════════════════════════════════════════
  {
    id: "world-3",
    title: "The Validation Department",
    subtitle: "Exact specifications. No exceptions.",
    narrative: "The anomaly data is being analyzed. You've been transferred to the Validation Department. Every transmission must conform to exact format specifications before it can be processed.",
    conceptsIntroduced: ["start anchor ^", "end anchor $", "exact count {n}", "range count {n,m}", "zero-or-more *"],
    challenges: [

      // ─── Challenge 3-1 ───────────────────────────────────────────
      {
        id: "3-1",
        title: "Header Check",
        briefing: "Genuine status reports start with STATUS:. Malformed entries have it buried mid-line. Match only the real ones.",
        type: "match",
        corpus: [
          "STATUS: sector alpha nominal",
          "STATUS: sector beta elevated",
          "STATUS: sector epsilon confirmed",
          "RELAY STATUS: sector gamma pending",
          "WARNING: STATUS elevated in delta",
          "STATIC: interference detected"
        ],
        mustMatch: [
          "STATUS: sector alpha nominal",
          "STATUS: sector beta elevated",
          "STATUS: sector epsilon confirmed"
        ],
        mustNotMatch: [
          "RELAY STATUS: sector gamma pending",
          "WARNING: STATUS elevated in delta",
          "STATIC: interference detected"
        ],
        par: 7,
        baseXP: 75,
        parBonusXP: 35,
        referenceSolution: "^STATUS",
        learnMore: "The ^ anchor tells the engine to match only at the very start of the string. Without it, STATUS would be found anywhere in the line — including mid-line malformed entries. Adding ^ makes position part of the pattern.",
        hint: "You need to pin the match to a specific position in the line. What anchor means 'at the start'?",
        hintCost: 10,
        conceptNote: "^ anchors the match to the start of the string. Without it, STATUS matches lines 4 and 5 as well — position doesn't matter to an unanchored pattern. With ^STATUS, only lines that begin with STATUS qualify.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 3-2 ───────────────────────────────────────────
      {
        id: "3-2",
        title: "Transmission End",
        briefing: "Valid confirmations end with RECEIVED. Some lines have RECEIVED buried mid-line instead. Match only the genuine ones.",
        type: "match",
        corpus: [
          "PROBE_A: transmission RECEIVED",
          "PROBE_B: packet RECEIVED",
          "PROBE_E: status RECEIVED",
          "relay RECEIVED: signal_c pending",
          "RECEIVED confirmation: PROBE_D",
          "PROBE_F: RECEIVED and processed"
        ],
        mustMatch: [
          "PROBE_A: transmission RECEIVED",
          "PROBE_B: packet RECEIVED",
          "PROBE_E: status RECEIVED"
        ],
        mustNotMatch: [
          "relay RECEIVED: signal_c pending",
          "RECEIVED confirmation: PROBE_D",
          "PROBE_F: RECEIVED and processed"
        ],
        par: 9,
        baseXP: 75,
        parBonusXP: 35,
        referenceSolution: "RECEIVED$",
        learnMore: "The $ anchor tells the engine to match only at the very end of the string. RECEIVED$ only matches when RECEIVED is the last thing on the line. Without $, the pattern matches all six lines.",
        hint: "You need to pin the match to a specific position. What anchor means 'at the end'?",
        hintCost: 10,
        conceptNote: "$ anchors the match to the end of the string. Without it, RECEIVED matches every line in the corpus — it appears in all six. With RECEIVED$, only lines where RECEIVED is the final word qualify.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 3-3 ───────────────────────────────────────────
      {
        id: "3-3",
        title: "Six-Digit Codes",
        briefing: "Station identifiers must be exactly six digits. Match the valid ones and ignore the malformed entries.",
        type: "match",
        corpus: [
          "STA-104289: nominal",
          "STA-987134: elevated",
          "STA-440017: confirmed",
          "STA-20345: format error",
          "STA-0791: format error",
          "STA-82: format error"
        ],
        mustMatch: [
          "STA-104289: nominal",
          "STA-987134: elevated",
          "STA-440017: confirmed"
        ],
        mustNotMatch: [
          "STA-20345: format error",
          "STA-0791: format error",
          "STA-82: format error"
        ],
        par: 5,
        baseXP: 75,
        parBonusXP: 35,
        referenceSolution: "\\d{6}",
        learnMore: "{n} matches exactly n repetitions of the preceding element. \\d{6} is equivalent to \\d\\d\\d\\d\\d\\d but far more readable — and the advantage grows with larger counts. The engine will not match if the digit run is shorter than n.",
        hint: "You need exactly six consecutive digits. Repeating \\d six times works — but there's a more concise notation.",
        hintCost: 10,
        conceptNote: "\\d{6} matches exactly six consecutive digits — no more, no fewer. The invalid entries have 2–5 digits, so \\d{6} finds nothing in them. Compare to writing \\d\\d\\d\\d\\d\\d: {n} notation is shorter and scales cleanly.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 3-4 ───────────────────────────────────────────
      {
        id: "3-4",
        title: "Variable-Length Codes",
        briefing: "Sector codes must be 2 to 4 uppercase letters — no more, no fewer. The codes always appear at the end of the line after a colon. Match the valid entries.",
        type: "match",
        corpus: [
          "sector code:AB",
          "sector code:XYZ",
          "sector code:LMNO",
          "sector code:Q",
          "sector code:PQRST",
          "sector code:ABCDEF"
        ],
        mustMatch: [
          "sector code:AB",
          "sector code:XYZ",
          "sector code:LMNO"
        ],
        mustNotMatch: [
          "sector code:Q",
          "sector code:PQRST",
          "sector code:ABCDEF"
        ],
        par: 10,
        baseXP: 75,
        parBonusXP: 35,
        referenceSolution: ":[A-Z]{2,4}$",
        learnMore: "{n,m} matches between n and m repetitions inclusive. Combine it with $ to anchor to the end of the line — otherwise a 5-letter code would partially match (the engine would find a valid 4-letter substring within it).",
        hint: "The code is always the last thing on the line. You need a range quantifier and an end anchor to avoid partially matching longer codes.",
        hintCost: 10,
        conceptNote: ":[A-Z]{2,4}$ combines three ideas: the colon anchors the match context, {2,4} enforces the length range, and $ prevents partial matches against longer codes. Without $, PQRST would match as PQRS.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Side Challenge 3-S ─────────────────────────
      {
        id: "3-S",
        title: "Bad Packets",
        briefing: "Signal color-maps use 6-digit hex codes — digits 0-9 and uppercase A-F only. Flag any packet containing a character outside that valid range.",
        type: "exclude",
        corpus: [
          "#A4F3C2 SECTOR_1",
          "#0B9E1D SECTOR_2",
          "#FFD700 SECTOR_3",
          "#G4A1B2 SECTOR_4",
          "#4b9e1d SECTOR_5",
          "#A4F3Z2 SECTOR_6"
        ],
        mustMatch: [
          "#G4A1B2 SECTOR_4",
          "#4b9e1d SECTOR_5",
          "#A4F3Z2 SECTOR_6"
        ],
        mustNotMatch: [
          "#A4F3C2 SECTOR_1",
          "#0B9E1D SECTOR_2",
          "#FFD700 SECTOR_3"
        ],
        par: 12,
        baseXP: 0,
        parBonusXP: 200,
        referenceSolution: "#\\w*[G-Za-z]",
        hint: "Start from the # to avoid matching the SECTOR labels. Use * to skip over any valid hex characters, then require a character that falls outside the valid range.",
        hintCost: 10,
        conceptNote: "#\\w*[G-Za-z] anchors to the hex block via #, uses \\w* to skip any leading valid characters, then requires an invalid one. The SECTOR labels are never reached because the pattern always starts from #.",
        isSideChallenge: true,
        isBoss: false
      },

      // ─── Boss Challenge 3-B ─────────────────────────
      {
        id: "3-B",
        title: "Full Compliance",
        briefing: "Transmission records must follow a strict format: exactly 3 digits, a dash, exactly 2 uppercase letters, a dash, exactly 6 digits. The full line — nothing more, nothing less.",
        type: "match",
        corpus: [
          "042-XY-198734",
          "771-AB-003847",
          "553-QR-441290",
          "42-XY-198734",
          "042-XYZ-198734",
          "042-XY-1987340",
          "042-12-198734",
          "042-xy-198734"
        ],
        mustMatch: [
          "042-XY-198734",
          "771-AB-003847",
          "553-QR-441290"
        ],
        mustNotMatch: [
          "42-XY-198734",
          "042-XYZ-198734",
          "042-XY-1987340",
          "042-12-198734",
          "042-xy-198734"
        ],
        par: 22,
        baseXP: 175,
        parBonusXP: 75,
        referenceSolution: "^\\d{3}-[A-Z]{2}-\\d{6}$",
        hint: "You need to validate the entire line from start to finish — no partial matches. Each field has a specific type and exact length.",
        hintCost: 10,
        conceptNote: "^\\d{3}-[A-Z]{2}-\\d{6}$ brings together every World 3 concept: ^ and $ ensure the full line matches, \\d{3} and \\d{6} enforce exact digit counts, and [A-Z]{2} requires exactly two uppercase letters. Any deviation in length or character type fails.",
        isSideChallenge: false,
        isBoss: true
      }

    ] // end challenges
  },  // end world-3

  // ═══════════════════════════════════════════════════════════
  // WORLD 4 — The Pattern Recognition Division
  // ═══════════════════════════════════════════════════════════
  {
    id: "world-4",
    title: "Pattern Recognition Division",
    subtitle: "Multiple signals. One pattern.",
    narrative: "The anomaly is broadcasting on multiple channels simultaneously. The Pattern Recognition Division is tasked with classifying and routing each signal type. A single pattern must handle many variants.",
    conceptsIntroduced: ["alternation |", "groups ()", "groups with quantifiers", "groups with alternation"],
    challenges: [

      // ─── Challenge 4-1 ───────────────────────────────────────────
      {
        id: "4-1",
        title: "Either/Or",
        briefing: "Only ALPHA and BETA probe transmissions are operational. GAMMA, DELTA, and EPSILON are background noise. Capture the live signals.",
        type: "match",
        corpus: [
          "PROBE-7 ALPHA: active",
          "PROBE-2 BETA: active",
          "PROBE-9 ALPHA: active",
          "PROBE-5 GAMMA: active",
          "PROBE-1 DELTA: active",
          "PROBE-3 EPSILON: active"
        ],
        mustMatch: [
          "PROBE-7 ALPHA: active",
          "PROBE-2 BETA: active",
          "PROBE-9 ALPHA: active"
        ],
        mustNotMatch: [
          "PROBE-5 GAMMA: active",
          "PROBE-1 DELTA: active",
          "PROBE-3 EPSILON: active"
        ],
        par: 9,
        baseXP: 75,
        parBonusXP: 35,
        referenceSolution: "ALPHA|BETA",
        learnMore: "The | operator means OR — the engine tries the left alternative first, and if it fails, tries the right. ALPHA|BETA matches any string containing either word. It's the simplest way to express a choice between two patterns.",
        hint: "You need to match one of two possible words. There's an operator that means 'this or that'.",
        hintCost: 10,
        conceptNote: "ALPHA|BETA matches lines containing either ALPHA or BETA. The pipe | is the alternation operator — the regex engine tests each alternative in order. GAMMA, DELTA, and EPSILON match neither, so they're correctly excluded.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 4-2 ───────────────────────────────────────────
      {
        id: "4-2",
        title: "Shared Structure",
        briefing: "NOMINAL and ELEVATED status reports are valid. But some lines contain those words in a different context — a noise label or interference flag. Match only the genuine status reports.",
        type: "match",
        corpus: [
          "NOMINAL STATUS — sector alpha",
          "ELEVATED STATUS — sector beta",
          "NOMINAL STATUS — sector epsilon",
          "NOMINAL INTERFERENCE detected",
          "ELEVATED NOISE detected",
          "CRITICAL STATUS — sector gamma"
        ],
        mustMatch: [
          "NOMINAL STATUS — sector alpha",
          "ELEVATED STATUS — sector beta",
          "NOMINAL STATUS — sector epsilon"
        ],
        mustNotMatch: [
          "NOMINAL INTERFERENCE detected",
          "ELEVATED NOISE detected",
          "CRITICAL STATUS — sector gamma"
        ],
        par: 24,
        baseXP: 75,
        parBonusXP: 35,
        referenceSolution: "(NOMINAL|ELEVATED) STATUS",
        learnMore: "Parentheses () create a group. Here they contain the alternation NOMINAL|ELEVATED, so the | only applies inside the group. The surrounding pattern — the space and STATUS — applies to whichever alternative matched. Without grouping, the | would split the entire pattern in two.",
        hint: "NOMINAL and ELEVATED both appear in mustNotMatch lines, so you can't match just those words alone. You need to match them only when followed by STATUS. Groups let you apply alternation to just part of a pattern.",
        hintCost: 10,
        conceptNote: "(NOMINAL|ELEVATED) STATUS uses a group to scope the alternation. Without parentheses, NOMINAL|ELEVATED STATUS would mean 'NOMINAL' or 'ELEVATED STATUS' — the | splits the whole pattern. The group confines the choice, then STATUS follows either branch.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 4-3 ───────────────────────────────────────────
      {
        id: "4-3",
        title: "Repeating Segments",
        briefing: "Valid record IDs consist of exactly four two-digit segments separated by dashes: NN-NN-NN-NN. Match the valid IDs and reject the malformed ones.",
        type: "match",
        corpus: [
          "ID:14-03-29-88 valid",
          "ID:07-11-58-44 valid",
          "ID:99-00-12-37 valid",
          "ID:14-03-29 invalid",
          "ID:14-03-29-88-12 invalid",
          "ID:14-3-29-88 invalid"
        ],
        mustMatch: [
          "ID:14-03-29-88 valid",
          "ID:07-11-58-44 valid",
          "ID:99-00-12-37 valid"
        ],
        mustNotMatch: [
          "ID:14-03-29 invalid",
          "ID:14-03-29-88-12 invalid",
          "ID:14-3-29-88 invalid"
        ],
        par: 21,
        baseXP: 75,
        parBonusXP: 35,
        referenceSolution: "^ID:(\\d{2}-){3}\\d{2} ",
        learnMore: "A group followed by a quantifier repeats the entire group. (\\d{2}-){3} means 'two digits and a dash, exactly three times' — equivalent to \\d{2}-\\d{2}-\\d{2}- but significantly shorter for repeated structures. The space after the final \\d{2} prevents matching the 5-segment invalid entry.",
        hint: "Three of the four segments share the same pattern: two digits followed by a dash. A group with an exact count can express that repetition concisely.",
        hintCost: 10,
        conceptNote: "(\\d{2}-){3} repeats the group '\\d{2}-' exactly three times. Combined with a trailing \\d{2} for the final segment, this is far more concise than writing \\d{2}-\\d{2}-\\d{2}-\\d{2}. The space anchor prevents the 5-segment entry from matching by requiring a space after the fourth segment.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 4-4 ───────────────────────────────────────────
      {
        id: "4-4",
        title: "Dual Format",
        briefing: "Signal logs record two types of events: WARN entries with a 3-digit code, and INFO entries with a 5-digit code. Both end with :LOG. Match valid entries of either type.",
        type: "match",
        corpus: [
          "WARN-042:LOG",
          "WARN-881:LOG",
          "INFO-10291:LOG",
          "INFO-00774:LOG",
          "WARN-10291:LOG",
          "INFO-042:LOG",
          "WARN-042:ERR",
          "DEBUG-042:LOG"
        ],
        mustMatch: [
          "WARN-042:LOG",
          "WARN-881:LOG",
          "INFO-10291:LOG",
          "INFO-00774:LOG"
        ],
        mustNotMatch: [
          "WARN-10291:LOG",
          "INFO-042:LOG",
          "WARN-042:ERR",
          "DEBUG-042:LOG"
        ],
        par: 28,
        baseXP: 100,
        parBonusXP: 50,
        referenceSolution: "^(WARN-\\d{3}|INFO-\\d{5}):LOG$",
        learnMore: "Groups and alternation compose naturally. ^(WARN-\\d{3}|INFO-\\d{5}):LOG$ uses a group to contain two structurally different alternatives, each with its own quantifier. The shared :LOG$ suffix lives outside the group and applies to whichever branch matched.",
        hint: "The two valid formats share a suffix (:LOG) but have different prefixes and different digit counts. A group can hold both alternatives while the shared parts sit outside.",
        hintCost: 10,
        conceptNote: "^(WARN-\\d{3}|INFO-\\d{5}):LOG$ puts the two format variants inside a group, with :LOG$ outside applying to both. The alternation inside the group handles the structural difference between WARN (3 digits) and INFO (5 digits). Anchors ensure the full line matches.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Side Challenge 4-S ─────────────────────────
      {
        id: "4-S",
        title: "Handshake Variants",
        briefing: "Successful handshakes use one of two formats: ALPHA probes use a 3-digit code, BETA relays use a 4-digit code. Both are wrapped in HS-...-OK. Match valid handshakes of either type.",
        type: "match",
        corpus: [
          "HS-ALPHA-142-OK",
          "HS-BETA-9834-OK",
          "HS-ALPHA-007-OK",
          "HS-BETA-1100-OK",
          "HS-GAMMA-142-OK",
          "HS-ALPHA-9834-OK",
          "HS-BETA-142-OK"
        ],
        mustMatch: [
          "HS-ALPHA-142-OK",
          "HS-BETA-9834-OK",
          "HS-ALPHA-007-OK",
          "HS-BETA-1100-OK"
        ],
        mustNotMatch: [
          "HS-GAMMA-142-OK",
          "HS-ALPHA-9834-OK",
          "HS-BETA-142-OK"
        ],
        par: 28,
        baseXP: 0,
        parBonusXP: 200,
        referenceSolution: "HS-(ALPHA-\\d{3}|BETA-\\d{4})-OK",
        hint: "The two variants have different internal structures — ALPHA uses 3 digits, BETA uses 4. A group containing alternation can handle both while the shared HS-...-OK wrapping sits outside.",
        hintCost: 10,
        conceptNote: "HS-(ALPHA-\\d{3}|BETA-\\d{4})-OK wraps two structurally different alternatives in a single group. The shared prefix HS- and suffix -OK are factored out. Without the group, you'd need to write the full pattern twice: HS-ALPHA-\\d{3}-OK|HS-BETA-\\d{4}-OK.",
        isSideChallenge: true,
        isBoss: false
      },

      // ─── Boss Challenge 4-B ─────────────────────────
      {
        id: "4-B",
        title: "Signal Matrix",
        briefing: "The routing system accepts two record formats: PRB type uses 3-digit codes, RLY type uses 4-digit codes. Both must end with :OK. Validate complete records of either type.",
        type: "match",
        corpus: [
          "PRB:042:OK",
          "PRB:781:OK",
          "RLY:9834:OK",
          "RLY:1102:OK",
          "PRB:9834:OK",
          "RLY:042:OK",
          "PRB:042:FAIL",
          "XMT:042:OK"
        ],
        mustMatch: [
          "PRB:042:OK",
          "PRB:781:OK",
          "RLY:9834:OK",
          "RLY:1102:OK"
        ],
        mustNotMatch: [
          "PRB:9834:OK",
          "RLY:042:OK",
          "PRB:042:FAIL",
          "XMT:042:OK"
        ],
        par: 26,
        baseXP: 175,
        parBonusXP: 75,
        referenceSolution: "^(PRB:\\d{3}|RLY:\\d{4}):OK$",
        hint: "Two formats, one pattern. Each format has a different type code and a different digit count. The :OK ending is shared. Anchors ensure nothing extra sneaks through.",
        hintCost: 10,
        conceptNote: "^(PRB:\\d{3}|RLY:\\d{4}):OK$ synthesises all four worlds: ^ and $ from World 3, {3} and {4} exact counts from World 3, and | alternation with () grouping from World 4. The group holds the two format variants; the shared :OK lives outside, anchored to the end.",
        isSideChallenge: false,
        isBoss: true
      }

    ] // end challenges
  }  // end world-4

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
  },
  "world-2": {
    worldNode: { x: 970, y: 300 },
    challenges: {
      "2-1": { x: 1100, y: 300 },
      "2-2": { x: 1230, y: 300 },
      "2-3": { x: 1360, y: 300 },
      "2-4": { x: 1490, y: 300 },
      "2-S": { x: 1490, y: 450, side: true },
      "2-B": { x: 1640, y: 300, boss: true }
    }
  },
  "world-3": {
    worldNode: { x: 1820, y: 300 },
    challenges: {
      "3-1": { x: 1950, y: 300 },
      "3-2": { x: 2080, y: 300 },
      "3-3": { x: 2210, y: 300 },
      "3-4": { x: 2340, y: 300 },
      "3-S": { x: 2340, y: 450, side: true },
      "3-B": { x: 2490, y: 300, boss: true }
    }
  },
  "world-4": {
    worldNode: { x: 2670, y: 300 },
    challenges: {
      "4-1": { x: 2800, y: 300 },
      "4-2": { x: 2930, y: 300 },
      "4-3": { x: 3060, y: 300 },
      "4-4": { x: 3190, y: 300 },
      "4-S": { x: 3190, y: 450, side: true },
      "4-B": { x: 3340, y: 300, boss: true }
    }
  }
};

function getChallengeState(challengeId, progress) {
  if (progress.completedChallenges.includes(challengeId)) return "completed";

  // Find which world this challenge belongs to
  let worldObj = null, worldIdx = -1;
  for (let i = 0; i < CAMPAIGN.length; i++) {
    if (CAMPAIGN[i].challenges.some(c => c.id === challengeId)) {
      worldObj = CAMPAIGN[i];
      worldIdx = i;
      break;
    }
  }
  if (!worldObj) return "locked";

  const worldChallenges = worldObj.challenges;
  const ch = worldChallenges.find(c => c.id === challengeId);

  // Boss: all non-side, non-boss in same world must be complete
  if (ch.isBoss) {
    const main = worldChallenges.filter(c => !c.isBoss && !c.isSideChallenge);
    return main.every(c => progress.completedChallenges.includes(c.id)) ? "available" : "locked";
  }

  // Side challenge: unlocks when the previous main challenge in same world is complete
  if (ch.isSideChallenge) {
    const scIdx = worldChallenges.indexOf(ch);
    const prevMain = worldChallenges.slice(0, scIdx).filter(c => !c.isSideChallenge && !c.isBoss);
    const unlock = prevMain[prevMain.length - 1];
    if (!unlock) return "available";
    return progress.completedChallenges.includes(unlock.id) ? "available" : "locked";
  }

  // First challenge of the first world: always available
  const mainInWorld = worldChallenges.filter(c => !c.isSideChallenge && !c.isBoss);
  if (ch === mainInWorld[0]) {
    if (worldIdx === 0) return "available";
    // First challenge of world 2+: requires previous world's boss
    const prevBoss = CAMPAIGN[worldIdx - 1].challenges.find(c => c.isBoss);
    return prevBoss && progress.completedChallenges.includes(prevBoss.id) ? "available" : "locked";
  }

  // Regular challenge: previous main challenge in same world must be complete
  const chIdx = worldChallenges.indexOf(ch);
  const prevMain = worldChallenges.slice(0, chIdx).filter(c => !c.isSideChallenge && !c.isBoss);
  const prev = prevMain[prevMain.length - 1];
  if (!prev) return "available";
  return progress.completedChallenges.includes(prev.id) ? "available" : "locked";
}

function renderMap() {
  const progress = loadProgress();
  document.getElementById("map-xp").textContent = `XP: ${progress.xp}`;

  // Show narrative for the furthest world with available or completed challenges
  let narrativeWorld = CAMPAIGN[0];
  for (const w of CAMPAIGN) {
    if (w.challenges.some(c =>
      progress.completedChallenges.includes(c.id) ||
      getChallengeState(c.id, progress) === "available"
    )) {
      narrativeWorld = w;
    }
  }
  document.getElementById("world-narrative-text").textContent = narrativeWorld.narrative;

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

  CAMPAIGN.forEach((world, wi) => {
    const layout = MAP_LAYOUT[world.id];
    if (!layout) return;

    const mainChallenges = world.challenges.filter(c => !c.isSideChallenge && !c.isBoss);
    const bossChallenge  = world.challenges.find(c => c.isBoss);
    const sideChallenges = world.challenges.filter(c => c.isSideChallenge);

    // ── Main path connectors (including to boss) ──────
    const fullPath = [...mainChallenges.map(c => c.id), ...(bossChallenge ? [bossChallenge.id] : [])];
    for (let i = 0; i < fullPath.length - 1; i++) {
      const a = layout.challenges[fullPath[i]];
      const b = layout.challenges[fullPath[i + 1]];
      if (a && b) svg.appendChild(svgEl("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#1e3a5f", "stroke-width": 2 }));
    }

    // ── World hub to first challenge ──────────────────
    if (mainChallenges.length > 0) {
      const w  = layout.worldNode;
      const c  = layout.challenges[mainChallenges[0].id];
      if (c) svg.appendChild(svgEl("line", { x1: w.x + 44, y1: w.y, x2: c.x - 20, y2: c.y, stroke: "#1e3a5f", "stroke-width": 2 }));
    }

    // ── Side challenge dashed connectors ─────────────
    sideChallenges.forEach(sc => {
      const scIdx   = world.challenges.indexOf(sc);
      const prevMain = world.challenges.slice(0, scIdx).filter(c => !c.isSideChallenge && !c.isBoss);
      const parent  = prevMain[prevMain.length - 1];
      if (parent) {
        const a = layout.challenges[parent.id];
        const b = layout.challenges[sc.id];
        if (a && b) svg.appendChild(svgEl("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#1e3a5f", "stroke-width": 2, "stroke-dasharray": "5 4" }));
      }
    });

    // ── Cross-world connector to next world ──────────
    if (wi < CAMPAIGN.length - 1) {
      const nextLayout = MAP_LAYOUT[CAMPAIGN[wi + 1].id];
      if (bossChallenge && nextLayout) {
        const bossPos = layout.challenges[bossChallenge.id];
        const nextHub = nextLayout.worldNode;
        svg.appendChild(svgEl("line", { x1: bossPos.x, y1: bossPos.y, x2: nextHub.x - 44, y2: nextHub.y, stroke: "#1e3a5f", "stroke-width": 2 }));
      }
    }

    // ── World hub node ────────────────────────────────
    {
      const { x, y } = layout.worldNode;
      const g = svgEl("g", { class: "map-node-world" });

      const circle = svgEl("circle", { cx: x, cy: y, r: 44, fill: "#16213e", stroke: "#0f9b8e", "stroke-width": 3 });
      g.appendChild(circle);

      const wNum = wi + 1;
      const label = svgEl("text", { x, y: y - 6, "text-anchor": "middle", fill: "#0f9b8e", "font-size": 11, "font-family": "JetBrains Mono, monospace", "font-weight": 700 });
      label.textContent = `WORLD ${wNum}`;
      g.appendChild(label);

      // Split subtitle on space into two lines
      const titleWords = world.title.split(" ");
      const mid = Math.ceil(titleWords.length / 2);
      const line1 = titleWords.slice(0, mid).join(" ");
      const line2 = titleWords.slice(mid).join(" ");
      const sub1 = svgEl("text", { x, y: y + 10, "text-anchor": "middle", fill: "#7a7a9a", "font-size": 9, "font-family": "system-ui, sans-serif" });
      sub1.textContent = line1;
      g.appendChild(sub1);
      if (line2) {
        const sub2 = svgEl("text", { x, y: y + 22, "text-anchor": "middle", fill: "#7a7a9a", "font-size": 9, "font-family": "system-ui, sans-serif" });
        sub2.textContent = line2;
        g.appendChild(sub2);
      }

      svg.appendChild(g);
    }

    // ── Challenge nodes ───────────────────────────────
    world.challenges.forEach(challenge => {
      const pos = layout.challenges[challenge.id];
      if (!pos) return;
      const state = getChallengeState(challenge.id, progress);

      const r = challenge.isBoss ? 32 : challenge.isSideChallenge ? 20 : 24;
      const g = svgEl("g", { class: `map-node node-${state}${challenge.isBoss ? " node-boss" : ""}${challenge.isSideChallenge ? " node-side" : ""}` });

      if (challenge.isBoss && state === "completed") {
        g.appendChild(svgEl("circle", { cx: pos.x, cy: pos.y, r: r + 12, fill: "none", stroke: "rgba(245,166,35,0.2)", "stroke-width": 8 }));
      }
      if (state === "completed" && !challenge.isBoss) {
        g.appendChild(svgEl("circle", { cx: pos.x, cy: pos.y, r: r + 8, fill: "none", stroke: "rgba(15,155,142,0.15)", "stroke-width": 6 }));
      }

      const strokeColor = challenge.isBoss ? "#f5a623" : state === "locked" ? "#3a3a5a" : "#0f9b8e";
      const fillColor   = state === "completed"
        ? (challenge.isBoss ? "#f5a623" : "#0f9b8e")
        : state === "locked" ? "#1a1a2e" : "transparent";

      g.appendChild(svgEl("circle", {
        cx: pos.x, cy: pos.y, r,
        fill: fillColor, stroke: strokeColor,
        "stroke-width": challenge.isBoss ? 3 : 2,
        ...(challenge.isSideChallenge ? { "stroke-dasharray": "4 3" } : {}),
        ...(state === "completed" && !challenge.isBoss ? { filter: "url(#glow-teal)" } : {}),
        ...(challenge.isBoss && state !== "locked" ? { filter: "url(#glow-gold)" } : {})
      }));

      const labelColor = state === "completed" ? "#fff" : state === "locked" ? "#3a3a5a" : challenge.isBoss ? "#f5a623" : "#0f9b8e";
      const idLabel = svgEl("text", { x: pos.x, y: pos.y + 4, "text-anchor": "middle", fill: labelColor, "font-size": challenge.isBoss ? 11 : challenge.isSideChallenge ? 9 : 10, "font-family": "JetBrains Mono, monospace", "font-weight": 700 });
      idLabel.textContent = challenge.id;
      g.appendChild(idLabel);

      const titleLabel = svgEl("text", { x: pos.x, y: pos.y + r + 14, "text-anchor": "middle", fill: state === "locked" ? "#3a3a5a" : "#7a7a9a", "font-size": 9, "font-family": "system-ui, sans-serif" });
      titleLabel.textContent = challenge.title;
      g.appendChild(titleLabel);

      if (state === "locked") {
        const lock = svgEl("text", { x: pos.x, y: pos.y + 5, "text-anchor": "middle", fill: "#3a3a5a", "font-size": 12 });
        lock.textContent = "🔒";
        g.appendChild(lock);
      }

      if (state !== "locked") {
        g.style.cursor = "pointer";
        g.addEventListener("click", () => loadChallenge(challenge.id));
      }

      svg.appendChild(g);
    });
  }); // end CAMPAIGN.forEach
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
