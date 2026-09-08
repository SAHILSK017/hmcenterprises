import { HomeHeroFullscreen } from "@/components/home/home-hero-fullscreen";

export default function HomePage() {
  return (
    <div className="home-fullscreen w-full">
      {/* Start fetching hero media as early as possible */}
      <link rel="preload" href="/videos/phone-hero-poster.jpg" as="image" type="image/jpeg" />
      <link rel="preload" href="/videos/phone-hero.mp4" as="video" type="video/mp4" />
      <HomeHeroFullscreen />
    </div>
  );
}
