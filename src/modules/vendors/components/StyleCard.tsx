import React from "react";
import Image from "next/image";

interface StyleCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
}

const StyleCard = ({ title, subtitle, imageUrl }: StyleCardProps) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-border">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-4 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default StyleCard;
