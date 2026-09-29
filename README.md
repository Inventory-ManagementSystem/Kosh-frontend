# KOSH - Inventory and Invoice Management System

KOSH is an inventory and invoice management system designed to help businesses manage their inventory, invoices, and users through a centralized web application.

This repository contains the frontend application of KOSH, developed using React and Vite. The frontend communicates with a separate Django backend through REST APIs.

## Tech Stack

* React.js

## Features

* User registration and login
* Role selection for Business Owner and Employee
* OTP verification
* User logout
* Client-side form validation
* Responsive user interface
* REST API integration
* JWT-based authentication

## Project Structure

```text
Kosh-frontend/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
├── vite.config.js
└── README.md
```

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd Kosh-frontend
```

Install the dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory and add the required backend API URLs.

Example:

```env
VITE_REG_API_URL=https://your-backend-domain/accounts/register/
VITE_LOGIN_API_URL=https://your-backend-domain/accounts/login/
```

Environment variables must start with `VITE_` to be accessible in the Vite frontend.

Do not commit the `.env` file if it contains sensitive information.

## Running the Project

Start the development server:

```bash
npm run dev
```

The application will run at:

```text
http://localhost:5173
```

## Production Build

To create a production build:

```bash
npm run build
```

The production files will be generated in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

## Authentication

The authentication system includes:

* User registration
* Login
* OTP verification
* JWT-based authentication
* Google authentication
* Role-based user selection

Authentication API endpoints are configured through environment variables.

## Deployment

The frontend can be deployed on platforms such as AWS EC2, Vercel, or other platforms that support Vite applications.

For production deployment, first generate the production build using:

```bash
npm run build
```

The contents of the generated `dist` directory can then be served using a web server such as Nginx.

## Development

The frontend is developed separately from the backend, allowing both applications to be developed and deployed independently.

When backend API URLs change, they can be updated through the frontend environment variables without changing the application source code.

## License

This project is currently developed for internal/project purpose.
