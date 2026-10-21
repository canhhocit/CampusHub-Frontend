# CAMPUSHUB FRONTEND UX RULES

Design for real users, not screenshots.

## Design direction
- Minimal, trustworthy, modern, and practical.
- The interface should feel like a well-designed marketplace, not an AI-generated dashboard.
- Avoid emoji icons, excessive colors, decorative gradients, glassmorphism, and unnecessary animations.
- Use a consistent design system with restrained colors, typography, spacing, borders, and shadows.
- Prefer familiar interaction patterns over experimental layouts.

## UX priorities
1. Make the most common action easy to find.
2. Reduce unnecessary clicks and repeated data entry.
3. Keep related actions together.
4. Show important status and next steps clearly.
5. Prevent user mistakes with validation and confirmation for destructive actions.
6. Provide clear feedback after every meaningful interaction.
7. Preserve context when users navigate, filter, search, or return to a previous page.

## Implementation requirements
- Inspect the existing page and its API integration before redesigning it.
- Reuse existing business logic and API calls whenever possible.
- Do not replace working features with static prototypes.
- Do not add fake statistics, fake products, fake notifications, or fake locker states.
- Every visible button, menu item, filter, form, and pagination control must work as intended.
- Avoid unnecessary modals. Prefer inline editing or focused forms when they simplify the workflow.
- Use tables for dense administrative data and compact cards when they improve browsing.
- Make forms easy to scan, with clear labels, useful validation, and actionable error messages.
- Support mobile screens around 375–390px, tablets around 768px, and desktop layouts around 1280–1440px.
- Test key flows at different viewport sizes.
- Verify loading, empty, error, and success states.
- Do not introduce a new UI library unless the existing stack cannot reasonably support the requirement.

## Definition of done
A page is not finished just because it looks attractive. Its main user flow must work, its data must come from the correct source, its responsive layout must be usable, and relevant checks must pass.
