# Schema Plan

## Main Entities

The app will use four main tables:

- notes
- tags
- note_tags
- note_links

These tables support notes, many-to-many tagging, and note-to-note relationships.

---

## Notes Table

The `notes` table stores the main content created by the user.

### Fields

- id
- title
- content
- created_at
- updated_at
- deleted_at

### Rules

Each note must have a title. Content can be empty because some notes may start as placeholders or quick ideas.

Notes will use soft delete by setting `deleted_at` instead of immediately removing the row. This makes the app safer because deleting a note by accident should not destroy the data instantly. Because apparently users enjoy deleting things and regretting it five seconds later.

---

## Tags Table

The `tags` table stores reusable labels for organizing notes.

### Fields

- id
- name
- created_at

### Rules

Tag names must be unique.

A tag can exist without any notes attached to it. This makes it possible to create tags ahead of time or keep tags after notes are deleted.

---

## Note Tags Table

The `note_tags` table connects notes and tags.

### Fields

- note_id
- tag_id

### Rules

This table creates a many-to-many relationship between notes and tags.

A note can have many tags.

A tag can belong to many notes.

The combination of `note_id` and `tag_id` should be unique so the same tag cannot be added to the same note more than once.

If a note is deleted, its note-tag records should be removed.

If a tag is deleted, its note-tag records should be removed.

---

## Note Links Table

The `note_links` table stores relationships between notes.

### Fields

- id
- source_note_id
- target_note_id
- relationship_type
- created_at

### Relationship Types

Possible relationship types:

- related
- expands_on
- example_of
- contradicts
- supports

### Rules

A note cannot link to itself.

A note can link to many other notes.

A note can receive links from many other notes.

Backlinks will not be stored separately. They will be calculated by querying links where the current note is the `target_note_id`.

The same source note and target note should not have duplicate links with the same relationship type.

If a note is deleted, links where that note is the source or target should be removed.

---

## Relationships Summary

### notes to note_tags

One note can have many note-tag records.

### tags to note_tags

One tag can have many note-tag records.

### notes to note_links as source

One note can link to many target notes.

### notes to note_links as target

One note can have many backlinks from other notes.

---

## Query Goals

The schema should support these queries:

- Get all notes
- Get one note by id
- Get all tags for a note
- Get all notes with a specific tag
- Get outgoing links from a note
- Get backlinks to a note
- Search notes by title or content
- Find orphan notes with no incoming or outgoing links
- Find most-linked notes
- Find related notes based on shared tags

---

## Design Decisions

### Soft Delete for Notes

Notes will use `deleted_at` instead of being permanently removed right away. This makes it safer and allows possible restore functionality later.

### Backlinks Are Derived

Backlinks will be calculated from the `note_links` table instead of stored separately. Storing backlinks separately would duplicate data and create sync problems. Tiny database gremlins love sync problems.

### SQL Instead of Graph Database

This project will use SQL because the relationship structure is simple enough for relational tables and joins. A graph database would be overkill for Version 1 and would distract from the goal of practicing SQL, Drizzle, and TypeScript.

### SQLite for Local Development

SQLite is a good fit because this is a local-first app. It keeps setup simple and makes the project easy to run without requiring a hosted database.