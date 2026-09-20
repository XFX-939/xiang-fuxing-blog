import "@/styles/classic.css";
import { Footer } from "@/components/classic/Footer";
import { Header } from "@/components/classic/Header";

export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-ui-version="classic"
      className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-bg font-sans text-primary"
    >
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-primary px-4 py-3 text-sm font-semibold text-bg focus:not-sr-only focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        跳到主要内容
      </a>
      <Header />
      <main id="main-content" className="w-full max-w-full flex-1 overflow-x-clip focus:outline-none" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
