import React from "react";
import Image from "next/image";
import SearchForm from "@/modules/vendors/components/SearchForm";

interface HeroWithSearchProps {
  imageUrl: string;
  searchType: "vendor" | "venue";
}

const HeroWithSearch = ({ imageUrl, searchType }: HeroWithSearchProps) => {
  return (
    <section className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[550px]">
      <div className="absolute inset-0 z-0 flex">
        <div className="hidden w-5/12 bg-background sm:block" />
        <div className="relative w-full overflow-hidden rounded-bl-3xl sm:w-7/12">
          <Image
            src={imageUrl}
            alt="Beautiful wedding venue in Sri Lanka"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent sm:from-background/60" />
        </div>
      </div>
      <div className="relative z-10 flex min-h-[inherit] items-center">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-lg sm:mx-0 sm:ml-8 lg:ml-16">
            <SearchForm type={searchType} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroWithSearch;
