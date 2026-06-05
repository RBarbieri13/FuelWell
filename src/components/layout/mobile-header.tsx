import { Logo } from "@/components/ui/logo";

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/92 backdrop-blur-xl border-b border-white/80 px-4 py-3 shadow-sm shadow-neutral-200/50">
      <div className="flex items-center justify-between">
        <Logo href="/app/dashboard" size="md" />
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
          Today
        </span>
      </div>
    </header>
  );
}
