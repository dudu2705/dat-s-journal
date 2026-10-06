"use client";

import dynamic from "next/dynamic";

const EntryForm = dynamic(() => import("../../entry-form"), { ssr: false });

export default function NewEntryPage() {
  return <EntryForm />;
}
