# Project Overview

The Mt. Pisgah Water Well project is a web-based application for managing water well operations, including homeowner management, usage tracking, invoice generation, and payment processing. The application provides both user and administrative interfaces for efficient water utility management.

## Folder Structure

The project follows a Next.js 13+ App Router structure:
- `/app`: Contains all pages and API routes using Next.js App Router structure
  - `/account`: User authentication pages
  - `/admin`: Administrative dashboard and management interfaces
  - `/api`: Backend API routes and database interactions
  - `/components`: Reusable React components
- `/public`: Static assets including images and fonts
- `/theme`: Custom styling and theme configurations

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
