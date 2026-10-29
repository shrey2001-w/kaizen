import Link from 'next/link'
import React from 'react'
//test deploy

const ThankYou = () => {
  
  return (
    <div
    className="
        flex flex-col items-center justify-center min-h-screen relative
        bg-center bg-no-repeat bg-cover
        before:content-[''] before:absolute before:top-0 before:left-0 
        before:w-full before:h-full before:bg-black/60
      "
    style={{ backgroundImage: 'url("/images/hero_image.webp")' }}
>
    <div className="relative text-white text-center max-w-[1000px] mx-auto px-4 w-full">
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4'>Thank You for Your Booking!</h1>
        <p className='text-lg sm:text-xl mb-6'>Your booking has been successfully completed. We will be in touch soon with more details.</p>
        <Link href="/" className="inline-flex bg-white text-black hover:bg-gray-100 transition-colors focus:ring-4 focus:outline-none focus:ring-white/50 font-semibold rounded-lg text-sm sm:text-base px-6 py-3 text-center">Back to Homepage</Link>
    </div>
</div>
  )
}
ThankYou.noHeader = true;
export default ThankYou