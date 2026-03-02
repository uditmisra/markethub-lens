import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagBadge } from "@/components/TagBadge";
import { useTags } from "@/hooks/useTags";
import { Tag, TagCategory, CATEGORY_LABELS } from "@/types/tags";
import { Plus, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";

interface TagSelectorProps {
  evidenceId: string;
  currentTags: Tag[];
}

const CATEGORIES: TagCategory[] = ["use_case", "persona", "competitor", "campaign", "sentiment"];

export const TagSelector = ({ evidenceId, currentTags }: TagSelectorProps) => {
  const { tags, createTag, addTagToEvidence, removeTagFromEvidence } = useTags();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>("use_case");

  const currentTagIds = new Set(currentTags.map((t) => t.id));

  const filtered = tags.filter(
    (t) =>
      !currentTagIds.has(t.id) &&
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (tag: Tag) => {
    try {
      await addTagToEvidence.mutateAsync({ evidenceId, tagId: tag.id });
    } catch {
      toast.error("Failed to add tag");
    }
  };

  const handleRemove = async (tag: Tag) => {
    try {
      await removeTagFromEvidence.mutateAsync({ evidenceId, tagId: tag.id });
    } catch {
      toast.error("Failed to remove tag");
    }
  };

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      const created = await createTag.mutateAsync({ name: newTagName.trim(), category: newTagCategory });
      await addTagToEvidence.mutateAsync({ evidenceId, tagId: created.id });
      setNewTagName("");
      toast.success("Tag created and added");
    } catch {
      toast.error("Failed to create tag");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {currentTags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} onRemove={() => handleRemove(tag)} />
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1 border-dashed">
              <Plus className="h-3 w-3" />
              Add tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add existing tag</p>
              <Input
                placeholder="Search tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filtered.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">No tags found</p>
                ) : (
                  filtered.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAdd(tag)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors"
                    >
                      <TagBadge tag={tag} />
                    </button>
                  ))
                )}
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Create new tag</p>
                <div className="space-y-2">
                  <Select value={newTagCategory} onValueChange={(v) => setNewTagCategory(v as TagCategory)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tag name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" className="h-8 px-3" onClick={handleCreate} disabled={!newTagName.trim()}>
                      <TagIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
