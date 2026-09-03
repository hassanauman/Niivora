import RitualImg from "@/public/images/ritual.webp";

type Step = {
  number: string;
  label: string;
  description: string;
};

const STEPS: Step[] = [
  { number: "01", label: "Apply", description: "On scalp & lengths" },
  { number: "02", label: "Massage", description: "For 3-5 minutes" },
  { number: "03", label: "Nourish", description: "Leave it overnight" },
  { number: "04", label: "Repeat", description: "3-4 times a week" },
];

export default function Ritual() {
  return (
    <section
      id="ritual"
      className="relative min-h-125 w-full scroll-mt-20 bg-cover bg-center sm:min-h-137.5 md:min-h-150 lg:bg-right"
      style={{ backgroundImage: `url(${RitualImg.src})` }}
    >
      {/* Dark overlay for text readability against the photo */}
      <div className="absolute inset-0 bg-linear-to-r from-espresso/90 via-espresso/50 to-transparent lg:to-espresso/10" />

      <div className="relative z-10 mx-auto flex h-full min-h-125 max-w-350 flex-col justify-between px-6 py-12 sm:min-h-137.5 sm:px-10 sm:py-16 md:min-h-150 md:px-16 md:py-20">
        {/* Top — heading block */}
        <div className="max-w-md font-jost">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold sm:mb-4 sm:text-xs">
            The Nevora Ritual
          </p>

          <h2 className="mb-4 font-serif text-2xl leading-tight text-offwhite sm:mb-6 sm:text-3xl md:text-4xl">
            A Moment of Care.
            <br />
            Every Day.
          </h2>

          <p className="max-w-xs text-sm leading-relaxed text-offwhite/80 md:text-base">
            Take a few minutes for yourself.
            <br />
            Massage gently. Breathe deep.
            <br />
            Let nature do the rest.
          </p>
        </div>

        {/* Bottom — steps row */}
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-6 sm:gap-x-10">
          {STEPS.map(({ number, label, description }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold font-jost text-xs text-gold sm:h-9 sm:w-9">
                {number}
              </span>

              <div className="font-jost">
                <p className="text-xs font-medium uppercase tracking-wide text-offwhite sm:text-sm">
                  {label}
                </p>
                <p className="text-[11px] text-offwhite/60 sm:text-xs">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
