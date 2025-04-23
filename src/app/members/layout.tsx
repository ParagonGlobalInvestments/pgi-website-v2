import StandaloneLayout from "@/components/layout/StandaloneLayout";

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}
