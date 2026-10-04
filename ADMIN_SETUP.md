# Private portal

Open `/su` directly. There are no admin links in the trader interface and the page is marked noindex.

The portal requires these **server-only** environment variables (never NEXT_PUBLIC):

- `ADMIN_EMAIL`: the administrator's email.
- `ADMIN_PASSWORD_HASH`: a 64-character hexadecimal SHA-256 hash of the administrator's strong, unique password.
- `ADMIN_SESSION_SECRET`: a cryptographically random secret of at least 32 characters.

Use a password manager or a local secret-management tool to create the values. Do not commit them. Restart the server after configuration. Authenticated sessions last eight hours and use signed, HttpOnly, SameSite cookies. Without configuration the portal stays closed. The in-process login throttle is for this single-process deployment; a multi-instance deployment should add a shared rate-limit store or use an identity provider.

The portal currently shows this browser's real workspace. It does not claim to manage users or subscriptions without a connected database.
