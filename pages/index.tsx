"use client";

import RideChoiceSection from '../components/hero';
import WhatWeOffer from '../components/whatWeoffer';
import ContactUs from '../components/Contact';
import CarOptions from '@/components/CarOption';
import Banner from '@/components/Banner'


const HomePage = () => {

  
  return (
    <>
      <RideChoiceSection />
      <WhatWeOffer />
      <CarOptions/>
      <ContactUs />
      <Banner/>
    </>
  );
};

export default HomePage;
