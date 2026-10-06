"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { store } from "@/lib/entries";

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    store.listTags().then(setTags);
  }, []);

  async function add() {
    if (!name.trim()) return;
    setTags(await store.addTag(name));
    setName("");
  }

  async function remove(tag: string) {
    if (!confirm(`Delete #${tag}? It will be removed from all entries.`)) return;
    setTags(await store.removeTag(tag));
  }

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <Link href="/" className="text-sm text-cyan">
        &larr; Home
      </Link>
      <h1 className="title-glow mt-3 mb-6 text-3xl font-bold">Add tag</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="card mb-8 flex flex-col gap-3 p-5 sm:flex-row"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name"
          className="field"
        />
        <button type="submit" className="btn" disabled={!name.trim()}>
          Add
        </button>
      </form>

      <h2 className="mb-3 text-sm uppercase tracking-widest text-blue-200/60">All tags</h2>
      {tags.length === 0 && <p className="text-blue-200/60">No tags yet.</p>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="chip flex items-center gap-2">
            #{tag}
            <button onClick={() => remove(tag)} aria-label={`Delete ${tag}`} className="text-blue-200/60 hover:text-cyan">
              &times;
            </button>
          </span>
        ))}
      </div>
    </main>
  );
}
