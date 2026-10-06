"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Entry, defaultTitle, store } from "@/lib/entries";

export default function EntryForm({ entry }: { entry?: Entry }) {
  const router = useRouter();
  const [title, setTitle] = useState(entry?.title ?? defaultTitle());
  const [body, setBody] = useState(entry?.body ?? "");
  const [selected, setSelected] = useState<string[]>(entry?.tags ?? []);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    store.listTags().then(setAllTags);
  }, []);

  function toggle(tag: string) {
    setSelected(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  }

  async function save() {
    const input = { title: title.trim() || defaultTitle(), body: body.trim(), tags: selected };
    if (entry) await store.updateEntry(entry.id, input);
    else await store.createEntry(input);
    router.push("/entries");
  }

  async function remove() {
    if (!entry || !confirm("Delete this entry?")) return;
    await store.removeEntry(entry.id);
    router.push("/entries");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <Link href="/entries" className="text-sm text-cyan">
        &larr; Entries
      </Link>
      <h1 className="title-glow mt-3 mb-6 text-3xl font-bold">{entry ? "Edit entry" : "New entry"}</h1>

      <div className="card flex flex-col gap-4 p-5">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="field text-lg font-semibold" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind?"
          rows={12}
          className="field resize-y"
        />

        <div>
          <p className="mb-2 text-sm uppercase tracking-widest text-blue-200/60">Tags</p>
          {allTags.length === 0 ? (
            <p className="text-blue-200/60">
              No tags yet.{" "}
              <Link href="/tags" className="text-cyan underline">
                Create some
              </Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button key={tag} type="button" onClick={() => toggle(tag)} className={`chip ${selected.includes(tag) ? "chip-on" : ""}`}>
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={save} className="btn" disabled={!body.trim()}>
            Save
          </button>
          {entry && (
            <button onClick={remove} className="text-sm text-blue-200/60 hover:text-cyan">
              Delete
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
