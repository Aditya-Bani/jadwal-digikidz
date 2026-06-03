/**
 * Custom display name mapping per email.
 * Tambahkan email baru di sini jika ingin override nama default.
 */
const EMAIL_DISPLAY_NAMES: Record<string, string> = {
  'anggara@gmail.com': 'Mr. Argy',
  'bani96963@gmail.com': 'Mr. Bani',
  'digikidzkotawisata@gmail.com': 'Ms. Zaura',
};

/**
 * Email yang tidak menggunakan prefix "Coach" di dashboard.
 */
const NO_COACH_PREFIX = new Set([
  'digikidzkotawisata@gmail.com',
]);

/**
 * Mengembalikan true jika email ini seharusnya tampil tanpa prefix "Coach".
 */
export function hasCoachPrefix(email: string): boolean {
  return !NO_COACH_PREFIX.has(email.toLowerCase().trim());
}

/**
 * Mengembalikan display name kustom jika ada,
 * jika tidak, generate dari username email seperti biasa.
 */
export function getDisplayName(email: string): string {
  if (!email) return '';
  const lower = email.toLowerCase().trim();
  if (EMAIL_DISPLAY_NAMES[lower]) return EMAIL_DISPLAY_NAMES[lower];
  const rawName = email.split('@')[0];
  return rawName
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Mengembalikan inisial dari display name (maks 2 karakter).
 */
export function getInitials(email: string): string {
  const name = getDisplayName(email);
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
