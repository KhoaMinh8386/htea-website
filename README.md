# HTEA - E-commerce Website for Tea Products

A full-stack e-commerce website for selling tea products, built with Node.js, Express, PostgreSQL, and React.

## Features

- User authentication and authorization
- Product management
- Shopping cart functionality
- Order management
- Admin dashboard
- Responsive design with Tailwind CSS
- Real-time product updates
- Secure payment integration
- User profile management

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Winston for logging
- Nodemailer for email services
- Chart.js for analytics

### Frontend
- React.js
- React Router v6 for navigation
- Axios for API requests
- Tailwind CSS for styling
- Webpack for bundling
- PostCSS for CSS processing
- React Context API for state management
- React Query for data fetching
- React Icons for UI icons

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/htea-website.git
cd htea-website
```

2. Install backend dependencies
   ```frist
   cd backend; npm install pg@8.14.1 sequelize@6.37.1 --save
``second
  cd htea-webstei; npm install
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
cd ..
```

4. Create a PostgreSQL database named `htea_db`

5. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=htea_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend development server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

### Backend
```
backend/
├── config/         # Configuration files
│   ├── config.js   # Main configuration
│   └── db.config.js # Database configuration
├── controllers/    # Route controllers
│   ├── auth.controller.js
│   ├── product.controller.js
│   └── order.controller.js
├── middleware/     # Custom middleware
│   ├── auth.js     # Authentication middleware
│   └── error.js    # Error handling middleware
├── models/         # Database models
│   ├── user.model.js
│   ├── product.model.js
│   └── order.model.js
├── routes/         # API routes
│   ├── auth.routes.js
│   ├── product.routes.js
│   └── order.routes.js
├── utils/          # Utility functions
│   ├── logger.js   # Winston logger setup
│   └── helpers.js  # Helper functions
├── app.js          # Express application setup
├── server.js       # Server entry point
└── db.js           # Database connection
```

### Frontend
```
frontend/
├── public/         # Static files
│   ├── index.html
│   ├── favicon.ico
│   └── assets/     # Images and other static assets
├── src/            # Source files
│   ├── components/ # Reusable components
│   ├── pages/      # Page components
│   ├── context/    # React Context
│   ├── hooks/      # Custom hooks
│   ├── services/   # API services
│   ├── utils/      # Utility functions
│   ├── styles/     # Global styles
│   ├── App.js      # Main App component
│   └── index.js    # Entry point
├── webpack.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Development Workflow

1. Create a new branch for your feature
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them
```bash
git add .
git commit -m "Add your commit message"
```

3. Push your changes
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

## License

Copyright (c) 2025 Huỳnh Minh Khoa

Permission is hereby granted to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, and distribute the Software for educational and non-commercial purposes only, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
2. Commercial use of this Software, including but not limited to selling, licensing, or integrating it into commercial products, is strictly prohibited without prior written permission from the author.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For commercial licensing inquiries, please contact: khoaminhnick2@gmail.com
