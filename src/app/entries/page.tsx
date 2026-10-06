"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Entry, store } from "@/lib/entries";

function preview(body: string): string {
  return body.length > 140 ? `${body.slice(0, 140).trimEnd()}…` : body;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    store.listEntries().then((list) => {
      setEntries(list);
      setLoaded(true);
    });
  }, []);

  const tagCounts: Record<string, number> = {};
  for (const entry of entries) {
    for (const tag of entry.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const usedTags = Object.keys(tagCounts).sort();

  const visible: Entry[] = [];
  for (const entry of entries) {
    let matches = activeTags.length === 0;
    for (const tag of activeTags) {
      if (entry.tags.includes(tag)) matches = true;
    }
    if (matches) visible.push(entry);
  }

  function toggleTag(tag: string) {
    setActiveTags(activeTags.includes(tag) ? activeTags.filter((t) => t !== tag) : [...activeTags, tag]);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <div className="flex items-center justify-between text-sm text-cyan">
        <Link href="/">&larr; Home</Link>
        <Link href="/import">Import</Link>
      </div>
      <div className="mt-3 mb-6 flex items-center justify-between gap-4">
        <h1 className="title-glow text-3xl font-bold">Entries</h1>
        <Link href="/entries/new" className="btn">
          Add entry
        </Link>
      </div>

      {usedTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {usedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`chip ${activeTags.includes(tag) ? "chip-on" : ""}`}
            >
              #{tag} ({tagCounts[tag]})
            </button>
          ))}
        </div>
      )}

      {loaded && visible.length === 0 && <p className="text-blue-200/60">No entries yet.</p>}

      <ul className="flex flex-col gap-4">
        {visible.map((entry) => (
          <li key={entry.id}>
            <Link href={`/entries/${entry.id}`} className="card card-link block p-5">
              <h2 className="text-lg font-semibold text-cyan">{entry.title ?? new Date(entry.createdAt).toLocaleDateString()}</h2>
              <p className="mt-2 whitespace-pre-wrap text-blue-100/80">{preview(entry.body)}</p>
              {entry.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
