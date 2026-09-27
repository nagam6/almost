# REQ03 — Exhibit Lifecycle & Editing Rules

## All Most — Museum of Mistakes

**Scope:** MVP
**Depends on:** REQ02

### Exhibit States

An exhibit/submission can have these states:

**Draft → Pending Review → Published**

Other possible states:

* **Changes Requested**
* **Rejected**
* **Archived**

### Who can change what?

| Current State     | Action            | Who can do it?     | New State         |
| ----------------- | ----------------- | ------------------ | ----------------- |
| Draft             | Submit for review | Student            | Pending Review    |
| Draft             | Edit              | Student            | Draft             |
| Pending Review    | Request changes   | Teacher            | Changes Requested |
| Pending Review    | Publish           | Teacher            | Published         |
| Pending Review    | Reject            | Teacher            | Rejected          |
| Changes Requested | Edit              | Student            | Changes Requested |
| Changes Requested | Resubmit          | Student            | Pending Review    |
| Rejected          | —                 | No further editing | Rejected          |
| Published         | —                 | No direct editing  | Published         |
| Published         | Archive           | Teacher            | Archived          |

### Student Editing Rules

Students can edit their submissions only when they are:

* **Draft**
* **Changes Requested**

Once a submission is **Published**, the student cannot edit the published exhibit.

### Published Exhibits

A published exhibit that already has student attempts is **immutable**.

This means the existing published content cannot simply be edited because students may already have interacted with it.

If a correction is needed:

**Published Exhibit → Create new version → Publish new version → Archive old version**

The old exhibit remains archived so that previous attempts and history are not changed.

### Simple Lifecycle

```text
Draft
  ↓
Pending Review
  ↓
Published
  ↓
Archived
```

If changes are needed:

```text
Pending Review
  ↓
Changes Requested
  ↓
Student edits
  ↓
Pending Review
```

If rejected:

```text
Pending Review
  ↓
Rejected
```

### Completion Checklist

* [ ] All six states are defined
* [ ] Every transition has a responsible role
* [ ] Students can edit only Draft and Changes Requested submissions
* [ ] Published exhibits with attempts cannot be edited
* [ ] Corrections create a new version
* [ ] The old version is archived
