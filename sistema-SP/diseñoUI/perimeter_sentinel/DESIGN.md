---
name: Perimeter Sentinel
colors:
  surface: '#101414'
  surface-dim: '#101414'
  surface-bright: '#363a3a'
  surface-container-lowest: '#0b0f0f'
  surface-container-low: '#181c1d'
  surface-container: '#1c2021'
  surface-container-high: '#272b2b'
  surface-container-highest: '#313536'
  on-surface: '#e0e3e3'
  on-surface-variant: '#bec8c9'
  inverse-surface: '#e0e3e3'
  inverse-on-surface: '#2d3131'
  outline: '#889393'
  outline-variant: '#3f4949'
  surface-tint: '#85d3da'
  primary: '#85d3da'
  on-primary: '#00363a'
  primary-container: '#01696f'
  on-primary-container: '#97e6ec'
  inverse-primary: '#01696f'
  secondary: '#c4c6d3'
  on-secondary: '#2d303b'
  secondary-container: '#444652'
  on-secondary-container: '#b2b4c2'
  tertiary: '#ffb68d'
  on-tertiary: '#522302'
  tertiary-container: '#8b4f2a'
  on-tertiary-container: '#ffceb5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a1f0f6'
  primary-fixed-dim: '#85d3da'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#e0e2f0'
  secondary-fixed-dim: '#c4c6d3'
  on-secondary-fixed: '#181b25'
  on-secondary-fixed-variant: '#444652'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68d'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#6e3815'
  background: '#101414'
  on-background: '#e0e3e3'
  surface-variant: '#313536'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono-data:
    fontFamily: monospace
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style
The design system is engineered to provide a high-reliability interface for IoT perimeter security. The brand personality is one of silent vigilance—unobtrusive when systems are nominal, but authoritative during alert states. 

The design style utilizes a **Minimalist Industrial** approach. It prioritizes data density and rapid scanning through a strict visual hierarchy. By utilizing a deep navy backdrop, the system reduces eye strain for operators in low-light environments while allowing the primary teal and semantic status colors to vibrate with high functional contrast. The aesthetic is clean and professional, avoiding decorative elements in favor of utilitarian clarity.

## Colors
The color palette is built on a foundation of deep, layered neutrals to establish a professional "command center" feel. 

- **Primary Teal (#01696f):** Used for core branding, primary action buttons, and "Armed" system states.
- **Surface Neutrals:** The background uses Deep Navy (#0f1117), while UI cards and containers use a slightly elevated Surface Navy (#1a1d27) to create subtle depth.
- **Semantic Status:** 
    - **Danger Red:** Reserved exclusively for active breaches and critical system failures.
    - **Warning Amber:** Indicates inactive sensors, bypassed zones, or low-battery warnings.
    - **Success Green:** Confirms safe zones and successful system check-ins.
- **Typography:** Pure white is used for headings to maximize contrast, while a muted slate-gray is used for secondary metadata to maintain hierarchy.

## Typography
This design system utilizes **Inter** exclusively to ensure maximum legibility across various screen densities. 

The type scale is functional and structured. Bold weights are reserved for critical status updates and headers. A specialized `label-caps` style is used for small UI labels (like sensor IDs or timestamps) to provide distinction from body text. For numerical data such as coordinates or signal strength, a monospace font should be substituted to ensure tabular alignment and rapid readability during high-stress monitoring.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure for the main dashboard. It prioritizes "at-a-glance" monitoring by grouping related sensors into modular cards.

The spacing rhythm is based on a 4px baseline. Gutters between cards are kept at 16px to maintain a tight, technical feel, while internal card padding is set to 24px (lg) to ensure information does not feel cramped. This balance of tight external margins and generous internal padding guides the eye to the content inside each functional block.

## Elevation & Depth
In this design system, depth is communicated through **Tonal Layering** rather than heavy shadows. 

The base background is the lowest level. Surface cards sit one level above, distinguished by their hex code (#1a1d27) and a very thin (1px) subtle border of a slightly lighter navy (#2d323d) to define edges. 

**Soft Elevation Shadows** are used sparingly:
- **Default State:** No shadows; flat tonal separation.
- **Active/Hover State:** A soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.4)) to lift the card visually.
- **Modals/Overlays:** High elevation with a deeper shadow and a 20% backdrop dimming to focus attention on critical alerts or settings.

## Shapes
The shape language balances modern approachability with technical precision. 

- **Containers/Cards:** Use a 12px radius to soften the large surface areas of the dashboard.
- **Interactive Elements:** Buttons use an 8px radius, providing a distinct "clickable" appearance compared to the outer containers.
- **Inputs:** Use a sharper 6px radius to imply the exactness and rigidity required for data entry and system configuration.
- **Status Indicators:** Small circular pips (fully rounded) are used alongside text to provide a secondary visual cue for system health.

## Components
- **Buttons:** Primary buttons use the Teal (#01696f) background with white text. Secondary buttons should be "Ghost" style with a 1px border. Danger actions use a solid Red fill.
- **Inputs:** Darker background than the card (#0f1117) with a 1px border. On focus, the border transitions to Teal.
- **Status Chips:** Small, low-profile badges. "Armed" uses a Teal tint, "Alert" uses a Red tint. Use high-contrast text within chips.
- **Sensor Cards:** These are the primary dashboard units. They must include a header with the sensor name, a large status icon, and a sparkline or list for recent activity.
- **Activity Feed:** A vertical list of timestamped events. Use icons to categorize the event type (e.g., motion, disconnect, system update).
- **Toggle Switches:** Use a tactile design; Teal for the "On/Armed" position and a muted gray for "Off."
- **Alert Banner:** A full-width component that appears at the top of the viewport during a breach, utilizing the Danger Red background to force immediate attention.