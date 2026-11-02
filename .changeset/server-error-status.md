---
'oc-server': patch
---

`ServerError` now also sets `status` (same value as `statusCode`). The OC registry takes the HTTP status from `err.status`, so errors like `new ServerError(401, '...')` were returned as 500.
