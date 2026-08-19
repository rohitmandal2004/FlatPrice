import { cn } from "../../lib/utils";
import React from "react";

export default function ImageGallery() {
  const images = [
    // Modern living room
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
    // Luxury bedroom
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop",
    // Modern kitchen
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop",
    // Minimalist apartment
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    // Cozy balcony
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
    // Elegant dining
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop",
  ];

  return (
    <section className="w-full flex flex-col items-center justify-start py-12">
      <div className="max-w-3xl text-center px-4">
        <h1 className="text-3xl font-semibold text-foreground">Featured Properties</h1>
        <p className="text-sm text-muted-foreground mt-2">
          A visual collection of premium flats and apartments – helping you envision the 
          potential of your next real estate investment.
        </p>
      </div>

      {/* Gallery Container */}
      <div className="flex overflow-x-auto md:overflow-visible snap-x snap-mandatory items-center gap-3 h-[400px] w-full max-w-5xl mt-10 px-4 pb-6 md:pb-0 hide-scrollbar">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="snap-center shrink-0 relative group flex-grow transition-all duration-500 w-64 md:w-56 md:hover:w-full rounded-xl overflow-hidden h-[350px] md:h-full cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
            <img
              className="h-full w-full object-cover object-center transition-transform duration-700 md:group-hover:scale-105"
              src={src}
              alt={`featured-property-${idx + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
