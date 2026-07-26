import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PhotoStrip from "@/components/PhotoStrip";
import PhotoUpload from "@/components/PhotoUpload";
import { EVENT } from "@/lib/event";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0e7490] via-[#0891b2] to-[#fdf6ec] pb-20 pt-14 text-white">
          <span aria-hidden className="animate-floaty absolute left-6 top-10 text-4xl opacity-80">🌺</span>
          <span aria-hidden className="animate-floaty absolute right-8 top-24 text-3xl opacity-70" style={{ animationDelay: "1.2s" }}>🌴</span>
          <span aria-hidden className="animate-floaty absolute left-1/4 bottom-24 text-3xl opacity-70" style={{ animationDelay: "2.1s" }}>🌸</span>
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
            <div className="animate-fade-slow text-center md:text-left">
              <p className="text-lg font-semibold tracking-widest text-plumeria">E KOMO MAI · WELCOME</p>
              <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">
                {EVENT.honoree} is turning{" "}
                <span className="text-plumeria">100!</span>
              </h1>
              <p className="mt-4 max-w-md text-lg text-white/90 md:max-w-none">
                {EVENT.tagline} Join us in {EVENT.location} to honor a full
                century of love, laughter, and island life.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  href="/rsvp"
                  className="rounded-full bg-hibiscus px-8 py-3 font-bold text-white shadow-lg transition-colors hover:bg-hibiscus/90"
                >
                  RSVP now
                </Link>
                <a
                  href="#share-a-photo"
                  className="rounded-full border-2 border-white/70 px-8 py-3 font-bold text-white transition-colors hover:bg-white/10"
                >
                  Share a photo
                </a>
              </div>
            </div>
            <div className="animate-fade-slow mx-auto w-full max-w-sm">
              <div className="rotate-2 rounded-3xl bg-white p-3 shadow-2xl transition-transform hover:rotate-0">
                <Image
                  src="/images/nanna.jpg"
                  alt="Nanna smiling in her yellow dress"
                  width={640}
                  height={480}
                  priority
                  className="rounded-2xl object-cover"
                />
                <p className="py-3 text-center font-display text-2xl text-ink">
                  Our beautiful Nanna 💛
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Party details */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-display text-4xl text-ocean-deep">
            The Celebration
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-ink/70">
            One hundred years deserves one unforgettable lū&apos;au. Here&apos;s
            everything you need to know.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-[color:var(--sand-deep)] bg-white/80 p-6 text-center shadow-sm">
              <p className="text-4xl">📅</p>
              <h3 className="mt-3 font-display text-2xl text-hibiscus">When</h3>
              <p className="mt-2 font-semibold">{EVENT.date}</p>
              <p className="text-ink/70">{EVENT.time}</p>
            </div>
            <div className="rounded-3xl border border-[color:var(--sand-deep)] bg-white/80 p-6 text-center shadow-sm">
              <p className="text-4xl">📍</p>
              <h3 className="mt-3 font-display text-2xl text-hibiscus">Where</h3>
              <p className="mt-2 font-semibold">{EVENT.venue}</p>
              <p className="text-ink/70">{EVENT.address}</p>
            </div>
            <div className="rounded-3xl border border-[color:var(--sand-deep)] bg-white/80 p-6 text-center shadow-sm">
              <p className="text-4xl">🌺</p>
              <h3 className="mt-3 font-display text-2xl text-hibiscus">What</h3>
              <p className="mt-2 font-semibold">A backyard-style lū&apos;au</p>
              <p className="text-ink/70">
                Ono food, live music, hula, and 100 years of stories. Aloha
                attire encouraged!
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/rsvp"
              className="inline-block rounded-full bg-ocean px-10 py-3.5 font-bold text-white shadow-md transition-colors hover:bg-ocean-deep"
            >
              Let us know you&apos;re coming →
            </Link>
          </div>
        </section>

        {/* Photo upload */}
        <section id="share-a-photo" className="bg-sand-deep/50 py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center font-display text-4xl text-ocean-deep">
              Share a Photo of Nanna
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-ink/70">
              Help us gather 100 years of memories! Upload your favorite photos
              of Nanna — after the family approves them, they&apos;ll appear in
              the gallery below and in the big slideshow at the party.
            </p>
            <div className="mt-8">
              <PhotoUpload />
            </div>
          </div>
        </section>

        {/* Approved photo strip */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-display text-4xl text-ocean-deep">
            100 Years of Aloha
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-ink/70">
            A rolling glimpse of the memories shared so far.
          </p>
          <div className="mt-8">
            <PhotoStrip />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
