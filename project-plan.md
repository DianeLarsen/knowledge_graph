# Knowledge Graph Project Plan

## Project Name

Knowledge Graph

## Project Summary

Knowledge Graph is a local-first note-linking app that helps users create, organize, search, and connect notes. Instead of treating notes as isolated documents, the app lets users build relationships between ideas using tags and note-to-note links. The goal is to make stored knowledge easier to explore, especially when ideas connect across topics.

## Target User

The target user is someone who takes notes for learning, writing, research, technical projects, or personal knowledge management. This could include students, developers, writers, or anyone who wants a structured way to connect ideas over time.

## Problem It Solves

Most note systems make it easy to write information down but harder to see how ideas connect. This project solves that by allowing notes to be linked, tagged, searched, and explored through relationships. It helps users find related ideas, identify unconnected notes, and build a more useful personal knowledge system.

## Version 1 Core Features

Version 1 will include:

- Create, view, edit, and delete notes
- Add tags to notes
- Link one note to another note
- View outgoing links from a note
- View backlinks to a note
- Search notes by title and content
- Filter notes by tag
- View orphan notes that do not have any links
- View most-linked notes
- View related notes based on shared tags

## Out of Scope for Version 1

The following features will not be included in Version 1:

- User authentication
- Multi-user collaboration
- Cloud sync
- AI-generated links or summaries
- Rich text editing
- Drag-and-drop graph canvas
- Real-time updates
- Mobile app support

## Tech Stack

- Next.js
- TypeScript
- SQL
- SQLite
- Drizzle ORM
- Tailwind CSS

## Project Goals

The main goal is to build a portfolio-ready application that demonstrates database design, SQL relationships, Drizzle ORM usage, and practical TypeScript development. The project should be easy to run locally, easy to explain, and structured well enough that future features could be added without rewriting the foundation.

## Success Criteria

The project will be considered successful when a user can create notes, organize them with tags, link related notes, search existing notes, and view meaningful relationship-based results such as backlinks, orphan notes, and most-linked notes.