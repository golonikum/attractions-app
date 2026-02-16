import { Attraction } from "@/types/attraction";
import { Group } from "@/types/group";
import { useMemo } from "react";

export const useFiltersInitialOptions = ({
  attractions,
  groups,
  selectedTag,
}: {
  groups: Group[];
  attractions: Attraction[];
  selectedTag: string[];
}) => {
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    groups.forEach((group) => {
      if (group.tag) {
        tags.add(group.tag);
      }
    });
    return Array.from(tags).sort();
  }, [groups]);

  const allGroups = useMemo(() => {
    return groups
      .filter(
        (item) =>
          !selectedTag.length || (item.tag && selectedTag.includes(item.tag)),
      )
      .map((item) => item.name)
      .sort();
  }, [groups, selectedTag]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    attractions.forEach((item) => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories).sort();
  }, [attractions]);

  return {
    allTags,
    allGroups,
    allCategories,
  };
};
