This directory contains integration endpoints (placeholders) for workplace apps.

Scaffolded providers:
- google-calendar
- calendly
- slack
- hubspot
- salesforce
- oauth/start (common OAuth entry)

Notes:
- All routes are runtime=nodejs and force-dynamic.
- They return 501 NOT_IMPLEMENTED with no-store caching.
- Implement providers with official SDKs and signed/OAuth flows only.
