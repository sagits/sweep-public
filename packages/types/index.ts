export type User = {
  name: string;
  email: string;
};

/** A row in Home's Notifications card and, later, the notifications list. */
export type Notification = {
  id: string;
  message: string;
  /** ISO timestamp — rendered as a date over a time on the right of the row. */
  at: string;
};

/** A cleaning project. Home shows the next few; the Projects tab lays them out on a calendar. */
export type Project = {
  id: string;
  propertyAlias: string;
  /** null renders as "Unassigned". */
  cleanerName: string | null;
  /** ISO timestamp of the cleaning window's start. */
  startsAt: string;
};
