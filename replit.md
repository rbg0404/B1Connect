# Overview

This is a SAP Business One (B1) application that provides a modern interface for interacting with SAP B1 data through the Service Layer API. The application has been migrated to use Flutter for the frontend and Python Flask for the backend. It features user authentication, dashboard analytics, business partner management, items management, sales orders, and support for both HANA and MSSQL database environments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Flutter for cross-platform UI with web support
- **State Management**: Provider for state management and dependency injection
- **UI Components**: Material Design 3 components with custom widgets
- **HTTP Client**: http package for API communication
- **Charts**: fl_chart for data visualization
- **Routing**: Navigator for screen navigation
- **Pages**: Login, Dashboard, Business Partners, Items, Sales Orders, Location Master, Branch Master, Warehouse Master

## Backend Architecture
- **Runtime**: Python 3.11 with Flask web framework
- **Language**: Python 3.11
- **API Pattern**: RESTful API with route handling in `/backend/app.py`
- **Session Management**: In-memory session storage with automatic cleanup of expired sessions
- **HTTP Client**: requests library for SAP Service Layer communication
- **CORS**: Flask-CORS for cross-origin resource sharing
- **Development**: Flask debug mode with hot reload

## Data Storage Solutions
- **SAP Integration**: Direct communication with SAP B1 Service Layer API for all business data
- **Session Storage**: In-memory Python dictionary for user sessions with automatic expiration cleanup
- **Configuration**: JSON-based configuration file (config.json) for SAP connection settings and database list

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
- **Flutter SDK**: Cross-platform UI framework with web support
- **Python**: Backend runtime environment with package management via pip/uv
- **Flask**: Lightweight web framework for Python

### Runtime Dependencies
- **Flutter Dependencies**: provider, http, fl_chart, intl
- **Python Dependencies**: Flask, Flask-CORS, requests, python-dotenv
- **Build Tools**: build_flutter.sh script for building Flutter web application