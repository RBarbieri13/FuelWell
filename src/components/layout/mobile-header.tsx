import Link from "next/link";

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 py-3">
      <Link href="/app/dashboard" className="text-lg font-bold text-primary-600">
        FuelWell
      </Link>
    </header>
  );
}
