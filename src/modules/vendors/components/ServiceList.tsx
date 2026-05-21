"use client";

import React, { useState } from 'react';
import BookingModal from './BookingModal';
import { useAuth } from '@/shared/context/AuthContext';

interface Service {
  id: string;
  serviceName: string;
  description: string;
  basePrice: number;
}

interface ServiceListProps {
  services: Service[];
  vendorName: string;
}

const ServiceList = ({ services, vendorName }: ServiceListProps) => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleBookClick = (service: Service) => {
    if (!user) {
      alert("Please log in to book a vendor.");
      return;
    }
    setSelectedService(service);
  };

  return (
    <div className="space-y-4">
      {services.map(service => (
        <div key={service.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow bg-white">
          <div className="flex-1">
            <h4 className="font-bold text-lg text-charcoal">{service.serviceName}</h4>
            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3 min-w-[150px]">
            <p className="font-semibold text-primary text-lg">LKR {service.basePrice.toLocaleString()}</p>
            <button 
              onClick={() => handleBookClick(service)}
              className="px-4 py-2 bg-charcoal text-white text-sm font-bold rounded-lg hover:bg-primary transition-colors whitespace-nowrap w-full sm:w-auto text-center"
            >
              Book This Service
            </button>
          </div>
        </div>
      ))}

      {selectedService && (
        <BookingModal 
          isOpen={true} 
          onClose={() => setSelectedService(null)} 
          vendorName={vendorName}
          serviceId={selectedService.id}
          price={selectedService.basePrice}
        />
      )}
    </div>
  );
};

export default ServiceList;
