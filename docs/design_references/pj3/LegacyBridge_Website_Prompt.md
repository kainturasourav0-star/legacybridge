# LegacyBridge Website — Reusable Design and Implementation Prompt

You are a senior product designer, frontend engineer, and accessibility-focused QA engineer. Build or refine a production-quality website for **LegacyBridge**, an evidence-based legacy-code modernization product. Use the existing repository when available and preserve working functionality. The result should closely reproduce the structure and visual language of the Axis software landing page while improving usability, responsiveness, accessibility, and product clarity.

Reference design:
https://www.aura.build/templates/axis-software-landing-page

Do not deliver a loose “inspired by” landing page. Match the reference’s actual composition, spacing, dark surfaces, typography, product mockups, perspective scenes, long-form section sequence, and footer treatment. Adapt all content to LegacyBridge rather than copying Axis product copy.

## 1. Product narrative

LegacyBridge helps teams understand and modernize business-critical legacy systems without hiding uncertainty.

Use this five-stage workflow consistently:

**DISCOVER → UNDERSTAND → PLAN → MIGRATE → VALIDATE**

Core product themes:

- Legacy code intelligence and dependency mapping
- Business-rule recovery with source-linked evidence
- Editable migration planning and proposed service boundaries
- Reviewable scaffold previews
- Behavioral-validation evidence and targeted regression-test previews
- A Business Logic Drift Detector that compares legacy and proposed rules, identifies possible behavior changes, and previews targeted regression tests
- Human approval before consequential changes

Clearly separate responsibilities:

- **LegacyBridge Intelligence** is the proposed own engine for source analysis, dependency mapping, business-rule recovery, architecture planning, scaffold previews, and supported test generation.
- **TinyFish Migration Research Agent** is limited to source-linked external documentation research. It does not inspect confidential source code and does not automatically convert an application.
- Never send confidential source, credentials, or secrets to the external research path.
- Untrusted code execution belongs in an isolated worker, not in ordinary web-server requests.

## 2. Provider exclusions

**Do not include OpenRouter or Pinecone anywhere.**

Remove and do not reintroduce:

- Their names, logos, cards, links, ticker entries, or legal-copy references
- Their packages, API keys, environment variables, or integrations
- OpenRouter-branded reasoning features

Where the layout needs a reasoning/intelligence card, use **LegacyBridge Intelligence** and describe the proposed own source-analysis and migration-planning engine. Do not substitute another external model provider merely to fill space.

## 3. Implementation constraints

For an existing React/Vite repository:

- Preserve React, Vite, React Router, the existing dashboard, authentication screens, and current styling conventions.
- Do not migrate the application to another framework just because Next.js appears in the proposed product stack.
- Preserve conditional Clerk integration:
  - `/login`
  - `/sign-up`
  - `/dashboard`
- When Clerk is not configured, retain an honest UI-preview authentication flow. Preview credentials must not be checked, transmitted, or stored.
- Do not add fake backend calls or imply that a UI interaction executed a real modernization job.
- Keep everything needed for the interface local. Use bundled fonts and inline SVG/CSS visuals rather than depending on remote images.

## 4. Visual system

Use this design direction:

- Background: near-black `#050505`
- Panels: restrained `#0c0d0f` to `#111214`
- Text: white-to-transparent gradient headings with muted gray body copy
- Typography: Inter, tight tracking, large desktop hero type around 92px, responsive smaller sizes
- Borders: subtle low-opacity white
- Accent colors: restrained blue-violet, green, and amber only where meaningful
- Generous vertical spacing and max-width content containers around 1200px
- Rounded pill navigation and CTA elements
- Subtle grid textures, radial glows, vertical light beams, and sparse particles
- Perspective and tilt used for product visuals, not for body copy
- Motion must be smooth but restrained and disabled under `prefers-reduced-motion`

Do not add bright gradients, excessive glassmorphism, colorful marketing illustrations, generic stock photos, invented customer logos, or unrelated visual effects.

## 5. Required landing-page structure

### A. Fixed navigation

- LegacyBridge brand on the left
- Centered pill navigation: Product, Method, Security, Research, Roadmap
- Log in and Sign up actions on the right
- Accessible mobile menu
- Closed mobile-menu controls must not remain keyboard-focusable
- Anchor targets must account for the fixed header
- Roadmap must target the actual migration visualization, not the footer

### B. Hero

- Large two-line white-gradient headline: “The new standard for legacy modernization”
- Gray supporting copy about understanding rules, planning boundaries, and validating behavior
- White pill “Start building” CTA
- Secondary Business Logic Drift Detector link
- Subtle vertical glow and particles
- Large tilted dark product interface with a clearly labeled illustrative dependency graph, business-rule rows, research insight, and human-review state

### C. Proposed technology strip

Use only relevant entries such as:

- Next.js
- TinyFish
- Supabase
- Clerk
- Vercel
- PostgreSQL
- GitHub Actions
- Docker

Label the strip as a proposed stack. Do not imply live integrations. Repeated ticker entries used for animation must be hidden from assistive technology. Pause the ticker on hover and respect reduced motion.

### D. Feature cards

Create three spacious Axis-style cards:

1. Purpose-built for legacy intelligence
2. Designed to expose drift
3. Crafted for human approval

Use CSS/SVG product visuals and accessible expand/collapse controls for supporting detail.

### E. Dual intelligence and research panels

- Legacy Intelligence: candidate boundaries, rule evidence, and local review state
- TinyFish Research: official-documentation research, source-linked findings, and an explicit statement that no confidential source is inspected
- Research preview must remain local unless a real integration is implemented and disclosed

### F. Migration direction

- Large “Set the migration direction” heading
- Editable-planning and human-ownership copy
- A perspective timeline containing the five explicit stages:
  DISCOVER, UNDERSTAND, PLAN, MIGRATE, VALIDATE
- Include proposed boundaries, checkpoints, and review states without suggesting automatic migration success

### G. Evidence artifacts

- Interactive Rule evidence and Regression tests tabs
- Source-linked rule preview
- Targeted regression-test preview marked “NOT EXECUTED”
- Supporting artifact categories: candidate rules, dependency maps, service contracts, drift reports

### H. Business Logic Drift Detector

- Compare original and proposed business rules
- Provide working illustrative filters for All findings, Drift risk, and Review needed
- Include a correctly sized validation graph and local approval controls
- Approval controls must explicitly state that no source code or migration was changed
- Never imply that passing a targeted test proves full behavioral equivalence

### I. Workflows and integrations

Include:

- **LegacyBridge Intelligence** — proposed source analysis, business-rule recovery, and migration planning; link internally to the method section
- **TinyFish Research** — external documentation research with cited findings
- **Supabase Evidence** — proposed private project data and traceable reports
- **GitHub Actions** — proposed repository workflows for supported checks
- **Isolated Workers** — required boundary for untrusted-code execution

External cards may link to official documentation. The LegacyBridge Intelligence card must use an internal link, not an external provider link. Make horizontal scrolling keyboard-focusable and add scroll snapping without introducing page-level overflow.

### J. Foundations

Use an accordion and technical visualization for:

- Source Intelligence
- Secure by Design
- Human Governance

Describe security controls as architectural requirements unless repository evidence verifies their implementation.

### K. Footer

Include:

- Brand and concise modernization description
- Product, Method, Resources, and Subscribe columns
- Dashboard and authentication links
- Prototype/status disclosures
- Privacy Policy and Terms & Conditions links
- A subscription interaction that explicitly sends no data in preview mode

## 6. Additional routes

### Privacy Policy — `/privacy`

Create a polished legal page in the same Axis visual language with:

- Fixed navigation and legal-page switcher
- Gradient hero, last-updated date, and reading time
- Sticky desktop table of contents and usable mobile layout
- Prototype-specific explanations of preview authentication, local form behavior, hosting logs, optional Clerk processing, external links, retention, security, and user choices
- No invented company address, contact email, legal entity, or operational data practices

Also support `/privacy-policy` as a redirect.

### Terms & Conditions — `/terms`

Include:

- Prototype status and acceptance
- Responsible use
- Illustrative output and mandatory human review
- Third-party documentation and services
- User content and authorization
- Availability and disclaimers
- Liability, changes, and contact through the project’s official channel

Also support `/terms-and-conditions` as a redirect.

Both pages must have responsive layouts, unique document titles, correct route scroll restoration, and a clear way back to the website.

## 7. Chart and SVG reliability

Avoid overly broad selectors such as `.ax-validation-chart svg`, which can accidentally enlarge header icons.

Use direct-child selectors for actual charts, for example:

```css
.ax-validation-chart > svg {
  width: 100%;
  max-width: 100%;
  height: 250px;
  max-height: 250px;
}

.ax-validation-chart-head svg {
  width: 12px;
  height: 12px;
}

.ax-site svg.lucide {
  flex: 0 0 auto;
}
```

Audit every SVG at desktop and mobile widths. Only intentional chart SVGs should be large. All icons must retain their explicit dimensions and must not stretch inside flex layouts.

## 8. Accessibility and responsive behavior

- Use semantic headings, navigation, forms, buttons, tabs, tabpanels, and accordion controls.
- Provide `aria-expanded`, `aria-controls`, `aria-selected`, `aria-pressed`, labels, and live status text where appropriate.
- Ensure visible keyboard focus and logical tab order.
- Respect reduced motion.
- Prevent hidden mobile-menu links from receiving focus.
- Test at 1440, 1024, 768, 390, and 360px widths.
- No page-level horizontal overflow. Intentional horizontal integration scrolling must remain inside its own container.
- Preserve readable type, adequate spacing, and usable tap targets on small screens.

## 9. Truthfulness and content rules

Do not invent:

- Customers, users, team members, affiliations, awards, or commercial traction
- Accuracy, performance, market-share, or migration-success metrics
- Implemented repository analysis, real scaffold writes, test execution, or live external integrations
- Security certifications or guarantees
- Research findings or benchmarks

Use visible labels such as **SAMPLE**, **ILLUSTRATIVE**, **SIMULATED**, **PROPOSED**, and **NOT EXECUTED** as appropriate.

A proposed service boundary is not universally correct. Generated tests are not executed results. Passing targeted tests would not prove complete behavioral equivalence. Human review is always required.

## 10. Improvements beyond the reference

Do not stop at a visual clone. Improve the experience by:

- Correcting anchor offsets and route scroll restoration
- Making the five-stage workflow explicit
- Keeping charts and icons properly bounded
- Providing useful legal pages rather than placeholder links
- Making repeated ticker content accessible
- Adding keyboard-friendly, scroll-snapping integration cards
- Maintaining clear distinctions between the own engine and external research
- Preserving dashboard and authentication behavior during landing-page work

## 11. Required validation

Before considering the work complete:

1. Run the production build successfully.
2. Search the entire active source for `OpenRouter`, `openrouter`, `Pinecone`, and `pinecone`; there must be no matches.
3. Test all landing interactions:
   - Feature details
   - Evidence tabs
   - Drift filters
   - Local approval states
   - Research preview
   - Foundations accordion
   - Footer subscription preview
   - Mobile navigation
4. Test `/privacy`, `/terms`, both long-url redirects, legal cross-links, table-of-contents anchors, and return-to-website navigation.
5. Verify `/login`, `/sign-up`, and `/dashboard` still work.
6. Confirm no browser console errors, page errors, duplicate IDs, or unexpected external requests.
7. Confirm no page-level overflow at all target widths.
8. Visually review desktop and mobile screenshots of the hero, migration scene, graphs, integrations, footer, and both legal pages.
9. Run any existing dashboard regression suite without weakening its assertions.

Deliver a polished, working implementation—not a static screenshot, a loose inspiration board, or a collection of placeholder controls.
