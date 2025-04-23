import StandaloneLayout from "@/components/layout/StandaloneLayout";

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}
