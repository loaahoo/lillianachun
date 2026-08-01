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
  { time: "11:00 AM", emoji: "🌺", title: "Arrival", note: "Reception opens with Hawaiian music and the family photo station" },
  { time: "11:45 AM", emoji: "🎤", title: "Welcome Remarks", note: "The family welcomes everyone to Nanna's celebration" },
  { time: "12:00 PM", emoji: "🍽️", title: "Food", note: "Lunch is served" },
  { time: "1:00 PM", emoji: "🌴", title: "Hula", note: "A special hula performance for Nanna" },
  { time: "2:00–3:00 PM", emoji: "🎵", title: "Live Music", note: "Enjoy live music during the final hour" },
  { time: "2:00–2:30 PM", emoji: "📸", title: "Photos with Nanna", note: "Take family photos with Nanna" },
  { time: "3:00 PM", emoji: "💛", title: "Wrap-Up", note: "Closing mahalo and a hui hou" },
];

/** The complete run of show for the party (guest-visible portions). */
export const FULL_SCHEDULE: FullScheduleSegment[] = [
  {
    segment: "Guest Arrival & Welcome",
    emoji: "🌺",
    items: [
      { time: "11:00 AM", duration: "45 min", activity: "Guests arrive", note: "Reception team welcomes everyone and directs gifts, cards and seating" },
      { time: "11:00 AM", duration: "45 min", activity: "Hawaiian background music", note: "Settle in, greet family and talk story" },
    ],
  },
  {
    segment: "Welcome Remarks",
    emoji: "🎤",
    items: [
      { time: "11:45 AM", duration: "15 min", activity: "Welcome remarks", note: "The family welcomes the 'ohana and begins the celebration" },
    ],
  },
  {
    segment: "Food",
    emoji: "🍽️",
    items: [
      { time: "12:00 PM", duration: "60 min", activity: "Lunch is served", note: "Relax, eat and enjoy time with the 'ohana" },
    ],
  },
  {
    segment: "Hula",
    emoji: "🌴",
    items: [
      { time: "1:00 PM", duration: "60 min", activity: "Hula performance", note: "A special performance for Nanna" },
    ],
  },
  {
    segment: "Live Music & Photos",
    emoji: "📸",
    items: [
      { time: "2:00 PM", duration: "60 min", activity: "Live music", note: "Enjoy live music during the final hour" },
      { time: "2:00 PM", duration: "30 min", activity: "Photos with Nanna", note: "Capture family photos with Nanna" },
    ],
  },
  {
    segment: "Wrap-Up",
    emoji: "💛",
    items: [
      { time: "3:00 PM", duration: "—", activity: "Final mahalo & closing", note: "A short, warm aloha 'oe from the family" },
    ],
  },
];
