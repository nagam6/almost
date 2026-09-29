# REQ02 — Access & Privacy

| Role | Access |
| --- | --- |
| Visitor | Browse published rooms and teacher exhibits; sign in to submit an answer or use Fix the AI. |
| Student | Submit one saved first answer per exhibit version, view their own result, and make unsaved practice attempts. |
| Teacher | Manage only their own exhibits and view aggregate, anonymous answer results. |

The correct choice and explanation are withheld until a student's first submission. Teacher summaries show counts and choice distribution without exposing student names, emails, IDs, or written reasoning. The API checks role and exhibit ownership; the Teacher role is self-selected during registration in this demo and is not identity-verified.

AI challenge creation and checking happen through the backend. Student-entered code is checked as text, never executed. API keys stay on the server.
