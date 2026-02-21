# Assets Directory

## Required Assets

Place your app assets in this directory:

### Icons
- **icon.png** - App icon (1024x1024px, PNG)
- **adaptive-icon.png** - Android adaptive icon (1024x1024px, PNG)
- **favicon.png** - Web favicon (48x48px, PNG)

### Splash Screen
- **splash.png** - Splash screen (1242x2436px, PNG)

### Notifications
- **notification-icon.png** - Notification icon (96x96px, PNG, white on transparent)

## Temporary Solution

For development, you can use placeholder images or remove the asset references from `app.json` temporarily.

## Creating Assets

### Quick Method (Online Tools)
1. Use [Canva](https://canva.com) or [Figma](https://figma.com)
2. Create 1024x1024px image with your logo/brand
3. Export as PNG
4. Use [MakeAppIcon](https://makeappicon.com) to generate all sizes

### Design Guidelines
- **Icon**: Simple, recognizable, works at small sizes
- **Colors**: Match your brand (primary: #1e40af)
- **Style**: Modern, clean, professional
- **Format**: PNG with transparency

## Asset Specifications

### icon.png
- Size: 1024x1024px
- Format: PNG
- Background: Solid color or transparent
- Content: Centered logo/symbol

### splash.png
- Size: 1242x2436px (iPhone 11 Pro Max)
- Format: PNG
- Background: White (#ffffff)
- Content: Logo centered

### adaptive-icon.png
- Size: 1024x1024px
- Format: PNG
- Safe area: 66% circle in center
- Background: Will be cropped to circle/square

## Quick Start Without Assets

To run the app without assets temporarily, comment out the asset references in `app.json`:

```json
{
  "expo": {
    // "icon": "./assets/icon.png",
    // "splash": { ... },
    // "notification": { ... }
  }
}
```
