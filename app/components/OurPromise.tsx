import { LucideIcon, Sprout, Droplets, Heart, HeartHandshake, FlaskConical } from "lucide-react";

type Value = {
  icon: LucideIcon;
  text: string;
};

const VALUES: Value[] = [
  { icon: Sprout, text: "Botanical Ingredients" },
  { icon: Droplets, text: "A Hair-Care Ritual" },
  { icon: FlaskConical, text: "Four Key Ingredients" },
  { icon: Heart, text: "Made in Pakistan" },
  { icon: HeartHandshake, text: "Made for Your Routine" },
];

export default function OurPromise() {
  return (
    <section className="w-full bg-espresso px-6 py-12 sm:px-10 md:px-16 md:py-16">
      <div className="mx-auto flex max-w-350 flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="shrink-0 font-jost">
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-gold sm:mb-3 sm:text-xs">The NIIVORA Approach</p>
          <h2 className="font-serif text-2xl leading-tight text-offwhite sm:text-3xl md:text-4xl">
            Thoughtful Care.
            <br />
            Clear Ingredients.
          </h2>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-5">
          {VALUES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-3 text-center">
              <Icon size={26} strokeWidth={1.25} className="text-gold" />
              <p className="text-[11px] uppercase leading-snug tracking-wide text-offwhite/80 sm:text-xs">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
