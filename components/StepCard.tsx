"use client";
import { Pencil } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils/helper";
import { withoutAuthAxios } from "@/services/config";

interface TaxiItem {
  carType: string;
  totalPrice: number;
  pickUpAddress: string;
  dropOffAddress: string;
  pickUpDate: string;
  selectTime: string;
}

interface TaxiItemsProps {
  showTaxiItems: boolean;
  setShowTaxiItems: React.Dispatch<React.SetStateAction<boolean>>;
  texiData: TaxiItem[];
  submittedData: FormData | any;
  setLoading: (isComponentLoading: boolean) => void;
}

const DEFAULT_CAR_IMAGE = "/images/carImg.png";

// Car name (exactly as stored in your database) -> image path
// Edit the names on the left to match your database car names.
const CAR_IMAGE_PATHS: Record<string, string> = {
  "Bolero": "/images/bolero.webp",
  "Scorpio": "/images/scorpio.jpeg",
  "SUV": "/images/cars/suv.png",
  "Luxury SUV": "/images/cars/luxury-suv.png",
  "Van": "/images/cars/van.png",
  "Mini Van": "/images/cars/mini-van.png",
};

// Normalize names so "Luxury  SUV" and "luxury suv" match
const normalizeName = (name: string) =>
  (name || "").trim().toLowerCase().replace(/\s+/g, " ");

// Lookup table built once, with normalized names as keys
const CAR_IMAGE_LOOKUP: Record<string, string> = Object.fromEntries(
  Object.entries(CAR_IMAGE_PATHS).map(([name, path]) => [normalizeName(name), path])
);

// Match the car name from the database with its image path
const getCarImage = (carType: string) =>
  CAR_IMAGE_LOOKUP[normalizeName(carType)] || DEFAULT_CAR_IMAGE;

// Shows the car image matching the name, falls back to the default if the file is missing
const CarImage = ({ carType }: { carType: string }) => {
  const [src, setSrc] = useState(getCarImage(carType));

  useEffect(() => {
    setSrc(getCarImage(carType));
  }, [carType]);

  return (
    <Image
      src={src}
      width={800}
      height={500}
      alt={carType}
      className="object-contain w-full h-full"
      onError={() => setSrc(DEFAULT_CAR_IMAGE)}
    />
  );
};

const TaxiItems: React.FC<TaxiItemsProps> = ({
  showTaxiItems,
  texiData,
  setShowTaxiItems,
  submittedData,
  setLoading,
}) => {
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Refs for scrolling
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Scroll to Step 1 when component mounts
  useEffect(() => {
    if (showTaxiItems && step1Ref.current) {
      step1Ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showTaxiItems]);

  // Scroll to Step 2 when taxi data is available
  useEffect(() => {
    if (showTaxiItems && texiData.length > 0 && step2Ref.current) {
      const t = setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [showTaxiItems, texiData]);

  // Scroll to Step 3 when the form opens (it is rendered only when open now)
  useEffect(() => {
    if (isOpen && selectedTaxi) {
      const t = setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [isOpen, selectedTaxi]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookNow = async (taxi: TaxiItem) => {
    if (!taxi || !submittedData) return;

    const reservationDetails = {
      pickup: submittedData?.formattedPickUpAddress,
      destination: submittedData?.formattedDropOffAddress,
      date: submittedData?.pickUpDate,
      time: submittedData?.selectTime,
      airlinename: submittedData?.airlinename,
      StopAddress: submittedData?.formattedStopAddress,
      flightnumber: submittedData?.flightnumber,
      hourlyservice: submittedData?.hourlyservice,
      rideOption: submittedData?.rideOption,
      numberPassengers: submittedData?.numberPassengers,
      seatOption: submittedData?.seatOption,
      carChoice: taxi?.carType,

      // Passenger details
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
    };

    const checkoutPayload = {
      price: taxi.totalPrice,
      reservationDetails,
      addOns: [],
    };

    try {
      setLoading(true);
      const response = await withoutAuthAxios().post(
        "/square/create-checkout",
        checkoutPayload
      );
      if (response.status === 200) {
        const checkoutUrl = response.data.url;
        if (checkoutUrl) {
          const popup = window.open(checkoutUrl, "_blank");
          if (!popup || popup.closed || typeof popup.closed === "undefined") {
            window.location.href = checkoutUrl;
          }
        }
      } else {
        console.error("Checkout failed.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!showTaxiItems) return null;

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <div className="max-w-[1600px] mx-auto w-full">
        {/* STEP 1: Ride Info */}
        <div
          ref={step1Ref}
          className="bg-white overflow-hidden scroll lg:m-0 md:m-0 m-3"
        >
          <div className="flex flex-row w-[100%] rounded-[15px] justify-start lg:justify-between items-center bg-gradient py-5 px-4 lg:px-12 gap-12">
            <div className="flex items-center lg:mx-20 md:mx-20 justify-start sm:justify-start gap-3 text-center sm:text-left w-[70%]">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input
                  type="radio"
                  checked
                  readOnly
                  className="appearance-none w-5 h-5 border-2 border-black rounded-full checked:bg-black checked:border-black"
                />
                <div className="absolute w-2 h-2 bg-white rounded-full"></div>
              </div>
              <h2 className="text-center sm:text-left text-[18px] sm:text-[20px] font-semibold text-white">
                <span className="font-extrabold font-outfit">STEP 1 : Ride Info</span>
              </h2>
            </div>

            <button
              onClick={() => setShowTaxiItems(false)}
              className="flex items-center lg:mx-20 md:mx-20 justify-end text-white hover:text-black transition w-[30%]"
            >
              <Pencil className="w-4 h-4 mr-2" />
              <span className="font-semibold font-outfit text-[20px]">Edit</span>
            </button>
          </div>

          <div className="bg-white p-6 sm:p-8 lg:px-12 flex flex-col lg:flex-row justify-between items-center lg:items-start gap-6 lg:gap-12 w-full">
            {/* Left Section */}
            <div className="flex flex-col gap-3 items-center lg:items-start text-center lg:text-left w-full lg:w-1/2">
              <div className="flex flex-wrap mx-20 items-center justify-center lg:justify-start gap-6 text-gray-700">
                <p className="font-extrabold text-[28px] text-black">
                  {submittedData?.pickUpDate || "-"}
                </p>
                <p className="font-extrabold text-[28px] text-black">
                  {submittedData?.selectTime || "-"}
                </p>
              </div>
              <p className="flex items-center font-light mx-20 text-[20px] font-outfit text-black justify-center lg:justify-start">
                Passengers
                <span className="font-light text-[20px] font-outfit text-black ml-1">
                  {submittedData?.numberPassengers || "—"}
                </span>
              </p>
            </div>

            {/* Right Section */}
            <div className="flex flex-col gap-6 text-gray-700 text-sm w-full lg:w-1/2">
              <div className="flex items-center gap-2 justify-center lg:justify-start text-black break-words">
                <img src="/images/location.png" alt="pickup" className="h-6 w-6 flex-shrink-0" />
                <span className="text-[20px] font-outfit font-light">
                  {submittedData?.formattedPickUpAddress || "-"}
                </span>
              </div>

              <div className="flex items-center gap-2 justify-center lg:justify-start text-black break-words">
                <img src="/images/location_2.png" alt="dropoff" className="h-6 w-6 flex-shrink-0" />
                <span className="text-[20px] font-outfit font-light">
                  {submittedData?.formattedDropOffAddress || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: Vehicle Selection */}
        <div ref={step2Ref} className="mt-8 scroll-mt-4">
          <div className="w-[95%] md:w-full mx-auto mt-8 bg-transparent rounded-lg">
            <div className="flex justify-start lg:justify-between items-center bg-gradient px-4 md:px-20 lg:px-20 py-6 rounded-[15px] flex-wrap">
              <div className="flex items-center lg:mx-11 gap-2 mx-1">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="appearance-none w-5 h-5 border-2 border-black rounded-full checked:bg-black checked:border-black"
                  />
                  <div className="absolute w-2 h-2 bg-white rounded-full"></div>
                </div>

                <h2 className="flex items-center text-xs sm:text-sm md:text-base font-semibold text-white whitespace-nowrap">
                  <span className="font-extrabold text-[16px] sm:text-[18px] md:text-[20px] font-outfit mr-1">
                    STEP 2 : Select Vehicle
                  </span>
                </h2>
              </div>
            </div>

            {/* Vehicle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-6 justify-items-center">
              {texiData.map((taxi, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-center items-center border border-black md:border-0 bg-white rounded-xl p-8 w-full max-w-lg transition-transform hover:scale-105"
                >
                  <h3 className="text-[28px] font-extrabold text-black mb-6 text-center">
                    {taxi.carType}
                  </h3>

                  {/* Car image matched by name from the database */}
                  <div className="relative w-full h-48 md:h-56 lg:h-72 mb-6">
                    <CarImage carType={taxi.carType} />
                  </div>

                  <div className="flex justify-center gap-4 sm:gap-6 mb-3 mt-8 lg:mt-1 text-gray-700">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-md">
                      <div className="border bg-[#D0D0D0] border-black rounded-md p-1">
                        <img src="/images/sitting.png" alt="sitting man" className="w-4 h-4" />
                      </div>
                      <span className="inline-flex items-center text-[19px] font-outfit text-black bg-[#D0D0D0] justify-center text-sm h-6 w-6 border border-black rounded-md font-medium">
                        {submittedData?.numberPassengers}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex items-center justify-center h-6 w-6 bg-[#D0D0D0] border border-black rounded-md">
                        <img src="/images/brifcase.png" alt="briefcase" className="h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-center h-6 w-6 bg-[#D0D0D0] border border-black rounded-md">
                        <span className="text-sm font-outfit text-[19px] text-black font-medium">5</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[#006F14] mt-3 text-[32px] font-extrabold text-xl mb-3">
                    {formatPrice(taxi.totalPrice)}
                  </p>
                  <span className="text-[12px] font-extrabold text-black mb-2 text-center">
                    {taxi.carType}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTaxi(taxi);
                      setIsOpen(true);
                    }}
                    className="px-12 py-2 bg-gradient text-white rounded-2xl font-outfit font-semibold text-[15px] hover:bg-gray-800 transition duration-200"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>

            {/* STEP 3: Passenger Detail (rendered only when open) */}
            {isOpen && selectedTaxi && (
              <div ref={step3Ref} className="w-full mt-8 bg-white scroll-mt-4">
                <div className="flex flex-col sm:flex-row items-center text-center rounded-[15px] justify-between bg-gradient py-5 px-4 sm:px-6 lg:px-12 w-full gap-3">
                  <div className="flex items-center lg:mx-20 mx-4 justify-start gap-3 text-center sm:text-left w-full sm:w-auto">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="radio"
                        checked
                        readOnly
                        className="appearance-none w-5 h-5 border-2 border-black rounded-full checked:bg-black checked:border-black"
                      />
                      <div className="absolute w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <h2 className="text-center lg:text-[20px] text-[16px] font-semibold text-white">
                      <span className="font-extrabold text-center font-outfit">
                        STEP 3 : Passenger Detail
                      </span>
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setSelectedTaxi(null);
                    }}
                    className="bg-black text-white font-outfit font-semibold px-5 py-2 rounded-xl lg:mx-20 hover:opacity-80 transition"
                  >
                    Close
                  </button>
                </div>

                <div className="p-6 sm:p-8 lg:px-32 bg-white">
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold font-outfit text-black mb-2 text-center">
                      Booking Confirmation
                    </h3>
                    <p className="text-center text-black font-outfit mb-6">
                      {selectedTaxi.carType} - {formatPrice(selectedTaxi.totalPrice)}
                    </p>

                    <form
                      className="flex flex-col gap-5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleBookNow(selectedTaxi);
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-black font-outfit font-medium mb-2 text-[16px]">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            required
                            className="p-3 rounded-xl border-2 border-gray-300 text-black focus:outline-none focus:border-black transition"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-black font-outfit font-medium mb-2 text-[16px]">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                            required
                            className="p-3 rounded-xl border-2 border-gray-300 text-black focus:outline-none focus:border-black transition"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-black font-outfit font-medium mb-2 text-[16px]">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email"
                          required
                          className="p-3 rounded-xl border-2 border-gray-300 text-black focus:outline-none focus:border-black transition"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-black font-outfit font-medium mb-2 text-[16px]">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          required
                          className="p-3 rounded-xl border-2 border-gray-300 text-black focus:outline-none focus:border-black transition"
                        />
                      </div>

                      <button
                        type="submit"
                        className="mt-4 py-4 bg-gradient text-white font-semibold font-outfit text-[18px] rounded-2xl hover:bg-gray-800 transition duration-200 w-full"
                      >
                        Proceed to Payment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxiItems;