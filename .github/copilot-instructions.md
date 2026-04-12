# Project Overview

The Mt. Pisgah Water Well project is a web-based application for managing water well operations, including homeowner management, usage tracking, invoice generation, and payment processing. The application provides both user and administrative interfaces for efficient water utility management.

## Libraries and Frameworks

- Next.js 15+ for the full-stack React framework
- React 19+ for the frontend UI
- Tailwind CSS for styling
- Postgres for database management
- TypeScript for type-safe development
- JWT and bcrypt for authentication and security

## Coding Standards

- Use TypeScript for all new code
- Follow the Next.js App Router patterns for routing and API endpoints
- Use functional components with React hooks
- Implement proper error handling using the utility functions in api/utils
- Follow RESTful practices for API endpoints
- Use repository pattern for database operations (see api/repositories)
- Implement proper data validation and sanitization
- Use proper TypeScript types and interfaces
- Use async/await for asynchronous operations
- Prefer methods that do one thing and one thing well
- Prefer method names that describe what the method does. There shouldn't be any surprises.
- Prefer methods that are easily re-usable.

## UI Guidelines

- Maintain consistent styling using the provided component library in /components
- Use the custom fonts: Avenir Next and Futura Medium
- Implement responsive design for all screen sizes
- Follow accessibility best practices
- Use the provided reusable components:
  - Button
  - TextInput
  - Select
  - Modal
  - Well
  - Badge
  - FlashMessage
- Forms should include proper validation and error handling
- Maintain a clean, professional interface suitable for utility management

## General Guidelines
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
    Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
    Drop: Task receipt/checklist by default. Only include when user asks for plan.
    Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
    Pattern: [thing] [action] [reason]. [next step].
    Not: "Sure! I'd be happy to help you with that."
    Yes: "Bug in auth middleware. Fix:"

Drop caveman speech for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
