# Contributing to PGI

This document provides guidelines for contributing to the Paragon Global Investments codebase.

## Getting Started

1. Read the main [README.md](../README.md) to understand the project
2. Review the [ARCHITECTURE.md](./ARCHITECTURE.md) and [DEVELOPMENT.md](./DEVELOPMENT.md)

## Contribution Workflow

1. **Clone**: Clone the repository directly
2. **Branch**: Create a branch for your work
   ```bash
   git checkout -b feature/your-feature-name main
   ```
3. **Develop**: Make changes following the coding standards in [DEVELOPMENT.md](./DEVELOPMENT.md)
4. **Test**: Ensure your changes don't break existing functionality
5. **Lint & Format**:
   ```bash
   npm run lint
   npm run format
   ```
6. **Commit**: Use conventional commit messages
   ```bash
   git commit -m "feat: add new internship filtering"
   ```
7. **Push**: Push your changes to your fork or branch
8. **Pull Request**: Create a PR with a clear description

## Coding Standards

- **TypeScript**: Use TypeScript with proper typing (see `src/types/index.ts`)
- **Components**: Create reusable components with well-defined props
- **Styling**: Use Tailwind CSS classes (see [DEVELOPMENT.md](./DEVELOPMENT.md))

## Git Practices

- `main`: Production-ready code
- `feature/<name>`: For new features
- `fix/<name>`: For bug fixes
- `chore/<name>`: For maintenance tasks

## Documentation

- Update documentation when adding features
- Document API endpoints in [API.md](./API.md)
- Document reusable components in [COMPONENTS.md](./COMPONENTS.md)
- Add JSDoc comments for complex functions
