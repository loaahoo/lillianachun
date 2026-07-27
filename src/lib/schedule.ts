/**
 * Party-day schedule, extracted from the family's Run of Show.
 * SIMPLE_SCHEDULE = guest-friendly view (homepage section).
 * FULL_SCHEDULE = complete party timeline (click-through page).
 * Pre-party setup workstreams are intentionally excluded.
 */

export interface ScheduleItem {
  time: string;
  title: string;
  note: string;
  emoji: string;
}

export interface FullScheduleSegment {
  segment: string;
  emoji: string;
  items: { time: string; duration: string; activity: string; note?: string }[];
}

/** The simple, friendly version guests see on the homepage. */
export const SIMPLE_SCHEDULE: ScheduleItem[] = [
  { time: "4:00 PM", emoji: "🌺", title: "Aloha & Arrival", note: "Come say hi! Pūpūs served with soft Hawaiian music" },
  { time: "4:45 PM", emoji: "🎤", title: "Welcome & Family Tributes", note: "Opening remarks and a few words of love for Nanna" },
  { time: "5:10 PM", emoji: "🌴", title: "Hula & Live Music", note: "Performances by the 'ohana, plus a special tribute dance" },
  { time: "5:45 PM", emoji: "🍽️", title: "Dinner is Served", note: "The lū'au buffet opens — kalua pig, lomi salmon & more" },
  { time: "6:30 PM", emoji: "🎂", title: "Cake & Celebration", note: "We sing to Nanna — the big moment of the night!" },
  { time: "7:10 PM", emoji: "📸", title: "Music, Mingling & Photos", note: "Open celebration and photos with Nanna" },
  { time: "8:15 PM", emoji: "💛", title: "Aloha 'Oe", note: "A final mahalo and warm goodnight" },
];

/** The complete run of show for the party (guest-visible portions). */
export const FULL_SCHEDULE: FullScheduleSegment[] = [
  {
    segment: "Guest Arrival & Welcome",
    emoji: "🌺",
    items: [
      { time: "4:00 PM", duration: "45 min", activity: "Guests arrive", note: "Reception team welcomes you at the entrance — light music playing" },
      { time: "4:00 PM", duration: "45 min", activity: "Pūpūs served", note: "Appetizers by the Maui Chun 'ohana" },
      { time: "4:00 PM", duration: "45 min", activity: "Background music", note: "Soft Hawaiian music by Ray" },
    ],
  },
  {
    segment: "Program Start",
    emoji: "🎤",
    items: [
      { time: "4:45 PM", duration: "10 min", activity: "Welcome & opening remarks", note: "Our MC kicks off the celebration" },
      { time: "4:55 PM", duration: "15 min", activity: "Family tributes", note: "A few words from the family" },
    ],
  },
  {
    segment: "Entertainment — Hula & Music",
    emoji: "🌴",
    items: [
      { time: "5:10 PM", duration: "20 min", activity: "Hula performances", note: "Danced with love by Nanna's 'ohana" },
      { time: "5:30 PM", duration: "15 min", activity: "Special Nanna tribute dance", note: "An emotional highlight" },
    ],
  },
  {
    segment: "Dinner Service",
    emoji: "🍽️",
    items: [
      { time: "5:45 PM", duration: "45 min", activity: "Lū'au buffet opens", note: "Kalua pig, chicken long rice, lomi salmon, rice & haupia" },
      { time: "5:45 PM", duration: "45 min", activity: "Live music continues", note: "Ray keeps the island vibes going" },
    ],
  },
  {
    segment: "The Main Moment — Cake & Celebration",
    emoji: "🎂",
    items: [
      { time: "6:30 PM", duration: "10 min", activity: "Gather for cake", note: "Everyone comes together near the stage" },
      { time: "6:40 PM", duration: "10 min", activity: "Cake presentation & birthday song", note: "The big moment — 100 years!" },
      { time: "6:50 PM", duration: "20 min", activity: "Cake serving", note: "A sweet slice for everyone" },
    ],
  },
  {
    segment: "Open Celebration & Social Time",
    emoji: "📸",
    items: [
      { time: "7:10 PM", duration: "60 min", activity: "Open music & mingling", note: "Dance, talk story, and enjoy" },
      { time: "7:10 PM", duration: "60 min", activity: "Photos with Nanna", note: "Capture a memory at the photo area" },
    ],
  },
  {
    segment: "Closing",
    emoji: "💛",
    items: [
      { time: "8:15 PM", duration: "15 min", activity: "Final thank you & closing", note: "A short, warm aloha 'oe from the family" },
    ],
  },
];
