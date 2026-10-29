import Image from "next/image";
import React from "react";

type Service = {
  id: string;
  imgSrc: string;
  icon: string;
  alt: string;
  title: string;
  description: string;
};

// Defined outside the component so it isn't re-created on every render
const SERVICES: Service[] = [
  {
    id: "airport-pickup",
    imgSrc: "/images/drop_img.jpg",
    icon: "/images/pick_up_img.png",
    alt: "Passenger being picked up from the airport terminal",
    title: "Airport pick up",
    description:
      "Reliable airport pickup, ensuring a smooth and comfortable ride from the terminal to your destination.",
  },
  {
    id: "activities",
    imgSrc: "/images/activities.png",
    icon: "/images/glass_img.png",
    alt: "Group enjoying an outing arranged with our transport",
    title: "Activities",
    description:
      "Enjoy memorable outings with our tailored transport for vineyard tours, bar nights, and brewery visits. We handle the driving, so you can focus on the fun.",
  },
  {
    id: "daily-errands",
    imgSrc: "/images/daily_errand.jpg",
    icon: "/images/tie_img.png",
    alt: "Chauffeur-driven car for daily errands",
    title: "Daily errands",
    description:
      "Efficient and reliable transport for your daily errands, making sure you get everything done with ease and comfort.",
  },
  {
    id: "airport-drop-off",
    imgSrc: "/images/pick_img.png",
    icon: "/images/drop_off_img.png",
    alt: "Passenger being dropped off at the airport",
    title: "Airport drop off",
    description:
      "Convenient airport drop-off service, getting you to your flight on time and stress-free.",
  },
];

const WhatWeOffer = () => {
  return (
    <section
      id="services-section"
      aria-labelledby="services-heading"
      className="w-full scroll-mt-[6rem] bg-white px-4 py-12 text-black sm:px-6 sm:py-16 lg:px-8 lg:py-20 2xl:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-16">
          <h2
            id="services-heading"
            className="font-outfit text-4xl underline uppercase leading-tight sm:text-5xl lg:text-6xl 2xl:text-7xl"
          >
            What we offer
          </h2>
          <p className="mt-3 font-outfit text-base text-gray-600 sm:text-lg 2xl:text-xl">
            The ride choice for every journey, from the airport to your
            weekend plans.
          </p>
        </div>

        {/*
          Cards:
          - below xl: horizontal scroll with snap
          - xl and up: 4-column grid
          The negative margin + padding lets the scroll area bleed to the
          screen edges so cards don't look clipped by the section padding.
        */}
        <ul
          className="
            -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-6 pt-8
            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            sm:-mx-6 sm:scroll-px-6 sm:gap-6 sm:px-6
            lg:-mx-8 lg:scroll-px-8 lg:px-8
            xl:mx-0 xl:grid xl:snap-none xl:grid-cols-4 xl:gap-6 xl:overflow-visible xl:px-0 xl:pb-0 xl:pt-0
            2xl:gap-8
          "
        >
          {SERVICES.map((service) => (
            <li
              key={service.id}
              className="flex w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[36%] xl:w-auto xl:shrink"
            >
              <article className="group flex w-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg focus-within:shadow-lg">
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                  <Image
                    src={service.imgSrc}
                    alt={service.alt}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 36vw, (min-width: 640px) 45vw, 80vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <div className="relative flex flex-1 flex-col px-5 pb-6 pt-10 sm:px-6 2xl:px-8 2xl:pb-8">
                  {/* Icon badge overlapping the image */}
                  <div className="absolute -top-7 left-5 flex h-14 w-14 items-center justify-center rounded-full border border-gray-100 bg-white shadow-md sm:left-6 2xl:left-8 2xl:h-16 2xl:w-16">
                    <Image
                      src={service.icon}
                      width={32}
                      height={32}
                      alt=""
                      aria-hidden="true"
                      className="h-7 w-7 object-contain 2xl:h-8 2xl:w-8"
                    />
                  </div>

                  <h3 className="font-outfit text-lg font-extrabold tracking-tight text-gradient sm:text-xl 2xl:text-2xl">
                    {service.title}
                  </h3>
                  <p className="mt-2 font-outfit text-sm font-medium leading-relaxed text-gray-700 sm:text-[15px] 2xl:text-base">
                    {service.description}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default WhatWeOffer;