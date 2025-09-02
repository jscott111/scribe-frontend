# 🎨 Typography System

This directory contains the Material-UI theme configuration and custom Typography components for consistent styling throughout the Scribe app.

## 📁 Files

- `theme.ts` - Main theme configuration with custom typography styles
- `typography.ts` - Typography variant constants and helper functions
- `README.md` - This documentation file

## 🚀 Quick Start

### 1. Using CustomTypography Component

Instead of writing verbose Typography components with inline styles:

```tsx
// ❌ Old way - verbose and inconsistent
<Typography sx={{ 
  textAlign: 'center', 
  fontSize: '2rem', 
  fontWeight: 'bold' 
}}>
  Scribe
</Typography>
```

Use the CustomTypography component with predefined variants:

```tsx
// ✅ New way - clean and consistent
<CustomTypography variant="appTitle">
  Scribe
</CustomTypography>
```

### 2. Available Variants

| Variant | Usage | Example |
|---------|-------|---------|
| `appTitle` | Main app titles | "Scribe" |
| `sectionHeader` | Section headings | "Language Settings" |
| `subsectionHeader` | Subsection headings | "Audio Settings" |
| `bodyText` | Regular text content | Paragraphs, descriptions |
| `captionText` | Small explanatory text | Help text, captions |
| `buttonText` | Button labels | "Start Recording" |
| `statusText` | Success/status messages | "Connected", "Recording" |
| `errorText` | Error messages | "Connection failed" |

### 3. Import and Usage

```tsx
import CustomTypography from '../components/UI/CustomTypography'

// In your component
<CustomTypography variant="sectionHeader">
  Language Settings
</CustomTypography>

<CustomTypography variant="bodyText">
  Select your source and target languages for translation.
</CustomTypography>

<CustomTypography variant="statusText">
  ✅ Connected to backend
</CustomTypography>
```

## 🎯 Benefits

1. **Consistency** - All typography follows the same design system
2. **Maintainability** - Change styles in one place, update everywhere
3. **Readability** - Clean, semantic component names
4. **Type Safety** - TypeScript ensures you use valid variants
5. **Performance** - No inline style calculations

## 🔧 Customization

### Adding New Variants

1. Add the variant to `CustomTypography.tsx`:

```tsx
// In the getVariantStyles function
case 'newVariant':
  return {
    fontSize: '1.2rem',
    fontWeight: '500',
    color: theme.palette.primary.main,
  }
```

2. Update the type definition:

```tsx
type CustomTypographyVariant = 
  | 'appTitle'
  | 'sectionHeader'
  | 'newVariant'  // Add here
  | // ... other variants
```

3. Add to constants in `typography.ts`:

```tsx
export const TYPOGRAPHY_VARIANTS = {
  // ... existing variants
  NEW_VARIANT: 'newVariant',
} as const
```

### Modifying Existing Styles

Edit the styles in `CustomTypography.tsx` or update the theme in `theme.ts`:

```tsx
// In theme.ts
typography: {
  h1: {
    fontSize: '3rem',  // Change from 2.5rem
    fontWeight: 'bold',
  },
}
```

## 📱 Responsive Typography

The theme automatically handles responsive typography. For custom responsive behavior:

```tsx
<CustomTypography 
  variant="sectionHeader"
  sx={{
    fontSize: { xs: '1.2rem', md: '1.5rem' },
  }}
>
  Responsive Header
</CustomTypography>
```

## 🎨 Theme Integration

The Typography system is fully integrated with Material-UI's theme system:

- Uses theme colors (`primary.main`, `text.primary`, etc.)
- Respects theme spacing units
- Supports dark/light mode switching
- Inherits theme typography settings

## 📚 Examples

See `src/examples/TypographyExamples.tsx` for comprehensive usage examples and demonstrations of all available variants.

## 🔄 Migration Guide

To migrate existing Typography components:

1. **Identify the style pattern** - What type of text is it?
2. **Choose the appropriate variant** - Match the semantic meaning
3. **Replace the component** - Swap `Typography` for `CustomTypography`
4. **Remove inline styles** - The variant handles the styling
5. **Test the result** - Ensure it looks correct

### Common Migrations

```tsx
// App titles
<Typography sx={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>
  → <CustomTypography variant="appTitle">

// Section headers  
<Typography sx={{ fontSize: '1.5rem', fontWeight: '600' }}>
  → <CustomTypography variant="sectionHeader">

// Body text
<Typography sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
  → <CustomTypography variant="bodyText">

// Status messages
<Typography sx={{ color: 'success.main', fontSize: '0.875rem' }}>
  → <CustomTypography variant="statusText">
```
