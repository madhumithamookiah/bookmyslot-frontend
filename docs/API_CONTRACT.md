# BookMySlot API Contract — current inventory

This file records the current transport conventions and action inventory. It is **not yet a complete OpenAPI specification**: request/response schemas and per-action error/auth requirements still need to be documented and verified against the handlers. Do not assume a shape is guaranteed just because a frontend TypeScript type exists.

## Base URL

- Local development: Vite proxies `/api/*` to the backend dev server on `http://localhost:3000`.
- Production: set `VITE_API_BASE_URL` to the deployed backend origin, with no trailing slash. Requests are then sent to `${VITE_API_BASE_URL}/api/...`.
- Do not hard-code a hosting URL in source code. The hosting provider supplies the deployment URL; custom domains are optional.

## Current endpoints

| Method | Path | Purpose / notes |
|---|---|---|
| GET or POST, action-dependent | `/api/db?action=<action>` | Main JSON API dispatcher; see action inventory below. The exact method and body vary by action and must be checked in the backend handler. |
| POST | `/api/send-receipt` | Sends a booking receipt email. |
| POST | `/api/send-cancellation` | Sends a cancellation email. |
| POST | `/api/send-verification-code` | Sends a verification code email. |
| GET | `/api/smtp-status` | SMTP status endpoint; restrict access if it exposes operational details. |

### `/api/db` action inventory

`ping`, `login`, `logout`, `me`, `initiate_signup`, `verify_signup`, `resend_verification_code`, `request_password_reset`, `verify_password_reset`, `provision_organization`, `set_organization_status`, `get_organizations`, `get_organization`, `save_organization`, `get_organization_settings`, `save_organization_settings`, `get_organization_entitlements`, `get_sports`, `save_sport`, `get_facilities`, `save_facility`, `get_users`, `save_user`, `save_pending_verification`, `delete_pending_verification`, `get_bookings`, `save_booking`, `get_restricted_slots`, `save_restricted_slot`, `delete_restricted_slot`, `get_announcements`, `save_announcement`, `delete_announcement`, `get_audit_logs`, `get_platform_dashboard`, `get_platform_organizations`, `get_platform_organization`, `get_subscription_plans`, `get_platform_subscriptions`, `get_organization_subscription`, `change_organization_plan`, `set_organization_subscription_status`, `get_platform_users`, `get_platform_user_details`, `set_platform_user_status`, and `get_platform_analytics`.

## Authentication and cross-origin behavior

The current frontend sends bearer/session-token headers and `credentials: 'include'`. The backend must allow only the intended frontend origin(s) through `FRONTEND_ORIGIN` and must be deployed over HTTPS. Cross-site cookies may require `SameSite=None; Secure`; verify the actual cookie implementation and browser behavior after deployment.

## Contract change rule

For each action, document: method, path/action, query parameters, request JSON schema, success JSON schema, error status/body, authentication/role requirements, and tenant/organization constraints. Update both repositories and add contract tests whenever the behavior changes. Consider generating a formal OpenAPI document after the action schemas have been verified.
