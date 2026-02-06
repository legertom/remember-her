"use client";

import { useState, useEffect } from "react";

const CATEGORIES = [
  "Actor",
  "Director",
  "Playwright",
  "Designer",
  "Place",
  "Play",
  "Producer",
  "Stage Manager",
  "Choreographer",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

interface Entry {
  id: string;
  name: string;
  notes: string;
  category: Category;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Actor: "bg-[#7c3aed]",
  Director: "bg-[#e11d48]",
  Playwright: "bg-[#0891b2]",
  Designer: "bg-[#d97706]",
  Place: "bg-[#059669]",
  Play: "bg-[#db2777]",
  Producer: "bg-[#92400e]",
  "Stage Manager": "bg-[#4338ca]",
  Choreographer: "bg-[#be185d]",
  Other: "bg-[#525252]",
};

const STORAGE_KEY = "remember-her-entries";

function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<Category>("Actor");
  const [filter, setFilter] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("Actor");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
    setMounted(true);
  }, []);

  const persist = (updated: Entry[]) => {
    setEntries(updated);
    saveEntries(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEntry: Entry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      notes: notes.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    persist([newEntry, ...entries]);
    setName("");
    setNotes("");
    setCategory("Actor");
  };

  const handleDelete = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditName(entry.name);
    setEditNotes(entry.notes);
    setEditCategory(entry.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditNotes("");
    setEditCategory("Actor");
  };

  const handleUpdate = (id: string) => {
    persist(
      entries.map((e) =>
        e.id === id
          ? { ...e, name: editName.trim(), notes: editNotes.trim(), category: editCategory }
          : e
      )
    );
    cancelEdit();
  };

  const exportCSV = () => {
    const headers = ["Name", "Category", "Notes", "Date Added"];
    const rows = filteredEntries.map((e) => [
      `"${e.name.replace(/"/g, '""')}"`,
      e.category,
      `"${e.notes.replace(/"/g, '""')}"`,
      new Date(e.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `remember-her-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEntries = entries.filter((e) => {
    const matchesFilter = filter === "All" || e.category === filter;
    const matchesSearch =
      search === "" ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.notes.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e11d48] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Remember Her
            </h1>
            <p className="text-xs text-[#a3a3a3]">theater notes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              disabled={entries.length === 0}
              className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-[#a3a3a3] transition-colors hover:border-[#e11d48]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* New Entry Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 sm:p-5"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Name — who or what to remember..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#222] px-3 py-2.5 text-sm text-white placeholder-[#555] outline-none transition-colors focus:border-[#e11d48]/60"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="rounded-lg border border-[#2a2a2a] bg-[#222] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#e11d48]/60 sm:w-44"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Notes — show, talent, context, anything..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#222] px-3 py-2.5 text-sm text-white placeholder-[#555] outline-none transition-colors focus:border-[#e11d48]/60"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-[#e11d48] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#be123c] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("All")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === "All"
                  ? "bg-white text-black"
                  : "bg-[#1a1a1a] text-[#a3a3a3] hover:text-white"
              }`}
            >
              All ({entries.length})
            </button>
            {CATEGORIES.map((c) => {
              const count = entries.filter((e) => e.category === c).length;
              if (count === 0) return null;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === c
                      ? `${CATEGORY_COLORS[c]} text-white`
                      : "bg-[#1a1a1a] text-[#a3a3a3] hover:text-white"
                  }`}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-white placeholder-[#555] outline-none transition-colors focus:border-[#e11d48]/60 sm:w-48"
          />
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-[#555]">
              {entries.length === 0
                ? "No entries yet. Start remembering!"
                : "No matches found."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-start gap-3 rounded-lg border border-[#2a2a2a] bg-[#141414] p-3 transition-colors hover:border-[#333]"
              >
                {editingId === entry.id ? (
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#222] px-3 py-2 text-sm text-white outline-none focus:border-[#e11d48]/60"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) =>
                          setEditCategory(e.target.value as Category)
                        }
                        className="rounded-lg border border-[#2a2a2a] bg-[#222] px-3 py-2 text-sm text-white outline-none focus:border-[#e11d48]/60"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes..."
                      className="rounded-lg border border-[#2a2a2a] bg-[#222] px-3 py-2 text-sm text-white outline-none focus:border-[#e11d48]/60"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg px-3 py-1.5 text-xs text-[#a3a3a3] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(entry.id)}
                        className="rounded-lg bg-[#e11d48] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#be123c]"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span
                      className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ${
                        CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Other
                      }`}
                    >
                      {entry.category}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-white">
                        {entry.name}
                      </span>
                      {entry.notes && (
                        <p className="mt-0.5 text-xs text-[#a3a3a3]">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="mr-2 text-[10px] text-[#555]">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => startEdit(entry)}
                        className="rounded p-1 text-[#555] hover:text-white"
                        title="Edit"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="rounded p-1 text-[#555] hover:text-[#e11d48]"
                        title="Delete"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-[#1a1a1a] py-6 text-center">
          <p className="text-xs text-[#444]">
            Remember Her &middot; {filteredEntries.length} of {entries.length}{" "}
            entries
          </p>
        </footer>
      </main>
    </div>
  );
}
