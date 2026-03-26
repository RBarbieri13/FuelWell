interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
}

export function MacroBar({
  label,
  current,
  target,
  unit = "g",
  color,
}: MacroBarProps) {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-700">{label}</span>
        <span className="text-neutral-500">
          {current} / {target}
          {unit}
        </span>
      </div>
      <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
