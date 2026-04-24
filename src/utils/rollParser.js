/**
 * Validates that email belongs to the university domain
 * @param {string} email
 * @returns {boolean}
 */
export function isValidUniversityEmail(email) {
  return email?.endsWith("@cfd.nu.edu.pk");
}

/**
 * Parses a university email into a formatted roll number
 * e.g. f243053@cfd.nu.edu.pk → 24F-3053
 * @param {string} email
 * @returns {string|null}
 */
export function parseRollNumber(email) {
  if (!isValidUniversityEmail(email)) return null;

  const localPart = email.split("@")[0]; // e.g. "f243053"

  // Pattern: optional letter prefix, 2-digit year, campus letter, roll digits
  // e.g. f243053 → year=24, campus=f, roll=3053
  const match = localPart.match(/^([a-zA-Z]?)(\d{2})([a-zA-Z])(\d+)$/);
  if (!match) return null;

  const [, , year, campus, roll] = match;
  return `${year}${campus.toUpperCase()}-${roll}`; // → "24F-3053"
}

/**
 * Converts a roll number to the image filename used in Firebase Storage
 * e.g. 24F-3053 → 24f3053
 * @param {string} rollNumber  e.g. "24F-3053"
 * @returns {string}           e.g. "24f3053"
 */
export function rollToFilename(rollNumber) {
  return rollNumber.replace("-", "").toLowerCase(); // "24f3053"
}

/**
 * Parses email directly to storage filename
 * e.g. f243053@cfd.nu.edu.pk → 24f3053
 */
export function emailToFilename(email) {
  const roll = parseRollNumber(email);
  if (!roll) return null;
  return rollToFilename(roll);
}

/**
 * Parses a filename (without extension) back to formatted roll number for display
 * e.g. "24f3053" → "24F-3053"
 */
export function filenameToRoll(filename) {
  const match = filename.match(/^(\d{2})([a-zA-Z])(\d+)$/);
  if (!match) return filename.toUpperCase();
  const [, year, campus, roll] = match;
  return `${year}${campus.toUpperCase()}-${roll}`;
}

/**
 * ─── ADMIN WHITELIST ───────────────────────────────────────────
 * THIS is the single source of truth for admin access.
 * storage.rules and firestore.rules do NOT maintain a separate list —
 * they only enforce authentication. Admin gating is handled here in
 * the app, keeping everything in one place.
 *
 * Add/remove admin emails here only.
 * ──────────────────────────────────────────────────────────────
 */
export const ADMIN_EMAILS = [
  "dawoodbinrafaydbr@gmail.com"
  // "another.admin@cfd.nu.edu.pk",
];

export function isAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}
