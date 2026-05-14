import { Tag } from "@/db/schema";

export type QuickTag = Pick<Tag, "id" | "name" | "color"> & {
  noteCount: number;
};

export type QuickReference = {
  id: string;
  title: string;
  type: string;
  author?: string | null;
  publisher?: string | null;
  publishedDate?: string | null;
  url?: string | null;
  citation?: string | null;
};

export type QuickNote = {
  id: string;
  title: string;
  content: string | null;
};