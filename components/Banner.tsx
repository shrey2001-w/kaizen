import Image from "next/image";
import React from "react";
import Footer from "./Footer";

const Banner: React.FC = () => {
  return (
    <>
    {/* <div className="flex justify-around items-center w-full  mx-auto bg-white py-6 px-4 flex-wrap gap-6    border-transparent hover:border-blue-300 transition duration-300">
      <Image
        src="/images/orlando.png"
        alt="Orlando International Airport"
        width={150}
        height={80}
        className="object-contain"
      />
      <Image
        src="/images/four.png"
        alt="Four Seasons"
        width={150}
        height={80}
        className="object-contain"
      />
      <Image
        src="/images/universal.png"
        alt="Universal Orlando Resort"
        width={150}
        height={80}
        className="object-contain"
      />
      <Image
        src="/images/hilton.png"
        alt="Hilton Orlando"
        width={150}
        height={80}
        className="object-contain"
      />
      <Image
        src="/images/log.png"
        alt="State of Florida"
        width={150}
        height={80}
        className="object-contain"
      />
    </div> */}
    <Footer />
    </>
  );
};

export default Banner;
