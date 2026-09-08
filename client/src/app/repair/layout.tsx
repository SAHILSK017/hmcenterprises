import { FormPageBridge } from "@/components/layout/form-page-bridge";

export default function RepairLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FormPageBridge />
      {children}
    </>
  );
}
