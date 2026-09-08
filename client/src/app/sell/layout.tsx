import { FormPageBridge } from "@/components/layout/form-page-bridge";

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FormPageBridge />
      {children}
    </>
  );
}
