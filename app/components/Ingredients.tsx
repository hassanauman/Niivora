import Image, { StaticImageData } from "next/image";

import BlackSeedOil from "@/public/images/black-seed-oil.webp";
import RosemaryOil from "@/public/images/rosemary-oil.webp";
import AmlaExtract from "@/public/images/amla-extract.webp";
import CastorOil from "@/public/images/castor-oil.webp";

type Ingredient = {
  image: StaticImageData;
  name: string;
  description: string;
};

const INGREDIENTS: Ingredient[] = [
  {
    image: BlackSeedOil,
    name: "Black Seed Oil",
    description: "Nourishes scalp, strengthens roots and promotes growth.",
  },
  {
    image: RosemaryOil,
    name: "Rosemary Oil",
    description: "Stimulates follicles and improves thickness.",
  },
  {
    image: AmlaExtract,
    name: "Amla Extract",
    description: "Rich in antioxidants, prevents premature greying.",
  },
  {
    image: CastorOil,
    name: "Castor Oil",
    description: "Improves circulation and supports healthy hair growth.",
  },
];

export default function Ingredients() {
  return (
    <section
      id="ingredients"
      className="scroll-mt-20 w-full bg-cream px-6 py-14 sm:px-10 md:px-16 md:py-20"
    >
      <div className="mx-auto flex max-w-350 flex-col gap-10 lg:flex-row lg:gap-16">
        {/* Left — text block */}
        <div className="shrink-0 font-jost lg:w-1/4">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold sm:text-xs">
            Powerful Ingredients,
            <br className="hidden sm:block" /> Purposeful Results.
          </p>

          <p className="mb-8 max-w-xs text-sm font-medium text-charcoal md:text-base">
            Every drop of Nevora Hair Oil is crafted with time-tested
            ingredients known for their hair loving properties.
          </p>

          <button
            type="button"
            className="bg-espresso px-6 py-3 text-[11px] uppercase tracking-widest text-offwhite sm:text-xs"
          >
            Explore Ingredients
          </button>
        </div>

        {/* Right — ingredients grid */}
        <div className="grid flex-1 grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
          {INGREDIENTS.map(({ image, name, description }) => (
            <div key={name} className="flex flex-col">
              <div className="relative aspect-3/4 w-full">
                <Image src={image} alt={name} fill className="object-cover" />
              </div>

              <div className="pt-4 font-jost">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal sm:text-sm">
                  {name}
                </h3>

                <p className="text-xs leading-snug text-charcoal/70 sm:text-sm">
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
