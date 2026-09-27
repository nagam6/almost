# REQ02 — Permissions & Anonymity

## All Most — Museum of Mistakes

**Scope:** MVP
**Depends on:** REQ01

### Who can see what?

| Record / Action             | Student                     | Teacher         |
| --------------------------- | --------------------------- | --------------- |
| Own submissions             | See & edit                  | See             |
| Other students' submissions | See mistake, **not author** | See             |
| Published exhibits          | See                         | See & manage    |
| Own progress                | See                         | —               |
| Class members               | See class                   | See own classes |
| Student identities          | Hidden from classmates      | Visible         |

### Anonymity

When a student submits a mistake:

* Other classmates **cannot see who submitted it**.
* The student who submitted it **can see that it is theirs**.
* The teacher of that class **can see the author's identity**.
* The system stores the author's identity.

**Classroom anonymity ≠ anonymity from the teacher or system.**

### Access Rules

**Students:**

* Can access only classes they joined.
* Can see their own progress.
* Can submit mistakes to their classes.
* Cannot access another student's private information or progress.

**Teachers:**

* Can access only their own classes.
* Can review and manage submissions from their classes.
* Can see the identity of students who submitted mistakes.

### Completion Checklist

* [ ] Classmates cannot see submission authors
* [ ] Authors can see their own submissions
* [ ] Teachers can see submission authors
* [ ] Students can access only their classes and progress
* [ ] Teachers can access only their own classes
* [ ] Anonymity rules are documented
