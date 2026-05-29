import React from "react";

interface AmenityCardProps {
  title: string;
  icon: React.ReactNode;
}

const AmenityCard = ({ title, icon }: AmenityCardProps) => {
  return (
    <div className="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-6 text-primary transition-shadow hover:shadow-md">
      <span className="flex-shrink-0" aria-hidden>
        {icon}
      </span>
      <span className="font-semibold text-foreground">{title}</span>
    </div>
  );
};

export default AmenityCard;
