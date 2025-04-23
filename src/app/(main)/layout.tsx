import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/ui/PageTransition";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-navy text-white">
      <PageTransition>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </PageTransition>
    </div>
  );
}
