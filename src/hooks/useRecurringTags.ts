import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRecurringTags() {
  const [recurringTags, setRecurringTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = async () => {
    const { data } = await supabase
      .from("recurring_revenue_tags")
      .select("tag")
      .order("tag");
    setRecurringTags((data || []).map((r) => r.tag));
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const addTag = async (tag: string) => {
    const { error } = await supabase
      .from("recurring_revenue_tags")
      .insert({ tag: tag.toLowerCase().trim() });
    if (!error) {
      setRecurringTags((prev) => [...prev, tag.toLowerCase().trim()].sort());
    }
    return error;
  };

  const removeTag = async (tag: string) => {
    const { error } = await supabase
      .from("recurring_revenue_tags")
      .delete()
      .eq("tag", tag);
    if (!error) {
      setRecurringTags((prev) => prev.filter((t) => t !== tag));
    }
    return error;
  };

  return { recurringTags, loading, addTag, removeTag, refetch: fetchTags };
}
