import { ImportedEntry, defaultTitle } from "./entries";

const STAMP = /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2})(am|pm)$/i;
const RULE = /^-{3,}$/;

function parseStamp(line: string): Date | null {
  const m = STAMP.exec(line.trim());
  if (!m) return null;
  const [, year, month, day, hour, minute, meridiem] = m;
  let h = Number(hour) % 12;
  if (meridiem.toLowerCase() === "pm") h += 12;
  return new Date(Number(year), Number(month) - 1, Number(day), h, Number(minute));
}

// Each entry is: timestamp, blank, title, blank, a line of dashes, then the body.
export function parsePenzu(text: string): ImportedEntry[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const starts: number[] = [];
  for (let i = 0; i + 4 < lines.length; i++) {
    if (
      parseStamp(lines[i]) &&
      lines[i + 1].trim() === "" &&
      lines[i + 3].trim() === "" &&
      RULE.test(lines[i + 4].trim())
    ) {
      starts.push(i);
    }
  }

  const entries: ImportedEntry[] = [];
  for (let n = 0; n < starts.length; n++) {
    const start = starts[n];
    const end = n + 1 < starts.length ? starts[n + 1] : lines.length;
    const date = parseStamp(lines[start]) as Date;
    entries.push({
      title: lines[start + 2].trim() || defaultTitle(date),
      body: lines.slice(start + 5, end).join("\n").trim(),
      tags: [],
      createdAt: date.toISOString(),
    });
  }
  return entries;
}
