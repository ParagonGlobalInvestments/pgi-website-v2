import StandaloneLayout from "@/components/layout/StandaloneLayout";

export default function NationalCommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}
