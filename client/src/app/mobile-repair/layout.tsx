import { FormPageBridge } from "@/components/layout/form-page-bridge";

export default function MobileRepairLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FormPageBridge />
      {children}
    </>
  );
}
