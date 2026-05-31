import React from "react";
import { notFound } from "next/navigation";
import { getVendorById } from "@/shared/lib/api/vendors";
import VendorDetailClientWrapper from "@/modules/vendors/components/VendorDetailClientWrapper";
import ServiceDetailContent from "@/modules/vendors/components/ServiceDetailContent";

const ServiceDetailPage = async ({
  params,
}: {
  params: Promise<{ vendorId: string; serviceId: string }>;
}) => {
  const { vendorId, serviceId } = await params;
  const vendor = await getVendorById(vendorId);

  if (!vendor) {
    notFound();
  }

  const serviceExists = vendor.services.some((service) => service.id === serviceId);
  if (!serviceExists) {
    notFound();
  }

  return (
    <VendorDetailClientWrapper>
      <ServiceDetailContent vendor={vendor} serviceId={serviceId} />
    </VendorDetailClientWrapper>
  );
};

export default ServiceDetailPage;
