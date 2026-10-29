'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type Car = {
  id: string;
  name: string;
  description: string;
  image: string;
  passengers: number;
  luggage: number;
};

const cars: Car[] = [
  {
    id: 'Scorpio',
    name: 'MAHINDRA SCORPIO',
    description: 'mahindra scorpio',
    image: '/images/scorpio.jpeg',
    passengers: 4,
    luggage: 5,
  },
  {
    id: 'Ertiga',
    name: 'ERTIGA',
    description: 'ERTIGA',
    image: '/images/ertiga.jpeg',
    passengers: 4,
    luggage: 5,
  },
  {
    id: 'Bolero',
    name: 'MAHINDRA BOLERO',
    description: 'MAHINDRA BOLERO',
    image: '/images/bolero.webp',
    passengers: 4,
    luggage: 5,
  },
  {
    id: 'WagonR',
    name: 'WAGONR',
    description: 'WAGONR',
    image: '/images/wagonr.jpeg',
    passengers: 4,
    luggage: 5,
  },
  {
    id: 'Innova',
    name: 'INNOVA',
    description: 'Innova',
    image: '/images/innova.jpeg',
    passengers: 4,
    luggage: 5,
  },
  {
    id: 'Swift',
    name: 'SWIFT',
    description: 'Swift',
    image: '/images/swift.jpeg',
    passengers: 4,
    luggage: 5,
  },
  {
    id: 'HondaCity',
    name: 'HONDA CITY',
    description: 'Honda City',
    image: '/images/hondacity.jpeg',
    passengers: 4,
    luggage: 5,
  },
  {
    id: 'Alto',
    name: 'ALTO',
    description: 'Alto',
    image: '/images/alto.jpeg',
    passengers: 4,
    luggage: 5,
  },
  {
    id: 'Ignis',
    name: 'IGNIS',
    description: 'Ignis',
    image: '/images/ignis.jpeg',
    passengers: 4,
    luggage: 5,
  },
];

export default function CarOptions() {
  const [selected, setSelected] = useState<string>('');

  return (
    <div className="w-full px-2 lg:px-0 py-4 text-center">
      {/* Container with max-width */}
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="w-full bg-gradient rounded-[15px] py-4 px-4 text-center">
          <h2 className="text-[20px] md:text-[23px] lg:text-[28px] text-white font-outfit font-bold uppercase underline">
            Car Options
          </h2>
        </div>

        {/* Car Grid: 1 column on mobile, 3 columns on medium and large screens */}
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-6
            justify-items-center
            items-start
            mt-8
            px-4
          "
        >
          {cars.map((car) => (
            <div
              key={car.id}
              onClick={() => setSelected(car.id)}
              className={`w-full max-w-[350px] border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center text-center
                ${
                  selected === car.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-transparent hover:border-gray-300'
                }`}
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/3] mb-4">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>

              {/* Info */}
              <div className="space-y-3 text-gray-800 mb-6">
                {/* Passengers */}
                <div className="flex items-center gap-3">
                  <img
                    src="/images/sitting.png"
                    alt="Passengers"
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">Passengers</span>
                </div>

                {/* Luggage */}
                <div className="flex items-center gap-3">
                  <img
                    src="/images/brifcase.png"
                    alt="Luggage"
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">Luggage</span>
                </div>
              </div>

              {/* Radio */}
              <input
                type="radio"
                name="car"
                checked={selected === car.id}
                readOnly
                className="w-5 h-5 accent-black"
              />

              {/* Name */}
              <div className="mt-4 text-black font-bold text-lg">
                {car.name}
              </div>

              {/* Book Button: shows only below the selected car */}
              {selected === car.id && (
                <Link
                  href={`/booking?car=${encodeURIComponent(car.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 inline-block bg-gradient px-10 py-3 text-[20px] text-white rounded-full"
                >
                  Book Now
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}