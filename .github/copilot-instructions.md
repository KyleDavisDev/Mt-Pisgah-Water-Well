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

## Database Table Structure

The following summarizes the main database tables, inferred from the models and repository patterns:

- **homeowners**
  - id: number
  - name: string
  - email: string | null
  - phone_number: string | null
  - mailing_address: string
  - is_active: boolean

- **properties**
  - id: number
  - street: string
  - city: string
  - state: string
  - zip: string
  - description: string | null
  - homeowner_id: number
  - is_active: boolean

- **usages**
  - id: number
  - property_id: number
  - date_collected: string (YYYY-MM-DD)
  - gallons: number
  - recorded_by_id: number
  - is_active: boolean


- **invoices** (Will be deprecated in favor of `fees` + `bills` paradigm)
  - id: number
  - property_id: number
  - amount_in_pennies: number
  - type: "WATER_USAGE" | "LATE_FEE"
  - metadata: JSON (formula_used, gallons_used, billing_month, billing_year, etc.)
  - created_at: string (ISO 8601)
  - is_active: boolean

- **fees**
  - id: number
  - property_id: number
  - bill_id: number
  - amount_in_pennies: number
  - category: "WATER_USAGE" | "ADMINISTRATIVE" | "LATE_FEE" | "SERVICE_FEE" | "CUSTOM";
  - metadata: JSON (formula_used, gallons_used, description, etc.)
  - created_at: string (ISO 8601)
  - is_active: boolean

- **bills**
  - id: number
  - property_id: number
  - total_in_pennies: number
  - billing_month: number
  - billing_year: number
  - metadata: JSON (The "frozen-in-time" values from `fees`)
  - created_at: string (ISO 8601)
  - is_active: boolean

- **payments**
  - id: number
  - amount_in_pennies: number
  - method: string
  - property_id: number
  - created_at: string (ISO 8601)
  - is_active: boolean
  - transaction_issued_by: string | null
  - transaction_id: string | null

- **users**
  - id: number
  - name: string
  - username: string
  - password: string (hashed)
  - is_active: boolean

- **permissions**
  - id: number
  - value: string
  - description: string | null
  - is_active: boolean

- **user_permissions**
  - id: number
  - userId: number
  - permissionId: number
  - isActive: boolean

- **audit_log**
  - id: number
  - table_name: string
  - record_id: number
  - action_type: "INSERT" | "UPDATE" | "DELETE"
  - old_data: string | null
  - new_data: string | null
  - action_by_id: number
  - action_timestamp: string (ISO 8601)
  - is_complete: boolean
