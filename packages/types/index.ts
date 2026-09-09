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

/**
 * A completed payment in the Payment History list. Every seeded payment is paid — the PoC has
 * no other state — so the "Paid" pill is a constant, not a field.
 */
export type Payment = {
  id: string;
  cleanerName: string;
  propertyAlias: string;
  /** ISO timestamp of when the payment settled. */
  paidAt: string;
  /** Whole USD amount, formatted at the row. */
  amount: number;
};
/** The unit-size toggle on the property form; the value is also what the card prints. */
export type UnitSizeUnit = 'sq. ft.' | 'sq. mt.';

/** A registered property. The Properties tab lists these; projects and searches point at one. */
export type Property = {
  id: string;
  alias: string;
  /** Street address without the unit — the card appends `#unit` itself. */
  address: string;
  /** "Unit #, Building Name, etc". Empty when the host left it blank. */
  unit: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  /** null when the host ticked "I don't know the Unit Size". */
  unitSize: number | null;
  unitSizeUnit: UnitSizeUnit;
  /** Stands in for the property photo; the card falls back to a house outline without one. */
  image?: string;
  currency: string;
  checkoutTime: string;
  checkinTime: string;
  description: string;
};

/** What the New Property form collects. The id is the mock resolver's to assign. */
export type NewProperty = Omit<Property, 'id'>;
