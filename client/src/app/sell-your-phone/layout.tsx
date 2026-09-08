import { FormPageBridge } from "@/components/layout/form-page-bridge";

export default function SellYourPhoneLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FormPageBridge />
      {children}
    </>
  );
}
