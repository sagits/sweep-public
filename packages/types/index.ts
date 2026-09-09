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

/**
 * A cleaner on the Marketplace. The bid card shows the top of this; the cleaner detail screen
 * shows all of it, which is why the whole cleaner rides on the bid rather than being looked up.
 */
export type Cleaner = {
  id: string;
  name: string;
  /** Emoji stand-in for the profile photo — nothing branded or licensed is shipped. */
  photo: string;
  /** 0–5, one decimal. Rendered as stars plus the number. */
  rating: number;
  reviewCount: number;
  /** The teal "Super Cleaner" chip next to the name. Aurea has no chip in the reference. */
  superCleaner: boolean;
  /** The "is also a Rental Handy Pro" line, again absent for Aurea. */
  rentalHandyPro: boolean;
  /** The purple shield badge on the bid card's footer strip. */
  backgroundChecked: boolean;
  completedProjects: number;
  location: string;
  /** Whole miles — the detail screen prints "5 miles away". */
  distanceMiles: number;
  /** Already formatted ("July 2023"): the PoC has no date to compute it from. */
  memberSince: string;
  /** "Message from Cleaner", behind the detail screen's Show/Hide expander. */
  message: string;
  /** Emoji stand-ins for the before/after grid on the cleaner detail screen. */
  workPhotos: string[];
};

/**
 * A cleaner's bid on one search. Every bid in the PoC is new — accepting one is inert per the
 * PRD — so there is no status field for the one value it could ever hold.
 */
export type Bid = {
  id: string;
  searchId: string;
  cleaner: Cleaner;
  /** Whole USD; the card prints "$100 per project". */
  price: number;
  /** The footer strip's "Expires in 2 days". */
  expiresInDays: number;
};

/**
 * A search posted to the Marketplace. Nothing ever closes one, so — like `Bid` — there is no
 * status field; the Closed tab renders the empty state.
 */
export type CleanerSearch = {
  id: string;
  propertyId: string;
  propertyAlias: string;
  /** ISO timestamp, rendered as "Created a minute ago". */
  createdAt: string;
  /** The property details the wizard confirmed, echoed by the Search Summary expander. */
  unit: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  unitSize: number | null;
  unitSizeUnit: UnitSizeUnit;
  /** "Describe your cleaning needs" — empty when the host skipped it. */
  notes: string;
  bids: Bid[];
};

/** What the New Cleaner Search wizard collects. The rest is the mock resolver's to assign. */
export type NewSearch = Omit<CleanerSearch, 'id' | 'createdAt' | 'bids'>;
