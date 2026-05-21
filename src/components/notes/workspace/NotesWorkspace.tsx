"use client";

import DesktopNotesWorkspace from "@/components/notes/workspace/DesktopNotesWorkspace";
import MobileNotesWorkspace from "@/components/notes/workspace/MobileNotesWorkspace";
import { Reference, Project } from "@/db/schema";
import type { NoteDetails } from "@/components/notes/card/noteCardTypes";

type WorkspaceProps = {
  dataList: NoteDetails[];
  references: Reference[];
  projects: Project[];
  userId: string;
};

export default function NotesWorkspace(props: WorkspaceProps) {
  return (
    <>
      <div className="block lg:hidden">
        <MobileNotesWorkspace {...props} />
      </div>

      <div className="hidden lg:block">
        <DesktopNotesWorkspace {...props} />
      </div>
    </>
  );
}
