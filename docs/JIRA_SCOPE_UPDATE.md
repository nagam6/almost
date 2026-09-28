# Almost Jira scope update — shared museum demo

Planning IDs here are labels in the imported backlog, not actual Jira issue keys.
Find the corresponding Jira issue before changing its status. This is a suggested
scope correction, not proof that all original acceptance criteria passed.

## Current product contract
- Anyone can browse published exhibits in the shared museum.
- Registration offers Student or Teacher. The demo does not verify teacher identity.
- Students submit a first diagnosis; only then do they see choice-specific feedback
  and the corrected solution. Their own attempts remain private.
- Teachers author complete drafts, preview, publish, archive, and see anonymous
  summaries only for their own exhibits. There are no classroom memberships or
  student-submission review queues in this demo.
- Draft -> Published -> Archived. Existing attempts and reveal snapshots are kept.
  Published content is not edited in place; manual corrections require a new exhibit.

## Jira edits
| Planning IDs | Suggested Jira change |
| --- | --- |
| REQ01–REQ05 | Update scope and role journeys to the shared museum; remove class join/review prerequisites. |
| AUTH07 | Revise criterion: public self-selected teacher role is allowed for this demo; verification is a later extension. |
| CLS01–CLS06, SUB01–SUB06 | Move to Out of scope for the demo; leave records, do not label Done. |
| MOD01–MOD02, MOD05–MOD06 | Teacher review of student submissions is Out of scope. The teacher-authored editor is covered by MOD07. |
| MOD03 | Mark according to actual criterion: teacher supplies choices, exactly one diagnosis is correct, each choice has feedback, and a corrected solution/explanation is provided. Manual educational correctness review remains MOD08. |
| MOD04 | Publish and archive work. Correction/version workflow beyond a new exhibit is pending: do not mark the full original task Done. |
| MOD07 / AL-51 | Teacher creates a complete draft and publishes to the shared museum. Teacher ownership and authorization are checked on the API. Done after the merged PR and demo test. |
| MOD08 | Check the content of each actual demo exhibit and avoid identifying details. Pending manual review. |
| LRN02, LRN05 | Add per-choice feedback after first attempt; it is never in the public pre-attempt API. Older published exhibits continue to use the general explanation. |
| ANA01–ANA05 | Reword class-specific criteria to aggregates across an owner's exhibits; check each task against actual UI/API before marking Done. |
| QA06 | Replace classroom journey with teacher creates/publishes -> student answers -> reveal -> anonymous teacher stats after refresh. |

Next practical work: run the real browser demo on new content, review MOD08 content,
and prepare the online API + frontend link. Jira edits may be split among existing
issues; this document does not create new issue keys or mark statuses automatically.
