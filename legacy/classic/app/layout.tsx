import "@/styles/classic.css";
import { Footer } from "@/components/classic/Footer";
import { Header } from "@/components/classic/Header";

export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-ui-version="classic"
      className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-bg font-sans text-primary"
    >
      <Header />
      <main className="w-full max-w-full flex-1 overflow-x-clip">{children}</main>
      <Footer />
    </div>
  );
}
