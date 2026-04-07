import { useState } from "react";
import { useRecurringTags } from "@/hooks/useRecurringTags";
import { useAllLeadTags } from "@/hooks/useAllLeadTags";
import { X, Plus, Loader2, Tag, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RecurringTagsManager() {
  const { recurringTags, loading, addTag, removeTag } = useRecurringTags();
  const { tags: allTags, loading: tagsLoading } = useAllLeadTags();
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const availableTags = allTags
    .filter((t) => !recurringTags.includes(t))
    .filter((t) => t.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (tag: string) => {
    setAdding(tag);
    await addTag(tag);
    setAdding(null);
  };

  const handleRemove = async (tag: string) => {
    setRemoving(tag);
    await removeTag(tag);
    setRemoving(null);
  };

  if (loading || tagsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Recurring Revenue Tags
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione quais tags da pipeline classificam a receita como recorrente. Leads com essas tags terão sua receita contabilizada como Recurring Revenue.
        </p>
      </div>

      {/* Current recurring tags */}
      <div className="card-dashboard p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Tags marcadas como Recurring ({recurringTags.length})</h3>
        {recurringTags.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Nenhuma tag selecionada. Adicione tags abaixo para classificar receita recorrente.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recurringTags.map((tag) => (
              <Badge key={tag} variant="default" className="gap-1.5 py-1 px-3 text-sm">
                {tag}
                <button
                  onClick={() => handleRemove(tag)}
                  disabled={removing === tag}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  {removing === tag ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Available tags */}
      <div className="card-dashboard p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Tags disponíveis na pipeline</h3>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {availableTags.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              {search ? "Nenhuma tag encontrada." : "Todas as tags já foram adicionadas."}
            </p>
          ) : (
            availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAdd(tag)}
                disabled={adding === tag}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/60 transition-colors text-left group"
              >
                <span className="text-foreground">{tag}</span>
                {adding === tag ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
