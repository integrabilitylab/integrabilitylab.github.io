import { toMetadataText } from "./math.ts";

interface PublicationData {
  title: string;
  authors: string[];
  year: number;
  summary?: string;
  venue?: string;
}

export function publicationDescription(data: PublicationData): string {
  return toMetadataText([
    data.title,
    data.authors.join(", ") + " (" + data.year + ")",
    data.summary || data.venue,
  ].filter(Boolean).join(". "));
}
