"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export default function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("search", term);
      } else {
        params.delete("search");
      }
      router.push(`/leads?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search leads..."
          className="w-full h-10 rounded-lg border border-input bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateSearch(e.target.value);
          }}
        />
      </div>
      <select
        className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) params.set("status", e.target.value);
          else params.delete("status");
          router.push(`/leads?${params.toString()}`);
        }}
        defaultValue={searchParams.get("status") || ""}>
        <option value="">All Statuses</option>
        <option value="new">New</option>
        <option value="in_progress">In Progress</option>
        <option value="contacted">Contacted</option>
        <option value="waiting_response">Waiting Response</option>
        <option value="qualified">Qualified</option>
        <option value="not_interested">Not Interested</option>
        <option value="converted">Converted</option>
      </select>
    </div>
  );
}
