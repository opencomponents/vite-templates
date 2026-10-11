---
'create-oc': patch
---

Redesigned scaffold example shared by every template. The server drops the
fake user database for `name` + `year` parameters with a tiny fun-fact lookup
 backing a single `funFact` action, and the UI becomes a modern greeting card
(dark hero, white card, year pill, full-width button) with button loading and
inline error states on the action call.
