/** Single source of truth for the party details shown across the site. */
export const EVENT = {
  honoree: "Nanna",
  age: 100,
  title: "Nanna's 100th Birthday Lū'au",
  theme: "Lilliana Chun's 100th Birthday",
  date: "Sunday, December 27, 2026",
  time: "4:00 PM – 9:00 PM",
  venue: "Venue being finalized",
  address: "Ewa Beach, Hawaii",
  location: "Ewa Beach, Hawaii",
  guests: "About 200 family & friends",
  tagline: "A century of aloha. One unforgettable celebration.",
} as const;

/** Confirmed lū'au menu from the family planner. */
export const MENU = [
  { name: "Kalua Pig", note: "Slow-roasted, smoky & tender" },
  { name: "Chicken Long Rice", note: "Comforting island classic" },
  { name: "Lomi Salmon", note: "Fresh, bright & chilled" },
  { name: "Steamed Rice", note: "The heart of every plate" },
  { name: "Haupia", note: "Silky coconut pudding" },
  { name: "Family Pūpūs", note: "Appetizers by the Maui Chun & Soon 'ohana" },
] as const;

/** Entertainment lineup from the planner. */
export const ENTERTAINMENT = [
  { name: "Live Hawaiian Music", note: "Performed by Ray" },
  { name: "Family Hula", note: "Danced with love by Nanna's 'ohana" },
  { name: "100 Years of Stories", note: "Memories shared across generations" },
] as const;
