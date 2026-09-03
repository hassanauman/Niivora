import Link from "next/link";
import { Play, Leaf, Rabbit, Droplet, FlaskConical } from "lucide-react";

import HeroImg from "@/public/images/hero.webp";
import SiteHeader from "@/app/components/SiteHeader";

const FEATURES = [
  {
    label: "leaf",
    icon: <Leaf className="text-gold" strokeWidth={1.5} />,
    text: "100% Natural",
  },
  {
    label: "rabbit",
    icon: <Rabbit className="text-gold" strokeWidth={1.5} />,
    text: "Cruelty Free",
  },
  {
    label: "droplet",
    icon: <Droplet className="text-gold" strokeWidth={1.5} />,
    text: "For All Hair Types",
  },
  {
    label: "flask-conical",
    icon: <FlaskConical className="text-gold" strokeWidth={1.5} />,
    text: "Toxin Free",
  },
];

export default function Hero() {
  return (
    <div
      className="h-[calc(100dvh-38px)] w-full bg-cover bg-position-[-430px] sm:bg-top"
      style={{ backgroundImage: `url(${HeroImg.src})` }}
    >
      <SiteHeader />

      <section
        id="home"
        className="flex flex-col gap-25 px-5 pt-14 font-jost text-offwhite lg:px-20"
      >
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-gold">
            Rooted in nature. Backed by science.
          </p>

          <h1 className="mb-4 flex flex-col gap-1 font-playfair text-4xl tracking-wide sm:text-5xl md:text-7xl">
            <span className="text-offwhite">Stronger Roots.</span>
            <span className="text-gold">Healthier You.</span>
          </h1>

          <p className="font-light">
            A premium blend of black seed oil and potent
            <br />
            botanicals to strengthen, nourish and
            <br />
            revive your hair naturally.
          </p>

          <div className="mt-5 flex gap-5">
            <Link
              href="/products"
              className="bg-gold px-5 py-2 text-sm font-medium uppercase leading-7 text-charcoal border border-gold transition-all duration-200 hover:scale-105 hover:bg-bronze"
            >
              Shop Now
            </Link>

            <Link
              href="#our-story"
              className="flex items-center gap-5 border border-gold bg-transparent px-5 py-2 text-sm uppercase leading-7 text-offwhite transition-all duration-200 hover:scale-105 hover:bg-espresso"
            >
              Our Story
              <div className="rounded-full border border-gold p-1">
                <Play fill="#f5f1ea" size={14} />
              </div>
            </Link>
          </div>
        </div>

        <div className="flex gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-1"
            >
              {feature.icon}
              <span className="max-w-18 text-center text-xs uppercase">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
