import { useState, useRef, useEffect } from "react";
import { Tag, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TagFilterProps {
  tags: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilter({ tags, selected, onChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = tags.filter((t) => t.toLowerCase().includes(search.toLowerCase()));

  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag]
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted/50 transition-colors"
      >
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span>{selected.length > 0 ? `${selected.length} tag${selected.length > 1 ? "s" : ""}` : "All Tags"}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Buscar tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
          {selected.length > 0 && (
            <div className="p-2 border-b border-border flex flex-wrap gap-1">
              {selected.map((tag) => (
                <Badge key={tag} variant="default" className="gap-1 text-xs py-0.5 px-2 cursor-pointer" onClick={() => toggle(tag)}>
                  {tag} <X className="w-2.5 h-2.5" />
                </Badge>
              ))}
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2 text-center">Nenhuma tag encontrada</p>
            ) : (
              filtered.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggle(tag)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    selected.includes(tag) ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  {tag}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
