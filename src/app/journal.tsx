"use client";

import { useEffect, useState } from "react";
import { Entry, localStore, parseTags } from "@/lib/entries";

const store = localStore;

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [tagText, setTagText] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    store.list().then((list) => {
      setEntries(list);
      setLoaded(true);
    });
  }, []);

  const allTags: string[] = [];
  for (const entry of entries) {
    for (const tag of entry.tags) {
      if (!allTags.includes(tag)) allTags.push(tag);
    }
  }

  const visible: Entry[] = [];
  for (const entry of entries) {
    if (!activeTag || entry.tags.includes(activeTag)) visible.push(entry);
  }

  function reset() {
    setEditingId(null);
    setBody("");
    setTagText("");
  }

  async function save() {
    if (!body.trim()) return;
    const input = { body: body.trim(), tags: parseTags(tagText) };
    if (editingId) {
      const updated = await store.update(editingId, input);
      setEntries(entries.map((e) => (e.id === editingId ? updated : e)));
    } else {
      const created = await store.create(input);
      setEntries([created, ...entries]);
    }
    reset();
  }

  function edit(entry: Entry) {
    setEditingId(entry.id);
    setBody(entry.body);
    setTagText(entry.tags.join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    await store.remove(id);
    setEntries(entries.filter((e) => e.id !== id));
    if (editingId === id) reset();
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Dat&apos;s Journal</h1>

      <section className="mb-8 flex flex-col gap-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind?"
          rows={6}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-transparent p-3 text-base dark:border-zinc-700"
        />
        <input
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder="tags, comma separated"
          className="w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-base dark:border-zinc-700"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            className="rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-40"
            disabled={!body.trim()}
          >
            {editingId ? "Update" : "Save"}
          </button>
          {editingId && (
            <button onClick={reset} className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700">
              Cancel
            </button>
          )}
        </div>
      </section>

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full border px-3 py-1 text-sm ${
                activeTag === tag
                  ? "border-foreground bg-foreground text-background"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {loaded && visible.length === 0 && <p className="text-zinc-500">No entries yet.</p>}

      <ul className="flex flex-col gap-4">
        {visible.map((entry) => (
          <li key={entry.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
              <time>{new Date(entry.createdAt).toLocaleString()}</time>
              <span className="flex gap-3">
                <button onClick={() => edit(entry)}>Edit</button>
                <button onClick={() => remove(entry.id)}>Delete</button>
              </span>
            </div>
            <p className="whitespace-pre-wrap">{entry.body}</p>
            {entry.tags.length > 0 && (
              <p className="mt-3 text-sm text-zinc-500">{entry.tags.map((t) => `#${t}`).join(" ")}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
