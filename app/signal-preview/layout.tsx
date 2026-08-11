import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function SignalPreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-ui-version="signal"
      className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-bg font-sans text-primary"
    >
      <Header />
      <main className="w-full max-w-full flex-1 overflow-x-clip">{children}</main>
      <Footer />
    </div>
  );
}
