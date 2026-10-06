"use client";

import Link from "next/link";
import { useState } from "react";
import { ImportedEntry, ImportResult, store } from "@/lib/entries";
import { parsePenzu } from "@/lib/penzu";

export default function ImportPage() {
  const [items, setItems] = useState<ImportedEntry[] | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onFile(file: File | undefined) {
    setResult(null);
    if (!file) return;
    setItems(parsePenzu(await file.text()));
  }

  async function run() {
    if (!items) return;
    setResult(await store.importEntries(items));
    setItems(null);
  }

  let range = "";
  if (items && items.length > 0) {
    const dates = items.map((i) => i.createdAt).sort();
    range = `${new Date(dates[0]).toLocaleDateString()} – ${new Date(dates[dates.length - 1]).toLocaleDateString()}`;
  }

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <Link href="/entries" className="text-sm text-cyan">
        &larr; Entries
      </Link>
      <h1 className="title-glow mt-3 mb-6 text-3xl font-bold">Import</h1>

      <div className="card flex flex-col gap-4 p-5">
        <p className="text-blue-100/80">Choose a Penzu TXT export. Entries keep their original dates. Importing the same file twice won&apos;t create duplicates.</p>
        <input type="file" accept=".txt,text/plain" onChange={(e) => onFile(e.target.files?.[0])} className="field" />

        {items && items.length === 0 && <p className="text-blue-200/60">No entries found in that file.</p>}

        {items && items.length > 0 && (
          <>
            <p>
              Found <span className="text-cyan">{items.length}</span> entries ({range}).
            </p>
            <div>
              <button onClick={run} className="btn">
                Import {items.length} entries
              </button>
            </div>
          </>
        )}

        {result && (
          <p>
            Imported <span className="text-cyan">{result.added}</span> entries
            {result.skipped > 0 && `, skipped ${result.skipped} already here`}.{" "}
            <Link href="/entries" className="text-cyan underline">
              View entries
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
