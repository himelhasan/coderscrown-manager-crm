"use client";

import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [industry, setIndustry] = useState(searchParams.get("industry") || "");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/v1/campaigns');
        if (res.ok) {
          const json = await res.json();
          setCampaigns(json.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCampaigns();
  }, []);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/leads?${params.toString()}`);
    },
    [router, searchParams],
  );

  const toggleSortOrder = () => {
    const currentOrder = searchParams.get("sortOrder") || "desc";
    const nextOrder = currentOrder === "asc" ? "desc" : "asc";
    updateParam("sortOrder", nextOrder);
  };

  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search name, email, company, industry..."
          className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateParam("search", e.target.value);
          }}
        />
      </div>

      {/* Campaign Filter */}
      <select
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
        onChange={(e) => updateParam("campaign", e.target.value)}
        defaultValue={searchParams.get("campaign") || ""}>
        <option value="">All Campaigns</option>
        {campaigns.map((c) => (
          <option key={c._id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Industry Filter Input */}
      <input
        type="text"
        placeholder="Filter by Industry..."
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
        value={industry}
        onChange={(e) => {
          setIndustry(e.target.value);
          updateParam("industry", e.target.value);
        }}
      />

      {/* Status Filter */}
      <select
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
        onChange={(e) => updateParam("status", e.target.value)}
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

      {/* Sort By Dropdown */}
      <div className="flex items-center gap-1.5 border-l border-border pl-3">
        <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Sort By:</span>
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary font-medium"
          onChange={(e) => updateParam("sortBy", e.target.value)}
          defaultValue={searchParams.get("sortBy") || "updatedAt"}>
          <option value="updatedAt">Recently Updated</option>
          <option value="createdAt">Date Created</option>
          <option value="industry">Industry</option>
          <option value="name">Lead Name</option>
          <option value="company_name">Company Name</option>
          <option value="status">Status</option>
        </select>

        <button
          onClick={toggleSortOrder}
          title={`Order: ${currentSortOrder.toUpperCase()}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {currentSortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
