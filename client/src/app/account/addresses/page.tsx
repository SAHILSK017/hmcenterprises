import { EmptyState } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { PageSection } from "@/components/layout/page-section";

export default function AccountAddressesPage() {
  return (
    <PageSection centered={false} innerClassName="py-0">
      <h1 className="mb-6 font-display text-2xl font-bold">Addresses</h1>
      <EmptyState
        icon={<MapPin className="h-10 w-10" />}
        title="No saved addresses"
        description="Addresses you add at checkout will appear here."
      />
    </PageSection>
  );
}
