import NotificationError from '@/components/NotificationError';
import { withoutAuthAxios } from '@/services/config';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import IsLoadingHOC from '@/components/common/IsLoadingHOC';
import StepCard from '../../components/StepCard';
import Footer from '@/components/Footer';
import ContactInfoBar from '@/components/ContactInfoBar';

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------- */
type LoadingProps = {
  isLoading: boolean;
  setLoading: (isComponentLoading: boolean) => void;
};

type BookingFormData = {
  rideOption: string;
  numberPassengers: string;
  pickUpDate: string;
  selectTime: string;
  formattedPickUpAddress: string;
  formattedDropOffAddress: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  flightnumber: string;
  airlinename: string;
  hourlyservice: string;
};

type SubmittedData = BookingFormData & { pickupDateTime: Date };

/* ------------------------------------------------------------------
   Constants
------------------------------------------------------------------- */

// Only these two cities are available for pick-up and drop-off
const CITIES = ['Noida', 'Gurgaon'] as const;

const RIDE_OPTIONS = [
  'One Way',
  'From Airport',
  'To Airport',
  'Hourly Service',
  'Chauffeur',
] as const;

const HOURLY_RIDES: readonly string[] = ['Hourly Service', 'Chauffeur'];
const AIRPORT_RIDES: readonly string[] = ['From Airport', 'To Airport'];

// A booking must be made at least this far in advance
const MIN_LEAD_TIME_MS = 60 * 60 * 1000;
const TIME_INTERVAL_MIN = 15;

const INITIAL_FORM_DATA: BookingFormData = {
  rideOption: '',
  numberPassengers: '',
  pickUpDate: '',
  selectTime: '',
  formattedPickUpAddress: '',
  formattedDropOffAddress: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  flightnumber: '',
  airlinename: '',
  hourlyservice: '',
};

const HERO_BACKGROUND = { backgroundImage: "url('/images/bookk.webp')" } as const;

// Shared input style: change sizes for ALL fields here
const inputClass =
  'w-full px-4 py-3.5 lg:py-4 border bg-[#C1C1C1] text-[16px] lg:text-[17px] xl:text-[18px] ' +
  'font-outfit font-semibold placeholder:text-[#908D8D] border-gray-300 rounded-[12px] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/60';

// Shared dropdown list item style
const dropdownItemClass =
  'block w-full text-left rounded-[12px] px-4 py-3 text-[16px] lg:text-[17px] xl:text-[18px] ' +
  'font-outfit hover:bg-gray-100 focus:bg-gray-100 focus:outline-none';

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */

/** Earliest allowed pick-up: now + lead time, rounded up to the next time slot. */
const getEarliestPickup = (): Date => {
  const date = new Date(Date.now() + MIN_LEAD_TIME_MS);
  const slotMs = TIME_INTERVAL_MIN * 60 * 1000;
  date.setSeconds(0, 0);
  return new Date(Math.ceil(date.getTime() / slotMs) * slotMs);
};

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfBookingDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 45, 0, 0);
  return d;
};

/** Calls `handler` when a mouse/touch event happens outside the returned ref. */
function useClickOutside<T extends HTMLElement>(handler: () => void, active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [active, handler]);

  return ref;
}

/* ------------------------------------------------------------------
   Icons
------------------------------------------------------------------- */
const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className={`h-5 w-5 shrink-0 text-gray-700 transition-transform duration-200 ${
      open ? 'rotate-180' : ''
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 8 5 5 5-5" />
  </svg>
);

/* ------------------------------------------------------------------
   SelectDropdown (used for ride option AND city pickers)
------------------------------------------------------------------- */
type SelectDropdownProps = {
  label: string;
  value: string;
  placeholder: string;
  options: readonly string[];
  onSelect: (value: string) => void;
  className?: string;
};

const SelectDropdown = memo(function SelectDropdown({
  label,
  value,
  placeholder,
  options,
  onSelect,
  className = '',
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const wrapperRef = useClickOutside<HTMLDivElement>(close, open);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') close();
  };

  return (
    // An open dropdown must sit above the fields that follow it
    <div
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      className={`relative ${open ? 'z-30' : 'z-10'} ${className}`}
    >
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
      >
        <span className={`truncate ${value ? 'text-black' : 'text-[#908D8D]'}`}>
          {value || placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 mt-1 max-h-60 w-full overflow-auto rounded-[12px] bg-white shadow-lg"
        >
          {options.map((option) => (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onSelect(option);
                  close();
                }}
                className={`${dropdownItemClass} ${option === value ? 'bg-gray-100 font-semibold' : ''}`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------
   Booking
------------------------------------------------------------------- */
const Booking: React.FC<LoadingProps> = ({ setLoading }) => {
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM_DATA);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const [showTaxiItems, setShowTaxiItems] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [texiData, setTexiData] = useState<any[]>([]);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDateTime, setErrorDateTime] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [apiError, setApiError] = useState('');

  const errorRef = useRef<HTMLDivElement | null>(null);

  const isHourlyRide = HOURLY_RIDES.includes(formData.rideOption);
  const isAirportRide = AIRPORT_RIDES.includes(formData.rideOption);

  // Computed once per mount; the submit handler re-checks against the live clock.
  const earliestPickup = useMemo(getEarliestPickup, []);

  // Time-picker bounds for the currently selected day
  const { minTime, maxTime } = useMemo(() => {
    const baseDay = selectedDate ?? earliestPickup;
    return {
      minTime: isSameDay(baseDay, earliestPickup) ? earliestPickup : startOfDay(baseDay),
      maxTime: endOfBookingDay(baseDay),
    };
  }, [selectedDate, earliestPickup]);

  useEffect(() => {
    if (errorDateTime && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorDateTime]);

  /* ---------------------------- Handlers --------------------------- */

  const resetResults = useCallback(() => {
    setShowTaxiItems(false);
    setApiError('');
  }, []);

  const handleRideOptionSelect = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, rideOption: value }));
      setLocationError('');
      resetResults();
    },
    [resetResults]
  );

  const handleCityChange = useCallback(
    (field: 'formattedPickUpAddress' | 'formattedDropOffAddress', value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setLocationError('');
      resetResults();
    },
    [resetResults]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null); // time options depend on the day, so force a re-pick
    setErrorDateTime(false);
    setFormData((prev) => ({
      ...prev,
      pickUpDate: date?.toLocaleDateString() || '',
      selectTime: '',
    }));
  }, []);

  const handleTimeChange = useCallback((time: Date | null) => {
    setSelectedTime(time);
    setErrorDateTime(false);
    setFormData((prev) => ({
      ...prev,
      selectTime: time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setApiError('');

    // Dropdowns are not native inputs, so HTML "required" can't validate them
    if (!formData.rideOption) {
      setLocationError('Please select a ride option.');
      return;
    }
    if (!formData.formattedPickUpAddress) {
      setLocationError('Please select a pick-up city.');
      return;
    }
    if (!isHourlyRide && !formData.formattedDropOffAddress) {
      setLocationError('Please select a drop-off city.');
      return;
    }
    setLocationError('');

    // Both date and time are required
    if (!selectedDate || !selectedTime) {
      setErrorDateTime(true);
      return;
    }

    // Build the pick-up DateTime from date + time
    const pickupDateTime = new Date(selectedDate);
    pickupDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

    // Reject pick-ups that are less than 1 hour away
    if (pickupDateTime.getTime() - Date.now() < MIN_LEAD_TIME_MS) {
      setErrorDateTime(true);
      setShowTaxiItems(false);
      return;
    }
    setErrorDateTime(false);

    // Only send the fields that apply to the chosen ride type
    const payload = {
      rideOption: formData.rideOption,
      numberPassengers: formData.numberPassengers,
      pickUpDate: pickupDateTime.toLocaleDateString(),
      selectTime: pickupDateTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      origins: formData.formattedPickUpAddress,
      destinations: isHourlyRide ? '' : formData.formattedDropOffAddress,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      flightnumber: isAirportRide ? formData.flightnumber : '',
      airlinename: isAirportRide ? formData.airlinename : '',
      hourlyservice: isHourlyRide ? formData.hourlyservice : '',
    };

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await withoutAuthAxios().post('/calculate', payload);
      const results = response?.data?.data?.results;

      if (response.status === 200 && Array.isArray(results)) {
        setSubmittedData({ ...formData, pickupDateTime });
        setTexiData(results);
        setShowTaxiItems(true);
      } else {
        setShowTaxiItems(false);
        setApiError('No vehicles are available for this trip. Please try different details.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching taxi data:', error?.response?.data || error);
      setShowTaxiItems(false);
      setApiError(
        error?.response?.data?.message ||
          'Could not fetch vehicles right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  /* ----------------------------- Render ---------------------------- */

  return (
    <>
      <section
        className="relative flex h-full flex-col items-center justify-center bg-white
          bg-cover bg-center bg-no-repeat pt-24 md:pt-32 lg:bg-fixed"
        style={HERO_BACKGROUND}
      >
        <div
          className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center
            justify-center gap-8 px-4 py-10 sm:px-8 lg:min-h-screen lg:flex-row lg:gap-10
            lg:px-10 lg:py-0 xl:gap-16 xl:px-16 2xl:px-20"
        >
          {/* LEFT SIDE TEXT */}
          <div className="flex w-full min-w-0 flex-col gap-4 text-center md:gap-6 lg:flex-1 lg:gap-8 lg:text-left">
            <h1 className="flex flex-col gap-1 font-outfit text-black md:gap-2">
              <span
                className="block text-[34px] font-extrabold leading-[1.15]
                  sm:text-[46px] md:text-[56px] lg:text-[46px] xl:text-[62px] 2xl:text-[72px]"
              >
                Book your ride
              </span>
              <span
                className="block text-[28px] font-light leading-[1.2]
                  sm:text-[38px] md:text-[46px] lg:text-[38px] xl:text-[52px] 2xl:text-[60px]"
              >
                with comfort and reliability
              </span>
            </h1>
            <p
              className="mx-auto max-w-2xl font-outfit text-base font-medium leading-relaxed text-black
                sm:text-lg md:text-xl lg:mx-0 lg:text-[18px] xl:text-[22px] 2xl:text-[24px]"
            >
              Our team is committed to providing high-quality and professional transportation
              services to passengers throughout Noida, Uttar Pradesh
            </p>
          </div>

          {/* RIGHT FORM CARD */}
          <form
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
            className="mb-10 flex w-full max-w-[560px] shrink-0 flex-col space-y-3 rounded-2xl
              bg-[#DCDCDC] p-5 sm:p-8 lg:mb-16 lg:w-[470px] lg:max-w-none xl:w-[540px]
              xl:space-y-4 xl:p-10 2xl:w-[590px]"
          >
            {/* Ride option */}
            <SelectDropdown
              label="Ride option"
              placeholder="Select Ride Option"
              value={formData.rideOption}
              options={RIDE_OPTIONS}
              onSelect={handleRideOptionSelect}
            />

            {/* Passengers */}
            <input
              type="number"
              name="numberPassengers"
              inputMode="numeric"
              min={1}
              value={formData.numberPassengers}
              placeholder="Number of passengers"
              aria-label="Number of passengers"
              onChange={handleChange}
              required
              className={inputClass}
            />

            {/* Hourly service */}
            {isHourlyRide && (
              <input
                type="number"
                name="hourlyservice"
                inputMode="numeric"
                min={1}
                value={formData.hourlyservice}
                placeholder="Number of Hours"
                aria-label="Number of hours"
                onChange={handleChange}
                required
                className={inputClass}
              />
            )}

            {/* Airport fields */}
            {isAirportRide && (
              <div className="flex flex-col gap-3 xl:gap-4">
                <input
                  type="text"
                  name="airlinename"
                  value={formData.airlinename}
                  placeholder="Enter Airline Name"
                  aria-label="Airline name"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <input
                  type="text"
                  name="flightnumber"
                  value={formData.flightnumber}
                  placeholder="Enter Flight Number"
                  aria-label="Flight number"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            )}

            {/* Date and time
                `relative z-20` lifts this row above the closed city dropdowns (z-10),
                and the popper z-50 keeps the calendar/time list above neighbouring fields. */}
            <div className="relative z-20 flex flex-col gap-3 sm:flex-row xl:gap-4">
              <div className="w-full sm:w-1/2 [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker-popper]:z-50">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  placeholderText="Select a date"
                  dateFormat="MMM d, yyyy"
                  minDate={startOfDay(earliestPickup)}
                  className={inputClass}
                  ariaLabelledBy="Pick-up date"
                  required
                />
              </div>
              <div className="w-full sm:w-1/2 [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker-popper]:z-50">
                <DatePicker
                  selected={selectedTime}
                  onChange={handleTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={TIME_INTERVAL_MIN}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select time"
                  className={inputClass}
                  minTime={minTime}
                  maxTime={maxTime}
                  ariaLabelledBy="Pick-up time"
                  required
                />
              </div>
            </div>

            {/* Locations (Noida / Gurgaon only) */}
            <SelectDropdown
              label="Pick-up city"
              placeholder="Pick-up location"
              value={formData.formattedPickUpAddress}
              options={CITIES}
              onSelect={(city) => handleCityChange('formattedPickUpAddress', city)}
            />

            {!isHourlyRide && (
              <SelectDropdown
                label="Drop-off city"
                placeholder="Drop-off location"
                value={formData.formattedDropOffAddress}
                options={CITIES}
                onSelect={(city) => handleCityChange('formattedDropOffAddress', city)}
              />
            )}

            {locationError && (
              <p
                role="alert"
                className="font-outfit text-sm font-medium text-red-600 lg:text-base"
              >
                {locationError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mx-auto w-full rounded-2xl bg-gradient py-3.5 text-[16px] font-semibold
                text-white transition hover:bg-gray-800 disabled:cursor-not-allowed
                disabled:opacity-60 sm:w-[220px] lg:py-4 lg:text-[18px] xl:w-[240px]"
            >
              {isSubmitting ? 'Checking...' : 'Check Out'}
            </button>
          </form>
        </div>

        {errorDateTime && (
          <div ref={errorRef} className="mt-4 flex w-full justify-center px-4" role="alert">
            <NotificationError />
          </div>
        )}

        {apiError && (
          <p
            role="alert"
            className="mt-4 px-4 text-center font-outfit font-medium text-red-600"
          >
            {apiError}
          </p>
        )}

        <StepCard
          showTaxiItems={showTaxiItems}
          setShowTaxiItems={setShowTaxiItems}
          texiData={texiData}
          submittedData={submittedData}
          setLoading={setLoading}
        />
      </section>

      <Footer />

      <ContactInfoBar />
    </>
  );
};

export default IsLoadingHOC(Booking);