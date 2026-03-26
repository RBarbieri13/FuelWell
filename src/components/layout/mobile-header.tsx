import { Logo } from "@/components/ui/logo";

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-neutral-100 px-4 py-3">
      <Logo href="/app/dashboard" size="md" />
    </header>
  );
}
