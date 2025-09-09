# Anti-Drift Gate (Team-Side Only)

Purpose
- Prevent scope drift and accidental actions that don’t match the user’s intent. Mandatory before any Probe/SVP.

Rule (must appear at the top of every Team message with work)
- Anti-Drift — Does intent match request? Yes/No. Reason: <one line>

If “No”
- Output `zz`, state the mismatch plainly, and propose the smallest safe corrective plan.
- Do not run commands or ship patches until corrected.

Where it sits in the flow
- Precedes Probe → SVP Patch → Gates → Verdicts.

Template (copy/paste at the top of each action message)
- Anti-Drift — Does intent match request? Yes/No. Reason: __________

Notes
- Applies to Team-side operations only (not user prompts to Codex).
- Pair with Tidy Check: one batch, no inline comments; explanations above the block.
