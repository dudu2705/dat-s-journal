export type Entry = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type EntryInput = Pick<Entry, "title" | "body" | "tags">;

export interface JournalStore {
  listEntries(): Promise<Entry[]>;
  getEntry(id: string): Promise<Entry | null>;
  createEntry(input: EntryInput): Promise<Entry>;
  updateEntry(id: string, input: EntryInput): Promise<Entry>;
  removeEntry(id: string): Promise<void>;
  listTags(): Promise<string[]>;
  addTag(name: string): Promise<string[]>;
  removeTag(name: string): Promise<string[]>;
}

const ENTRIES_KEY = "dat-s-journal:entries";
const TAGS_KEY = "dat-s-journal:tags";

function readEntries(): Entry[] {
  const raw = localStorage.getItem(ENTRIES_KEY);
  return raw ? (JSON.parse(raw) as Entry[]) : [];
}

function writeEntries(entries: Entry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

function readTags(): string[] {
  const raw = localStorage.getItem(TAGS_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

function writeTags(tags: string[]) {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

export function normalizeTag(name: string): string {
  return name.trim().toLowerCase().replace(/^#/, "");
}

export function defaultTitle(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const localStore: JournalStore = {
  async listEntries() {
    return readEntries().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getEntry(id) {
    for (const entry of readEntries()) {
      if (entry.id === id) return entry;
    }
    return null;
  },

  async createEntry(input) {
    const now = new Date().toISOString();
    const entry: Entry = { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now };
    writeEntries([entry, ...readEntries()]);
    return entry;
  },

  async updateEntry(id, input) {
    const entries = readEntries();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Entry not found");
    entries[index] = { ...entries[index], ...input, updatedAt: new Date().toISOString() };
    writeEntries(entries);
    return entries[index];
  },

  async removeEntry(id) {
    writeEntries(readEntries().filter((e) => e.id !== id));
  },

  async listTags() {
    return readTags().sort();
  },

  async addTag(name) {
    const tag = normalizeTag(name);
    const tags = readTags();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
      writeTags(tags);
    }
    return tags.sort();
  },

  async removeTag(name) {
    const tags = readTags().filter((t) => t !== name);
    writeTags(tags);
    const entries = readEntries();
    for (const entry of entries) {
      entry.tags = entry.tags.filter((t) => t !== name);
    }
    writeEntries(entries);
    return tags.sort();
  },
};

export const store: JournalStore = localStore;
