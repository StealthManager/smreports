import { useState, useMemo } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 14 dias", value: "14d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Últimos 60 dias", value: "60d" },
  { label: "Últimos 90 dias", value: "90d" },
  { label: "Este mês", value: "this_month" },
  { label: "Mês passado", value: "last_month" },
  { label: "Este ano", value: "this_year" },
  { label: "Personalizado", value: "custom" },
];

function getPresetRange(preset: string): DateRange {
  const now = new Date();
  switch (preset) {
    case "7d": return { from: subDays(now, 7), to: now };
    case "14d": return { from: subDays(now, 14), to: now };
    case "30d": return { from: subDays(now, 30), to: now };
    case "60d": return { from: subDays(now, 60), to: now };
    case "90d": return { from: subDays(now, 90), to: now };
    case "this_month": return { from: startOfMonth(now), to: now };
    case "last_month": {
      const prev = subMonths(now, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    case "this_year": return { from: startOfYear(now), to: now };
    default: return { from: subDays(now, 30), to: now };
  }
}

export function getDefaultRange(): DateRange {
  return getPresetRange("30d");
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState("30d");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({ from: value.from, to: value.to });

  const handlePreset = (val: string) => {
    setPreset(val);
    if (val !== "custom") {
      const range = getPresetRange(val);
      onChange(range);
      setTempRange(range);
    }
  };

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    setTempRange(range);
    if (range.from && range.to) {
      onChange({ from: range.from, to: range.to });
      setPreset("custom");
      setCalendarOpen(false);
    }
  };

  const label = useMemo(() => {
    return `${format(value.from, "dd MMM", { locale: ptBR })} — ${format(value.to, "dd MMM yyyy", { locale: ptBR })}`;
  }, [value]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={preset} onValueChange={handlePreset}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Selecione">
            {presets.find((p) => p.value === preset)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {presets.map((p) => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-9 gap-2 text-sm font-normal", !value && "text-muted-foreground")}>
            <CalendarIcon className="h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={tempRange as any}
            onSelect={handleCalendarSelect as any}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
