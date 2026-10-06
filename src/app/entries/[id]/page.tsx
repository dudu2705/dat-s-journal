"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Entry, store } from "@/lib/entries";
import EntryForm from "../../entry-form";

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    store.getEntry(id).then((found) => {
      setEntry(found);
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) return null;
  if (!entry) return <p className="p-8 text-center text-blue-200/60">Entry not found.</p>;
  return <EntryForm entry={entry} />;
}
