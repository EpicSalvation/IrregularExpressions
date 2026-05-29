/* ═══════════════════════════════════════════════════
   IRREGULAR EXPRESSION — application logic
   No frameworks. Pure ES2020+.
═══════════════════════════════════════════════════ */
import {
  fetchCurrentUser,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  fetchProgress,
  pushProgress,
} from './auth-client.js?v=1.6';

"use strict";

// ────────────────────────────────────────────────────
//  CAMPAIGN DATA — World 1 (full)
// ────────────────────────────────────────────────────
const CAMPAIGN = [

  // ═══════════════════════════════════════════════════
  //  WORLD 0 — Tutorial / SETI Orientation
  // ═══════════════════════════════════════════════════
  {
    id: "world-0",
    title: "SETI Orientation",
    subtitle: "Learn the tools.",
    narrative: "Welcome to the SETI Institute. Your first week as a data intern starts now. The mission sounds thrilling — scanning the cosmos for signs of intelligent life. The reality? Terabytes of raw telescope data, mountains of noise, and a terminal. Your supervisor slides you a keyboard and says two words: learn regex.",
    conceptsIntroduced: ["literal matching", "dot wildcard (.)", "one-or-more (+)"],
    challenges: [

      // ─── Challenge 0-1 ──────────────────────────────
      {
        id: "0-1",
        title: "Welcome Aboard",
        briefing: "Your first assignment: scan last night's telescope log and pull every line marked as a signal event. Signal lines all contain the word SIGNAL — nothing else in the log does.",
        scenario: "The lead analyst needs a clean list of signal events from last night's sweep before the morning briefing. The log is full of noise, calibration, and status entries that need to be filtered out.",
        learnMore: "A regex is a pattern you use to search text. At its simplest, a pattern is just the literal text you're looking for.\n\nThe pattern SIGNAL matches any line containing the exact sequence of characters S-I-G-N-A-L. Case matters: signal would not match SIGNAL.\n\nThis is where every regex journey starts — just describe exactly what you're looking for, character by character.",
        type: "match",
        corpus: [
          "SIGNAL received on band L at 03:42:11",
          "NOISE burst detected on array 4",
          "SIGNAL candidate at 1420 MHz logged",
          "CALIBRATION sequence complete",
          "SIGNAL anomaly flagged for review",
          "STATUS telescope array nominal"
        ],
        mustMatch: [
          "SIGNAL received on band L at 03:42:11",
          "SIGNAL candidate at 1420 MHz logged",
          "SIGNAL anomaly flagged for review"
        ],
        mustNotMatch: [
          "NOISE burst detected on array 4",
          "CALIBRATION sequence complete",
          "STATUS telescope array nominal"
        ],
        par: 6,
        baseXP: 25,
        parBonusXP: 10,
        referenceSolution: "SIGNAL",
        hint: "The simplest regex is the exact text you want to find.",
        hintCost: 5,
        conceptNote: "A literal pattern matches text exactly as written. SIGNAL finds every line containing SIGNAL — simple as that. Most regex patterns start here.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 0-2 ──────────────────────────────
      {
        id: "0-2",
        title: "Transmission Variants",
        briefing: "Three legacy receiver arrays log their status pings with slightly different separators: STATUS_OK, STATUS-OK, and STATUS OK. The monitoring dashboard needs one pattern to catch all three.",
        scenario: "The monitoring system aggregates feeds from three legacy systems that each evolved independently. You can't change the source systems — you need one pattern flexible enough to handle all their status formats.",
        learnMore: "In regex, the dot . is a wildcard. It matches any single character — a letter, digit, symbol, or even a space.\n\nThis is useful when data comes from different sources with slightly different formatting. Instead of writing three separate patterns, one pattern with a dot absorbs all variants.\n\nPrecision: . matches exactly one character — a placeholder for 'I don't care what's here, as long as something is.'",
        type: "match",
        corpus: [
          "STATUS_OK receiver array 1 online",
          "STATUS-OK receiver array 2 verified",
          "STATUS OK receiver array 3 aligned",
          "STATUS FAILED array 4 offline",
          "NO_STATUS_DATA available",
          "SYSTEM STATUS running"
        ],
        mustMatch: [
          "STATUS_OK receiver array 1 online",
          "STATUS-OK receiver array 2 verified",
          "STATUS OK receiver array 3 aligned"
        ],
        mustNotMatch: [
          "STATUS FAILED array 4 offline",
          "NO_STATUS_DATA available",
          "SYSTEM STATUS running"
        ],
        par: 9,
        baseXP: 25,
        parBonusXP: 10,
        referenceSolution: "STATUS.OK",
        hint: "A single character differs between the three lines you want. There's a wildcard in regex that matches any one character.",
        hintCost: 5,
        conceptNote: "The dot . matches any single character. STATUS.OK matches STATUS_OK, STATUS-OK, and STATUS OK — three separators, one pattern.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 0-3 ──────────────────────────────
      {
        id: "0-3",
        title: "Signal Trace",
        briefing: "The array controller logs every active receiver with its identifier. All active array lines start with ARRAY_ followed by the array ID — which varies widely in format and length. Match them all.",
        scenario: "The array management system needs to isolate all active array entries from the mixed-source log. Array IDs were assigned by different teams over the years and follow no consistent naming convention.",
        learnMore: "The + quantifier means 'one or more of the preceding element.'\n\nWhen combined with . (any character), .+ matches any sequence of one or more characters.\n\nARRAY_.+ means: the literal text ARRAY_ followed by at least one character of anything. This handles any identifier regardless of what it is or how long it is.\n\nNote the difference: . matches exactly one character, .+ matches one or more — as many as needed.",
        type: "match",
        corpus: [
          "ARRAY_1 signal acquired",
          "ARRAY_NORTH alignment complete",
          "ARRAY_7B frequency locked",
          "BEACON_7 ping sent",
          "SECTOR_A offline",
          "RELAY station standby"
        ],
        mustMatch: [
          "ARRAY_1 signal acquired",
          "ARRAY_NORTH alignment complete",
          "ARRAY_7B frequency locked"
        ],
        mustNotMatch: [
          "BEACON_7 ping sent",
          "SECTOR_A offline",
          "RELAY station standby"
        ],
        par: 8,
        baseXP: 25,
        parBonusXP: 10,
        referenceSolution: "ARRAY_.+",
        hint: "You need to match anything that comes after ARRAY_ — regardless of what it is. The dot matches one character. How do you match one or more?",
        hintCost: 5,
        conceptNote: ".+ matches one or more of any character. Combined with a literal prefix, it captures open-ended content after a known anchor.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Side Challenge 0-S ─────────────────────────
      {
        id: "0-S",
        title: "Cross-Band Signals",
        briefing: "The signal router tags verified cross-band transmissions as TX followed by one separator character and then SIGNAL. Identify all properly tagged transmissions — filter out noise and malformed entries.",
        scenario: "The cross-band router uses a two-part tag to mark verified transmissions. Some lines in the overnight log are noise or malformed tags that shouldn't pass through to the processing pipeline.",
        type: "match",
        corpus: [
          "TX.SIGNAL cross-band verified",
          "TX-SIGNAL carrier confirmed",
          "TX_SIGNAL encoding active",
          "TX NOISE background radiation",
          "EXTRA SIGNAL detected",
          "TXX SIGNAL double-tagged error"
        ],
        mustMatch: [
          "TX.SIGNAL cross-band verified",
          "TX-SIGNAL carrier confirmed",
          "TX_SIGNAL encoding active"
        ],
        mustNotMatch: [
          "TX NOISE background radiation",
          "EXTRA SIGNAL detected",
          "TXX SIGNAL double-tagged error"
        ],
        par: 9,
        baseXP: 0,
        parBonusXP: 75,
        referenceSolution: "TX.SIGNAL",
        hint: "TX and SIGNAL are literal. There is exactly one character between them that varies.",
        hintCost: 5,
        conceptNote: "TX.SIGNAL uses the dot as a precise one-character wildcard — a single placeholder, not the start of .+. Sometimes precision is the point.",
        isSideChallenge: true,
        isBoss: false
      },

      // ─── Boss Challenge 0-B ─────────────────────────
      {
        id: "0-B",
        title: "First Deployment",
        briefing: "Last night's consolidated log contains live signal reports with the format: LIVE, a separator character, SIGNAL, followed by report data. Isolate every valid live signal report from the noise.",
        scenario: "The night shift supervisor needs a clean pull of every valid live signal report from last night's consolidated system log before the incident review board convenes.",
        type: "match",
        corpus: [
          "LIVE.SIGNAL data stream active",
          "LIVE-SIGNAL carrier wave detected",
          "LIVE_SIGNAL frequency lock confirmed",
          "ARCHIVED.SIGNAL historical record",
          "LIVE DATA nominal scan",
          "SIGNAL NOISE background interference"
        ],
        mustMatch: [
          "LIVE.SIGNAL data stream active",
          "LIVE-SIGNAL carrier wave detected",
          "LIVE_SIGNAL frequency lock confirmed"
        ],
        mustNotMatch: [
          "ARCHIVED.SIGNAL historical record",
          "LIVE DATA nominal scan",
          "SIGNAL NOISE background interference"
        ],
        par: 13,
        baseXP: 75,
        parBonusXP: 25,
        referenceSolution: "LIVE.SIGNAL.+",
        hint: "You need LIVE + any separator + SIGNAL + any content after. You've seen both of these tools this world.",
        hintCost: 10,
        conceptNote: "LIVE.SIGNAL.+ combines a literal prefix, a single-character wildcard, another literal, and a one-or-more tail. Real patterns rarely use just one concept.",
        isSideChallenge: false,
        isBoss: true
      }

    ] // end world-0 challenges
  }, // end world-0

  {
    id: "world-1",
    title: "Log File Detective",
    subtitle: "Pull signal from noise.",
    narrative: "Orientation is over. You've been assigned to the night shift — monitoring live telescope feeds, flagging anything unusual. It's mostly routine. Then, buried in last night's logs, you spot something the automated filters missed: an anomalous signal, repeating at regular intervals. Your supervisor leans over your shoulder and says: pull everything you can from those logs.",
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
        par: 11,
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
        par: 25,
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
        par: 8,
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
        par: 29,
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
        par: 19,
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
        par: 25,
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
    narrative: "Your discovery made it up the chain. The anomaly is confirmed — it's structured, not random. SETI has never seen anything like it: field codes, embedded payloads, validity markers woven into the signal. They're calling you the one who found it, and now they need you to help decode it. The data is cleaner here, but the patterns are more complex.",
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
        par: 11,
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
        par: 22,
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
    narrative: "The decoded fragments are pouring in faster than the team can verify them. Half the data is corrupted — garbled headers, truncated codes, malformed timestamps. Before any of it can be analyzed, someone has to separate the clean transmissions from the noise. That someone is you. Every fragment must pass strict format checks. No exceptions.",
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
        par: 12,
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
        learnMore: "Sometimes you're not looking for what's right — you're hunting for what's wrong.\n\nOne approach: anchor to a known starting point, use a wildcard to skip past anything that could be valid, then require a character that falls outside the allowed set.\n\nYou don't need to match the entire hex code. You just need to find the first thing that shouldn't be there.",
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
    narrative: "The signal isn't one transmission — it's many. Layered on top of each other, broadcast across multiple channels simultaneously. Some are probe telemetry. Some are handshake protocols. Some are something else entirely. The team needs you to classify and route each variant. One pattern per task. No room for error.",
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
        par: 10,
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
        par: 25,
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
        par: 30,
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
        par: 31,
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
        par: 27,
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
  },  // end world-4

  // ═══════════════════════════════════════════════════════════
  // WORLD 5 — The Boundary Layer
  // ═══════════════════════════════════════════════════════════
  {
    id: "world-5",
    title: "The Boundary Layer",
    subtitle: "Context is everything.",
    narrative: "The transmission's structure runs deeper than anyone expected. Patterns that looked random are actually context-dependent — the same sequence means different things depending on what surrounds it. The team has hit a wall: their tools match content but ignore context. You need to see past the characters to the boundaries between them.",
    conceptsIntroduced: ["word boundary \\b", "lookahead (?=...)", "negative lookahead (?!...)", "lookbehind (?<=...)"],
    challenges: [

      // ─── Challenge 5-1 ───────────────────────────────────────────
      {
        id: "5-1",
        title: "Exact Callsign",
        briefing: "The relay log contains the code RED in several contexts. Match only lines where RED appears as a standalone callsign — not embedded inside another word.",
        scenario: "The routing system flags RED-priority transmissions, but the naive filter also catches REDIRECT, FILTERED, and BORED. The dispatcher needs exact callsign matches only.",
        learnMore: "\\b is a word boundary — it matches the position between a word character (\\w) and a non-word character, or the start/end of the string.\n\n\\bRED\\b matches RED as a standalone word. It won't match the RED inside REDIRECT or BORED because those positions are between two word characters — no boundary exists there.\n\n\\b doesn't consume any characters. It's a zero-width assertion — it checks a condition about position, not content.",
        type: "match",
        corpus: [
          "ALERT RED: priority transmission",
          "SECTOR RED confirmed active",
          "RED SIGNAL acquired on band L",
          "REDIRECT to backup array",
          "FILTERED noise on channel 4",
          "BORED operator logged out"
        ],
        mustMatch: [
          "ALERT RED: priority transmission",
          "SECTOR RED confirmed active",
          "RED SIGNAL acquired on band L"
        ],
        mustNotMatch: [
          "REDIRECT to backup array",
          "FILTERED noise on channel 4",
          "BORED operator logged out"
        ],
        par: 7,
        baseXP: 100,
        parBonusXP: 35,
        referenceSolution: "\\bRED\\b",
        hint: "You need RED as a whole word, not as part of a longer word. There's a zero-width assertion that marks the boundary between word and non-word characters.",
        hintCost: 10,
        conceptNote: "\\b matches a word boundary — the position between a \\w character and a non-\\w character. \\bRED\\b ensures RED is a standalone word, not a substring of REDIRECT, FILTERED, or BORED.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 5-2 ───────────────────────────────────────────
      {
        id: "5-2",
        title: "Conditional Clearance",
        briefing: "Sector names appear throughout the log, but only sectors followed by the status CLEAR are safe to route through. Match the sector entries — but only when CLEAR follows.",
        scenario: "The routing algorithm needs sector names for path calculation, but only cleared sectors. The status must be checked without including it in the extracted match.",
        learnMore: "A lookahead (?=...) checks whether a pattern follows the current position, without including it in the match.\n\nSECTOR_\\w+(?= CLEAR) matches the sector name only if CLEAR comes after it. The lookahead is zero-width — it asserts a condition but doesn't consume characters.\n\nThis is useful when you need to verify context without capturing it — like checking a badge before letting someone through a door.",
        type: "match",
        corpus: [
          "SECTOR_alpha CLEAR for routing",
          "SECTOR_beta CLEAR for routing",
          "SECTOR_gamma CLEAR for routing",
          "SECTOR_delta BLOCKED by interference",
          "SECTOR_epsilon DEGRADED signal",
          "SECTOR_zeta OFFLINE maintenance"
        ],
        mustMatch: [
          "SECTOR_alpha CLEAR for routing",
          "SECTOR_beta CLEAR for routing",
          "SECTOR_gamma CLEAR for routing"
        ],
        mustNotMatch: [
          "SECTOR_delta BLOCKED by interference",
          "SECTOR_epsilon DEGRADED signal",
          "SECTOR_zeta OFFLINE maintenance"
        ],
        par: 20,
        baseXP: 100,
        parBonusXP: 50,
        referenceSolution: "SECTOR_\\w+(?= CLEAR)",
        hint: "You need to match sector names, but only when a specific status follows. A lookahead checks what comes next without consuming it.",
        hintCost: 10,
        conceptNote: "(?= CLEAR) is a positive lookahead — it asserts that ' CLEAR' follows the current position, but doesn't include it in the match. The sector name is matched; the status is only verified.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 5-3 ───────────────────────────────────────────
      {
        id: "5-3",
        title: "Exclude the Compromised",
        briefing: "All probe data should be processed — except probes flagged as COMPROMISED. Match probe entries that are NOT followed by COMPROMISED.",
        scenario: "A firmware vulnerability was discovered in some probes. Their data is tainted and must be excluded from the analysis pipeline. Everything else goes through.",
        learnMore: "A negative lookahead (?!...) asserts that a pattern does NOT follow the current position.\n\nPROBE_\\d+ (?!COMPROMISED) matches probe entries only when COMPROMISED doesn't follow. Like positive lookahead, it's zero-width — it checks a condition without consuming text.\n\nThe space before the lookahead is important here — it forces the digit sequence to be fully consumed before the status check begins.",
        type: "match",
        corpus: [
          "PROBE_14 NOMINAL data_batch_77",
          "PROBE_29 ACTIVE data_batch_82",
          "PROBE_03 NOMINAL data_batch_91",
          "PROBE_14 COMPROMISED quarantined",
          "PROBE_29 COMPROMISED quarantined",
          "PROBE_88 COMPROMISED quarantined"
        ],
        mustMatch: [
          "PROBE_14 NOMINAL data_batch_77",
          "PROBE_29 ACTIVE data_batch_82",
          "PROBE_03 NOMINAL data_batch_91"
        ],
        mustNotMatch: [
          "PROBE_14 COMPROMISED quarantined",
          "PROBE_29 COMPROMISED quarantined",
          "PROBE_88 COMPROMISED quarantined"
        ],
        par: 25,
        baseXP: 100,
        parBonusXP: 50,
        referenceSolution: "PROBE_\\d+ (?!COMPROMISED)",
        hint: "You want to match probe entries, but exclude specific ones. A negative lookahead asserts that something does NOT follow.",
        hintCost: 10,
        conceptNote: "(?!COMPROMISED) is a negative lookahead — it succeeds only when 'COMPROMISED' does NOT follow the current position. The space before it ensures the full probe ID is consumed, preventing the engine from backtracking to a shorter digit match.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 5-4 ───────────────────────────────────────────
      {
        id: "5-4",
        title: "Priority Payloads",
        briefing: "Hex payload values appear throughout the log, but only payloads that follow a PRIORITY: tag are urgent. Match the hex payloads — but only when preceded by PRIORITY:.",
        scenario: "The alert system needs to extract urgent payload values for immediate processing. Regular payloads are handled by the batch queue. The tag determines urgency, but only the payload value is needed.",
        learnMore: "A lookbehind (?<=...) checks whether a pattern precedes the current position, without including it in the match.\n\n(?<=PRIORITY:)[A-F0-9]+ matches hex values only when PRIORITY: comes before them. Like lookahead, it's zero-width.\n\nLookbehinds let you filter by context that precedes your target — useful when you need the value but not the label.",
        type: "match",
        corpus: [
          "PRIORITY:A4F3C2 route immediately",
          "PRIORITY:0B9E1D route immediately",
          "PRIORITY:FFD700 route immediately",
          "ROUTINE:A4F3C2 queue for batch",
          "DEFERRED:0B9E1D hold for review",
          "ARCHIVED:FFD700 cold storage"
        ],
        mustMatch: [
          "PRIORITY:A4F3C2 route immediately",
          "PRIORITY:0B9E1D route immediately",
          "PRIORITY:FFD700 route immediately"
        ],
        mustNotMatch: [
          "ROUTINE:A4F3C2 queue for batch",
          "DEFERRED:0B9E1D hold for review",
          "ARCHIVED:FFD700 cold storage"
        ],
        par: 23,
        baseXP: 125,
        parBonusXP: 50,
        referenceSolution: "(?<=PRIORITY:)[A-F0-9]+",
        hint: "You need to match hex values, but only when they follow a specific label. A lookbehind checks what comes before without consuming it.",
        hintCost: 10,
        conceptNote: "(?<=PRIORITY:) is a positive lookbehind — it asserts that 'PRIORITY:' precedes the current position. Only the hex payload is matched; the label is verified but not consumed.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Side Challenge 5-S ─────────────────────────────────────
      {
        id: "5-S",
        title: "Ghost Frequencies",
        briefing: "The spectrum analyzer detected signals on MHz frequencies. Match the numeric frequency values — but only when they appear after 'on ' and before ' MHz'.",
        type: "match",
        corpus: [
          "signal detected on 1420 MHz hydrogen line",
          "signal detected on 2400 MHz sweep band",
          "signal detected on 5800 MHz carrier",
          "error code 1420 in subsystem",
          "array 2400 calibration complete",
          "channel MHz1420 legacy format"
        ],
        mustMatch: [
          "signal detected on 1420 MHz hydrogen line",
          "signal detected on 2400 MHz sweep band",
          "signal detected on 5800 MHz carrier"
        ],
        mustNotMatch: [
          "error code 1420 in subsystem",
          "array 2400 calibration complete",
          "channel MHz1420 legacy format"
        ],
        par: 19,
        baseXP: 0,
        parBonusXP: 225,
        referenceSolution: "(?<=on )\\d+(?= MHz)",
        hint: "You need the number, but only in a specific context. Two zero-width assertions — one before and one after — can lock the match to exactly the right position.",
        hintCost: 10,
        conceptNote: "(?<=on ) and (?= MHz) are a lookbehind and lookahead working together. They create a contextual filter: only numbers sandwiched between 'on ' and ' MHz' are matched. The number itself is the only thing consumed.",
        isSideChallenge: true,
        isBoss: false
      },

      // ─── Boss Challenge 5-B ─────────────────────────────────────
      {
        id: "5-B",
        title: "The Filter",
        briefing: "The signal router needs to match transmission codes — exactly 3 uppercase letters — but only when preceded by TX: and NOT followed by :REVOKED. Revoked transmissions must be silently dropped.",
        type: "match",
        corpus: [
          "TX:ARB dispatch confirmed",
          "TX:QRZ dispatch confirmed",
          "TX:NNV dispatch confirmed",
          "TX:ARB:REVOKED access denied",
          "TX:QRZ:REVOKED access denied",
          "RX:ARB received and logged",
          "TX:AR partial code error",
          "TX:ARBX overlong code error"
        ],
        mustMatch: [
          "TX:ARB dispatch confirmed",
          "TX:QRZ dispatch confirmed",
          "TX:NNV dispatch confirmed"
        ],
        mustNotMatch: [
          "TX:ARB:REVOKED access denied",
          "TX:QRZ:REVOKED access denied",
          "RX:ARB received and logged",
          "TX:AR partial code error",
          "TX:ARBX overlong code error"
        ],
        par: 30,
        baseXP: 200,
        parBonusXP: 100,
        referenceSolution: "(?<=TX:)[A-Z]{3}\\b(?!:REVOKED)",
        hint: "You need a lookbehind for the prefix, an exact character count for the code, a word boundary to prevent partial matches, and a negative lookahead to exclude revoked entries.",
        hintCost: 10,
        conceptNote: "(?<=TX:)[A-Z]{3}\\b(?!:REVOKED) layers three boundary concepts: a lookbehind verifies the TX: prefix, \\b ensures the code is exactly 3 letters (not a substring of a longer code), and a negative lookahead excludes revoked transmissions. Each assertion narrows the match without consuming characters.",
        isSideChallenge: false,
        isBoss: true
      }

    ] // end challenges
  },  // end world-5

  // ═══════════════════════════════════════════════════════════
  // WORLD 6 — The Source
  // ═══════════════════════════════════════════════════════════
  {
    id: "world-6",
    title: "The Source",
    subtitle: "The signal speaks for itself.",
    narrative: "The final layer of the transmission has been exposed. It's not just data — it's a language. Patterns that reference themselves, structures that repeat with purpose, and a grammar that was clearly designed to be decoded. Whatever sent this signal expected someone to find it. The team is silent. Everyone is watching your terminal.",
    conceptsIntroduced: ["negative lookbehind (?<!...)", "backreferences \\1", "combined mastery"],
    challenges: [

      // ─── Challenge 6-1 ───────────────────────────────────────────
      {
        id: "6-1",
        title: "Access Control",
        briefing: "Sector lockdown reports contain the word LOCKED in every entry. But some sectors are UNLOCKED — and those should pass through freely. Match only the genuinely locked sectors.",
        scenario: "The containment system needs to identify which sectors are sealed. UNLOCKED entries should be ignored — they're cleared for traffic. The word LOCKED appears in both, so simple matching won't work.",
        learnMore: "A negative lookbehind (?<!...) asserts that a pattern does NOT precede the current position.\n\n(?<!UN)LOCKED matches LOCKED only when it is NOT preceded by UN. So 'LOCKED' matches, but the 'LOCKED' inside 'UNLOCKED' does not.\n\nLike all lookaround assertions, it's zero-width — it checks context without consuming characters. Negative lookbehind completes the set: you can now assert what must or must not appear on either side of your target.",
        type: "match",
        corpus: [
          "SECTOR_A LOCKED down for analysis",
          "SECTOR_B LOCKED down for analysis",
          "SECTOR_C LOCKED down for analysis",
          "SECTOR_D UNLOCKED and available",
          "SECTOR_E UNLOCKED and available",
          "SECTOR_F UNLOCKED and available"
        ],
        mustMatch: [
          "SECTOR_A LOCKED down for analysis",
          "SECTOR_B LOCKED down for analysis",
          "SECTOR_C LOCKED down for analysis"
        ],
        mustNotMatch: [
          "SECTOR_D UNLOCKED and available",
          "SECTOR_E UNLOCKED and available",
          "SECTOR_F UNLOCKED and available"
        ],
        par: 13,
        baseXP: 125,
        parBonusXP: 50,
        referenceSolution: "(?<!UN)LOCKED",
        hint: "LOCKED appears in every line — including the UNLOCKED ones. You need to exclude matches where specific characters come right before LOCKED.",
        hintCost: 10,
        conceptNote: "(?<!UN) is a negative lookbehind — it asserts that 'UN' does NOT precede the current position. (?<!UN)LOCKED matches the standalone word LOCKED but rejects the LOCKED inside UNLOCKED. This completes the lookaround toolkit: positive/negative, ahead/behind.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 6-2 ───────────────────────────────────────────
      {
        id: "6-2",
        title: "Duplicate Signal",
        briefing: "Legitimate transmissions use a unique 3-letter code per line. Corrupted entries repeat the same code twice. Find the duplicates.",
        scenario: "The deduplication filter is down. Entries where the same 3-letter code appears more than once are echo artifacts from a relay malfunction. They need to be flagged and removed.",
        learnMore: "A backreference \\1 matches the exact same text that was captured by group 1.\n\n([A-Z]{3}).*\\1 captures a 3-letter code in group 1, then .* skips ahead, and \\1 requires the same three letters to appear again.\n\nThis is fundamentally different from [A-Z]{3}.*[A-Z]{3} — that would match any two 3-letter codes. A backreference enforces identity, not just structure.",
        type: "match",
        corpus: [
          "ARB:send ARB:confirm duplicate",
          "QRZ:send QRZ:confirm duplicate",
          "NNV:send NNV:confirm duplicate",
          "ARB:send QRZ:confirm routed",
          "QRZ:send NNV:confirm routed",
          "NNV:send ARB:confirm routed"
        ],
        mustMatch: [
          "ARB:send ARB:confirm duplicate",
          "QRZ:send QRZ:confirm duplicate",
          "NNV:send NNV:confirm duplicate"
        ],
        mustNotMatch: [
          "ARB:send QRZ:confirm routed",
          "QRZ:send NNV:confirm routed",
          "NNV:send ARB:confirm routed"
        ],
        par: 14,
        baseXP: 125,
        parBonusXP: 50,
        referenceSolution: "([A-Z]{3}).*\\1",
        hint: "You need to match lines where the same 3-letter code appears twice. Parentheses capture text — and there's a way to refer back to what was captured.",
        hintCost: 10,
        conceptNote: "([A-Z]{3}) captures a 3-letter code. \\1 is a backreference — it matches the exact same text captured by group 1. This enforces that the same code appears twice, not just any two codes. Identity, not structure.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 6-3 ───────────────────────────────────────────
      {
        id: "6-3",
        title: "Mirror Protocol",
        briefing: "Valid message frames use a mirror format: a 3-letter code at the start and the same code at the end, wrapped around a hyphenated payload. Match only frames where the opening and closing codes are identical.",
        scenario: "The frame validator requires that sender authentication tokens match the header code — a cryptographic echo built into the signal's grammar. Mismatched frames are forgeries.",
        learnMore: "Backreferences work naturally with surrounding structure. ^([A-Z]{3}):\\w+-\\w+:\\1 captures the opening code, matches the payload structure, then requires the same code at the close.\n\nThe backreference doesn't just check 'three uppercase letters' — it checks for the exact same three letters in the exact same order. ARB only matches ARB, never QRZ.\n\nThis lets you validate structural symmetry — patterns that reference themselves.",
        type: "match",
        corpus: [
          "ARB:data-link:ARB verified",
          "QRZ:scan-deep:QRZ verified",
          "NNV:ping-echo:NNV verified",
          "ARB:data-link:QRZ mismatch",
          "QRZ:scan-deep:NNV mismatch",
          "ARB:data-link:arb case error"
        ],
        mustMatch: [
          "ARB:data-link:ARB verified",
          "QRZ:scan-deep:QRZ verified",
          "NNV:ping-echo:NNV verified"
        ],
        mustNotMatch: [
          "ARB:data-link:QRZ mismatch",
          "QRZ:scan-deep:NNV mismatch",
          "ARB:data-link:arb case error"
        ],
        par: 22,
        baseXP: 125,
        parBonusXP: 50,
        referenceSolution: "^([A-Z]{3}):\\w+-\\w+:\\1",
        hint: "The opening and closing codes must be identical — not just the same format. Capture the first one and reference it at the end.",
        hintCost: 10,
        conceptNote: "^([A-Z]{3}) captures the opening code. :\\w+-\\w+: matches the payload. \\1 at the end requires the exact same code — not just any 3-letter sequence. Case-sensitive: ARB doesn't match arb.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Challenge 6-4 ───────────────────────────────────────────
      {
        id: "6-4",
        title: "Full Spectrum",
        briefing: "Valid scan entries start with SCAN:, followed by a band code (L or S), a 4-digit ID, a colon, and a status that is NOT FAIL. Match complete valid scan entries.",
        scenario: "The final processing queue accepts only clean scans on active bands. Failed scans, invalid bands, and malformed IDs must all be rejected before the data enters the analysis pipeline.",
        learnMore: "Complex real-world patterns combine multiple regex concepts in a single expression.\n\n^SCAN:[LS]\\d{4}:(?!FAIL)\\w+ uses: anchoring (^), character classes ([LS]), exact quantifiers (\\d{4}), negative lookahead ((?!FAIL)), and shorthand (\\w+).\n\nEach element eliminates a different class of invalid input. The pattern reads left to right like a checklist: correct prefix, valid band, right-length ID, non-failure status.",
        type: "match",
        corpus: [
          "SCAN:L0042:PASS sector clear",
          "SCAN:S1987:PASS sector clear",
          "SCAN:L7741:DONE sector archived",
          "SCAN:L0042:FAIL sector error",
          "SCAN:X0042:PASS invalid band",
          "SCAN:L42:PASS short ID",
          "RELAY:L0042:PASS wrong prefix"
        ],
        mustMatch: [
          "SCAN:L0042:PASS sector clear",
          "SCAN:S1987:PASS sector clear",
          "SCAN:L7741:DONE sector archived"
        ],
        mustNotMatch: [
          "SCAN:L0042:FAIL sector error",
          "SCAN:X0042:PASS invalid band",
          "SCAN:L42:PASS short ID",
          "RELAY:L0042:PASS wrong prefix"
        ],
        par: 27,
        baseXP: 150,
        parBonusXP: 75,
        referenceSolution: "^SCAN:[LS]\\d{4}:(?!FAIL)\\w+",
        hint: "Work left to right: anchor to start, constrain the band, enforce ID length, then use a negative lookahead to reject failures.",
        hintCost: 10,
        conceptNote: "^SCAN:[LS]\\d{4}:(?!FAIL)\\w+ is a five-concept pattern: ^ for anchoring, [LS] for character class, \\d{4} for exact count, (?!FAIL) for negative lookahead, and \\w+ for the status value. Each constraint eliminates a different invalid entry.",
        isSideChallenge: false,
        isBoss: false
      },

      // ─── Side Challenge 6-S ─────────────────────────────────────
      {
        id: "6-S",
        title: "Temporal Echo",
        briefing: "The signal contains timestamps where the hour and minute fields are identical — 03:03, 14:14, 22:22. These 'temporal echoes' are believed to be synchronization markers. Find them.",
        type: "match",
        corpus: [
          "03:03:22 signal pulse detected",
          "14:14:09 anomaly burst logged",
          "22:22:55 sync marker recorded",
          "03:14:22 background noise",
          "14:03:09 calibration ping",
          "22:07:55 routine scan"
        ],
        mustMatch: [
          "03:03:22 signal pulse detected",
          "14:14:09 anomaly burst logged",
          "22:22:55 sync marker recorded"
        ],
        mustNotMatch: [
          "03:14:22 background noise",
          "14:03:09 calibration ping",
          "22:07:55 routine scan"
        ],
        par: 16,
        baseXP: 0,
        parBonusXP: 250,
        referenceSolution: "(\\d{2}):\\1:\\d{2}",
        hint: "The hour and minute fields are the same two digits. Capture the first and require the second to be identical.",
        hintCost: 10,
        conceptNote: "(\\d{2}) captures a two-digit field. :\\1: requires the same digits to appear again after a colon. This detects structural repetition within the data — the signal referencing itself.",
        isSideChallenge: true,
        isBoss: false
      },

      // ─── Boss Challenge 6-B ─────────────────────────────────────
      {
        id: "6-B",
        title: "The Rosetta Pattern",
        briefing: "The final decoded message format: a protocol type (SIG or MSG), a 3-letter sender code, a payload, and the same sender code repeated as an authentication token. The full line must match exactly and end with :OK.",
        type: "match",
        corpus: [
          "SIG:ARB-data_stream-ARB:OK",
          "MSG:QRZ-relay_burst-QRZ:OK",
          "SIG:NNV-deep_scan-NNV:OK",
          "SIG:ARB-data_stream-QRZ:OK",
          "MSG:QRZ-relay_burst-QRZ:FAIL",
          "SIG:ARB-data_stream-ARB:OK extra",
          "XMT:ARB-data_stream-ARB:OK",
          "SIG:AB-data_stream-AB:OK"
        ],
        mustMatch: [
          "SIG:ARB-data_stream-ARB:OK",
          "MSG:QRZ-relay_burst-QRZ:OK",
          "SIG:NNV-deep_scan-NNV:OK"
        ],
        mustNotMatch: [
          "SIG:ARB-data_stream-QRZ:OK",
          "MSG:QRZ-relay_burst-QRZ:FAIL",
          "SIG:ARB-data_stream-ARB:OK extra",
          "XMT:ARB-data_stream-ARB:OK",
          "SIG:AB-data_stream-AB:OK"
        ],
        par: 32,
        baseXP: 250,
        parBonusXP: 125,
        referenceSolution: "^(SIG|MSG):([A-Z]{3})-\\w+-\\2:OK$",
        hint: "The protocol allows two types (alternation), the sender code appears twice (backreference), and the entire line must be validated (anchors). This pattern uses nearly everything you've learned.",
        hintCost: 10,
        conceptNote: "^(SIG|MSG):([A-Z]{3})-\\w+-\\2:OK$ is the capstone: ^ and $ from World 3, alternation and groups from World 4, and \\2 backreference from World 6. Group 1 handles the protocol type, group 2 captures the sender code, and \\2 enforces that the authentication token matches. Every concept in the campaign converges here.",
        isSideChallenge: false,
        isBoss: true
      }

    ] // end challenges
  }  // end world-6

];   // end CAMPAIGN

// ────────────────────────────────────────────────────
//  REGULARCADE — CORPUS MATCH
//  Pure skill drills. No narrative. No hints.
//  STUB: Replace with GET /api/minigames?type=corpus_match in v2.
// ────────────────────────────────────────────────────
const ARCADE_CORPUS_MATCH = [
  {
    id: "cm-1",
    title: "Email Addresses",
    description: "Match valid email addresses. Reject everything else.",
    type: "match",
    corpus: [
      "alice@example.com",
      "bob.smith@company.org",
      "admin@mail-server.net",
      "not-an-email",
      "@missing-user.com",
      "spaces in@address.com",
      "no-at-sign.com",
      "user@.no-domain"
    ],
    mustMatch: [
      "alice@example.com",
      "bob.smith@company.org",
      "admin@mail-server.net"
    ],
    mustNotMatch: [
      "not-an-email",
      "@missing-user.com",
      "spaces in@address.com",
      "no-at-sign.com",
      "user@.no-domain"
    ],
    par: 14,
    baseXP: 50,
    parBonusXP: 25,
    referenceSolution: "^\\S+@\\S+\\.\\w+$"
  }
];

// ────────────────────────────────────────────────────
//  REGULARCADE — TIMED DRILL
//  Rapid-fire series. Timer runs continuously.
//  STUB: Replace with GET /api/minigames?type=timed_drill in v2.
// ────────────────────────────────────────────────────
const ARCADE_TIMED_DRILLS = [
  {
    id: "td-1",
    title: "Fundamentals Sprint",
    description: "Six quick-fire challenges covering the basics. 90 seconds on the clock.",
    timeLimitSeconds: 90,
    baseXP: 100,
    timeBonus: 50,
    challenges: [
      {
        title: "Literal Match",
        briefing: "Match the ERROR lines.",
        corpus: [
          "ERROR disk full",
          "WARNING low memory",
          "ERROR timeout",
          "INFO startup complete",
          "DEBUG cache hit",
          "INFO ready"
        ],
        mustMatch: ["ERROR disk full", "ERROR timeout"],
        mustNotMatch: ["WARNING low memory", "INFO startup complete", "DEBUG cache hit", "INFO ready"],
        par: 5
      },
      {
        title: "Wildcard Separator",
        briefing: "Match LOG OK lines regardless of separator. Not BLOG or DIALOG.",
        corpus: [
          "LOG_OK system nominal",
          "LOG-OK system checked",
          "LOG OK system ready",
          "LOG_FAIL system error",
          "BLOG_OK external",
          "DIALOG_OK popup"
        ],
        mustMatch: ["LOG_OK system nominal", "LOG-OK system checked", "LOG OK system ready"],
        mustNotMatch: ["LOG_FAIL system error", "BLOG_OK external", "DIALOG_OK popup"],
        par: 7
      },
      {
        title: "Digit Run",
        briefing: "Match entries with a numeric ID after id: — at least one digit.",
        corpus: [
          "id:4821 active",
          "id:107 active",
          "id:99034 active",
          "id: missing",
          "idx4821 wrong format",
          "id:zero missing"
        ],
        mustMatch: ["id:4821 active", "id:107 active", "id:99034 active"],
        mustNotMatch: ["id: missing", "idx4821 wrong format", "id:zero missing"],
        par: 6
      },
      {
        title: "Anchored Start",
        briefing: "Match lines that start with PASS. Not BYPASS, COMPASS, or mid-line.",
        corpus: [
          "PASS unit test alpha",
          "PASS unit test beta",
          "PASS integration gamma",
          "BYPASS security check",
          "COMPASS calibrated",
          "unit test PASS delta"
        ],
        mustMatch: ["PASS unit test alpha", "PASS unit test beta", "PASS integration gamma"],
        mustNotMatch: ["BYPASS security check", "COMPASS calibrated", "unit test PASS delta"],
        par: 5
      },
      {
        title: "Character Class",
        briefing: "Match zones A, B, and C only.",
        corpus: [
          "zone-A active",
          "zone-B active",
          "zone-C active",
          "zone-D inactive",
          "zone-X decommissioned",
          "zone-1 numeric"
        ],
        mustMatch: ["zone-A active", "zone-B active", "zone-C active"],
        mustNotMatch: ["zone-D inactive", "zone-X decommissioned", "zone-1 numeric"],
        par: 10
      },
      {
        title: "Escape Artist",
        briefing: "Match lines containing a dollar amount.",
        corpus: [
          "price: $9.99",
          "price: $14.50",
          "price: $0.75",
          "ratio: 9.99",
          "version 14.50",
          "score: 99/100"
        ],
        mustMatch: ["price: $9.99", "price: $14.50", "price: $0.75"],
        mustNotMatch: ["ratio: 9.99", "version 14.50", "score: 99/100"],
        par: 2
      }
    ]
  }
];

// ────────────────────────────────────────────────────
//  REGULARCADE — REGEX CROSSWORD
//  Fill the grid so every row AND column satisfies its pattern.
//  STUB: Replace with GET /api/minigames?type=crossword in v2.
// ────────────────────────────────────────────────────
const ARCADE_CROSSWORD = [
  {
    id: "cw-1",
    title: "Binary Flip",
    description: "A 2×2 warm-up. Fill each cell so rows and columns both match.",
    rows: 2,
    cols: 2,
    rowPatterns: ["^1[^1]$", "^0[^0]$"],
    colPatterns: ["^[01]{2}$", "^0[01]$"],
    solution: [["1","0"],["0","1"]],
    baseXP: 50,
    difficulty: "Easy"
  },
  {
    id: "cw-2",
    title: "Hex Decode",
    description: "Decode a 3×3 hex transmission. Alternation and character classes required.",
    rows: 3,
    cols: 3,
    rowPatterns: ["^F[AE]D$", "^0+$", "^b[e-o]d$"],
    colPatterns: ["^F\\d[a-f]$", "^(A0a|E0e)$", "^D0[a-d]$"],
    solution: [["F","E","D"],["0","0","0"],["b","e","d"]],
    baseXP: 100,
    difficulty: "Medium"
  },
  {
    id: "cw-3",
    title: "Repeating Signal",
    description: "A symmetric 3×3 grid. Grouped repetition meets negated classes.",
    rows: 3,
    cols: 3,
    rowPatterns: ["^(A1)+A$", "^1[^A]1$", "^(A1)+A$"],
    colPatterns: ["^A1A$", "^1[AB]1$", "^(A1)+A$"],
    solution: [["A","1","A"],["1","B","1"],["A","1","A"]],
    baseXP: 150,
    difficulty: "Hard"
  }
];

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

let _currentUser = null;   // { id, handle } when logged in, null for guests
let _progressCache = null; // populated by initAuth() before init() runs

function loadProgress() {
  return _progressCache ?? { completedChallenges: [], xp: 0, scores: {} };
}

function saveProgress(progress) {
  _progressCache = progress;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (_) {}
  if (_currentUser) pushProgress(progress).catch(() => {});
}

function _readLocalProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null; } catch (_) { return null; }
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

// Corpus Match tile
document.getElementById("arcade-tile-corpus-match").addEventListener("click", () => {
  renderCorpusMatchList();
  goTo("screen-corpus-match");
});

// ────────────────────────────────────────────────────
//  REGULARCADE — CORPUS MATCH LIST
// ────────────────────────────────────────────────────
function renderCorpusMatchList() {
  const progress = loadProgress();
  const container = document.getElementById("corpus-match-list");
  container.innerHTML = "";

  ARCADE_CORPUS_MATCH.forEach(game => {
    const completed = progress.completedChallenges.includes(game.id);
    const score = progress.scores[game.id];

    const card = document.createElement("div");
    card.className = "arcade-game-card" + (completed ? " completed" : "");

    const title = document.createElement("div");
    title.className = "arcade-game-title";
    title.textContent = game.title;
    card.appendChild(title);

    const desc = document.createElement("div");
    desc.className = "arcade-game-desc";
    desc.textContent = game.description;
    card.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "arcade-game-meta mono";
    meta.textContent = `par: ${game.par}  |  ${game.baseXP} XP` + (completed && score ? `  |  your best: ${score.charCount} chars` : "");
    card.appendChild(meta);

    const playBtn = document.createElement("button");
    playBtn.className = "btn btn-primary btn-sm";
    playBtn.textContent = completed ? "PLAY AGAIN" : "PLAY";
    playBtn.addEventListener("click", () => loadChallenge(game.id, true));
    card.appendChild(playBtn);

    container.appendChild(card);
  });
}

// ────────────────────────────────────────────────────
//  REGULARCADE — TIMED DRILL
// ────────────────────────────────────────────────────

// Timed Drill tile
document.getElementById("arcade-tile-timed-drill").addEventListener("click", () => {
  renderTimedDrillList();
  goTo("screen-timed-drill");
});

function renderTimedDrillList() {
  const progress = loadProgress();
  const container = document.getElementById("timed-drill-list");
  container.innerHTML = "";

  ARCADE_TIMED_DRILLS.forEach(drill => {
    const completed = progress.completedChallenges.includes(drill.id);
    const score = progress.scores[drill.id];

    const card = document.createElement("div");
    card.className = "arcade-game-card" + (completed ? " completed" : "");

    const title = document.createElement("div");
    title.className = "arcade-game-title";
    title.textContent = drill.title;
    card.appendChild(title);

    const desc = document.createElement("div");
    desc.className = "arcade-game-desc";
    desc.textContent = drill.description;
    card.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "arcade-game-meta mono";
    meta.textContent = `${drill.challenges.length} challenges  |  ${drill.timeLimitSeconds}s  |  ${drill.baseXP} XP`
      + (completed && score ? `  |  best: ${score.time}s` : "");
    card.appendChild(meta);

    const playBtn = document.createElement("button");
    playBtn.className = "btn btn-primary btn-sm";
    playBtn.textContent = completed ? "PLAY AGAIN" : "PLAY";
    playBtn.addEventListener("click", () => startTimedDrill(drill));
    card.appendChild(playBtn);

    container.appendChild(card);
  });
}

// ── Timed drill gameplay state ──
let tdDrill = null;       // current drill data
let tdStep = 0;           // current sub-challenge index
let tdTimer = null;        // interval id
let tdStartTime = 0;       // Date.now() when started
let tdElapsed = 0;         // seconds elapsed
let tdSolvedCount = 0;     // how many sub-challenges solved
let tdAtParCount = 0;      // how many solved at/under par

function startTimedDrill(drill) {
  tdDrill = drill;
  tdStep = 0;
  tdSolvedCount = 0;
  tdAtParCount = 0;

  document.getElementById("td-header-title").textContent = drill.title;
  document.getElementById("td-progress-fill").style.width = "0%";

  goTo("screen-timed-drill-play");
  loadTimedDrillStep();

  // Start timer
  tdStartTime = Date.now();
  tdElapsed = 0;
  clearInterval(tdTimer);
  tdTimer = setInterval(tickTimedDrill, 250);
  tickTimedDrill();

  // Focus input
  document.getElementById("td-regex-input").focus();
}

function tickTimedDrill() {
  tdElapsed = Math.floor((Date.now() - tdStartTime) / 1000);
  const remaining = Math.max(0, tdDrill.timeLimitSeconds - tdElapsed);
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const timerEl = document.getElementById("td-timer");
  timerEl.textContent = `${min}:${sec.toString().padStart(2, "0")}`;

  // Color warnings
  timerEl.classList.remove("warning", "danger");
  if (remaining <= 10) timerEl.classList.add("danger");
  else if (remaining <= 30) timerEl.classList.add("warning");

  if (remaining <= 0) {
    clearInterval(tdTimer);
    finishTimedDrill(false);
  }
}

function loadTimedDrillStep() {
  const ch = tdDrill.challenges[tdStep];
  const total = tdDrill.challenges.length;

  document.getElementById("td-step-label").textContent = `${tdStep + 1} / ${total}`;
  document.getElementById("td-step-title").textContent = ch.title;
  document.getElementById("td-briefing-text").textContent = ch.briefing || "";
  document.getElementById("td-progress-fill").style.width = `${(tdStep / total) * 100}%`;

  // Render corpus
  const container = document.getElementById("td-corpus-lines");
  container.innerHTML = "";
  ch.corpus.forEach(line => {
    const div = document.createElement("div");
    div.classList.add("corpus-line");
    if (ch.mustMatch.includes(line)) div.classList.add("must-match");
    if (ch.mustNotMatch.includes(line)) div.classList.add("must-not-match");
    div.textContent = line;
    container.appendChild(div);
  });

  // Reset input
  const input = document.getElementById("td-regex-input");
  input.value = "";
  document.getElementById("td-char-counter").textContent = `0 chars | par: ${ch.par}`;
  document.getElementById("td-char-counter").className = "char-counter mono";
  document.getElementById("td-regex-error").textContent = "";
  document.getElementById("td-locked-in").textContent = "";
  document.getElementById("td-locked-in").classList.remove("visible");
  input.focus();
}

function renderTimedDrillCorpus(ch, regex) {
  const container = document.getElementById("td-corpus-lines");
  container.innerHTML = "";
  ch.corpus.forEach(line => {
    const div = document.createElement("div");
    div.classList.add("corpus-line");
    const isMustMatch = ch.mustMatch.includes(line);
    const isMustNotMatch = ch.mustNotMatch.includes(line);
    if (isMustMatch) div.classList.add("must-match");
    if (isMustNotMatch) div.classList.add("must-not-match");

    let matched = false;
    if (regex) {
      try { matched = regex.test(line); } catch (_) {}
    }
    if (regex) {
      if (isMustMatch) div.classList.add(matched ? "line-matched" : "line-unmatched");
      else if (isMustNotMatch) div.classList.add(matched ? "line-matched" : "line-ok");
      div.innerHTML = highlightLine(line, regex);
    } else {
      div.textContent = line;
    }
    container.appendChild(div);
  });
}

// Live input handler for timed drill
document.getElementById("td-regex-input").addEventListener("input", () => {
  if (!tdDrill) return;
  const ch = tdDrill.challenges[tdStep];
  const pattern = document.getElementById("td-regex-input").value;

  const errorEl = document.getElementById("td-regex-error");
  const counterEl = document.getElementById("td-char-counter");
  const lockedInEl = document.getElementById("td-locked-in");

  if (pattern === "") {
    renderTimedDrillCorpus(ch, null);
    errorEl.textContent = "";
    counterEl.textContent = `0 chars | par: ${ch.par}`;
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
    errorEl.textContent = `Invalid: ${e.message}`;
    renderTimedDrillCorpus(ch, null);
    lockedInEl.classList.remove("visible");
    return;
  }

  renderTimedDrillCorpus(ch, regex);

  const len = pattern.length;
  const atPar = len <= ch.par;
  counterEl.textContent = `${len} chars | par: ${ch.par}`;
  counterEl.className = "char-counter mono" + (len < ch.par ? " under-par" : atPar ? " at-par" : "");

  // Check if solved
  const matchPasses = ch.mustMatch.every(s => regex.test(s));
  const excludePasses = ch.mustNotMatch.every(s => !regex.test(s));

  if (matchPasses && excludePasses) {
    lockedInEl.textContent = "LOCKED IN ✓";
    lockedInEl.classList.add("visible");

    tdSolvedCount++;
    if (atPar) tdAtParCount++;

    // Flash and advance
    const layout = document.querySelector("#screen-timed-drill-play .challenge-layout");
    layout.classList.add("td-flash");
    setTimeout(() => layout.classList.remove("td-flash"), 400);

    setTimeout(() => {
      tdStep++;
      if (tdStep >= tdDrill.challenges.length) {
        clearInterval(tdTimer);
        finishTimedDrill(true);
      } else {
        loadTimedDrillStep();
      }
    }, 350);

    // Disable input briefly to prevent double-advance
    document.getElementById("td-regex-input").disabled = true;
    setTimeout(() => {
      document.getElementById("td-regex-input").disabled = false;
    }, 400);
  } else {
    lockedInEl.textContent = "";
    lockedInEl.classList.remove("visible");
  }
});

function finishTimedDrill(completed) {
  clearInterval(tdTimer);

  const totalChallenges = tdDrill.challenges.length;
  const timeUsed = tdElapsed;
  const underTime = completed && timeUsed < tdDrill.timeLimitSeconds;

  // Calculate XP
  const progress = loadProgress();
  const prevScore = progress.scores[tdDrill.id];
  const isFirstCompletion = !progress.completedChallenges.includes(tdDrill.id);

  let baseXP = completed ? tdDrill.baseXP : Math.round(tdDrill.baseXP * (tdSolvedCount / totalChallenges));
  let timeBonusXP = underTime ? tdDrill.timeBonus : 0;
  let xpEarned = baseXP + timeBonusXP;

  // Only award XP on first completion; time bonus on reattempt if first time under time
  let xpToGrant = 0;
  if (isFirstCompletion) {
    xpToGrant = xpEarned;
  } else if (underTime && prevScore && !prevScore.underTime) {
    xpToGrant = timeBonusXP;
  }

  if (completed && isFirstCompletion) {
    progress.completedChallenges.push(tdDrill.id);
  }
  progress.xp += xpToGrant;

  if (!prevScore || (completed && timeUsed < (prevScore.time || Infinity))) {
    progress.scores[tdDrill.id] = {
      xp: (prevScore ? prevScore.xp : 0) + xpToGrant,
      time: timeUsed,
      solved: tdSolvedCount,
      atPar: tdAtParCount,
      underTime
    };
  } else if (xpToGrant > 0 && prevScore) {
    prevScore.xp += xpToGrant;
    prevScore.underTime = underTime;
  }
  saveProgress(progress);

  // Show results
  document.getElementById("td-result-label").textContent = completed ? "DRILL COMPLETE" : "TIME'S UP";
  document.getElementById("td-result-label").className = "result-status-label" + (completed ? " success-label" : " failure-label");
  document.getElementById("td-result-title").textContent = tdDrill.title;
  document.getElementById("td-result-completed").textContent = `${tdSolvedCount} / ${totalChallenges}`;
  document.getElementById("td-result-time").textContent = `${timeUsed}s`;
  document.getElementById("td-result-at-par").textContent = `${tdAtParCount} / ${tdSolvedCount}`;

  const isReplay = xpToGrant === 0;
  document.getElementById("td-xp-base").textContent = isReplay ? "+0" : `+${baseXP}`;
  const timeRow = document.getElementById("td-xp-time-row");
  if (timeBonusXP > 0 && !isReplay) {
    timeRow.style.display = "";
    document.getElementById("td-xp-time").textContent = `+${timeBonusXP}`;
  } else if (timeBonusXP > 0 && xpToGrant === timeBonusXP) {
    // Reattempt earned time bonus
    document.getElementById("td-xp-base").textContent = "+0";
    timeRow.style.display = "";
    document.getElementById("td-xp-time").textContent = `+${timeBonusXP}`;
  } else {
    timeRow.style.display = "none";
  }
  document.getElementById("td-xp-total").textContent = `+${xpToGrant}`;

  document.getElementById("td-result-continue-btn").onclick = () => {
    renderTimedDrillList();
    goTo("screen-timed-drill");
  };

  goTo("screen-timed-drill-results");
}

// Quit button
document.getElementById("td-back-btn").addEventListener("click", () => {
  clearInterval(tdTimer);
  renderTimedDrillList();
  goTo("screen-timed-drill");
});

// ────────────────────────────────────────────────────
//  REGULARCADE — REGEX CROSSWORD
// ────────────────────────────────────────────────────

// Crossword tile
document.getElementById("arcade-tile-crossword").addEventListener("click", () => {
  renderCrosswordList();
  goTo("screen-crossword");
});

function renderCrosswordList() {
  const progress = loadProgress();
  const container = document.getElementById("crossword-list");
  container.innerHTML = "";

  ARCADE_CROSSWORD.forEach(puzzle => {
    const completed = progress.completedChallenges.includes(puzzle.id);

    const card = document.createElement("div");
    card.className = "arcade-game-card" + (completed ? " completed" : "");

    const title = document.createElement("div");
    title.className = "arcade-game-title";
    title.textContent = puzzle.title;
    card.appendChild(title);

    const desc = document.createElement("div");
    desc.className = "arcade-game-desc";
    desc.textContent = puzzle.description;
    card.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "arcade-game-meta mono";
    meta.textContent = `${puzzle.rows}×${puzzle.cols}  |  ${puzzle.difficulty}  |  ${puzzle.baseXP} XP`;
    card.appendChild(meta);

    const playBtn = document.createElement("button");
    playBtn.className = "btn btn-primary btn-sm";
    playBtn.textContent = completed ? "PLAY AGAIN" : "PLAY";
    playBtn.addEventListener("click", () => startCrossword(puzzle));
    card.appendChild(playBtn);

    container.appendChild(card);
  });
}

// ── Crossword gameplay state ──
let cwPuzzle = null;
let cwCells = [];   // 2D array of input elements
let cwErrors = 0;   // track total wrong attempts for stats

function startCrossword(puzzle) {
  cwPuzzle = puzzle;
  cwCells = [];
  cwErrors = 0;

  document.getElementById("cw-header-title").textContent = puzzle.title;
  document.getElementById("cw-error-count").textContent = "";

  const grid = document.getElementById("cw-grid");
  grid.innerHTML = "";

  const table = document.createElement("table");
  table.className = "cw-table";

  // Header row: empty corner + column patterns
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // empty corner
  for (let c = 0; c < puzzle.cols; c++) {
    const th = document.createElement("th");
    th.className = "cw-pattern-col mono";
    th.textContent = puzzle.colPatterns[c];
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body rows: row pattern + cells
  const tbody = document.createElement("tbody");
  for (let r = 0; r < puzzle.rows; r++) {
    const tr = document.createElement("tr");

    const patternCell = document.createElement("td");
    patternCell.className = "cw-pattern-row mono";
    patternCell.textContent = puzzle.rowPatterns[r];
    tr.appendChild(patternCell);

    const rowCells = [];
    for (let c = 0; c < puzzle.cols; c++) {
      const td = document.createElement("td");
      td.className = "cw-cell-wrap";

      const input = document.createElement("input");
      input.type = "text";
      input.className = "cw-cell mono";
      input.maxLength = 1;
      input.autocomplete = "off";
      input.autocorrect = "off";
      input.autocapitalize = "off";
      input.spellcheck = false;
      input.dataset.row = r;
      input.dataset.col = c;

      input.addEventListener("input", onCwCellInput);
      input.addEventListener("keydown", onCwCellKeydown);

      td.appendChild(input);
      tr.appendChild(td);
      rowCells.push(input);
    }
    cwCells.push(rowCells);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  grid.appendChild(table);

  goTo("screen-crossword-play");

  // Focus first cell
  setTimeout(() => cwCells[0][0].focus(), 50);
}

function onCwCellInput(e) {
  const input = e.target;
  const r = +input.dataset.row;
  const c = +input.dataset.col;

  // Allow only single printable character
  if (input.value.length > 1) {
    input.value = input.value.slice(-1);
  }

  validateCwGrid();

  // Auto-advance to next empty cell
  if (input.value.length === 1) {
    advanceCwFocus(r, c);
  }
}

function onCwCellKeydown(e) {
  const r = +e.target.dataset.row;
  const c = +e.target.dataset.col;

  if (e.key === "Backspace" && e.target.value === "") {
    // Move to previous cell
    e.preventDefault();
    const prev = getPrevCwCell(r, c);
    if (prev) {
      prev.value = "";
      prev.focus();
      validateCwGrid();
    }
  } else if (e.key === "ArrowUp" && r > 0) {
    e.preventDefault();
    cwCells[r - 1][c].focus();
  } else if (e.key === "ArrowDown" && r < cwPuzzle.rows - 1) {
    e.preventDefault();
    cwCells[r + 1][c].focus();
  } else if (e.key === "ArrowLeft" && c > 0) {
    e.preventDefault();
    cwCells[r][c - 1].focus();
  } else if (e.key === "ArrowRight" && c < cwPuzzle.cols - 1) {
    e.preventDefault();
    cwCells[r][c + 1].focus();
  }
}

function advanceCwFocus(fromR, fromC) {
  // Find next empty cell (row-major order)
  for (let r = fromR; r < cwPuzzle.rows; r++) {
    const startC = (r === fromR) ? fromC + 1 : 0;
    for (let c = startC; c < cwPuzzle.cols; c++) {
      if (!cwCells[r][c].value) {
        cwCells[r][c].focus();
        return;
      }
    }
  }
  // Wrap around
  for (let r = 0; r <= fromR; r++) {
    const endC = (r === fromR) ? fromC : cwPuzzle.cols;
    for (let c = 0; c < endC; c++) {
      if (!cwCells[r][c].value) {
        cwCells[r][c].focus();
        return;
      }
    }
  }
}

function getPrevCwCell(r, c) {
  if (c > 0) return cwCells[r][c - 1];
  if (r > 0) return cwCells[r - 1][cwPuzzle.cols - 1];
  return null;
}

function validateCwGrid() {
  const puzzle = cwPuzzle;
  let allFilled = true;
  let allCorrect = true;

  // Reset all cell states
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      cwCells[r][c].classList.remove("cw-valid", "cw-invalid");
      if (!cwCells[r][c].value) allFilled = false;
    }
  }

  // Check rows
  const rowValid = [];
  for (let r = 0; r < puzzle.rows; r++) {
    const rowStr = cwCells[r].map(cell => cell.value).join("");
    if (rowStr.length < puzzle.cols) {
      rowValid.push(null); // incomplete
      continue;
    }
    try {
      const re = new RegExp(puzzle.rowPatterns[r]);
      rowValid.push(re.test(rowStr));
    } catch (_) {
      rowValid.push(false);
    }
  }

  // Check columns
  const colValid = [];
  for (let c = 0; c < puzzle.cols; c++) {
    let colStr = "";
    let complete = true;
    for (let r = 0; r < puzzle.rows; r++) {
      const v = cwCells[r][c].value;
      if (!v) { complete = false; break; }
      colStr += v;
    }
    if (!complete) {
      colValid.push(null);
      continue;
    }
    try {
      const re = new RegExp(puzzle.colPatterns[c]);
      colValid.push(re.test(colStr));
    } catch (_) {
      colValid.push(false);
    }
  }

  // Apply cell styling based on row/col validity
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      if (!cwCells[r][c].value) continue;
      const rOk = rowValid[r];
      const cOk = colValid[c];
      if (rOk === null || cOk === null) continue; // incomplete row or col
      if (rOk && cOk) {
        cwCells[r][c].classList.add("cw-valid");
      } else {
        cwCells[r][c].classList.add("cw-invalid");
        allCorrect = false;
      }
    }
  }

  if (!allFilled) allCorrect = false;

  if (allFilled && allCorrect) {
    setTimeout(() => finishCrossword(), 300);
  }
}

function finishCrossword() {
  const puzzle = cwPuzzle;
  const progress = loadProgress();
  const isFirstCompletion = !progress.completedChallenges.includes(puzzle.id);

  let xpToGrant = 0;
  if (isFirstCompletion) {
    xpToGrant = puzzle.baseXP;
    progress.completedChallenges.push(puzzle.id);
  }
  progress.xp += xpToGrant;

  if (!progress.scores[puzzle.id]) {
    progress.scores[puzzle.id] = { xp: xpToGrant };
  } else if (xpToGrant > 0) {
    progress.scores[puzzle.id].xp += xpToGrant;
  }
  saveProgress(progress);

  // Show results
  document.getElementById("cw-result-label").textContent = "PUZZLE COMPLETE";
  document.getElementById("cw-result-label").className = "result-status-label success-label";
  document.getElementById("cw-result-title").textContent = puzzle.title;
  document.getElementById("cw-result-grid").textContent = `${puzzle.rows}×${puzzle.cols}`;
  document.getElementById("cw-result-difficulty").textContent = puzzle.difficulty;
  document.getElementById("cw-xp-base").textContent = isFirstCompletion ? `+${puzzle.baseXP}` : "+0";
  document.getElementById("cw-xp-total").textContent = `+${xpToGrant}`;

  const replayNote = document.getElementById("cw-replay-note");
  if (!isFirstCompletion) {
    replayNote.textContent = "XP already earned for this puzzle.";
    replayNote.style.display = "";
  } else {
    replayNote.style.display = "none";
  }

  document.getElementById("cw-result-continue-btn").onclick = () => {
    renderCrosswordList();
    goTo("screen-crossword");
  };

  goTo("screen-crossword-results");
}

// Quit button
document.getElementById("cw-back-btn").addEventListener("click", () => {
  renderCrosswordList();
  goTo("screen-crossword");
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

// Layout constants for all worlds — each world spans ~900px so roughly one fills the viewport
const WORLD_SPACING = 900;
const MAP_LAYOUT = {
  "world-0": {
    worldNode: { x: 120, y: 300 },
    challenges: {
      "0-1": { x: 280, y: 300 },
      "0-2": { x: 440, y: 300 },
      "0-3": { x: 600, y: 300 },
      "0-S": { x: 600, y: 460, side: true },
      "0-B": { x: 780, y: 300, boss: true }
    }
  },
  "world-1": {
    worldNode: { x: 120 + WORLD_SPACING, y: 300 },
    challenges: {
      "1-1": { x: 280 + WORLD_SPACING, y: 300 },
      "1-2": { x: 420 + WORLD_SPACING, y: 300 },
      "1-3": { x: 560 + WORLD_SPACING, y: 300 },
      "1-4": { x: 700 + WORLD_SPACING, y: 300 },
      "1-S": { x: 700 + WORLD_SPACING, y: 460, side: true },
      "1-B": { x: 860 + WORLD_SPACING, y: 300, boss: true }
    }
  },
  "world-2": {
    worldNode: { x: 120 + WORLD_SPACING * 2, y: 300 },
    challenges: {
      "2-1": { x: 280 + WORLD_SPACING * 2, y: 300 },
      "2-2": { x: 420 + WORLD_SPACING * 2, y: 300 },
      "2-3": { x: 560 + WORLD_SPACING * 2, y: 300 },
      "2-4": { x: 700 + WORLD_SPACING * 2, y: 300 },
      "2-S": { x: 700 + WORLD_SPACING * 2, y: 460, side: true },
      "2-B": { x: 860 + WORLD_SPACING * 2, y: 300, boss: true }
    }
  },
  "world-3": {
    worldNode: { x: 120 + WORLD_SPACING * 3, y: 300 },
    challenges: {
      "3-1": { x: 280 + WORLD_SPACING * 3, y: 300 },
      "3-2": { x: 420 + WORLD_SPACING * 3, y: 300 },
      "3-3": { x: 560 + WORLD_SPACING * 3, y: 300 },
      "3-4": { x: 700 + WORLD_SPACING * 3, y: 300 },
      "3-S": { x: 700 + WORLD_SPACING * 3, y: 460, side: true },
      "3-B": { x: 860 + WORLD_SPACING * 3, y: 300, boss: true }
    }
  },
  "world-4": {
    worldNode: { x: 120 + WORLD_SPACING * 4, y: 300 },
    challenges: {
      "4-1": { x: 280 + WORLD_SPACING * 4, y: 300 },
      "4-2": { x: 420 + WORLD_SPACING * 4, y: 300 },
      "4-3": { x: 560 + WORLD_SPACING * 4, y: 300 },
      "4-4": { x: 700 + WORLD_SPACING * 4, y: 300 },
      "4-S": { x: 700 + WORLD_SPACING * 4, y: 460, side: true },
      "4-B": { x: 860 + WORLD_SPACING * 4, y: 300, boss: true }
    }
  },
  "world-5": {
    worldNode: { x: 120 + WORLD_SPACING * 5, y: 300 },
    challenges: {
      "5-1": { x: 280 + WORLD_SPACING * 5, y: 300 },
      "5-2": { x: 420 + WORLD_SPACING * 5, y: 300 },
      "5-3": { x: 560 + WORLD_SPACING * 5, y: 300 },
      "5-4": { x: 700 + WORLD_SPACING * 5, y: 300 },
      "5-S": { x: 700 + WORLD_SPACING * 5, y: 460, side: true },
      "5-B": { x: 860 + WORLD_SPACING * 5, y: 300, boss: true }
    }
  },
  "world-6": {
    worldNode: { x: 120 + WORLD_SPACING * 6, y: 300 },
    challenges: {
      "6-1": { x: 280 + WORLD_SPACING * 6, y: 300 },
      "6-2": { x: 420 + WORLD_SPACING * 6, y: 300 },
      "6-3": { x: 560 + WORLD_SPACING * 6, y: 300 },
      "6-4": { x: 700 + WORLD_SPACING * 6, y: 300 },
      "6-S": { x: 700 + WORLD_SPACING * 6, y: 460, side: true },
      "6-B": { x: 860 + WORLD_SPACING * 6, y: 300, boss: true }
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

  // Auto-scroll to the first available (next) challenge
  scrollMapToNextChallenge(progress);
}

function scrollMapToNextChallenge(progress) {
  let targetX = null;
  for (const world of CAMPAIGN) {
    const layout = MAP_LAYOUT[world.id];
    if (!layout) continue;
    for (const ch of world.challenges) {
      if (getChallengeState(ch.id, progress) === "available") {
        const pos = layout.challenges[ch.id];
        if (pos) { targetX = pos.x; break; }
      }
    }
    if (targetX !== null) break;
  }
  // If all complete, scroll to the last world
  if (targetX === null) {
    const lastWorld = CAMPAIGN[CAMPAIGN.length - 1];
    const lastLayout = MAP_LAYOUT[lastWorld.id];
    if (lastLayout) targetX = lastLayout.worldNode.x;
  }
  if (targetX === null) return;

  const container = document.querySelector(".map-container");
  const svgEl = document.getElementById("map-svg");
  // Convert SVG coordinate to pixel position within the rendered SVG element
  const svgWidth = svgEl.getBoundingClientRect().width || svgEl.clientWidth;
  const viewBoxWidth = 6500;
  const scale = svgWidth / viewBoxWidth;
  const pixelX = targetX * scale;
  // Center the target in the viewport
  const scrollTarget = pixelX - container.clientWidth / 2;
  container.scrollLeft = Math.max(0, scrollTarget);
}

// ────────────────────────────────────────────────────
//  CHALLENGE SCREEN
// ────────────────────────────────────────────────────
let activeChallengeId = null;
let hintUsed = false;
let hintRevealed = false;
let arcadeMode = false;

function findChallenge(id) {
  for (const world of CAMPAIGN) {
    const ch = world.challenges.find(c => c.id === id);
    if (ch) return { world, challenge: ch };
  }
  // Search arcade corpus match games
  const arcadeCh = ARCADE_CORPUS_MATCH.find(c => c.id === id);
  if (arcadeCh) return { world: null, challenge: arcadeCh };
  return null;
}

function loadChallenge(challengeId, isArcade = false) {
  const found = findChallenge(challengeId);
  if (!found) return;
  const { world, challenge } = found;

  activeChallengeId = challengeId;
  arcadeMode   = isArcade;
  hintUsed     = false;
  hintRevealed = false;

  const progress = loadProgress();

  // Header
  document.getElementById("challenge-world-title").textContent = arcadeMode ? "CORPUS MATCH" : world.title;
  document.getElementById("challenge-xp").textContent = `XP: ${progress.xp}`;
  document.getElementById("challenge-back-btn").textContent = arcadeMode ? "← ARCADE" : "← MAP";

  // Meta
  document.getElementById("challenge-id").textContent = arcadeMode ? "" : challenge.id;
  document.getElementById("challenge-title").textContent = challenge.title;
  document.getElementById("challenge-type-badge").textContent = challenge.type.toUpperCase();

  // Briefing + scenario
  const briefingEl = document.getElementById("briefing-text");
  const briefingSource = challenge.briefing || challenge.description || "";
  briefingEl.innerHTML = escapeHtml(briefingSource) +
    (challenge.scenario
      ? `<span class="briefing-scenario">${escapeHtml(challenge.scenario)}</span>`
      : "");

  // Learn more panel
  const learnSection = document.getElementById("learn-more-section");
  const learnText    = document.getElementById("learn-more-text");
  const learnPanel   = document.getElementById("learn-more-panel");
  const learnToggle  = document.getElementById("learn-more-toggle");
  const learnChevron = document.getElementById("learn-more-chevron");
  const showLearn = !arcadeMode && !challenge.isBoss && !!challenge.learnMore;
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

  // Hint — hide for arcade mode
  const hintSection = document.getElementById("hint-btn");
  if (arcadeMode) {
    hintSection.hidden = true;
    document.getElementById("hint-panel").hidden = true;
  } else {
    hintSection.hidden = false;
    const hintCostEl = document.getElementById("hint-cost");
    hintCostEl.textContent = `−${challenge.hintCost}pts`;
    document.getElementById("hint-btn").disabled = false;
    document.getElementById("hint-panel").hidden = true;
  }

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
  if (arcadeMode) {
    renderCorpusMatchList();
    goTo("screen-corpus-match");
  } else {
    renderMap();
    goTo("screen-map");
  }
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
    // Save progress — only award new XP
    const progress = loadProgress();
    const prevScore = progress.scores[challenge.id];
    const isFirstCompletion = !progress.completedChallenges.includes(challenge.id);

    // Calculate how much NEW XP to actually grant
    // Campaign: XP only on first completion, no reattempt bonuses (reference solution is shown)
    // Arcade: XP on first completion + par bonus on first at-par reattempt
    let xpToGrant = 0;
    if (isFirstCompletion) {
      xpToGrant = result.xpAwarded;
    } else if (arcadeMode && result.atPar && prevScore && !prevScore.atPar) {
      xpToGrant = challenge.parBonusXP;
    }

    if (isFirstCompletion) {
      progress.completedChallenges.push(challenge.id);
    }
    progress.xp += xpToGrant;

    // Update stored score if this attempt is better (shorter) or first
    if (!prevScore || result.charCount < prevScore.charCount) {
      progress.scores[challenge.id] = {
        xp: (prevScore ? prevScore.xp : 0) + xpToGrant,
        regexUsed: pattern,
        charCount: result.charCount,
        atPar: result.atPar,
        hintUsed
      };
    } else if (xpToGrant > 0) {
      // Same or worse length but earned par bonus — update xp and atPar flag
      prevScore.xp += xpToGrant;
      prevScore.atPar = result.atPar;
    }
    saveProgress(progress);

    // Pass the actual XP granted to the success screen
    result.xpGranted = xpToGrant;
    showSuccess(challenge, pattern, result, progress);
  } else {
    showFailure(challenge, result);
  }
}

// ────────────────────────────────────────────────────
//  SUCCESS SCREEN
// ────────────────────────────────────────────────────
function showSuccess(challenge, pattern, result, progress) {
  document.getElementById("success-challenge-id").textContent = arcadeMode
    ? challenge.title
    : `${challenge.id} — ${challenge.title}`;

  const debriefCard = document.getElementById("concept-debrief-card");
  if (arcadeMode) {
    debriefCard.hidden = true;
  } else {
    debriefCard.hidden = false;
    document.getElementById("concept-note-text").textContent = challenge.conceptNote;
  }

  // Reference solution card — hide for arcade mode
  const refCard = document.getElementById("reference-solution-card");
  const refCode = document.getElementById("reference-solution-code");
  if (!arcadeMode && challenge.referenceSolution) {
    refCode.textContent = challenge.referenceSolution;
    refCard.hidden = false;
  } else {
    refCard.hidden = true;
  }

  // XP rows — show actual granted XP
  const xpGranted = result.xpGranted !== undefined ? result.xpGranted : result.xpAwarded;
  const isReplay = xpGranted === 0;

  document.getElementById("xp-base-val").textContent = isReplay ? "+0" : `+${challenge.baseXP}`;
  document.getElementById("xp-challenge-total").textContent = `+${xpGranted}`;
  document.getElementById("xp-running-total").textContent   = `${progress.xp}`;

  // Par bonus row
  const parRow = document.getElementById("xp-par-row");
  if (result.atPar && challenge.parBonusXP > 0 && !isReplay) {
    parRow.classList.add("visible");
    document.getElementById("xp-par-val").textContent = `+${challenge.parBonusXP}`;
  } else if (result.atPar && xpGranted === challenge.parBonusXP) {
    // Reattempt that just earned par bonus
    document.getElementById("xp-base-val").textContent = "+0";
    parRow.classList.add("visible");
    document.getElementById("xp-par-val").textContent = `+${challenge.parBonusXP}`;
  } else {
    parRow.classList.remove("visible");
  }

  // Hint penalty row
  const hintRow = document.getElementById("xp-hint-row");
  if (!isReplay && result.hintPenalty > 0) {
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
  animateCountUp(document.getElementById("xp-challenge-total"), 0, xpGranted, 600, "+");
  animateCountUp(document.getElementById("xp-running-total"),   progress.xp - xpGranted, progress.xp, 1000, "");

  // Wire continue button
  const continueBtn = document.getElementById("success-continue-btn");

  if (arcadeMode) {
    continueBtn.textContent = "BACK TO ARCADE →";
    continueBtn.onclick = () => { renderCorpusMatchList(); goTo("screen-corpus-match"); };
  } else {
    const nextChallenge = getNextChallenge(challenge.id);
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
  document.getElementById("failure-challenge-id").textContent = arcadeMode
    ? challenge.title
    : `${challenge.id} — ${challenge.title}`;

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

  // Hint — hide for arcade mode
  const failHintBtn = document.getElementById("failure-hint-btn");
  if (arcadeMode) {
    failHintBtn.hidden = true;
  } else {
    failHintBtn.hidden = false;
    const hintCostEl = document.getElementById("failure-hint-cost");
    hintCostEl.textContent = `−${challenge.hintCost}pts`;

    failHintBtn.disabled = hintUsed;
    failHintBtn.onclick = () => {
      hintUsed = true;
      hintRevealed = true;
      document.getElementById("hint-text").textContent = challenge.hint;
      document.getElementById("hint-panel").hidden = false;
      document.getElementById("hint-btn").disabled = true;
      goTo("screen-challenge");
    };
  }

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
//  AUTH
// ────────────────────────────────────────────────────
function updateAuthUI(user) {
  const btn = document.getElementById("auth-status-btn");
  if (!btn) return;
  if (user) {
    btn.textContent = `[${user.handle}] SIGN OUT`;
    btn.onclick = async () => {
      await authLogout();
      _currentUser = null;
      _progressCache = _readLocalProgress() ?? { completedChallenges: [], xp: 0, scores: {} };
      updateAuthUI(null);
      updateTitleBadge();
    };
  } else {
    btn.textContent = "SIGN IN";
    btn.onclick = () => document.getElementById("auth-modal").classList.remove("hidden");
  }
}

function initAuthModal() {
  const modal      = document.getElementById("auth-modal");
  const tabs       = modal.querySelectorAll(".auth-tab");
  const handleEl   = document.getElementById("auth-handle");
  const emailEl    = document.getElementById("auth-email");
  const passwordEl = document.getElementById("auth-password");
  const rememberEl = document.getElementById("auth-remember");
  const errorEl    = document.getElementById("auth-error");
  const submitBtn  = document.getElementById("auth-submit-btn");
  const guestBtn   = document.getElementById("auth-guest-btn");

  let activeTab = "login";

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === activeTab));
      handleEl.classList.toggle("hidden", activeTab !== "signup");
      submitBtn.textContent = activeTab === "login" ? "SIGN IN" : "CREATE ACCOUNT";
      errorEl.textContent = "";
    });
  });

  guestBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  submitBtn.addEventListener("click", async () => {
    errorEl.textContent = "";
    const email    = emailEl.value.trim();
    const password = passwordEl.value;
    const handle   = handleEl.value.trim();

    try {
      let user;
      if (activeTab === "login") {
        user = await authLogin(email, password, rememberEl.checked);
      } else {
        user = await authRegister(handle, email, password);
      }

      // Merge: push local progress if it has more XP than cloud
      const cloud = await fetchProgress().catch(() => null);
      const local = _readLocalProgress();
      if (local && (!cloud || local.xp > (cloud.xp ?? 0))) {
        await pushProgress(local).catch(() => {});
        _progressCache = local;
      } else {
        _progressCache = cloud ?? { completedChallenges: [], xp: 0, scores: {} };
      }

      _currentUser = user;
      modal.classList.add("hidden");
      updateAuthUI(user);
      updateTitleBadge();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

async function initAuth() {
  _currentUser = await fetchCurrentUser().catch(() => null);

  if (_currentUser) {
    const cloud = await fetchProgress().catch(() => null);
    const local = _readLocalProgress();
    if (local && (!cloud || local.xp > (cloud.xp ?? 0))) {
      _progressCache = local;
      pushProgress(local).catch(() => {});
    } else {
      _progressCache = cloud ?? { completedChallenges: [], xp: 0, scores: {} };
    }
  } else {
    _progressCache = _readLocalProgress() ?? { completedChallenges: [], xp: 0, scores: {} };
  }

  initAuthModal();
  updateAuthUI(_currentUser);
}

// ────────────────────────────────────────────────────
//  INIT
// ────────────────────────────────────────────────────
function init() {
  updateTitleBadge();
  goTo("screen-title");
}

initAuth().then(() => init());
