# SAP Business One Flutter Application

A Flutter application for SAP Business One that provides a modern interface for interacting with SAP B1 data through the Service Layer API.

## Features

- User authentication with SAP B1
- Dashboard with analytics
- Business partner management
- Items management
- Sales orders management
- Support for multiple HANA databases

## Backend

The backend is built with Python Flask and provides REST API endpoints for the Flutter frontend.

## Running the Application

1. Start the Flask backend:
```bash
cd backend
python app.py
```

2. Run the Flutter application:
```bash
cd flutter_app
flutter run -d web-server --web-port=8080 --web-hostname=0.0.0.0
```

The Flutter web app will be available on port 8080.
