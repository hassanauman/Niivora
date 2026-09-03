import Image from "next/image";
import Mother from "@/public/images/mother.webp";
import Botanical from "@/public/images/botanical.svg";

export default function Story() {
  return (
    <section id="our-story" className="scroll-mt-20 w-full bg-cream">
      <div className="grid min-h-125 grid-cols-1 lg:grid-cols-[40%_60%]">
        {/* Left — image */}
        <div className="relative h-87.5 sm:h-112.5 lg:h-auto">
          <Image
            src={Mother}
            alt="Woman with long hair by a window, embodying the Nevora ritual"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right — text panel */}
        <div className="relative flex flex-col justify-center overflow-hidden px-6 py-12 font-jost sm:px-10 sm:py-16 md:px-16 md:py-20">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold sm:mb-4 sm:text-xs">
            The Nevora Story
          </p>

          <h2 className="mb-4 max-w-md font-serif text-2xl leading-tight text-charcoal sm:mb-6 sm:text-3xl md:text-4xl">
            Born from a Mother's Recipe. Perfected by Nature.
          </h2>

          <p className="mb-3 max-w-sm text-sm text-charcoal/80 sm:mb-4 md:text-base">
            Nevora began with a simple belief — the best care comes from nature
            and love.
          </p>

          <p className="mb-6 max-w-sm text-sm text-charcoal/80 sm:mb-8 md:text-base">
            Inspired by timeless remedies and powered by modern science, we
            created a blend that truly nourishes your hair from root to tip.
          </p>

          <p className="font-serif text-base italic text-charcoal sm:text-lg">
            Made with love,
            <br />
            for you.
          </p>

          {/* Decorative botanical illustration, bottom right */}
          <Image
            src={Botanical}
            alt=""
            aria-hidden="true"
            className="absolute bottom-4 right-4 hidden h-auto w-24 opacity-80 sm:bottom-6 sm:right-6 md:block lg:right-8 lg:w-40 xl:right-12 xl:w-52"
          />
        </div>
      </div>
    </section>
  );
}
