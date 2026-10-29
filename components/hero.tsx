import Image from 'next/image';
import Link from 'next/link';
import React from 'react';




const RideChoiceSection = () => {
 
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src='/images/herobg.jpg'
          fill
          alt='Airport Background'
          className="object-cover"
          priority
        />
        {/* Dark blue overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_12.98%,rgba(0,0,0,0)_75%,rgba(255,255,255,1)_120%)]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 mt-10 flex   border-b border-black flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Main Heading */}
        <h1 className="text-3xl  font-outfit md:text-5xl lg:text-6xl xl:text-7xl font-medium text-white leading-tight">
          Welcome to
          <br />
           <span className="text-white underline font-bold block mt-2 sm:mt-5 md:mt-6 lg:mt-8 xl:mt-4">
           KAIZEN TRANSPORTATION
         </span>

        </h1>


        {/* Tagline */}
        <p className=" text-[24px] font-medium font-outfit mt-10  text-[#ffffff] mb-9  px-4">
         Your trusted path to every destination.
        </p>

        {/* CTA Button */}
        <Link
          href="/booking"
          rel="noopener"
          className="bg-gradient text-white mt-10 
          px-8 py-4 rounded-full shadow-lg inline-block
          text-[26px] font-medium text-center
  "
        >
          Book with us
        </Link>
      </div>


    </div>
  );
};

export default RideChoiceSection;