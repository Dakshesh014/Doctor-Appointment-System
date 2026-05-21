# Doctor Appointment System

A full-stack web application for managing doctor appointments, medical records, prescriptions, and patient-doctor interactions. This system includes features for patients, doctors, admins, and super-admins.

## Features

### Patient Features
- Register and login
- Book appointments with doctors
- View appointment history
- Access medical records and prescriptions
- Receive notifications
- Manage lab records and results
- Message doctors
- Rate and review doctors

### Doctor Features
- Manage appointments
- View patient information
- Create and manage prescriptions
- View lab results
- Access medical records
- Send messages to patients
- Track activity logs

### Admin Features
- Manage appointments and users
- View billing and payments
- Manage lab results
- Monitor prescriptions
- Activity tracking
- System notifications

### Super Admin Features
- Full system management
- User management
- System settings
- Comprehensive analytics
- Activity monitoring

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **html2canvas & jsPDF** - PDF generation
- **CSS** - Styling

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Dakshesh014/Doctor-Appointment-System.git
cd Doctor-Appointment-System
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/doctor-appointment
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Running the Project

### Development Mode

#### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

(Alternative: Use `npm start` for production mode without auto-reload)

#### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized build in the `frontend/build` directory.

#### Start Backend (Production)

```bash
cd backend
npm start
```

## Project Structure

```
Doctor-Appointment-System/
├── backend/
│   ├── config/              # Configuration files
│   │   ├── multer.js
│   │   └── prescriptionMulter.js
│   ├── controllers/         # Route controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   └── superadminController.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   └── activityTracker.js
│   ├── models/              # MongoDB models
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── Prescription.js
│   │   ├── MedicalRecord.js
│   │   ├── LabResult.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Billing.js
│   │   ├── Insurance.js
│   │   ├── VisitHistory.js
│   │   ├── LabRecord.js
│   │   ├── ActivityLog.js
│   │   └── SystemSettings.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── superadminRoutes.js
│   │   └── reviewRoutes.js
│   ├── utils/               # Utility functions
│   │   ├── emailService.js
│   │   └── activityLogger.js
│   ├── server.js            # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── public/              # Static files
│   │   ├── index.html
│   │   └── images/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── AdminSidebar.js
│   │   │   ├── DoctorSidebar.js
│   │   │   ├── PatientSidebar.js
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── admin/
│   │   │   ├── doctor/
│   │   │   ├── patient/
│   │   │   └── superadmin/
│   │   ├── App.js           # Main app component
│   │   ├── index.js         # Entry point
│   │   └── App.css
│   ├── build/               # Production build output
│   └── package.json
│
├── .gitignore               # Git ignore file
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor details
- `PUT /api/doctors/:id` - Update doctor profile

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient profile

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id` - Update prescription

### Lab Results
- `GET /api/lab-results` - Get lab results
- `POST /api/lab-results` - Upload lab results

### Billing
- `GET /api/billing` - Get billing information
- `POST /api/billing` - Create bill

## Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT token generation |
| `NODE_ENV` | Environment (development/production) |
| `EMAIL_USER` | Email address for sending notifications |
| `EMAIL_PASSWORD` | Email password or app password |

### Frontend (.env)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL |

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Verify connection string in `.env` file
- Check if MongoDB port (27017) is accessible

### CORS Error
- Verify backend CORS configuration
- Ensure frontend URL is allowed in backend

### Port Already in Use
```bash
# Find and kill process on port 5000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or use different port by setting in .env
PORT=3001
```

### Dependencies Error
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please create an issue on GitHub or contact the project maintainers.

## Project Links

- **Repository**: https://github.com/Dakshesh014/Doctor-Appointment-System
- **Author**: Dakshesh014

---

**Last Updated**: May 2026
