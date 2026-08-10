# EviMersin Dashboard UI Handbook

A practical guide for building and maintaining the admin dashboard UI. Follow these rules so every new screen matches the existing design.

---

## 1. Brand colors

All brand colors live in `src/app/globals.css` as CSS variables. **Always use these variables** instead of inventing new colors.

| Token | Hex | Use for |
|-------|-----|---------|
| `--brand-navy` | `#1B2A4A` | Headings, primary text, hero panels |
| `--brand-red` | `#E31C23` | Primary actions (Save, Add, Delete confirm) |
| `--brand-blue` | `#2563EB` | Links, focus rings, info accents, eyebrow labels |
| `--muted` | `#6B7280` | Descriptions, subtitles, table headers |
| `--foreground` | `#1A1A1A` | Body text (rare in dashboard) |
| `--background` | `#FFFFFF` | Page/card backgrounds |

### Hover colors (hardcoded)

| Base | Hover |
|------|-------|
| `--brand-red` | `#C9181E` |
| `--brand-blue` | `#1D4ED8` |

### Surface & border colors (dashboard neutrals)

These are used consistently across panels. Do not replace with random grays.

| Role | Hex | Usage |
|------|-----|-------|
| Page loading bg | `#F4F6F9` | Full-page loading states |
| Card border | `#E8EEF6` | Panels, cards, modals |
| Row divider | `#EEF2F7` | Table rows, topbar border |
| Input border | `#DBE3EF` / `#DBE4F0` | Text inputs, selects |
| Input background | `#F8FAFC` | Default input fill |
| Hover row | `#FAFBFD` | Table row hover |
| Placeholder | `#94A3B8` | Input placeholders |

### Feedback colors

| State | Border | Background | Text |
|-------|--------|------------|------|
| Error | `#FECACA` | `#FEF2F2` | `#B91C1C` |
| Success | `#BBF7D0` | `#F0FDF4` | `#15803D` |
| Warning | `#FDE68A` | `#FFFBEB` | `#92400E` |
| Info | `#BFDBFE` | `#EFF6FF` | `var(--brand-blue)` |

### Status badge colors

| Status | Background | Text |
|--------|------------|------|
| Active | `#ECFDF5` | `#047857` |
| Inactive | `#F1F5F9` | `#64748B` |
| Featured | `#EFF6FF` | `var(--brand-blue)` |
| Hot deal | `#FFF7ED` | `#C2410C` |

---

## 2. Typography

**Font:** Poppins (loaded in `src/app/layout.tsx`)

| Role | Classes |
|------|---------|
| Page title | `text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]` |
| Eyebrow label | `text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-blue)]` |
| Section title | `text-[15px] font-semibold text-[var(--brand-navy)]` |
| Description | `text-[14px] text-[var(--muted)]` |
| Form label | `text-[12px] font-semibold text-[var(--brand-navy)]` |
| Input text | `text-[14px] text-[var(--brand-navy)]` |
| Button text | `text-[13px] font-semibold` |
| Table header | `text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]` |
| Table body | `text-[13px]` |
| Badge | `text-[11px] font-semibold` |

---

## 3. Layout structure

```
DashboardShell (gradient backdrop)
├── DashboardSidebar (glass, 250px desktop)
└── Main panel (white, rounded on desktop)
    ├── DashboardTopbar (h-16)
    └── Content area (scrollable)
        └── Your panel / page
```

### Key files

| File | Purpose |
|------|---------|
| `src/app/dashboard/layout.tsx` | Auth + shell wrapper |
| `src/features/dashboard/components/DashboardShell.tsx` | Gradient + grid layout |
| `src/features/dashboard/components/DashboardSidebar.tsx` | Navigation |
| `src/features/dashboard/components/DashboardTopbar.tsx` | Header bar |
| `src/features/dashboard/components/DashboardContent.tsx` | Tab routing |

### Content area padding

```html
px-4 py-5 sm:px-6 lg:px-8 lg:py-7
```

### Page section spacing

Use `space-y-6` between major blocks (header → alerts → card → footer actions).

---

## 4. Shell & sidebar

### Gradient backdrop

Defined inline in `DashboardShell.tsx`:

```css
linear-gradient(135deg, #1b2a4a 0%, #2563eb 42%, #7c9cff 68%, #e31c23 100%)
```

Plus radial overlays in navy, blue, and red at low opacity.

### Main content panel (desktop)

```html
bg-white lg:rounded-[28px] lg:shadow-[0_20px_60px_rgba(15,23,42,0.22)]
```

### Glass sidebar

```css
background: rgba(255, 255, 255, 0.16);
backdrop-filter: blur(28px);
border: 1px solid rgba(255, 255, 255, 0.22);
box-shadow: 0 12px 40px rgba(15, 23, 42, 0.18);
border-radius: 28px; /* desktop */
width: 250px; /* desktop */
```

Sidebar text: white at 75–90% opacity. Active item: white background at ~15% + inset border.

---

## 5. Components

### 5.1 Standard card / panel

Use this for every content block:

```html
<div class="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
  <!-- content -->
</div>
```

For table wrappers, omit inner padding and use `overflow-hidden` on the card.

### 5.2 Page header pattern

Every dashboard tab should start like this:

```tsx
<div>
  <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-blue)]">
    Settings
  </p>
  <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
    Website Settings
  </h1>
  <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">
    Short description of what this page does.
  </p>
</div>
```

For lookup lists, use `LookupListLayout` from `LookupManager.tsx` — it includes this header + Add button + card wrapper.

### 5.3 Buttons

**Primary (red) — Save, Add, Submit**

```html
<button class="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70">
  Save settings
</button>
```

**Secondary (outline) — Cancel**

```html
<button class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc]">
  Cancel
</button>
```

**Primary (blue) — secondary actions**

```html
<button class="inline-flex h-10 items-center justify-center rounded-full bg-[var(--brand-blue)] px-4 text-[13px] font-semibold text-white hover:bg-[#1d4ed8]">
  Action
</button>
```

**Destructive outline — Delete**

```html
<button class="rounded-full border border-[#fecaca] px-3 py-1.5 text-[12px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]">
  Delete
</button>
```

**Rule:** Main CTAs are always `rounded-full` (pill shape), height `h-11`.

### 5.4 Form inputs

Use `TextInput` from `LookupManager.tsx` when possible.

Manual markup:

```html
<label class="block">
  <span class="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
    Email
  </span>
  <input
    class="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[var(--brand-blue)] focus:bg-white"
  />
</label>
```

**Select:** same classes as input + custom chevron if needed.

**Textarea:**

```html
<textarea class="w-full rounded-xl border border-[#dbe4f0] bg-white px-3.5 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)]"></textarea>
```

**Checkbox accent:** `text-[var(--brand-red)] focus:ring-[var(--brand-red)]`

### 5.5 Alerts

**Error**

```html
<div class="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
  Error message here
</div>
```

**Success**

```html
<div class="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] font-medium text-[#15803d]">
  Saved successfully.
</div>
```

Place alerts **above** the submit button, with `mt-4` spacing.

### 5.6 Tables

**Wrapper:** inside standard card with `overflow-x-auto`.

**Header row:**

```html
<thead class="border-b border-[#e8eef6] bg-[#f8fafc] text-[12px] uppercase tracking-[0.06em] text-[var(--muted)]">
  <th class="px-4 py-3 font-semibold">Column</th>
</thead>
```

**Body row:**

```html
<tr class="border-b border-[#eef2f7] last:border-b-0">
  <td class="px-4 py-3 text-[13px] text-[var(--brand-navy)]">Value</td>
</tr>
```

Use `StatusBadge` and `RowActions` from `LookupManager.tsx` for consistency.

### 5.7 Modals & drawers

| Component | File | Max width |
|-----------|------|-----------|
| Side drawer | `SideDrawer.tsx` | `max-w-lg` |
| Search drawer | `DashboardSearchDrawer.tsx` | `max-w-md` |
| Delete confirm | `ConfirmDeleteDrawer` in LookupManager | `max-w-md` |
| Email OTP modal | `EmailVerificationModal.tsx` | `max-w-md` |

**Overlay:** `bg-black/40` (or `/35`–`/45`)

**Panel shadow:** `shadow-[0_24px_80px_rgba(15,23,42,0.28)]`

**Modal title:** `text-[1.25rem] font-bold text-[var(--brand-navy)]`

**Footer buttons:** `flex-col-reverse gap-3 sm:flex-row sm:justify-end` (Cancel left, primary right on desktop)

**Mobile modals:** `rounded-t-[28px]` bottom sheet style when full-width on small screens.

### 5.8 Badges

```html
<span class="inline-flex rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-semibold text-[#047857]">
  Active
</span>
```

Use `StatusBadge` component — do not hand-roll status colors.

---

## 6. Border radius & shadows

### Border radius

| Value | Use for |
|-------|---------|
| `rounded-full` | Buttons, pills, search inputs, badges |
| `rounded-[28px]` | Shell panels, sidebar, modals, hero cards |
| `rounded-[24px]` | Standard content cards |
| `rounded-2xl` | Image previews, nested cards |
| `rounded-xl` | Inputs, alerts, thumbnails |
| `rounded-lg` | Small image previews in tables |

### Shadows

| Shadow | Use for |
|--------|---------|
| `shadow-[0_8px_30px_rgba(15,23,42,0.04)]` | Default cards |
| `shadow-[0_20px_60px_rgba(15,23,42,0.22)]` | Main content panel |
| `shadow-[0_24px_80px_rgba(15,23,42,0.28)]` | Modals / drawers |
| `shadow-[0_16px_40px_rgba(15,23,42,0.18)]` | Overview hero card |

---

## 7. Reusable components (use these first)

**File:** `src/features/dashboard/components/lookups/LookupManager.tsx`

| Export | When to use |
|--------|-------------|
| `LookupListLayout` | List pages with table + Add button |
| `LookupFormLayout` | Create/edit forms with back link |
| `TextInput` | Any labeled text/number/email field |
| `StatusSelect` | Active/Inactive dropdown |
| `LookupTable` | Standard data table |
| `RowActions` | Edit + Delete row buttons |
| `StatusBadge` | Active/Inactive pill |
| `FormLoading` | Loading placeholder |
| `ConfirmDeleteDrawer` | Delete confirmation |

### Example: new settings-style panel

```tsx
export function MyPanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
          My Panel
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">
          Description here.
        </p>
      </div>

      {/* Form card */}
      <form className="max-w-3xl rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <section>
          <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">
            Section title
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="Field" value="" onChange={() => {}} />
          </div>
        </section>

        <button
          type="submit"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e]"
        >
          Save
        </button>
      </form>
    </div>
  );
}
```

Reference implementations:

- **Settings form:** `SettingsPanel.tsx`
- **Hero slides:** `HeroSlidesPanel.tsx`
- **Lookup list:** `CategoriesPanel.tsx`
- **Complex form:** `forms/ProductForm.tsx`

---

## 8. Common issues & fixes

### Wrong colors on new pages

**Problem:** Using Tailwind defaults like `text-gray-600`, `border-gray-200`, `bg-blue-500`.

**Fix:** Replace with brand tokens:
- `text-[var(--muted)]` not `text-gray-500`
- `border-[#e8eef6]` not `border-gray-200`
- `bg-[var(--brand-red)]` not `bg-red-500`

### Buttons look different from rest of dashboard

**Problem:** `rounded-lg`, `rounded-md`, or square buttons.

**Fix:** Primary/secondary actions use `rounded-full` and `h-11`.

### Inputs look flat or wrong on focus

**Problem:** White background always, no focus state, or `ring` instead of border change.

**Fix:** Default `bg-[#f8fafc]`, on focus `focus:border-[var(--brand-blue)] focus:bg-white`.

### Page feels cramped or inconsistent spacing

**Problem:** Random `mt-2`, `mb-8`, mixed gaps.

**Fix:**
- Page sections: `space-y-6`
- Form grids: `gap-4`
- Card padding: `p-5 sm:p-6`

### Table doesn't match other lists

**Problem:** Custom table styling per panel.

**Fix:** Copy from `LookupTable` or use `LookupListLayout` + `LookupTable`.

### Modal z-index conflicts

**Problem:** Dropdown or sidebar appears above modal.

**Fix:** Use established z-index layers:
- Sidebar mobile overlay: `z-50`
- Delete drawer: `z-[80]`
- Side drawer / search: `z-[90]`
- Email verification modal: `z-[100]`

### Images not showing in dashboard previews

**Problem:** Using raw `next/image` for `/uploads/...` paths.

**Fix:** Use `SafeImage` from `src/components/ui/SafeImage.tsx` — it handles upload paths and missing files.

### Form validation errors from API

**Problem:** Empty optional fields sent as `null` in FormData.

**Fix:** Coerce null to empty string in API routes (`formData.get("field") ?? ""`) and use `z.preprocess` in Zod schemas for nullable form fields.

### New tab not appearing in dashboard

**Fix checklist:**
1. Add tab id to `src/features/dashboard/data.ts`
2. Add case in `DashboardContent.tsx`
3. Add nav item in `DashboardSidebar.tsx` (with permission if needed)
4. Create panel component in `src/features/dashboard/components/`

---

## 9. Do's and don'ts

### Do

- Use CSS variables for brand colors
- Reuse `LookupManager` components for CRUD pages
- Keep page titles at `1.75rem` bold navy
- Use red for primary destructive/confirm actions
- Use blue for links, focus states, and eyebrow labels
- Test mobile: sidebar drawer, modal bottom sheets, table horizontal scroll
- Match existing panels before inventing new layouts

### Don't

- Don't use `tailwind.config` custom colors — project uses CSS variables in `globals.css`
- Don't use sharp corners on main CTAs (no `rounded-md` buttons)
- Don't use pure black `#000` for text — use `--brand-navy`
- Don't put forms directly on the gradient background — always inside white card/panel
- Don't skip error/success alert styling — users need consistent feedback
- Don't hardcode localhost URLs for images — store `/uploads/...` paths in DB

---

## 10. Quick copy-paste cheat sheet

```tsx
// Page wrapper spacing
<div className="space-y-6">

// Standard card
className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6"

// Page title
className="text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]"

// Description
className="text-[14px] text-[var(--muted)]"

// Primary button
className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e]"

// Input
className="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] focus:border-[var(--brand-blue)] focus:bg-white"

// Error alert
className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]"
```

---

## 11. File map

```
src/
├── app/
│   ├── globals.css              ← Brand CSS variables
│   └── dashboard/
│       ├── layout.tsx           ← Dashboard shell entry
│       └── page.tsx             ← Tab router
├── features/dashboard/
│   ├── data.ts                  ← Nav items & tab IDs
│   └── components/
│       ├── DashboardShell.tsx
│       ├── DashboardSidebar.tsx
│       ├── DashboardTopbar.tsx
│       ├── DashboardContent.tsx
│       ├── SettingsPanel.tsx    ← Form panel example
│       ├── HeroSlidesPanel.tsx  ← Table + modal example
│       └── lookups/
│           └── LookupManager.tsx ← Shared UI primitives
└── components/ui/
    └── SafeImage.tsx            ← Upload image component
```

---

*Last updated: matches EviMersin dashboard as of project conventions in `globals.css` and `LookupManager.tsx`.*
