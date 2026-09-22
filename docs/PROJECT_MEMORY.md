# Skylar Project Memory

Last reviewed: 2026-09-22

This file is the short working memory for the current repository. The seven
copied project documents in this folder remain the detailed product,
technical, design, delivery, testing, and decisions references.

## Product Direction

Skylar is an HR Briefing Room, not a generic dashboard and not a permanent
chat application. The main experience is an ordered daily briefing that guides
the user through the next important HR action. People and Documents are direct
access areas, secondary to the briefing.

The active application roles are only:

- `admin`: can manage employee records and notes.
- `employee`: provisioned workspace user with no admin mutations.

There is no active `super_admin`, manager, advisor, or Skylar Team role in the
current code. Advisor and company administration roles remain future decisions.

## Implemented Now

- Firebase passwordless email-link authentication.
- Active-user email allowlist before requesting a magic link.
- Secure server session cookies and protected server-rendered routes.
- Server-side role and company authorization.
- Real Firestore-backed `users`, `employees`, and
  `employee_ledger_entries` data.
- Daily Briefing starter flow.
- People index and employee profile pages.
- Employee creation and profile editing for admins.
- Employee-linked note creation for admins.
- Inline note editing and admin-confirmed deletion for notes.
- Admin-confirmed employee deletion, including attached ledger records while
  preserving the provisioned Firebase identity.
- Searchable employee selection when creating a note.
- Documents index and saved record detail pages.
- Account menu, logout, quick actions, and Ask Skylar UI surface.
- Top loading progress indicator.
- Responsive custom UI with lightweight transitions and no blur animation.
- Six-beat Live-in-5 flow for an empty admin workspace: workspace context,
  employee creation, situation, clarifying context, plan, and filed state.
- Live-in-5 uses a dedicated `/onboarding` route so creating the first employee
  cannot replace the remaining beats with the normal Briefing page.
- Live-in-5 beat 2 creates the employee through the server action, and beat 5
  saves the first real ledger note through the server action.
- Employee profile metadata: copied work email, state, last updated date,
  role, and location.
- Unit and integration test foundation for auth, schemas, guards, and errors.

## Important Current Decisions

- Use admin/employee roles only.
- `ahmed.fayyaz@artilence.com` is the admin account.
- Employee creation, profile updates, and note creation are admin-only and
  enforced on the server.
- Only provisioned active email addresses may request a sign-in link.
- Employee notes belong in the unified employee ledger.
- Documents are ledger records, not a separate document-vault product.
- Ask Skylar is a future assistant surface; it is not connected to Claude yet.
- Avoid blur-heavy transitions. Keep motion subtle and performant.
- Keep profile metadata compact and avoid duplicate note information in the
  employee header.

## Main Routes

| Route | Current purpose |
| --- | --- |
| `/login` | Passwordless email sign-in |
| `/verify` | Completes the Firebase email link |
| `/briefing` | Daily Briefing starter flow |
| `/onboarding` | Direct Live-in-5 flow for testing and first-run entry |
| `/deferred` | Deferred view, currently needs real persistence |
| `/people` | Employee index |
| `/people/new` | Create employee flow |
| `/people/[employeeId]` | Employee profile and saved notes |
| `/notes/new` | Create note flow |
| `/documents` | Ledger/document index |
| `/documents/[documentId]` | Ledger record detail |

## Remaining Product Work

### Highest priority

- Add company creation during signup and connect the flow to a new workspace,
  rather than only starting it for an existing empty admin workspace.
- Integrate Anthropic Claude with streaming responses.
- Build real conversation cards, clarifying questions, plans, and transcripts.
- Create server-side Briefing ordering and `/api/briefing/today`.
- Persist `NEXT` and `NOT NOW` behavior, including defer-to-tomorrow logic.
- Connect Ask Skylar to a real assistant backend.

### Employee memory and risk

- Generate and regenerate AI employee summaries after ledger changes.
- Support conversation, review, hire, document, and amendment ledger events.
- Add long-press employee navigation from briefing cards.
- Add PDF employee-file export.
- Add risk classification and high-risk card state.
- Build the 900ms escalation hold, cancel, sealed state, case ID, advisor
  assignment, queue, email notification, response status, and analytics.
- Decide the keyboard-accessible equivalent for press-and-hold escalation.

### Platform and business

- Add reviewed Firestore security rules and cross-tenant isolation tests.
- Add Stripe Checkout, Customer Portal, webhooks, trial gating, and billing.
- Add manager/company seat invites if the role model is expanded later.
- Build marketing/signup pages.
- Add production Vercel, Firebase domains, Anthropic, Resend, and Sentry
  configuration.
- Add monitoring, scheduled Firestore backups, rollback, and support process.
- Add Capacitor iOS/Android builds, push notifications, deep links, and store
  release work.
- Finalize Terms of Service, Privacy Policy, UAT owner, advisor access, and
  production project ownership.

## Verification State

`npm run typecheck`, `npm run lint`, and `npm test` pass.

Current test result: 8 test files and 55 tests passing.

## Source Documents

- [Product requirements](01-product-requirements.md)
- [Design implementation guide](02-design-implementation-guide.md)
- [Technical implementation spec](03-technical-implementation-spec.md)
- [Ahmed onboarding/build guide](04-ahmed-onboarding-build-guide.md)
- [Delivery plan/backlog](05-delivery-plan-backlog.md)
- [Testing/release/operations](06-testing-release-operations.md)
- [Open decisions/traceability](07-open-decisions-traceability.md)
- [Engineering architecture](SKYLAR_ENGINEERING_ARCHITECTURE_v4.md)
