# Overview

This is a SAP Business One (B1) web application that provides a modern interface for interacting with SAP B1 data through the Service Layer API. The application features user authentication, dashboard analytics, and business partner management with support for both HANA and MSSQL database environments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and building
- **Routing**: Wouter for client-side routing with pages for login, dashboard, and not-found
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Library**: Radix UI components with Tailwind CSS for styling, following the shadcn/ui design system
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Styling**: Tailwind CSS with CSS custom properties for theming and dark mode support

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful API with centralized route handling in `/server/routes.ts`
- **Session Management**: In-memory session storage with automatic cleanup of expired sessions
- **Validation**: Zod schemas for request/response validation shared between client and server
- **Development**: Hot reload with Vite middleware integration for seamless full-stack development

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM with support for migrations
- **ORM**: Drizzle ORM with schema definitions in `/shared/schema.ts`
- **SAP Integration**: Direct communication with SAP B1 Service Layer API for business data
- **Session Storage**: In-memory storage for user sessions with configurable timeouts

## Authentication and Authorization
- **Authentication Method**: SAP B1 Service Layer authentication using username/password
- **Session Management**: Server-side session storage with SAP SessionId tokens
- **Security**: Cookie-based session handling with automatic session cleanup
- **Environment Support**: Configurable support for both HANA and MSSQL database environments

## External Dependencies

### SAP Business One Integration
- **SAP B1 Service Layer**: Primary data source at `https://sap.itlobby.com:50000/b1s/v1`
- **Database**: Connects to `ZZZ_IT_TEST_LIVE_DB` database
- **Authentication**: Uses SAP B1 user credentials (manager/Ea@12345 as defaults)
- **Session Management**: Handles SAP SessionId tokens with configurable timeouts

### Database Services
- **PostgreSQL**: Primary application database through Neon serverless
- **Drizzle ORM**: Database abstraction layer with TypeScript support
- **Migrations**: Automated database schema management through Drizzle Kit

### UI and Styling Dependencies
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Lucide Icons**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant API for component styling

### Development and Build Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Runtime Dependencies
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for type-safe API contracts
- **Date-fns**: Date manipulation utilities
- **Cookie Parser**: Express middleware for cookie handling