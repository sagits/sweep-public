/**
 * "11:00 AM" — the one clock format in the app, shared by `DateTimeStamp`, project detail's
 * start/end rows and the manual project form's hour presets.
 */
export const timeLabel = (at: Date | string) =>
  new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const MINUTE = 60_000;

/**
 * "a minute ago" / "3 hours ago" — the notifications list's stamp, and the tail of the
 * Marketplace's "Created …" line. Seeded rows are timestamped when the bundle loads, so a fresh
 * launch reads like the reference; it stays honest after that.
 */
export function relativeLabel(iso: string): string {
  const minutes = Math.floor((Date.now() - Date.parse(iso)) / MINUTE);
  if (minutes < 2) return 'a minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}
