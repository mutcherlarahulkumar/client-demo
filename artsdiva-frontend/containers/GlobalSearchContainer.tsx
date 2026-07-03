import { useRouter } from "next/router";
import { useSearch } from "@artsdiva/hooks/useSearch";
import { SearchBar } from "@artsdiva/components/SearchBar";
import { SearchResultsDropdown } from "@artsdiva/components/SearchResultsDropdown";
import type { SearchResultItem } from "@artsdiva/types/search.types";

const ROUTE_BY_TYPE: Record<SearchResultItem["type"], string> = {
  artwork: "/artworks",
  artist: "/artists",
  client: "/clients",
};

export function GlobalSearchContainer() {
  const router = useRouter();
  const { query, setQuery, results, isLoading } = useSearch();

  const handleSelect = (item: SearchResultItem): void => {
    void router.push(`${ROUTE_BY_TYPE[item.type]}/${item.id}`);
    setQuery("");
  };

  return (
    <div className="relative">
      <SearchBar value={query} onChange={setQuery} placeholder="Search artworks, artists, clients..." />
      {query.trim() && <SearchResultsDropdown results={results} isLoading={isLoading} onSelect={handleSelect} />}
    </div>
  );
}

