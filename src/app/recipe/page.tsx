import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { LauaeFrond, MaileLei, Pikake, PikakeStrand } from "@/components/TropicalDecor";

export const metadata: Metadata = {
  title: "Nanna's Chicken Long Rice | Nanna's 100th Birthday Lū'au",
  description:
    "Nanna's family-famous Chicken Long Rice recipe — written out in full, with a recording of Nanna sharing it in her own voice.",
};

const INGREDIENTS = [
  "1 whole fryer chicken (3½–4½ lbs), chopped into 10–12 pieces",
  "2 tablespoons olive oil",
  "12 ounces bean thread noodles (long rice)",
  "1 quart (32 oz) low-sodium chicken broth",
  "2–3 cups water (for cooking noodles)",
  "1½–2 teaspoons Hawaiian salt (start with less)",
  "4–6 green onions, thinly sliced",
];

const STEPS: { title: string; lines: string[] }[] = [
  {
    title: "Step 1 — Start the chicken",
    lines: [
      "Heat olive oil over medium heat.",
      "Add chopped chicken.",
      "Cook about 25 minutes, turning occasionally.",
      "The chicken should release its juices and become tender but not browned.",
    ],
  },
  {
    title: "Step 2 — Cook the long rice",
    lines: [
      "Meanwhile, bring water to a boil.",
      "Cook long rice for about 6 minutes until softened.",
      "Drain only if there is excess water.",
    ],
  },
  {
    title: "Step 3 — Bring them together",
    lines: [
      "Add the cooked long rice directly into the chicken pot.",
      "Pour in about 2 cups chicken broth.",
      "Stir.",
    ],
  },
  {
    title: "Step 4 — Season",
    lines: [
      "Season with Hawaiian salt.",
      "Taste.",
      "Add more broth if needed.",
      "Nanna likes it to stay moist — not soupy, but definitely not dry.",
    ],
  },
  {
    title: "Step 5 — Simmer",
    lines: [
      "Simmer for another 20–25 minutes.",
      "The noodles should absorb the broth while staying silky.",
    ],
  },
  {
    title: "Step 6 — Finish & serve",
    lines: ["Top generously with chopped green onions.", "Serve hot."],
  },
];

export default function RecipePage() {
  return (
    <div className="flex min-h-screen flex-col bg-lauhala">
      <Nav />
      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#073844] via-[#0b5563] to-[#0e6a74] pb-16 pt-14 text-white">
          <Pikake className="animate-floaty absolute left-3 top-6 h-5 w-5 text-white/45 sm:left-10 sm:top-10 sm:h-8 sm:w-8 sm:text-white/60" />
          <Pikake className="animate-floaty absolute right-3 top-14 h-4 w-4 text-white/35 sm:right-12 sm:top-24 sm:h-6 sm:w-6 sm:text-white/45" style={{ animationDelay: "1.4s" }} />
          <LauaeFrond className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-48 text-white/[0.12]" />
          <LauaeFrond flip className="pointer-events-none absolute -bottom-2 -right-10 h-20 w-40 text-white/[0.1]" />
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="font-script text-4xl text-plumeria">From Nanna&apos;s kitchen</p>
            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-6xl">
              Nanna&apos;s Chicken Long Rice
            </h1>
            <PikakeStrand className="mt-5 text-plumeria" />
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/85">
              The family-famous recipe — 100 years in the making. Nanna doesn&apos;t
              really measure, so feel free to do this one by taste, or by heart.
              You get um!
            </p>
          </div>
        </section>

        {/* Audio — Nanna in her own voice */}
        <section className="relative -mt-8 px-4">
          <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-gold/30 bg-shell p-7 shadow-xl">
            <div className="flex items-center gap-3">
              <Pikake className="h-8 w-8 shrink-0 text-lagoon" />
              <div>
                <h2 className="font-display text-2xl font-semibold text-lagoon-deep">
                  Hear it from Nanna herself
                </h2>
                <p className="text-sm text-ink/65">
                  Nanna shares her recipe in her own words — recorded with love.
                </p>
              </div>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls preload="metadata" className="mt-5 w-full">
              <source src="/api/recipe/audio?v=3" type="audio/mpeg" />
              Your browser does not support the audio player.
              <a href="/api/recipe/audio">Download the recording instead.</a>
            </audio>
            <p className="mt-3 text-center text-xs text-ink/50">
              About 7½ minutes · Press play and cook along with Nanna 💛
            </p>
          </div>
        </section>

        {/* Written recipe */}
        <section className="mx-auto max-w-3xl px-4 py-14">
          <div className="rounded-[1.75rem] border border-gold/25 bg-shell p-8 shadow-[0_10px_35px_-15px_rgba(11,85,99,0.25)] sm:p-10">
            <p className="text-center text-sm font-bold uppercase tracking-[0.25em] text-hibiscus">
              Serves 8–10
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold text-lagoon-deep">
              Ingredients
            </h2>
            <PikakeStrand className="mt-3 text-lagoon" />
            <ul className="mx-auto mt-6 max-w-xl space-y-2.5">
              {INGREDIENTS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Pikake className="mt-1 h-4 w-4 shrink-0 text-lagoon/70" />
                  <span className="leading-relaxed text-ink/85">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mx-auto mt-6 max-w-xl rounded-2xl bg-lauhala p-4 text-sm leading-relaxed text-ink/70">
              Notice what&apos;s <strong>not</strong> here: onion, garlic, ginger,
              soy sauce, sesame oil. Most Chicken Long Rice recipes include some
              or all of these, but Nanna specifically says she doesn&apos;t use
              onion, and she never mentions any of the others. That simplicity is
              probably what makes hers taste so different.
            </p>

            <h2 className="mt-12 text-center font-display text-3xl font-semibold text-lagoon-deep">
              Directions
            </h2>
            <PikakeStrand className="mt-3 text-lagoon" />
            <ol className="mx-auto mt-8 max-w-xl space-y-7">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative pl-12">
                  <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gold/50 bg-lauhala font-display text-sm font-bold text-lagoon-deep">
                    {i + 1}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-lagoon-deep">
                    {step.title}
                  </h3>
                  <div className="mt-1.5 space-y-1">
                    {step.lines.map((line) => (
                      <p key={line} className="leading-relaxed text-ink/80">
                        {line}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* What makes it different */}
          <div className="mt-10 rounded-[1.75rem] bg-lagoon-deep p-8 text-white sm:p-10">
            <p className="text-center font-script text-3xl text-plumeria">
              What makes Nanna&apos;s different
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="text-sm font-bold uppercase tracking-wider text-white/60">
                  Most recipes add
                </p>
                <p className="mt-2 leading-relaxed text-white/85">
                  Ginger · Onion · Garlic · Soy sauce · Sesame oil
                </p>
              </div>
              <div className="rounded-2xl border border-plumeria/40 bg-plumeria/10 p-5">
                <p className="text-sm font-bold uppercase tracking-wider text-plumeria">
                  Nanna&apos;s flavor comes from
                </p>
                <p className="mt-2 leading-relaxed text-white/90">
                  Chicken · Chicken broth · Hawaiian salt · Long rice · Green onions
                </p>
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-center leading-relaxed text-white/75">
              Nanna&apos;s version is almost minimalist — very old-school
              plantation style. The chicken is the star, and the broth stays
              light and comforting instead of heavily seasoned.
            </p>
          </div>
          <MaileLei withPikake className="mt-12 text-palm/45" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
