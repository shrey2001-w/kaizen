"use client";

import React from "react";


const ContactInfoBar = () => {
  
  return (
    <div className="bg-[#c1c1c1] text-black py-5 px-6 w-full">
      {/* Container with max-width */}
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <p className="font-semibold text-black text-sm sm:text-base">
          Phone Number:
          <a
            href="tel:+8920324753"
            className="underline font-bold hover:text-gray-700"
          >
           +8920324753
          </a>
        </p>

        <p className="font-semibold text-sm text-black sm:text-base mt-2 sm:mt-0">
         Email:
          <a
            href="mailto:bhattshrey21@gmail.com"
            className="underline font-bold hover:text-gray-700"
          >
            bhattshrey21@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default ContactInfoBar;