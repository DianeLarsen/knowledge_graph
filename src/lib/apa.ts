type ReferenceLike = {
  type?: string | null;
  title: string;
  author?: string | null;
  url?: string | null;
  publisher?: string | null;
  publishedDate?: string | Date | null;
};

function getYear(date?: string | Date | null) {
  if (!date) return "n.d.";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "n.d.";

  return String(parsed.getFullYear());
}

function formatAuthor(author?: string | null) {
  if (!author) return "";

  return author.trim();
}

export function getApaReference(reference: ReferenceLike) {
  const author = formatAuthor(reference.author);
  const year = getYear(reference.publishedDate);
  const title = reference.title.trim();
  const url = reference.url?.trim();

  if (author && url) {
    return `${author}. (${year}). ${title}. ${url}`;
  }

  if (author) {
    return `${author}. (${year}). ${title}.`;
  }

  if (url) {
    return `${title}. (${year}). ${url}`;
  }

  return `${title}. (${year}).`;
}

export function getApaCitation(reference: ReferenceLike) {
  const author = formatAuthor(reference.author);
  const year = getYear(reference.publishedDate);

  if (!author) {
    return `("${reference.title}", ${year})`;
  }

  const firstAuthor = author.split(",")[0].trim();

  return `(${firstAuthor}, ${year})`;
}
