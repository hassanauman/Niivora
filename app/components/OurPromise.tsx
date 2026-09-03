import {
  LucideIcon,
  Ban,
  Sprout,
  Droplets,
  Heart,
  HeartHandshake,
} from "lucide-react";

type Value = {
  icon: LucideIcon;
  text: string;
};

const VALUES: Value[] = [
  { icon: Ban, text: "No Harmful Chemicals" },
  { icon: Sprout, text: "Sustainably Sourced" },
  { icon: Droplets, text: "Cold Pressed Goodness" },
  { icon: Heart, text: "Made in Pakistan" },
  { icon: HeartHandshake, text: "Love for People & Planet" },
];

export default function OurPromise() {
  return (
    <section className="w-full bg-espresso px-6 py-12 sm:px-10 md:px-16 md:py-16">
      <div className="mx-auto flex max-w-350 flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        {/* Left — heading */}
        <div className="shrink-0 font-jost">
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-gold sm:mb-3 sm:text-xs">
            Our Promise
          </p>

          <h2 className="font-serif text-2xl leading-tight text-offwhite sm:text-3xl md:text-4xl">
            Pure. Honest.
            <br />
            Always.
          </h2>
        </div>

        {/* Right — values grid */}
        <div className="grid flex-1 grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-5">
          {VALUES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex flex-col items-center gap-3 text-center"
            >
              <Icon size={26} strokeWidth={1.25} className="text-gold" />

              <p className="text-[11px] uppercase leading-snug tracking-wide text-offwhite/80 sm:text-xs">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
