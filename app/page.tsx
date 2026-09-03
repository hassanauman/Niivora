import Hero from "./components/Hero";
import AnnouncementBar from "./components/AnnouncementBar";
import Story from "./components/Story";
import OurPromise from "./components/OurPromise";
import Ingredients from "./components/Ingredients";
import Ritual from "./components/Ritual";
import FeaturedProduct from "./components/FeaturedProduct";

export default function Home() {
  return (
    <main>
      <AnnouncementBar />
      <Hero />
      <Story />
      <OurPromise />
      <Ingredients />
      <Ritual />
      <FeaturedProduct />
    </main>
  );
}
