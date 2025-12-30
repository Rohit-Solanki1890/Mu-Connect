# 🎨 Global Spacing & Layout System

## 📐 Overview

This document outlines the centralized spacing system for the Mu-Connect application. The goal is to ensure consistent, professional UI with balanced spacing across all pages and components.

---

## 🏗️ Current Structure

```
Layout (sticky header + responsive grid)
├── Header (top navigation - sticky)
├── Main Content (max-width container)
│   ├── Left Sidebar (lg: col-span-3) - Navigation
│   ├── Center (lg: col-span-6) - Pages/Content
│   └── Right Sidebar (lg: col-span-3) - Trends
└── Footer (optional)
```

---

## 📏 Spacing Standards

### **1. Page/Section Padding**
Standard padding for outer containers:

```tailwind
/* Desktop */
px-4 sm:px-6 lg:px-8    /* Horizontal: 16px → 24px → 32px */
py-4 sm:py-6 lg:py-8    /* Vertical: 16px → 24px → 32px */

/* Mobile-optimized */
px-3 sm:px-4 lg:px-6    /* Mobile-first: 12px → 16px → 24px */
py-3 sm:py-4 lg:py-6
```

### **2. Component Spacing**
Spacing between child components:

```tailwind
gap-4 sm:gap-6 lg:gap-8     /* Gap between grid items */
space-y-4 sm:space-y-6      /* Vertical spacing in flex column */
space-x-2 sm:space-x-3      /* Horizontal spacing in flex row */
```

### **3. Section Dividers**
Spacing between major sections:

```tailwind
mb-6 sm:mb-8 lg:mb-10       /* After section headers */
mt-6 sm:mt-8                /* Before new major sections */
pb-4 sm:pb-6                /* Inside sections before divider */
border-b border-gray-200 dark:border-gray-700
```

### **4. Card/Component Internal Spacing**
```tailwind
p-3 sm:p-4 lg:p-6           /* Card padding */
space-y-3 sm:space-y-4      /* Content spacing inside cards */
```

---

## 🎯 Responsive Breakpoints

```tailwind
Mobile   (default)     : No prefix (320px+)
sm:      (640px+)     : Tablets portrait
md:      (768px+)     : Tablets landscape
lg:      (1024px+)    : Desktops
xl:      (1280px+)    : Large desktops
2xl:     (1536px+)    : Ultra-wide
```

**Mobile-first approach:** Always start with mobile styles, then scale up!

---

## 📱 Implementation Examples

### **Example 1: Page Container**
```tsx
// Before (Inconsistent)
<div className="px-4 py-6 mx-auto">
  <div className="mb-8">
    <h1 className="text-3xl mb-4">Title</h1>
  </div>
</div>

// After (Consistent & Responsive)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
  <div className="mb-6 sm:mb-8">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Title</h1>
  </div>
</div>
```

### **Example 2: Grid Layout**
```tsx
// Before
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card />
</div>

// After (Consistent gap scaling)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
  <Card />
</div>
```

### **Example 3: Card Component**
```tsx
// Before
<Card className="p-4">
  <div className="space-y-2">
    <h3 className="mb-3">Title</h3>
    <p>Content</p>
  </div>
</Card>

// After
<Card className="p-4 sm:p-6">
  <div className="space-y-3 sm:space-y-4">
    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Title</h3>
    <p className="text-gray-600 dark:text-gray-400">Content</p>
  </div>
</Card>
```

---

## 🏗️ New Layout Structure

### **Wrapper Components** (Centralize padding)

```tsx
// Container wrapper for max-width consistency
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* All page content */}
</div>

// Section wrapper for vertical spacing
<div className="py-6 sm:py-8 border-b border-gray-200 dark:border-gray-700">
  {/* Section content */}
</div>

// Card/grid spacing
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {/* Items */}
</div>
```

---

## 🎨 Color & Styling Consistency

### **Text Hierarchy**
```tailwind
h1: text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white
h2: text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white
h3: text-lg sm:text-xl font-semibold text-gray-900 dark:text-white
p:  text-base text-gray-700 dark:text-gray-300
small: text-sm text-gray-600 dark:text-gray-400
```

### **Interactive Elements**
```tailwind
/* Buttons */
button: px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg transition-colors

/* Input fields */
input: px-3 sm:px-4 py-2 rounded-lg border dark:bg-gray-800

/* Hover states */
hover:bg-gray-100 dark:hover:bg-gray-700
hover:shadow-lg transition-shadow duration-200
```

---

## ✅ Spacing Checklist

Before committing code, check:

- [ ] Page has `max-w-7xl mx-auto` wrapper
- [ ] Padding uses responsive scale: `px-4 sm:px-6 lg:px-8`
- [ ] Gaps between grid items: `gap-4 sm:gap-6 lg:gap-8`
- [ ] Sections separated with `mb-6 sm:mb-8` or `border-b`
- [ ] Card padding: `p-4 sm:p-6` (not just `p-4`)
- [ ] Mobile view tested (320px width)
- [ ] Tablet view tested (640px width)
- [ ] Desktop view tested (1024px+ width)
- [ ] Dark mode classes present on all text (`dark:text-white`)
- [ ] No hardcoded fixed widths (except containers)

---

## 🎯 Best Practices

### **DO's** ✅
- Start with mobile-first spacing
- Use responsive prefixes for all major spacing
- Keep consistent spacing ratios (4-6-8 scale)
- Use `max-w-7xl` for page width consistency
- Add `dark:` variants to all text/background colors
- Test across mobile, tablet, and desktop
- Use Tailwind utilities, not custom CSS

### **DON'Ts** ❌
- Don't use fixed pixel spacing in inline styles
- Don't mix `gap-2` with `gap-6` without breakpoints
- Don't forget responsive variants
- Don't hardcode colors without dark mode
- Don't use `p-4` universally; scale with breakpoints
- Don't add padding to pages directly; use wrapper
- Don't mix `space-y-` with manual `mb-` on children

---

## 📚 File Structure Best Practices

```
src/
├── components/
│   ├── Layout.tsx          (Main layout - handles page structure)
│   ├── ui/
│   │   ├── Card.tsx        (Base card with padding)
│   │   ├── Button.tsx      (Styled button)
│   │   ├── Input.tsx       (Form input)
│   │   └── Container.tsx   (Wrapper component - NEW)
│   └── ...
├── pages/
│   ├── feed/
│   │   └── FeedPage.tsx    (Uses Container wrapper)
│   ├── messages/
│   │   └── MessagesPage.tsx
│   └── ...
└── styles.css              (Tailwind imports)
```

---

## 🔧 Utility Classes to Add

Add to `tailwind.config.js`:

```javascript
extend: {
  spacing: {
    'page': '1.5rem',      // Page horizontal padding
    'section': '1rem',     // Section vertical padding
    'component': '0.5rem', // Component internal padding
  },
  maxWidth: {
    'container': '1280px', // Standard max-width
  }
}
```

Then use:
```tailwind
px-page sm:px-6 lg:px-8
py-section
max-w-container
```

---

## 📊 Spacing Reference Table

| Scale | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| **Page Padding (X)** | px-8 | px-6 | px-4 |
| **Page Padding (Y)** | py-8 | py-6 | py-4 |
| **Section Gap** | gap-8 | gap-6 | gap-4 |
| **Component Padding** | p-6 | p-5 | p-4 |
| **Text Spacing** | space-y-6 | space-y-5 | space-y-4 |
| **Header Height** | h-16 | h-14 | h-14 |
| **Sidebar Width** | w-72 | hidden | hidden |

---

## 🚀 Quick Implementation Checklist

1. **Apply to Layout.tsx:**
   - [ ] Wrap main content in `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
   - [ ] Update sidebar gaps to responsive `gap-4 sm:gap-6`
   - [ ] Add responsive padding to main grid

2. **Update Pages:**
   - [ ] Feed Page
   - [ ] Messages Page
   - [ ] People Page
   - [ ] Profile Page
   - [ ] Search Page
   - [ ] Rooms Page

3. **Standardize Components:**
   - [ ] Card: `p-4 sm:p-6`
   - [ ] Button: responsive padding
   - [ ] Input: responsive padding
   - [ ] Avatar: consistent sizing

4. **Test Coverage:**
   - [ ] Mobile (320px)
   - [ ] Tablet (768px)
   - [ ] Desktop (1024px+)
   - [ ] Dark mode
   - [ ] Responsive behavior

---

## 💡 Example: Refactored Layout.tsx

See `LAYOUT_REFACTORED_EXAMPLE.tsx` for complete before/after example.

---

**Last Updated:** December 29, 2025  
**Version:** 1.0
