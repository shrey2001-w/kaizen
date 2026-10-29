'use client';

import Image from 'next/image';
import Link from 'next/link';
import { memo, useMemo, useState } from 'react';

/* ----------------------------- Types & data ----------------------------- */

type Category = 'Hatchback' | 'Sedan' | 'SUV' | 'MPV';

type Car = {
  id: string;
  name: string;
  category: Category;
  image: string;
  passengers: number;
  luggage: number;
};

const CATEGORY_STYLES: Record<Category, { badge: string; panel: string }> = {
  Hatchback: {
    badge: 'bg-emerald-100 text-emerald-800',
    panel: 'from-emerald-50 to-teal-100',
  },
  Sedan: {
    badge: 'bg-sky-100 text-sky-800',
    panel: 'from-sky-50 to-indigo-100',
  },
  SUV: {
    badge: 'bg-orange-100 text-orange-800',
    panel: 'from-orange-50 to-amber-100',
  },
  MPV: {
    badge: 'bg-violet-100 text-violet-800',
    panel: 'from-violet-50 to-fuchsia-100',
  },
};

const CATEGORIES: Array<'All' | Category> = ['All', 'Hatchback', 'Sedan', 'SUV', 'MPV'];

// NOTE: every id is now unique (the old list had 'Swift' four times,
// which made all four cards select together). Adjust seats/luggage as needed.
const CARS: Car[] = [
  { id: 'alto', name: 'Maruti Alto', category: 'Hatchback', image: '/images/alto.jpeg', passengers: 4, luggage: 2 },
  { id: 'wagonr', name: 'Maruti WagonR', category: 'Hatchback', image: '/images/wagonr.jpeg', passengers: 4, luggage: 2 },
  { id: 'ignis', name: 'Maruti Ignis', category: 'Hatchback', image: '/images/ignis.jpeg', passengers: 4, luggage: 2 },
  { id: 'swift', name: 'Maruti Swift', category: 'Hatchback', image: '/images/swift.jpeg', passengers: 4, luggage: 3 },
  { id: 'hondacity', name: 'Honda City', category: 'Sedan', image: '/images/hondacity.jpeg', passengers: 4, luggage: 3 },
  { id: 'bolero', name: 'Mahindra Bolero', category: 'SUV', image: '/images/bolero.webp', passengers: 6, luggage: 4 },
  // { id: 'scorpio', name: 'Mahindra Scorpio', category: 'SUV', image: '/images/scorpio.jpeg', passengers: 6, luggage: 4 },
  { id: 'ertiga', name: 'Maruti Ertiga', category: 'MPV', image: '/images/ertiga.jpeg', passengers: 6, luggage: 4 },
  { id: 'innova', name: 'Toyota Innova', category: 'MPV', image: '/images/innova.jpeg', passengers: 7, luggage: 5 },
];

/* ------------------------------- Icons ---------------------------------- */

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

/* ------------------------------ Car card -------------------------------- */

type CarCardProps = {
  car: Car;
  selected: boolean;
  priority: boolean;
  onSelect: (id: string) => void;
};

const CarCard = memo(function CarCard({ car, selected, priority, onSelect }: CarCardProps) {
  const style = CATEGORY_STYLES[car.category];

  return (
    <label className="group relative block cursor-pointer">
      <input
        type="radio"
        name="car"
        value={car.id}
        checked={selected}
        onChange={() => onSelect(car.id)}
        className="peer sr-only"
      />

      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white transition duration-300
          peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-300
          ${
            selected
              ? 'border-amber-400 shadow-xl shadow-amber-200/60 sm:-translate-y-1'
              : 'border-slate-200 shadow-sm hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg'
          }`}
      >
        {/* Image panel */}
        <div className={`relative bg-gradient-to-br ${style.panel} px-4 pt-4`}>
          <span
            className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
          >
            {car.category}
          </span>

          <span
            className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition
              ${
                selected
                  ? 'border-amber-400 bg-amber-400 text-slate-900'
                  : 'border-slate-300 bg-white/80 text-transparent'
              }`}
            aria-hidden="true"
          >
            <CheckIcon />
          </span>

          <div className="relative mx-auto aspect-[4/3] w-full">
            <Image
              src={car.image}
              alt={car.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
              className="object-contain p-2 drop-shadow-lg transition duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          <h3 className="text-center font-outfit text-lg font-bold uppercase tracking-wide text-slate-900 sm:text-xl">
            {car.name}
          </h3>

          <div className="mt-auto grid grid-cols-2 gap-3 text-sm font-medium text-slate-700">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-indigo-700">
              <UsersIcon />
              <span>{car.passengers} Seats</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
              <BagIcon />
              <span>{car.luggage} Bags</span>
            </div>
          </div>

          <span
            className={`block rounded-full py-2 text-center text-sm font-semibold transition
              ${
                selected
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white'
              }`}
          >
            {selected ? 'Selected' : 'Select this car'}
          </span>
        </div>
      </div>
    </label>
  );
});

/* ------------------------------ Main component -------------------------- */

export default function CarOptions() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [filter, setFilter] = useState<'All' | Category>('All');

  const visibleCars = useMemo(
    () => (filter === 'All' ? CARS : CARS.filter((c) => c.category === filter)),
    [filter]
  );

  const selectedCar = useMemo(() => CARS.find((c) => c.id === selectedId), [selectedId]);

  return (
    <section
      aria-labelledby="car-options-title"
      className={`w-full px-3 py-6 sm:px-4 lg:px-6 ${selectedCar ? 'pb-32 sm:pb-28' : ''}`}
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-teal-500 px-4 py-6 text-center shadow-lg sm:py-8">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-amber-300/20" />
          <h2
            id="car-options-title"
            className="relative font-outfit text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl lg:text-4xl"
          >
            Car Options
          </h2>
          <p className="relative mt-2 text-sm text-indigo-100 sm:text-base">
            Pick the ride that fits your group and luggage.
          </p>
        </div>

        {/* Category filter */}
        <div
          role="tablist"
          aria-label="Filter cars by type"
          className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={filter === cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300
                ${
                  filter === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Car grid */}
        <div
          role="radiogroup"
          aria-label="Available cars"
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 2xl:grid-cols-4"
        >
          {visibleCars.map((car, index) => (
            <CarCard
              key={car.id}
              car={car}
              selected={selectedId === car.id}
              priority={index < 3}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </div>

      {/* Sticky booking bar */}
      {selectedCar && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-center text-sm text-slate-600 sm:text-left sm:text-base">
              You selected{' '}
              <span className="font-bold text-slate-900">{selectedCar.name}</span>
              <span className="text-slate-400"> &middot; </span>
              {selectedCar.passengers} seats
            </p>

            <Link
              href={`/booking?car=${encodeURIComponent(selectedCar.id)}`}
              className="w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-10 py-3 text-center text-lg font-bold text-slate-900 shadow-lg shadow-amber-300/50 transition hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 sm:w-auto"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}