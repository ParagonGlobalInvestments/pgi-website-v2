# UI Components

This document catalogs key UI components in the PGI application. For base UI elements (Button, Card, Input), refer to [shadcn/ui](https://ui.shadcn.com) documentation as many components in `src/components/ui/` are derived from this library.

## Layout Components

### DashboardLayout

- **Purpose**: Main layout for authenticated dashboard pages
- **Features**: Responsive sidebar, user profile display, role-based navigation
- **Path**: `src/app/portal/dashboard/layout.tsx`

### NavItem

- **Purpose**: Navigation item with icon, label, and active state
- **Features**: Icon display, active highlighting, click handling
- **Path**: Part of layout components (e.g., dashboard layout)

## Authentication Components

### OnboardingWizard

- **Purpose**: Multi-step form for new user profile completion
- **Props**:
  - `onComplete`: Callback function for completion
  - `userData`: Initial user data
- **Path**: `src/components/auth/OnboardingWizard.tsx`

### ProtectedPage

- **Purpose**: Wrapper to protect content based on authentication/roles
- **Props**:
  - `requiredRole`: Role(s) needed to access content
  - `children`: Protected content
- **Path**: `src/components/auth/ProtectedPage.tsx`

## Core UI Components

The `src/components/ui/` directory contains UI primitives based on shadcn/ui:

- Button, Input, Card, Dialog, Select, Toast, Table, Badge, etc.
- These are customized variants of shadcn/ui components

## Animation Components

### SmoothTransition

- **Purpose**: Apply smooth mount/unmount animations
- **Props**:
  - `isVisible`: Boolean to control visibility
  - `direction`: 'vertical' | 'horizontal' | 'scale'
  - `className`: Additional CSS classes
  - `children`: React nodes
- **Usage**:
  ```tsx
  <SmoothTransition isVisible={showContent} direction="vertical">
    <Content />
  </SmoothTransition>
  ```
- **Path**: `src/components/ui/SmoothTransition.tsx`

## Component Guidelines

When creating new components:

1. **Location**:

   - Generic UI primitives: `src/components/ui/`
   - Feature-specific components: `src/components/features/`
   - Shared components: `src/components/shared/`

2. **Structure**:

   - Use TypeScript interfaces for props
   - Implement with functional components and hooks
   - Follow accessibility best practices
   - Use Tailwind CSS for styling

3. **Documentation**:
   - Add JSDoc comments for props
   - Document significant components in this file
   - Include usage examples for complex components
