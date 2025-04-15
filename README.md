# HTEA - E-commerce Website for Tea Products

A full-stack e-commerce website for selling tea products, built with Node.js, Express, PostgreSQL, and React.

## Features

- User authentication and authorization
- Product management
- Shopping cart functionality
- Order management
- Admin dashboard
- Responsive design with Tailwind CSS

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Multer for file uploads

### Frontend
- React.js
- Redux Toolkit for state management
- React Router for navigation
- Axios for API requests
- Formik & Yup for form handling
- Tailwind CSS for styling
- Headless UI & Heroicons for UI components

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/htea-website.git
cd htea-website
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

4. Create a PostgreSQL database named `htea_db`

5. Import the database schema
```bash
psql -U postgres -d htea_db -f htea_db.sql
```

6. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=htea_secret_key_2023
JWT_EXPIRE=30d
DB_HOST=localhost
DB_PORT=5432
DB_NAME=htea_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### Running the Application

1. Start the backend server
```bash
npm run dev
```

2. Start the frontend development server
```bash
npm run client
```

3. Or run both simultaneously
```bash
npm run dev:full
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Account

- Username: admin
- Email: admin@example.com
- Password: admin123

## License

This project is licensed under the MIT License. 