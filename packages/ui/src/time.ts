/**
 * "11:00 AM" — the one clock format in the app, shared by `DateTimeStamp`, project detail's
 * start/end rows and the manual project form's hour presets.
 */
export const timeLabel = (at: Date | string) =>
  new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
