import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAllLeadTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      // Fetch all distinct tags from leads table
      const { data } = await supabase.from("leads").select("tags");
      const tagSet = new Set<string>();
      (data || []).forEach((row) => {
        const t = row.tags as string[] | null;
        if (t) t.forEach((tag) => tagSet.add(tag));
      });
      setTags([...tagSet].sort());
      setLoading(false);
    }
    fetch();
  }, []);

  return { tags, loading };
}
