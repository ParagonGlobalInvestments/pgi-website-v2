import StandaloneLayout from "@/components/layout/StandaloneLayout";

export default function PublicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}
