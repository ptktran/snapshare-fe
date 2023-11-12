
import { useState } from "react";

export default function Carousel({ images }) {
  // carousel component, takes in an array of image urls
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  function isImage(url) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i;
    if (imageExtensions.test(url)) return true
    return false
  }

  return (
    <div className="max-w-[1400px] h-[650px] w-full m-auto relative group">
      <div className="w-full h-full ease duration-400}">
      {isImage(images[currentIndex]) ? (
       <img src={images[currentIndex]} alt="post-image" className="h-full w-full object-contain" />
      ) : (
       <video src={images[currentIndex]} controls loop className="h-full w-full object-cover" />
      )}

      </div>
      {/* Left Arrow */}
      <button onClick={prevSlide} className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-2 text-xl rounded-full p-1 bg-white/50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="gray" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button onClick={nextSlide} className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-2 text-xl rounded-full p-1 bg-white/50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="gray" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <div className="absolute bottom-0 flex justify-center w-full">
        <div className="flex justify-center py-2 ">
          {images.map((slide, slideIndex) => (
            <button key={slideIndex} onClick={() => setCurrentIndex(slideIndex)}>
              {slideIndex === currentIndex ? (
                <img src="/icons/dot-filled.svg" className="w-3" />
                ) : (
                <img src="/icons/dot-unfilled.svg" className="w-3" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
