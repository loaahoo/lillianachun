import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PhotoStrip from "@/components/PhotoStrip";
import PhotoUpload from "@/components/PhotoUpload";
import { ENTERTAINMENT, EVENT, MENU } from "@/lib/event";
import { getEventDetails } from "@/lib/eventDetails";
import { SIMPLE_SCHEDULE } from "@/lib/schedule";
import { LauaeFrond, MaileLei, Pikake, PikakeStrand } from "@/components/TropicalDecor";

export const dynamic = "force-dynamic";

export default async function Home() {
  const details = await getEventDetails();
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#073844] via-[#0b5563] to-[#0e6a74] pb-24 pt-16 text-white">
          {/* decorative monstera silhouettes */}
          <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 opacity-[0.08]" fill="currentColor">
            <path d="M100 15c-40 0-75 32-75 78 0 40 28 72 66 77l4-30-25-8 28-6 3-22-30-10 33-3 2-20-22-12 25-1C112 22 107 15 100 15z" />
          </svg>
          <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -bottom-20 -right-12 h-80 w-80 rotate-45 opacity-[0.08]" fill="currentColor">
            <path d="M100 15c-40 0-75 32-75 78 0 40 28 72 66 77l4-30-25-8 28-6 3-22-30-10 33-3 2-20-22-12 25-1C112 22 107 15 100 15z" />
          </svg>
          {/* Pikake blossoms — Nanna's favorite flower — drifting in the hero */}
          <Pikake className="animate-floaty absolute left-8 top-12 h-10 w-10 text-white/70" />
          <Pikake className="animate-floaty absolute right-10 top-28 h-7 w-7 text-white/50" style={{ animationDelay: "1.2s" }} />
          <Pikake className="animate-floaty absolute bottom-32 left-1/4 h-8 w-8 text-white/55" style={{ animationDelay: "2.1s" }} />
          <Pikake className="animate-floaty absolute right-1/4 top-1/2 h-5 w-5 text-white/40" style={{ animationDelay: "3s" }} />
          {/* Laua'e fronds anchoring the hero corners */}
          <LauaeFrond className="pointer-events-none absolute -bottom-4 -left-8 h-28 w-56 text-white/[0.13]" />
          <LauaeFrond flip className="pointer-events-none absolute -bottom-2 -right-10 h-24 w-48 text-white/[0.1]" />

          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
            <div className="animate-fade-slow text-center md:text-left">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-plumeria">
                E komo mai · You are invited
              </p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] sm:text-7xl">
                One Hundred Years
                <span className="mt-2 block font-script text-4xl font-normal text-plumeria sm:text-6xl">
                  of Aloha
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-white/85 md:mx-0">
                Join us for {EVENT.honoree}&apos;s {EVENT.theme} — honoring a
                full century of love, laughter, and island life in{" "}
                {details.location}.
              </p>
              <PikakeStrand className="mt-4 justify-center text-plumeria md:justify-start" />
              <p className="mt-4 font-display text-2xl text-plumeria">
                {details.date}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  href="/rsvp"
                  className="rounded-full bg-hibiscus px-9 py-3.5 font-bold text-white shadow-xl shadow-hibiscus/25 transition-all hover:-translate-y-0.5 hover:bg-[#b52f52]"
                >
                  RSVP now
                </Link>
                <a
                  href="#share-a-photo"
                  className="rounded-full border border-white/50 px-9 py-3.5 font-bold text-white/95 backdrop-blur transition-colors hover:bg-white/10"
                >
                  Share a photo
                </a>
              </div>
            </div>

            <div className="animate-fade-slow mx-auto w-full max-w-sm">
              <div className="rotate-2 rounded-[1.75rem] border border-gold/40 bg-shell p-3 shadow-2xl transition-transform duration-300 hover:rotate-0">
                <Image
                  src="/images/nanna.jpg"
                  alt="Nanna smiling in her yellow dress"
                  width={640}
                  height={480}
                  priority
                  className="rounded-[1.25rem] object-cover"
                />
                <p className="py-3 text-center font-script text-3xl text-ink">
                  Our beautiful Nanna
                </p>
              </div>
            </div>
          </div>

          {/* wave divider */}
          <svg aria-hidden viewBox="0 0 1440 70" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-[46px] w-full text-sand">
            <path fill="currentColor" d="M0,40 C240,70 480,10 720,35 C960,60 1200,20 1440,45 L1440,70 L0,70 Z" />
          </svg>
        </section>

        {/* Party details */}
        <section className="bg-lauhala">
          <div className="relative mx-auto max-w-6xl px-4 py-20">
            <LauaeFrond className="pointer-events-none absolute -left-6 top-8 h-20 w-40 text-palm/15" />
            <LauaeFrond flip className="pointer-events-none absolute -right-8 bottom-8 h-20 w-40 text-palm/15" />
            <p className="text-center font-script text-3xl text-hibiscus">The Celebration</p>
            <h2 className="mt-1 text-center font-display text-4xl font-semibold text-lagoon-deep sm:text-5xl">
              {EVENT.theme}
            </h2>
            <PikakeStrand className="mt-4 text-lagoon" />
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { icon: "📅", title: "When", main: details.date, sub: details.time },
                { icon: "📍", title: "Where", main: details.venue, sub: details.address },
                { icon: "pikake", title: "Who", main: details.guests, sub: "Aloha attire encouraged!" },
              ].map(card => (
                <div key={card.title} className="rounded-[1.5rem] border border-gold/25 bg-shell p-8 text-center shadow-[0_10px_35px_-15px_rgba(11,85,99,0.25)]">
                  {card.icon === "pikake" ? (
                    <Pikake className="mx-auto h-10 w-10 text-lagoon" />
                  ) : (
                    <p className="text-4xl">{card.icon}</p>
                  )}
                  <h3 className="mt-4 font-display text-2xl font-semibold text-lagoon">{card.title}</h3>
                  <p className="mt-2 font-bold text-ink">{card.main}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/65">{card.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/rsvp"
                className="inline-block rounded-full bg-lagoon px-10 py-3.5 font-bold text-white shadow-lg shadow-lagoon/25 transition-all hover:-translate-y-0.5 hover:bg-lagoon-deep"
              >
              Let us know you&apos;re coming →
              </Link>
            </div>
          </div>
          {/* maile lei draped along the section boundary */}
          <MaileLei withPikake className="text-palm/45" />
        </section>

        {/* Evening schedule (simple, guest-friendly) */}
        <section className="relative bg-shell pb-14 pt-20">
          <div className="mx-auto max-w-3xl px-4">
            <p className="text-center font-script text-3xl text-hibiscus">How the evening flows</p>
            <h2 className="mt-1 text-center font-display text-4xl font-semibold text-lagoon-deep">
              The Party Schedule
            </h2>
            <PikakeStrand className="mt-4 text-lagoon" />
            <ol className="relative mt-12 space-y-0 border-l-2 border-gold/30 pl-0">
              {SIMPLE_SCHEDULE.map(item => (
                <li key={item.time} className="relative flex gap-5 pb-8 pl-8 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gold/50 bg-shell text-[11px]"
                  >
                    {item.emoji}
                  </span>
                  <div className="w-20 shrink-0 pt-0.5">
                    <p className="font-bold text-hibiscus">{item.time}</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-semibold text-lagoon-deep">{item.title}</p>
                    <p className="mt-0.5 text-sm text-ink/60">{item.note}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 text-center">
              <Link
                href="/schedule"
                className="inline-block rounded-full border-2 border-lagoon px-9 py-3 font-bold text-lagoon transition-colors hover:bg-lagoon hover:text-white"
              >
                See the full schedule →
              </Link>
            </div>
          </div>
          {/* maile lei draped along the section base */}
          <MaileLei withPikake className="mt-12 text-palm/45" />
        </section>

        {/* Menu & entertainment */}
        <section className="relative overflow-hidden bg-lagoon-deep py-20 text-white">
          <LauaeFrond className="pointer-events-none absolute -left-10 -top-2 h-24 w-52 text-white/[0.08]" />
          <LauaeFrond flip className="pointer-events-none absolute -bottom-4 -right-8 h-28 w-56 text-white/[0.08]" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-14 md:grid-cols-2">
              <div>
                <p className="font-script text-3xl text-plumeria">ʻOno grinds</p>
                <h2 className="mt-1 font-display text-4xl font-semibold">The Lū&apos;au Menu</h2>
                <ul className="mt-8 space-y-4">
                  {MENU.map(item => (
                    <li key={item.name} className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="font-display text-xl font-semibold text-plumeria/95">{item.name}</span>
                      <span className="text-right text-sm text-white/65">{item.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-script text-3xl text-plumeria">Mele & hula</p>
                <h2 className="mt-1 font-display text-4xl font-semibold">Entertainment</h2>
                <ul className="mt-8 space-y-6">
                  {ENTERTAINMENT.map(item => (
                    <li key={item.name} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                      <p className="font-display text-xl font-semibold text-plumeria/95">{item.name}</p>
                      <p className="mt-1 text-sm text-white/70">{item.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* maile lei against the deep lagoon — lighter strand */}
          <MaileLei className="mt-14 text-plumeria/35" />
        </section>

        {/* Photo upload */}
        <section id="share-a-photo" className="relative bg-lauhala py-20">
          <LauaeFrond className="pointer-events-none absolute -right-6 top-10 h-20 w-40 -scale-x-100 text-palm/15" />
          <div className="relative mx-auto max-w-4xl px-4">
            <p className="text-center font-script text-3xl text-hibiscus">Help us remember</p>
            <h2 className="mt-1 text-center font-display text-4xl font-semibold text-lagoon-deep">
              Share a Photo of Nanna
            </h2>
            <PikakeStrand className="mt-4 text-lagoon" />
            <p className="mx-auto mt-3 max-w-xl text-center leading-relaxed text-ink/70">
              Help us gather 100 years of memories! Upload your favorite photos
              of Nanna — after the family approves them, they&apos;ll appear in
              the gallery and in the big slideshow at the party.
            </p>
            <div className="mt-9">
              <PhotoUpload />
            </div>
          </div>
          <MaileLei withPikake className="mt-14 text-palm/45" />
        </section>

        {/* Approved photo strip */}
        <section className="relative mx-auto max-w-6xl px-4 py-20">
          <LauaeFrond className="pointer-events-none absolute -left-4 bottom-6 h-16 w-32 text-palm/15" />
          <p className="text-center font-script text-3xl text-hibiscus">The memories so far</p>
          <h2 className="mt-1 text-center font-display text-4xl font-semibold text-lagoon-deep">
            100 Years of Aloha
          </h2>
          <PikakeStrand className="mt-4 text-lagoon" />
          <div className="mt-9">
            <PhotoStrip />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
