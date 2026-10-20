import Image, { StaticImageData } from "next/image";

import BlackSeedOil from "@/public/images/black-seed-oil.webp";
import JojobaOil from "@/public/images/jojoba-oil.webp";
import RosemaryOil from "@/public/images/rosemary-oil.webp";
import VitaminE from "@/public/images/vitamin-e.webp";

type Ingredient = {
  image?: StaticImageData;
  name: string;
  description: string;
};

const INGREDIENTS: Ingredient[] = [
  {
    image: BlackSeedOil,
    name: "Black Seed Oil",
    description: "A key oil in the NIIVORA blend.",
  },
  {
    image: JojobaOil,
    name: "Jojoba Oil",
    description: "Included as part of the established formula.",
  },
  {
    image: RosemaryOil,
    name: "Rosemary Oil",
    description: "A botanical oil included in the blend.",
  },
  {
    image: VitaminE,
    name: "Vitamin E",
    description: "Included in the formula as an antioxidant ingredient.",
  },
];

export default function Ingredients() {
  return (
    <section
      id="ingredients"
      className="scroll-mt-20 w-full bg-cream px-6 py-14 sm:px-10 md:px-16 md:py-20"
    >
      <div className="mx-auto flex max-w-350 flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="shrink-0 font-jost lg:w-1/4">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold sm:text-xs">
            A considered blend
          </p>
          <p className="mb-8 max-w-xs text-sm font-medium text-charcoal md:text-base">
            NIIVORA Hair Oil brings together black seed oil, jojoba oil,
            rosemary oil, and vitamin E.
          </p>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
          {INGREDIENTS.map(({ image, name, description }) => (
            <div key={name} className="flex flex-col">
              <div className="relative flex aspect-3/4 w-full items-center justify-center overflow-hidden bg-[#e7dfd1]">
                {image ? (
                  <Image src={image} alt={name} fill className="object-cover" />
                ) : (
                  <span className="px-4 text-center font-playfair text-2xl text-charcoal/70">
                    {name}
                  </span>
                )}
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
