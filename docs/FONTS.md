# Veloria Vault - Font Documentation

## Font Families Used in This Project

This document lists all the fonts used in the Veloria Vault Next.js frontend for consistent typography across the application.

---

## Primary Fonts

### 1. Playfair Display (Serif)
- **Usage**: Headings, luxury accents, hero titles, section headers
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Styles**: Normal, Italic
- **CSS Variable**: `--font-serif`
- **Fallbacks**: Georgia, 'Times New Roman', serif
- **Use Cases**:
  - Hero section titles ("Luxury Locked In Leather")
  - Section headings ("Hot Seller", "Most Loved Styles")
  - Product names in featured sections
  - Brand name "VELORIA VAULT" in footer

### 2. Inter (Sans-serif)
- **Usage**: Body text, UI elements, navigation, buttons
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **CSS Variable**: `--font-sans`
- **Fallbacks**: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Use Cases**:
  - Navigation menu items
  - Product descriptions
  - Button text
  - Footer links
  - Form inputs

### 3. Lato (Sans-serif - Alternative)
- **Usage**: Alternative sans-serif for buttons, labels
- **Weights**: 300 (Light), 400 (Regular), 700 (Bold)
- **CSS Variable**: `--font-lato`
- **Fallbacks**: sans-serif
- **Use Cases**:
  - Price displays
  - Category labels
  - Small UI text

---

## Google Fonts Import

All fonts are loaded from Google Fonts via a single optimized request:

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&display=swap');
```

---

## CSS Utility Classes

### Tailwind Configuration

The fonts are available as Tailwind utility classes:

```css
.font-serif    /* Playfair Display */
.font-sans     /* Inter */
.font-lato     /* Lato */
```

### Manual CSS Variables

```css
:root {
  --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter', 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-lato: 'Lato', sans-serif;
}
```

---

## Typography Hierarchy

### Hero Section
- **Font**: Playfair Display
- **Size**: 5xl - 8xl (48px - 96px)
- **Weight**: 500 - 600
- **Line Height**: 1.1

### Section Headings (H2)
- **Font**: Playfair Display
- **Size**: 2xl - 3xl (24px - 36px)
- **Weight**: 500
- **Line Height**: 1.2

### Navigation
- **Font**: Inter
- **Size**: xs - sm (12px - 14px)
- **Weight**: 500
- **Letter Spacing**: 0.15em (uppercase)

### Body Text
- **Font**: Inter
- **Size**: sm - base (14px - 16px)
- **Weight**: 400
- **Line Height**: 1.6

### Product Cards
- **Category**: Inter, 10px, uppercase, tracking-wide
- **Product Name**: Inter, 14px, medium weight
- **Price**: Inter, 14px, semibold

### Buttons
- **Font**: Inter
- **Size**: xs (12px)
- **Weight**: 700 (bold)
- **Letter Spacing**: 0.2em
- **Transform**: uppercase

---

## Font Loading Strategy

1. **Preconnect to Google Fonts**: Already configured in the CSS import
2. **Font Display**: `swap` (via Google Fonts URL parameter)
3. **System Fonts as Fallback**: Ensures text is visible while fonts load
4. **Font Subsetting**: Automatically handled by Google Fonts

---

## Usage Guidelines

### DO:
- Use Playfair Display for headlines to convey luxury
- Use Inter for all body text and UI elements
- Maintain consistent font weights (avoid using every available weight)
- Use proper letter-spacing for uppercase text

### DON'T:
- Use more than 3 font families on a single page
- Use decorative fonts for body text
- Load unnecessary font weights (impacts performance)
- Mix multiple serif fonts

---

## Performance Notes

- All fonts are loaded via a single HTTP request
- Font files are cached by the browser
- System font fallbacks ensure immediate text rendering
- Consider using `next/font` for automatic optimization in future updates
