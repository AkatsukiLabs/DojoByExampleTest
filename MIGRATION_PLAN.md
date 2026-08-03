# Client Migration Plan - Vocs Fresh Start

## Overview
Complete migration of the documentation site to a fresh Vocs installation with modern design, proper theme switching, and cleaner codebase.

## Commit Strategy
Each phase will be a separate commit with clear, descriptive messages following conventional commits format.

## Migration Phases & Commits

### Phase 1: Initialize Migration Branch
**Commit**: `feat: initialize client migration branch`
```bash
git checkout -b feat/client-migration-vocs
```


# ONLYDUST


### Phase 2: Setup Fresh Vocs Project
**Commit**: `feat: initialize new vocs project with modern stack`
```bash
# Create new client directory
mkdir client-new
cd client-new

# Initialize fresh Vocs project
pnpm init
pnpm add vocs@latest react@latest react-dom@latest
pnpm add -D @types/react @types/react-dom typescript tailwindcss postcss autoprefixer
```
- Latest Vocs version (stable, not alpha)
- React 19
- Tailwind CSS 3.4+
- PostCSS with autoprefixer
- TypeScript 5.x

### Phase 3: Migrate Assets & Design System
**Commit**: `feat: add design system and migrate assets`
- Copy logos and SVG files from old client
- Organize in proper structure:
  ```
  client-new/
  ├── public/
  │   ├── logos/
  │   │   ├── dojo-icon-light.svg
  │   │   ├── dojo-icon-dark.svg
  │   │   ├── dojo-logo-light.svg
  │   │   └── dojo-logo-dark.svg
  │   ├── partners/
  │   │   ├── cartridge.svg
  │   │   ├── starknet.svg
  │   │   └── ...
  │   └── og-images/
  ```
- Define color palette (Primary: #ff3000)
- Create design tokens for typography, spacing, shadows

### Phase 4: Configure Vocs & Tailwind
**Commit**: `feat: configure vocs with theme and tailwind setup`
- Create `vocs.config.ts` with:
  - Modern theme with working dark/light mode
  - Proper logo switching
  - SEO optimization
  - Social cards configuration
- Setup `tailwind.config.js` with:
  - Custom color palette
  - Typography plugin
  - Dark mode variants
- Configure `tsconfig.json` with strict mode and path aliases

### Phase 5: Setup Navigation Structure
**Commit**: `feat: implement navigation and routing system`
- Create `routes.ts` with improved structure
- Implement sidebar with auto-collapse logic
- Add breadcrumbs support
- Setup mobile navigation
- Configure Previous/Next navigation
- Add table of contents

### Phase 6: Create Homepage & Landing
**Commit**: `feat: create modern homepage with hero and features`
- Design hero section with clear CTA
- Add feature cards grid
- Quick start section
- Community section
- Latest updates component

### Phase 7: Migrate Documentation Content
**Commit**: `feat: migrate all documentation content`
- Copy all `.md` and `.mdx` files from old client
- Reorganize in cleaner structure:
  - `getting-started/` - Setup and basics
  - `guides/` - Integration guides (React, Unity, AI)
  - `deployment/` - Deployment guides
  - `reference/` - API and configuration
  - `examples/` - Code examples and templates

### Phase 8: Create Custom React Components
**Commit**: `feat: add custom MDX components and utilities`
- Create reusable components:
  - `ThemeToggle.tsx` - Working theme switcher
  - `FeatureCard.tsx` - Homepage feature cards
  - `CodeExample.tsx` - Enhanced code blocks with copy
  - `Callout.tsx` - Alert/warning boxes
  - `Tabs.tsx` - Tabbed content
- Setup MDX component mapping

### Phase 9: Implement Search & Enhanced Features
**Commit**: `feat: add search functionality and UX enhancements`
- Configure search with Cmd+K shortcut
- Add syntax highlighting for Cairo
- Implement code block enhancements (line numbers, copy button)
- Create custom 404 page
- Add loading states and error boundaries

### Phase 10: Setup Cairo Syntax Highlighting
**Commit**: `feat: add Cairo language support for syntax highlighting`
- Configure Shiki with Cairo grammar
- Add Cairo code examples
- Test syntax highlighting

### Phase 11: Testing & Performance Optimization
**Commit**: `perf: optimize build and runtime performance`
- Run functionality tests:
  - Theme switching
  - Navigation
  - Search
  - Mobile responsiveness
- Optimize performance:
  - Bundle size analysis
  - Image optimization
  - Code splitting
- Accessibility audit

### Phase 12: Configure Deployment
**Commit**: `feat: setup deployment configuration`
- Update package.json scripts
- Configure Vercel deployment
- Setup GitHub Actions CI/CD
- Add preview deployments

### Phase 13: Documentation & Cleanup
**Commit**: `docs: update documentation and migration notes`
- Update README.md
- Create CONTRIBUTING.md
- Document migration changes
- Add changelog

### Phase 14: Final Migration & Switchover
**Commit**: `feat: complete migration to new client`
```bash
# Backup old client
mv client client-old

# Move new client
mv client-new client

# Update root package.json if needed
# Test everything
pnpm install
pnpm dev
```

### Phase 15: Cleanup & Archive
**Commit**: `chore: remove old client and finalize migration`
- Remove `client-old` directory
- Update any root-level configurations
- Final testing in production environment

## Commit Summary

Total commits for migration: **15 commits**

1. `feat: initialize client migration branch`
2. `feat: initialize new vocs project with modern stack`
3. `feat: add design system and migrate assets`
4. `feat: configure vocs with theme and tailwind setup`
5. `feat: implement navigation and routing system`
6. `feat: create modern homepage with hero and features`
7. `feat: migrate all documentation content`
8. `feat: add custom MDX components and utilities`
9. `feat: add search functionality and UX enhancements`
10. `feat: add Cairo language support for syntax highlighting`
11. `perf: optimize build and runtime performance`
12. `feat: setup deployment configuration`
13. `docs: update documentation and migration notes`
14. `feat: complete migration to new client`
15. `chore: remove old client and finalize migration`

## Success Criteria

### Must Have
- ✅ Working dark/light theme toggle
- ✅ All existing content migrated
- ✅ Mobile responsive
- ✅ Fast page loads (<2s)
- ✅ Search functionality
- ✅ Clean, modern design
- ✅ Cairo syntax highlighting

## Timeline
- **Estimated Duration**: 7-10 days
- **Commit Frequency**: 1-2 phases per day
- **Review Points**: After phases 5, 10, and 14

## Next Steps

1. Create migration branch (Phase 1)
2. Initialize new Vocs project (Phase 2)
3. Follow phases sequentially
4. Test after each commit
5. Merge when all phases complete

Ready to start the migration!
