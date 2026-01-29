---
trigger: always_on
---

# Frontend Rules (Next.js)

## Server vs Client Components

```typescript
// Server Component (default)
// ❌ DO NOT use 'use client'
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
// ✅ Must start with 'use client'
'use client';

export default function Button() {
  const [state, setState] = useState();
  return <button onClick={() => setState()}>{state}</button>;
}
```

---

## Export Rule

> **RULE**: All components must use **default export**.

```typescript
// ✅ CORRECT
export default function ProductCard() {}

// ❌ WRONG
export function ProductCard() {}
export const ProductCard = () => {};
```

---

## Conditional Rendering (Activity)

> **RULE**: Use React's `Activity` component for conditional rendering.

```typescript
import { Activity } from 'react';

// ✅ CORRECT - Using Activity
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <ExpensiveComponent />
</Activity>
<Activity mode={!isVisible ? 'visible' : 'hidden'}>
  <FallbackComponent />
</Activity>

// ❌ WRONG - Ternary or && operator
{isVisible ? <ExpensiveComponent /> : <FallbackComponent />}
{isVisible && <ExpensiveComponent />}
```

**Why Activity?**

- Preserves component state when hidden
- Better performance for toggling visibility
- Component is not unmounted, just hidden

---

## i18n Rules

Translation files: `apps/web/i18n/messages/{locale}.json`

```typescript
// Server Component
import { getTranslations } from "next-intl/server";
const t = await getTranslations("Products");

// Client Component
("use client");
import { useTranslations } from "next-intl";
const t = useTranslations("Products");
```
