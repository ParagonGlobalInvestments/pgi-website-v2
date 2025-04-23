import StandaloneLayout from "@/components/layout/StandaloneLayout";

export default function PlacementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}
