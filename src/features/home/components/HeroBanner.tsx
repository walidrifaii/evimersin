import Image from "next/image";
import heroImage from "@/assets/images/hero.png";
import { PropertySearchBar } from "@/features/home/components/PropertySearchBar";
import { PropertyTypeCard } from "@/features/home/components/PropertyTypeCard";
import { homeData, propertyTypeCards } from "@/features/home/data";

export function HeroBanner() {
  const tabletCards = propertyTypeCards.filter((item) => item.id !== "more");
  const moreCard = propertyTypeCards.find((item) => item.id === "more");
  const mobileCards = [
    ...propertyTypeCards.filter((item) =>
      ["villas", "apartments", "studios", "lands"].includes(item.id),
    ),
    moreCard,
  ].filter((item): item is (typeof propertyTypeCards)[number] => Boolean(item));

  return (
    <section className="relative w-full bg-white">
      <div className="relative min-h-[78vh] w-full overflow-hidden lg:min-h-[820px]">
        <Image
          src={heroImage}
          alt="Luxury villa with pool at night"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />

        <div className="relative z-10 mx-auto flex h-full min-h-[78vh] w-full flex-col items-start justify-start px-4 pb-32 pt-14 text-left sm:px-6 md:px-4 md:pb-36 md:pt-16 lg:px-[100px] lg:pb-48 lg:pt-28">
          <div className="w-full max-w-[640px] animate-[heroFade_700ms_ease-out]">
            <h1 className="text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[3rem] lg:text-[3.75rem]">
              <span>{homeData.title}</span>
              <br />
              <span className="mt-2 sm:mt-3">{homeData.titleAccent}</span>
            </h1>
            <p className="mt-6 text-[0.95rem] font-normal leading-relaxed text-white/90 sm:mt-8 sm:text-[1.125rem]">
              {homeData.subtitle}
            </p>
          </div>

          <div className="mt-8 w-full self-start animate-[heroFade_900ms_ease-out] sm:mt-10">
            <PropertySearchBar />
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-20 w-full px-4 sm:px-6 md:-mt-18 md:px-4 lg:-mt-28 lg:px-[100px]">
        <div className="rounded-2xl bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] md:hidden">
          <div className="grid grid-cols-5 divide-x divide-[#eef2f7]">
            {mobileCards.map((item, index) => (
              <div
                key={item.id}
                className="animate-[heroRise_700ms_ease-out] [animation-fill-mode:both]"
                style={{ animationDelay: `${120 + index * 60}ms` }}
              >
                <PropertyTypeCard
                  item={item}
                  compact
                  label={item.shortTitle ?? item.title}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden rounded-2xl bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)] md:block lg:hidden">
          <div className="grid grid-cols-5 divide-x divide-[#eef2f7]">
            {tabletCards.map((item, index) => (
              <div
                key={item.id}
                className="animate-[heroRise_700ms_ease-out] [animation-fill-mode:both]"
                style={{ animationDelay: `${120 + index * 60}ms` }}
              >
                <PropertyTypeCard item={item} compact />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden grid-cols-5 gap-4 lg:grid">
          {tabletCards.map((item, index) => (
            <div
              key={item.id}
              className="animate-[heroRise_700ms_ease-out] [animation-fill-mode:both]"
              style={{ animationDelay: `${120 + index * 70}ms` }}
            >
              <PropertyTypeCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
