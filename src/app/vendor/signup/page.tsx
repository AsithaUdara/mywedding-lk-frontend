import VendorSignupFlow from "@/modules/vendor/signup/VendorSignupFlow";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";

export default function VendorSignupPage() {
  return (
    <RegalFrostShell mesh className="min-h-screen px-4 py-8 sm:py-12">
      <VendorSignupFlow />
    </RegalFrostShell>
  );
}
