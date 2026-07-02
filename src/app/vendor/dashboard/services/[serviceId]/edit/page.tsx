"use client";

import { use } from "react";
import ServiceListingWizard from "@/modules/vendor/services/listing/ServiceListingWizard";

export default function EditServiceListingPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = use(params);
  return <ServiceListingWizard mode="edit" serviceId={serviceId} />;
}
