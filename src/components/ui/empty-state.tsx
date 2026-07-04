import Link from "next/link";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-5">
        <Icon className="w-6 h-6 text-neutral-400" />
      </div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1.5">
        {title}
      </h2>
      <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <Link href={action.href} className="mt-6">
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
