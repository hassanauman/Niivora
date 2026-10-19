import Link from "next/link";
import { Play, Leaf, Droplet, FlaskConical, MapPin } from "lucide-react";

import HeroImg from "@/public/images/hero.webp";
import SiteHeader from "@/app/components/SiteHeader";

const FEATURES = [
  { label: "botanical", icon: <Leaf className="text-gold" strokeWidth={1.5} />, text: "Botanical Blend" },
  { label: "routine", icon: <Droplet className="text-gold" strokeWidth={1.5} />, text: "Hair Care Ritual" },
  { label: "vitamin-e", icon: <FlaskConical className="text-gold" strokeWidth={1.5} />, text: "Vitamin E" },
  { label: "made-in-pakistan", icon: <MapPin className="text-gold" strokeWidth={1.5} />, text: "Made in Pakistan" },
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
            Thoughtfully blended for your hair-care routine
          </p>
          <h1 className="mb-4 flex flex-col gap-1 font-playfair text-4xl tracking-wide sm:text-5xl md:text-7xl">
            <span className="text-offwhite">A Ritual for</span>
            <span className="text-gold">Your Hair.</span>
          </h1>
          <p className="max-w-lg font-light">
            A considered blend featuring black seed oil, jojoba oil, rosemary
            oil, and vitamin E, made to be part of your hair-care routine.
          </p>
          <div className="mt-5 flex gap-5">
            <Link
              href="/products"
              className="border border-gold bg-gold px-5 py-2 text-sm font-medium uppercase leading-7 text-charcoal transition-all duration-200 hover:scale-105 hover:bg-bronze"
            >
              Explore the Collection
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
        <div className="flex flex-wrap gap-5">
          {FEATURES.map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-1">
              {feature.icon}
              <span className="max-w-24 text-center text-xs uppercase">{feature.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
