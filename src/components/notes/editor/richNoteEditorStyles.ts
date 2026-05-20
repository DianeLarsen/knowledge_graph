export const editorHeights = "min-h-[220px] md:min-h-[260px] xl:min-h-[300px]";

export const proseStyles = `
  [&_.ProseMirror]:min-h-[220px]
  md:[&_.ProseMirror]:min-h-[260px]
  xl:[&_.ProseMirror]:min-h-[300px]
  [&_.ProseMirror]:outline-none
  [&_.ProseMirror_p]:my-2
`;

export const markStyles = `
  [&_.ProseMirror_a]:rounded
  [&_.ProseMirror_a]:px-1
  [&_.ProseMirror_a]:underline

  [&_.tag-mark]:rounded
  [&_.tag-mark]:px-1
  [&_.tag-mark]:underline
  [&_.tag-mark]:decoration-dotted
  [&_.tag-mark]:underline-offset-2

  [&_.reference-mark]:rounded
  [&_.reference-mark]:bg-amber-50
  [&_.reference-mark]:px-1
  [&_.reference-mark]:text-amber-800
  [&_.reference-mark]:underline
  [&_.reference-mark]:decoration-dotted
  [&_.reference-mark]:underline-offset-2
  dark:[&_.reference-mark]:bg-amber-900/30
  dark:[&_.reference-mark]:text-amber-200
`;
