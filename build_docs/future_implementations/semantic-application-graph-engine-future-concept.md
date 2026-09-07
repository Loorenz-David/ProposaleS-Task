# Semantic Application Graph Engine
## Future Independent Package / Repository Concept

**Status:** Deferred / future implementation  
**Purpose:** Reusable infrastructure for semantic application navigation, agent interaction, and application-context mapping  
**Initial inspiration:** Proposal Copilot / Proposales frontend  
**Intended form:** Independent repository and eventually a reusable package

---

## 1. Core Idea

Build a reusable **Semantic Application Graph Engine** that allows an application to describe its meaningful product architecture using stable semantic identities rather than DOM structure, component names, CSS selectors, or manually maintained navigation metadata.

Application developers should not have to manually implement separate systems for:

- agent navigation;
- application-map maintenance;
- semantic breadcrumbs;
- session restoration;
- contextual help;
- guided navigation;
- application capability discovery;
- semantic action targeting.

Instead, application features contribute semantic declarations and UI bindings.

The engine validates and compiles those declarations into a normalized **Semantic Application Graph**.

That graph becomes a shared semantic layer between:

- the application;
- the user;
- the agent;
- navigation infrastructure;
- session/runtime context;
- future product-tour/help systems;
- developer tooling.

The goal is that feature developers mostly need to maintain **correct semantic keys, identities, relationships, context schemas, and capabilities**.

The engine owns the infrastructure required to organize and validate the application map.

---

## 2. Long-Term Principle

> Refactoring visual structure should not require refactoring agent knowledge when the underlying product concept has not changed.

The semantic architecture of an application should survive reasonable UI redesigns.

Moving a filter from a sidebar to a toolbar should not require rewriting:

- agent instructions;
- semantic navigation;
- application context;
- session restoration logic;
- contextual help;
- navigation contracts.

The visual implementation may change while the semantic identity remains stable.

---

## 3. The Three-Layer Model

The system should distinguish three layers.

### Layer 1 — Product Semantics

Stable concepts meaningful to the product:

```text
proposal-list
proposal-detail
proposal
customer
filter-proposals
sort-proposals
open-proposal
schedule-follow-up
create-proposal
```

These concepts should be independent of React components and visual layout.

### Layer 2 — Semantic Application Graph

The normalized machine-readable representation of:

- nodes;
- stable identities;
- hierarchy/relationships;
- resources;
- context schemas;
- capabilities;
- actions;
- transitions;
- available semantic operations;
- optional route/address information.

This is the layer produced and validated by the engine.

### Layer 3 — UI Implementation

The current rendering mechanism:

```text
React components
buttons
tabs
dialogs
popovers
tables
routes
toolbars
sidebars
CSS
DOM
```

The UI binds to semantic graph nodes.

The UI does **not** define the application graph merely by existing in a particular DOM hierarchy.

---

## 4. Compilation Model

Conceptually:

```text
Application feature declarations
            │
            ▼
┌──────────────────────────────┐
│ Semantic Application Compiler│
│                              │
│ validates identities         │
│ resolves relationships       │
│ checks schemas               │
│ detects broken references    │
│ discovers capabilities       │
│ normalizes metadata          │
│ builds graph                 │
└──────────────┬───────────────┘
               │
               ▼
      Semantic Application Graph
               │
      ┌────────┼──────────┬───────────┐
      ▼        ▼          ▼           ▼
    Agent    Human      Session     Help/Tour
 navigation navigation   context     systems
```

The exact compiler/runtime API is deferred.

---

## 5. Developer Experience

A feature developer should ideally describe meaningful application concepts without manually maintaining all dependent infrastructure.

Conceptually:

```ts
defineSurface({
  key: "proposal-list",
  // semantic metadata
})

defineCapability({
  key: "filter-proposals",
  // semantic input
})
```

The UI then binds to those semantic concepts:

```tsx
<SemanticNode node="proposal-list.filters.status">
  <StatusFilter />
</SemanticNode>
```

The exact API is deliberately undecided.

The important property is:

> Application semantics are explicitly declared and UI elements bind to them.

The engine should not need developers to manually maintain several parallel maps.

---

## 6. Stable Identity vs Hierarchy

Stable semantic identity must be separated from current hierarchy/layout.

Example:

```text
proposal-list.status-filter
```

may initially render as:

```text
proposal-list
└── sidebar
    └── status-filter
```

and later:

```text
proposal-list
└── toolbar
    └── status-filter
```

The product concept has not changed.

Therefore the semantic identity should remain stable even if visual placement changes.

Hierarchy is graph metadata.

Hierarchy should not automatically become identity.

---

## 7. Do Not Compile Architecture From the DOM

DOM annotations may be useful as UI bindings, but rendered DOM structure must not become the source of truth for application architecture.

Avoid:

```text
Rendered DOM
→ inspect attributes
→ infer application architecture
```

This becomes fragile with:

- portals;
- dialogs;
- conditional rendering;
- virtualization;
- responsive layouts;
- lazy loading;
- server/client component boundaries;
- elements that are temporarily not mounted.

Prefer:

```text
Semantic declarations
        ↓
Semantic Application Graph
        ↓
UI bindings
```

Attributes such as:

```html
data-app-node="proposal-list.filters.status"
```

may eventually be useful for binding, inspection, debugging, tours, or development tools.

They should bind UI to an already-known semantic concept rather than create that concept implicitly.

---

## 8. Semantic Context

The graph should support a structured representation of meaningful application context.

Example:

```ts
{
  surface: "proposal-list",

  context: {
    filters: {
      state: "draft"
    },

    sort: {
      field: "updatedAt",
      direction: "asc"
    }
  },

  focus: {
    kind: "proposal",
    id: "proposal-123"
  }
}
```

This represents:

> what meaningful product context is currently active?

It does not represent arbitrary component state.

---

## 9. Observation and Action Symmetry

A major design goal is to use the same semantic vocabulary for both **input** and **output**.

### Application → Agent

The application may expose:

```ts
{
  surface: "proposal-list",

  context: {
    state: "draft",
    sort: "updated-oldest"
  },

  availableCapabilities: [
    "open-proposal",
    "change-status-filter",
    "change-sort"
  ]
}
```

The agent can reason from this semantic representation.

### Agent → Application

The agent may request:

```ts
{
  intent: "navigate",

  target: {
    surface: "proposal-list",

    context: {
      state: "draft",
      sort: "updated-oldest"
    }
  }
}
```

The application validates the request and converts it into actual UI/navigation state.

Therefore:

> one semantic graph can become both an observation model and an action vocabulary.

---

## 10. Agent Navigation

The agent should not automate arbitrary DOM controls.

Avoid architectures where the model reasons in terms such as:

```text
click button #proposal-options
open menu #sorting
select third row
click second option
```

Prefer:

```text
surface: proposal-list
capability: filter-proposals
status: draft
sort: updatedAt ascending
```

Conceptually:

```text
User intent
    ↓
Agent reasoning
    ↓
Structured semantic request
    ↓
Application boundary
    ↓
Validation / authorization
    ↓
Semantic Application Graph
    ↓
Navigation/runtime change
    ↓
Main Application Surface
```

The application remains responsible for converting semantic intent into UI behavior.

---

## 11. Navigation vs Business Actions

The engine must preserve a strong distinction between navigation and consequential actions.

### Navigation

Examples:

```text
Show draft proposals.
Open proposal X.
Show proposals for customer Y.
Take me to scheduled follow-ups.
```

Navigation modifies application/presentation context.

### Business actions

Examples:

```text
Create proposal.
Modify proposal.
Send email.
Schedule follow-up.
Cancel action.
Delete record.
```

Business actions may create persistent or external effects.

They must continue through the owning application's:

- validation;
- authorization;
- provenance;
- approval;
- domain/service boundaries.

Navigation capability must never imply permission to perform available business actions.

---

## 12. Relationship to Application Sessions

The Semantic Application Context can eventually become the meaningful application portion of a session runtime.

Example:

```text
Session A
├── conversation/workflow
└── application context
    └── Proposal Listing
        ├── status = draft
        └── sort = oldest updated

Session B
├── conversation/workflow
└── application context
    └── Proposal Detail
        └── proposal = XYZ
```

Switching:

```text
A → B → A
```

may restore A's meaningful semantic application context.

It should not restore arbitrary DOM state.

---

## 13. Relationship to Routes

Future applications may map some semantic contexts to routes.

Example:

```text
/proposals?state=draft&sort=updatedAt
```

may correspond to:

```ts
{
  surface: "proposal-list",
  filters: {
    state: "draft"
  },
  sort: {
    field: "updatedAt"
  }
}
```

However:

> route representation and semantic application identity are not necessarily the same thing.

The engine should permit host applications to decide:

- what is route-addressable;
- what belongs in query parameters;
- what belongs only to session/runtime context;
- what is transient;
- what is persistent.

The package should not force one routing library unless that becomes a deliberate adapter.

---

## 14. Relationship to Breadcrumbs

Traditional breadcrumbs are a presentation of hierarchy:

```text
Proposals > Drafts > Acme Renovation
```

They should be treated as one possible projection of the semantic graph.

Conceptually:

```text
Semantic Application Graph
        │
        ├── application UI
        ├── breadcrumbs
        ├── navigation controls
        ├── agent context
        └── session context
```

Not:

```text
Breadcrumb component
        ↓
application architecture
```

---

## 15. Relationship to Guided Tours

Product-tour anchors solve a different problem.

For example:

```html
data-tour="proposal-review"
```

identifies stable surfaces that a walkthrough can highlight.

Semantic application identities describe product architecture and capabilities.

These systems may integrate later, but they should not automatically be the same abstraction.

The semantic graph should also not become a generic testing-ID registry.

---

## 16. Validation and Compiler Responsibilities

A future compiler should be able to detect problems such as:

```text
duplicate semantic identities
orphan nodes
missing parents
invalid references
unreachable surfaces
actions without handlers
invalid capability schemas
resources without stable identities
agent-visible capabilities without semantic descriptions
deprecated nodes still referenced
ambiguous semantic paths
broken aliases
invalid context transitions
```

This makes semantic architecture refactoring explicit and toolable.

A future developer command could conceptually perform:

```text
compile application map
validate application map
visualize application map
diff semantic architecture
```

The exact CLI/API remains deferred.

---

## 17. Refactoring

The desired development experience is:

1. update semantic declarations and/or bindings;
2. run the graph compiler/validator;
3. inspect broken semantic references;
4. intentionally migrate changed product concepts;
5. regenerate or validate dependent artifacts.

If the visual implementation changed but the product concept did not, semantic identities should normally remain unchanged.

If the product concept itself changed, the compiler should help make that semantic migration visible rather than silently guessing.

---

## 18. Potential Generated Artifacts

The graph may eventually support generation or derivation of:

- normalized application map;
- agent navigation schemas;
- agent observation context;
- semantic breadcrumbs;
- contextual command palettes;
- guided navigation metadata;
- contextual help;
- session-restoration schemas;
- route validation;
- developer topology visualizations;
- semantic architecture diffs;
- analytics naming conventions;
- documentation indexes.

These are possibilities, not initial requirements.

---

## 19. Package / Repository Boundary

This engine should be implemented as an **independent repository/package**, not as Proposal Copilot-specific infrastructure.

The Proposal Copilot application can eventually become one consumer/reference implementation.

The package should not know concepts such as:

```text
Proposales
proposal preparation
proposal pricing
ProposalWorkflowState
Proposales API
```

Those belong to host applications.

The engine should provide generic primitives for concepts such as:

```text
surface
resource
context
capability
action
relationship
navigation target
semantic identity
graph
binding
validation
```

Application-specific semantics are supplied by the consumer.

---

## 20. Possible Package Layers

A future package may naturally split into modules such as:

```text
core
├── semantic identity
├── graph schema
├── compiler
├── validation
└── runtime model

react
├── providers
├── bindings
├── hooks
└── semantic-node helpers

agent
├── observation projection
├── navigation/action schema generation
└── semantic request validation

devtools
├── graph inspection
├── graph visualization
├── validation CLI
└── semantic diff tooling

adapters
├── routing adapter(s)
└── optional framework integrations
```

This is only a possible decomposition.

Do not freeze package boundaries until implementation begins.

---

## 21. Framework Independence

The semantic graph core should ideally be framework-independent.

React integration can be a separate adapter/package.

Conceptually:

```text
semantic-graph-core
       │
       ├── React adapter
       ├── Next.js adapter
       ├── agent adapter
       └── developer tooling
```

This increases portability to other projects.

Do not make DOM availability a requirement for compiling or reasoning about the graph.

---

## 22. Security and Trust Boundary

The semantic graph describes what the application knows how to represent or request.

It must not become authorization.

For example:

```text
Graph says:
"send-email" is a known capability.
```

does not mean:

```text
current user/agent is authorized to send email.
```

Host applications remain responsible for authorization and business validation.

The package should make this distinction explicit.

---

## 23. What the Engine Must Not Become

Avoid turning the package into:

### A DOM automation framework

Its purpose is semantic application understanding, not selector-based clicking.

### A universal state manager

It should not own every application's business or React state.

### A router replacement by default

It may integrate with routing but should not necessarily become the application's router.

### An authorization system

Capabilities describe semantics; applications enforce authority.

### An AI-specific framework

Agent integration is an important consumer, but the semantic graph should remain useful without AI.

### A UI component library

It may expose bindings/helpers, but appearance and product composition belong to applications.

---

## 24. Initial Implementation Strategy

Do not attempt to build the complete system immediately.

A future implementation should begin with real requirements from at least one or two applications.

A sensible order could be:

```text
1. semantic identity model
2. graph/node schema
3. declaration API
4. compiler + validation
5. runtime graph
6. React binding layer
7. context representation
8. navigation request/validation
9. agent observation projection
10. developer inspection tools
```

Only add route generation, breadcrumbs, tours, analytics, or other projections when real consumers require them.

---

## 25. Proposal Copilot as First Consumer

Proposal Copilot can provide the first concrete test bed.

Today its architecture is:

```text
Persistent Workspace Shell
├── Agent Surface
└── Main Application Surface
    └── Proposal Preparation
```

Future surfaces might include:

```text
Proposal Listing
Proposal Detail
Customers
Content Library
Schedules
Settings
```

When the second genuine Main Application Surface is implemented, that may be the correct time to prototype the semantic graph.

Possible future semantics:

```text
proposal-preparation
proposal-list
proposal-detail
proposal
filter-proposals
open-proposal
preview-proposal
schedule-follow-up
```

The Proposal Copilot implementation should consume the package.

The package must not be designed as if Proposal Copilot were the only possible host.

---

## 26. Success Criteria

The architecture is successful when:

1. Application developers express product semantics without manually wiring several parallel navigation systems.
2. The engine produces one coherent semantic graph.
3. Human and agent navigation can use the same semantic vocabulary.
4. UI refactors do not break semantic identities when product meaning remains unchanged.
5. Invalid graph relationships are caught mechanically.
6. Host applications retain ownership of business state and authorization.
7. The graph can be consumed without inspecting DOM hierarchy.
8. React is an integration layer rather than the semantic core.
9. The package remains reusable across unrelated applications.
10. Agent knowledge refers to product concepts rather than implementation details.

---

## 27. Central Design Rule

> Anything important enough for an agent, user, or application subsystem to navigate to should have a stable semantic identity independent of its current visual implementation.

And:

> Human navigation and agent navigation should converge on the same semantic application model, while consequential actions continue through the host application's explicit validation, authorization, and approval boundaries.

---

## 28. Deferred Questions

The following should remain open until implementation research begins:

- exact declaration API;
- graph serialization format;
- whether graph compilation is build-time, runtime, or hybrid;
- alias/versioning strategy for semantic identities;
- migration model;
- route adapters;
- React binding API;
- dynamic resource-instance representation;
- capability schema format;
- graph projection supplied to an LLM;
- token-budget-aware graph/context reduction;
- access-control-aware graph projection;
- package/module boundaries;
- generated TypeScript types;
- CLI design;
- devtools visualization;
- server/client graph division;
- static vs dynamic nodes;
- package naming.

Do not answer these speculatively in Proposal Copilot frontend-core work.

They belong to the future independent engine project.
