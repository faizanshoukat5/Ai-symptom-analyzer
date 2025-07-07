# 📋 Full-Stack Task Manager Application

A complete task management application built with React, Node.js, Express, and MongoDB.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation  
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Query** for state management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** enabled

### Database
- **MongoDB Atlas** (cloud) or local MongoDB

## 📁 Project Structure

```
task-manager/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   ├── public/
│   └── package.json
├── backend/                 # Express server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── .env.example
│   └── package.json
└── README.md
```

## 🚀 Features

### Authentication
- [x] User registration with email validation
- [x] Secure login with JWT tokens
- [x] Password hashing with bcrypt
- [x] Protected routes

### Task Management
- [x] Create, read, update, delete tasks
- [x] Task categories and priorities
- [x] Due dates and reminders
- [x] Task completion status

### User Roles
- [x] **Admin**: Manage all users and tasks
- [x] **User**: Manage personal tasks only

### Extra Features
- [x] Search and filter tasks
- [x] Task sorting by date, priority, status
- [x] Dashboard with task statistics
- [x] Responsive design

## 🏗️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd task-manager/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd task-manager/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## 🌐 Deployment

### Backend Deployment (Render)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Set environment variables:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `PORT`: 10000 (default for Render)

4. **Build and deploy commands:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

### Frontend Deployment (Netlify)

1. **Build the React app:**
   ```bash
   cd frontend && npm run build
   ```

2. **Deploy to Netlify:**
   - Drag and drop the `build` folder to Netlify
   - Or connect your GitHub repository

3. **Set environment variables:**
   - `REACT_APP_API_URL`: Your backend URL (e.g., https://your-app.onrender.com)

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/tasks` - Get all tasks
- `DELETE /api/admin/users/:id` - Delete user

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.