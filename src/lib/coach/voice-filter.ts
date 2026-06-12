/**
 * E4: Coach voice enforcement (decisions D13). The system prompt forbids the
 * banned phrasings; this is the post-hoc backstop. When a banned phrase slips
 * through we append a short correction notice rather than re-billing a full
 * retry — the phrase list is narrow enough that this fires rarely.
 */

const BANNED = [/you(?:'ve|\s+have)?\s+missed/i, /you skipped/i, /you went over/i];

export function enforceVoice(text: string): { ok: true } | { ok: false; correctionNotice: string } {
  if (!BANNED.some((re) => re.test(text))) return { ok: true };
  return {
    ok: false,
    correctionNotice:
      "\n\n(Rephrasing: the numbers above are just data — here's the next useful move.)",
  };
}

/**
 * E3: PII guard. The snapshot never includes email/phone/address, but the
 * model could still echo one the user typed. Scrub before streaming on.
 */
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;

export function redactPii(text: string): string {
  return text.replace(EMAIL_RE, "[email hidden]").replace(PHONE_RE, "[number hidden]");
}
