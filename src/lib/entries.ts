export type Entry = {
  id: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type EntryInput = Pick<Entry, "body" | "tags">;

export interface EntryStore {
  list(): Promise<Entry[]>;
  create(input: EntryInput): Promise<Entry>;
  update(id: string, input: EntryInput): Promise<Entry>;
  remove(id: string): Promise<void>;
}

const KEY = "dat-s-journal:entries";

function read(): Entry[] {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Entry[]) : [];
}

function write(entries: Entry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export const localStore: EntryStore = {
  async list() {
    return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(input) {
    const now = new Date().toISOString();
    const entry: Entry = { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now };
    write([entry, ...read()]);
    return entry;
  },

  async update(id, input) {
    const entries = read();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Entry not found");
    entries[index] = { ...entries[index], ...input, updatedAt: new Date().toISOString() };
    write(entries);
    return entries[index];
  },

  async remove(id) {
    write(read().filter((e) => e.id !== id));
  },
};

export function parseTags(text: string): string[] {
  const tags: string[] = [];
  for (const part of text.split(",")) {
    const tag = part.trim().toLowerCase().replace(/^#/, "");
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
}
