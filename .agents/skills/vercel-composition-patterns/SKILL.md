---
name: vercel-composition-patterns
description: React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on tasks involving compound components, render props, context providers, or component architecture. Includes React 19 API changes.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid
boolean prop proliferation by using compound components, lifting state, and
composing internals. These patterns make codebases easier for both humans and AI
agents to work with as they scale.

## When to Apply

Reference these guidelines when:

- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture
- Working with compound components or context providers

## Rule Categories by Priority

| Priority | Category                | Impact | Prefix          |
| -------- | ----------------------- | ------ | --------------- |
| 1        | Component Architecture  | HIGH   | `architecture-` |
| 2        | State Management        | MEDIUM | `state-`        |
| 3        | Implementation Patterns | MEDIUM | `patterns-`     |
| 4        | React 19 APIs           | MEDIUM | `react19-`      |

## Quick Reference

### 1. Component Architecture (HIGH)

- [architecture-avoid-boolean-props](./rules/architecture-avoid-boolean-props.md) - Don't add boolean props to customize behavior; use composition
- [architecture-compound-components](./rules/architecture-compound-components.md) - Structure complex components with shared context

### 2. State Management (MEDIUM)

- [state-decouple-implementation](./rules/state-decouple-implementation.md) - Provider is the only place that knows how state is managed
- [state-context-interface](./rules/state-context-interface.md) - Define generic interface with state, actions, meta for dependency injection
- [state-lift-state](./rules/state-lift-state.md) - Move state into provider components for sibling access

### 3. Implementation Patterns (MEDIUM)

- [patterns-explicit-variants](./rules/patterns-explicit-variants.md) - Create explicit variant components instead of boolean modes
- [patterns-children-over-render-props](./rules/patterns-children-over-render-props.md) - Use children for composition instead of renderX props

### 4. React 19 APIs (MEDIUM)

> **⚠️ React 19+ only.**

- [react19-no-forwardref](./rules/react19-no-forwardref.md) - Don't use `forwardRef`; use `ref` as a normal prop and use `use()` instead of `useContext()`

## How to Use

Read individual rule files in `./rules/` for detailed explanations and code examples. Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and architectural reasoning
