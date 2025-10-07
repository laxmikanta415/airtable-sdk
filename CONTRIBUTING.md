# MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

# CONTRIBUTING.md

# Contributing to Airtable TypeScript SDK

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**

   ```bash
   git clone https://github.com/laxmikanta415/airtable-sdk.git
   cd airtable-sdk
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Building

```bash
npm run build
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing Guidelines

- Write tests for all new features
- Ensure existing tests pass before submitting PR
- Aim for high code coverage (>80%)
- Use descriptive test names

Example test structure:

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## Pull Request Process

1. **Update documentation** - Update README.md if you're adding new features
2. **Write tests** - Ensure your changes are tested
3. **Run the full test suite** - Make sure everything passes
4. **Update CHANGELOG** - Add a note about your changes
5. **Submit the PR** with a clear description of:
   - What the change does
   - Why it's needed
   - Any breaking changes
   - Related issues

## Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(table): add batch update method
fix(client): handle network timeouts properly
docs(readme): update installation instructions
```

## Adding New Features

When adding new features:

1. Check if it aligns with the project goals
2. Open an issue first to discuss major changes
3. Ensure backward compatibility when possible
4. Update TypeScript types
5. Add comprehensive tests
6. Update documentation

## Reporting Bugs

When reporting bugs, include:

- SDK version
- Node.js version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages/stack traces
- Minimal code example

## Feature Requests

For feature requests:

- Explain the use case
- Describe the proposed solution
- Consider alternatives
- Explain why it would benefit other users

## Code Review Process

- All submissions require review
- Maintainers will review PRs within 7 days
- Address review feedback promptly
- Be respectful and constructive

## Project Structure

```
airtable-sdk/
├── src/
│   ├── index.ts          # Main entry point
│   ├── client.ts         # Client class
│   ├── base.ts           # Base class
│   ├── table.ts          # Table class with CRUD operations
│   ├── types.ts          # TypeScript type definitions
│   └── errors.ts         # Error classes
├── tests/
│   ├── client.test.ts
│   ├── table.test.ts
│   └── ...
├── examples/
│   ├── basic-usage.ts
│   └── advanced-usage.ts
├── dist/                 # Build output (gitignored)
├── package.json
├── tsconfig.json
├── README.md
└── CONTRIBUTING.md
```

## Release Process

(For maintainers)

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a git tag
4. Push to GitHub
5. Publish to npm

```bash
npm version patch|minor|major
git push origin main --tags
npm publish
```

## Questions?

Feel free to open an issue for any questions or concerns.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

# CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

- Initial release
- Full TypeScript support with complete type definitions
- CRUD operations for records
- Batch operations with automatic batching
- Rate limit handling
- Comprehensive error handling
- Query filtering and sorting
- Pagination support
- Complete test coverage
- Extensive documentation and examples

### Features

- `AirtableClient` - Main client class
- `AirtableBase` - Base instance management
- `AirtableTable` - Table operations with generic types
- `select()` - Query records with filtering and sorting
- `create()` / `createRecords()` / `createBatch()` - Create operations
- `update()` / `updateRecords()` / `updateBatch()` - Update operations
- `delete()` / `deleteRecords()` / `deleteBatch()` - Delete operations
- `find()` - Get single record by ID
- Custom error classes: `AirtableError`, `RateLimitError`

## [Unreleased]

### Planned

- Webhook support
- Field metadata retrieval
- Attachment handling improvements
- Advanced caching options
- Retry logic with exponential backoff
