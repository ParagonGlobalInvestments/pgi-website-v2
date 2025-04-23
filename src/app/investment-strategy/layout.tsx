import StandaloneLayout from "@/components/layout/StandaloneLayout";

export default function InvestmentStrategyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}
