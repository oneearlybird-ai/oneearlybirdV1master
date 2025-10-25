Patch Guard — Anti-Hallucination Gate
Usage:
  node scripts/patch_guard.mjs --target <file> --ref <research_file> --tolerance-chars 0 --tolerance-lines 0 --require-sha
or:
  node scripts/patch_guard.mjs --target <file> --ref-metrics "chars=541,lines=23,sha256=abcdef..." --require-sha

Exit codes:
  0 = PASS, non-zero = FAIL. Printed reasons show which rule failed.

Typical examples:
  Expected characters: 541 vs Team file: 547 → FAIL X
  Lines mismatch by 1 → FAIL X
  SHA mismatch with require-sha → FAIL X
  Code fences or multiple EOF markers → FAIL X
  PASS example prints all metrics and ends with "✅ PATCH GUARD PASS"
