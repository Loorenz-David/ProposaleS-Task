# UI Styling and Component System

- **Applicability:** CONDITIONAL
- **Intent:** One styling mechanism, one place for visual values, and a shared-primitive layer that stays small and generic.
- **Applies when:** writing or changing any markup or styling; adding a shared UI primitive; promoting a component out of a feature; considering a component library, an icon set, or a design-system abstraction.
- **Does not imply:** a design system, a component library, or a theming layer. None of those exists, and none is required.
- **Related:** [05-client-architecture.md](05-client-architecture.md) (component responsibility, accessibility), [03-feature-architecture.md](03-feature-architecture.md) §3 (where code lives), [16-design-prototype-porting.md](16-design-prototype-porting.md) (translating a prototype's styling)

This contract owns *how UI looks in code*. It owns nothing about *what the UI does*: component responsibility, state, and accessibility behavior are [05-client-architecture.md](05-client-architecture.md).

## 1. Styling mechanism

**Tailwind CSS is the styling mechanism for production UI.** Utility classes in the markup are the default and the norm; a component's visual definition is readable in the component file.

Recorded in [README.md](README.md) "Decided for the frontend". Tailwind is configured for production UI; this rule does not require a retroactive rewrite of the existing CSS-Modules foundation (see §6).

Rules:

- New production UI is styled with Tailwind utility classes.
- A second styling mechanism is not introduced beside it. CSS-in-JS libraries, styled-components, Emotion, SCSS, and utility wrappers around Tailwind are prohibited.
- Long class lists are acceptable. They are not a reason to invent an abstraction; extracting a component is how repetition is removed, not extracting a class-name constant.
- Conditional class-name composition uses a small utility created inside the feature that first needs it. No file exists yet, and no `clsx`/`classnames` dependency is added for it; it is promoted to `src/components/ui/` only when §4's promotion rule is actually met.

## 2. Design tokens (the Tailwind theme layer)

`src/styles/theme.css` is the **single definition of visual values** (color, type scale, spacing, radii, shadows, motion). It is Tailwind's own theme layer (`@theme` / `@theme static`), not a separate mechanism wired onto Tailwind — declaring a value there both defines it once and makes it available to utility classes. It exists, is small, and stays small.

- Values are defined once, in the theme file, and never duplicated into a JavaScript config or repeated as literals in components.
- A value is added when a second consumer needs it, not in anticipation.
- Building a larger token taxonomy (semantic layers, component-level tokens, multi-theme scales) is prohibited until repeated product patterns demand it. One flat set of values is the target.
- Raw values in markup (`text-[#1f5eff]`, `p-[13px]`) are a signal the value is either a theme entry or an accident. Prefer a theme entry; use an arbitrary value only for a genuinely one-off measurement.

## 3. Inline styles

The `style` prop is reserved for values that **cannot be known at build time**:

| Allowed | Prohibited |
|---|---|
| A panel width the user is dragging | Static colors, spacing, typography, borders, radii |
| A computed transform or offset | A "theme" expressed as a style object |
| Runtime positioning (popover coordinates, virtualized item offsets) | Conditional visual variants that a class could express |
| A CSS custom property set from a runtime value (`style={{ "--panel-w": px }}`) | Any style that would be identical on every render |

The rule is: if the value is the same on every render, it is a class. Style objects as the general styling architecture are prohibited — this is the most common shape a prototype arrives in ([16-design-prototype-porting.md](16-design-prototype-porting.md) §4).

Global CSS in `src/styles/globals.css` is limited to the reset, base element typography, the focus treatment, and the reduced-motion treatment. Feature-specific rules do not go there.

## 4. Shared primitives (`src/components/ui/`)

`src/components/ui/` holds **generic, domain-free** presentational primitives ([03-feature-architecture.md](03-feature-architecture.md) §3). Today: none. The first primitive is created only when the promotion rule below is actually met.

Promotion rule, in order:

1. A component starts inside the feature that needs it (`features/<x>/components/`).
2. It is promoted to `src/components/ui/` when a **second feature** actually uses it, or when it exists specifically to carry an interaction/accessibility contract used across features (dialog, tabs, popover).
3. "It looks reusable" is not a reason. Anticipated reuse is the failure mode this rule prevents.

A `src/components/ui/` component MUST NOT: know a domain concept (proposal, block, clarification), fetch anything, import from `features/`, or hold feature workflow state. If it needs one of those, it belongs in the feature.

`src/components/ui/` is not a place to park components that have no other home. A component with exactly one consumer lives beside that consumer.

## 5. Component library and accessible primitives

**Status: decided.** Radix UI Primitives is the adopted headless accessible-primitive library and Lucide React is the adopted icon library ([README.md](README.md) "Resolved decisions"), recorded per [13-decision-checklist.md](13-decision-checklist.md) §5.

- Do not adopt a library because a design tool, a prototype, or a generator assumes one.
- Project-owned components built on native elements are the default and are sufficient for controls whose semantics the platform already provides (`button`, `a`, `input`, `select`, `dialog`, `details`).
- Hand-rolling the semantics of a **composite** widget — modal focus trapping, tab/tablist roving focus, popover positioning with dismissal, combobox — is where accessibility is usually lost ([05-client-architecture.md](05-client-architecture.md) §7). Radix UI Primitives is adopted for exactly this: a composite widget whose semantics a Radix primitive correctly models. It supplies interaction mechanics and accessibility primitives only; it never brings a design system or a pre-styled visual identity with it — styling stays ours, per §1–§3.
- That adoption is an architectural decision: it is recorded in [README.md](README.md) "Resolved decisions" with the widget that justified it, per [13-decision-checklist.md](13-decision-checklist.md) §5.
- Packages are added per milestone for the primitive actually used, never the ecosystem pre-emptively. Each addition is recorded in the consuming phase's Review log with the widget that justified it.
- Scaffolding tools that copy component source into the repository (shadcn-class) are not adopted by this decision; adopting one would require its own recorded decision, and the copied code would then be **our code**: reviewed, styled to our theme layer, and held to every contract in this folder.

## 6. CSS Modules

No CSS-Modules foundation exists in this tree. The scaffold's original three primitives and shell, which used CSS Modules, were deliberately deleted during bootstrap simplification ([README.md](../README.md) "Status"). New UI is Tailwind (§1); a `*.module.css` file introduced outside this rule is a violation of §1, not existing code grandfathered under this section.
