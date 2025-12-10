# ZENIT GeoAI - AI Coding Agent Instructions

## Project Overview
ZENIT is a Next.js 15 GIS platform for spatial analysis and mapping in Guatemala, integrating AI assistance, role-based access control, and geospatial data visualization. Built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Architecture & Key Patterns

### Role-Based Module System
- Three user roles: `SuperAdmin`, `Admin`, `Pro` (defined in `src/lib/constants.ts`)
- Module access controlled via `allowedRoles` arrays in `MODULES` constant
- Navigation structure supports nested submodules with collapsible menus
- Always check user permissions when adding new features or routes

### AI Integration (Google Genkit)
- AI flows in `src/ai/flows/` use structured input/output schemas with Zod
- Main AI assistant accessible via chat panel in dashboard header
- Spatial analysis flow supports overlay, proximity, and hotspot analysis types
- AI flows follow pattern: define schema → create prompt → define flow → export function

### Map Component Architecture
- Leaflet + React-Leaflet for all map components
- Client-side only rendering pattern: check `isClient` state before rendering maps
- Layer management through `ActiveLayer` interface with visibility/opacity controls
- Consistent popup content generation via `createPopupContent` helper
- Map invalidation required after panel resize/toggle operations

### UI Component System
- shadcn/ui components in `src/components/ui/` - never modify these directly
- Custom components extend shadcn base components
- Theme uses CSS custom properties with light mode enforced
- Font system: Space Grotesk (headlines), Inter (body) - use `font-headline`/`font-body` classes

## Development Workflows

### Running the Application
```bash
npm run dev          # Next.js dev server on port 9002 with Turbopack
npm run genkit:dev   # Start Genkit AI development server
npm run genkit:watch # Genkit with file watching
```

### Styling Conventions
- Primary color: Sky Blue (`--primary: 197 71% 73%`) for brand consistency
- Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- Glassmorphism effect: `bg-background/80 backdrop-blur-sm` pattern
- Map legends: position with `leaflet-bottom leaflet-right` classes

### Data Flow Patterns
- Context providers for auth (`AuthProvider`) and theme (`ThemeProvider`)
- LocalStorage persistence for user sessions (`zenit-user` key)
- GeoJSON data structure for all spatial layers
- Type definitions in `src/types/index.ts` - maintain these for new features

## File Organization

### Critical Directories
- `src/app/dashboard/` - All authenticated routes with shared layout
- `src/components/[feature]/` - Feature-specific components (geomarketing, poblacion, etc.)
- `src/ai/flows/` - AI workflow definitions
- `public/geodata/` - Static GeoJSON files for national data layers
- `public/geodb/` - System GeoJSON files (districts, regions, branches)

### Component Naming
- Feature components: `[feature]-[component].tsx` (e.g., `geomarketing-map.tsx`)
- UI components: kebab-case matching shadcn/ui conventions
- Layout components: descriptive names (`sidebar.tsx`, `layout.tsx`)

## Integration Points

### External Data Sources
- INE (National Statistics), SEGEPLAN (Planning), MAGA (Agriculture) for AI-assisted analysis
- Support for KML, GeoJSON, Shapefile uploads
- WMS layer integration capability built-in

### Configuration Files
- `next.config.ts` - TypeScript/ESLint errors ignored for development speed
- Image domains whitelisted: `placehold.co`, `ideg.segeplan.gob.gt`
- Leaflet CSS imported globally in layout

## Common Pitfalls
- Always use absolute file paths in imports (`@/` prefix)
- Map components must handle SSR/hydration with client-side checks
- Role checking required for all protected routes and features
- GeoJSON data validation needed for user uploads
- Layer opacity management crucial for map performance

## Testing & Debugging
- Use browser dev tools for Leaflet map debugging
- Genkit UI available at development server for AI flow testing
- TypeScript strict mode disabled - focus on functionality over type safety
- Console logging acceptable for development debugging