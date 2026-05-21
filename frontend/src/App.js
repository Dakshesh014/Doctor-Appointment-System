import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// ==================== AUTH PAGES ====================
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerAccess from './pages/OwnerAccess';
import SuperAdminLogin from './pages/SuperAdminLogin';


// Add this with your other imports
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';

// ==================== PATIENT PAGES ====================
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import ViewAppointments from './pages/patient/ViewAppointments';
import VisitHistory from './pages/patient/VisitHistory';
import Prescriptions from './pages/patient/Prescriptions';
import LabRecords from './pages/patient/LabRecords';
import Billing from './pages/patient/Billing';
import Messages from './pages/patient/Messages';
import PatientProfile from './pages/patient/MyProfile';
import PatientSettings from './pages/patient/Settings';
import Insurance from './pages/patient/Insurance';
import VideoConsultations from './pages/patient/VideoConsultations';
import Diagnoses from './pages/patient/Diagnoses';
import TreatmentPlans from './pages/patient/TreatmentPlans';

// ==================== DOCTOR PAGES ====================
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPendingAppointments from './pages/doctor/PendingAppointments';
import MyPatients from './pages/doctor/MyPatients';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import PatientDetails from './pages/doctor/PatientDetails';
import DoctorVisitHistory from './pages/doctor/VisitHistory';
import DoctorLabRecords from './pages/doctor/LabRecords';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorSettings from './pages/doctor/Settings';
import DoctorMessages from './pages/doctor/Messages';
import DoctorBilling from './pages/doctor/Billing';
import DoctorProfile from './pages/doctor/MyProfile';
import DoctorVideoConsultations from './pages/doctor/VideoConsultations';
import DoctorDiagnoses from './pages/doctor/Diagnoses';
import DoctorTreatmentPlans from './pages/doctor/TreatmentPlans';

// ==================== ADMIN PAGES - ONE COMPONENT PER ROUTE ====================
import AdminDashboard from './pages/admin/AdminDashboard';
import AllUsers from './pages/admin/AllUsers';
import ManagePatients from './pages/admin/ManagePatients';
import ManageDoctors from './pages/admin/ManageDoctors';
import PendingDoctors from './pages/admin/PendingDoctors';
import AdminViewAppointments from './pages/admin/ViewAppointments';
import AdminSchedule from './pages/admin/Schedule';
import AdminMedicalRecords from './pages/admin/AdminMedicalRecords';
import AdminLabResults from './pages/admin/AdminLabResults';
import AdminPrescriptions from './pages/admin/AdminPrescriptions';
import AdminBilling from './pages/admin/AdminBilling';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/Reports';
import AdminMessages from './pages/admin/AdminMessages';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/Settings';
import AdminProfile from './pages/admin/MyProfile';

// ==================== SUPERADMIN PAGES ====================
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManageAdmins from './pages/superadmin/ManageAdmins';
import PendingAdmins from './pages/superadmin/PendingAdmins';
import SuperAdminManageDoctors from './pages/superadmin/ManageDoctors';
import ManagePatientsSuper from './pages/superadmin/ManagePatients';
import Security from './pages/superadmin/Security';
import ActivityHistory from './pages/superadmin/ActivityHistory';
import AuditLogs from './pages/superadmin/AuditLogs';
import SuperAdminMessages from './pages/superadmin/SuperAdminMessages';



// ==================== PROTECTED ROUTE COMPONENT ====================
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

// ==================== MAIN APP COMPONENT ====================
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ... routes ... */}
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/setup-owner" element={<OwnerAccess />} />
          <Route path="/owner-access" element={<SuperAdminLogin />} />

          {/* ==================== PATIENT ROUTES ==================== */}
          <Route path="/patient/dashboard" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/book-appointment" element={<ProtectedRoute allowedRole="patient"><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRole="patient"><ViewAppointments /></ProtectedRoute>} />
          <Route path="/patient/visit-history" element={<ProtectedRoute allowedRole="patient"><VisitHistory /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRole="patient"><Prescriptions /></ProtectedRoute>} />
          <Route path="/patient/lab-records" element={<ProtectedRoute allowedRole="patient"><LabRecords /></ProtectedRoute>} />
          <Route path="/patient/billing" element={<ProtectedRoute allowedRole="patient"><Billing /></ProtectedRoute>} />
          <Route path="/patient/messages" element={<ProtectedRoute allowedRole="patient"><Messages /></ProtectedRoute>} />
          <Route path="/patient/my-profile" element={<ProtectedRoute allowedRole="patient"><PatientProfile /></ProtectedRoute>} />
          <Route path="/patient/settings" element={<ProtectedRoute allowedRole="patient"><PatientSettings /></ProtectedRoute>} />
          <Route path="/patient/insurance" element={<ProtectedRoute allowedRole="patient"><Insurance /></ProtectedRoute>} />
          <Route path="/patient/video-consultations" element={<ProtectedRoute allowedRole="patient"><VideoConsultations /></ProtectedRoute>} />
          <Route path="/patient/diagnoses" element={<ProtectedRoute allowedRole="patient"><Diagnoses /></ProtectedRoute>} />
          <Route path="/patient/treatment-plans" element={<ProtectedRoute allowedRole="patient"><TreatmentPlans /></ProtectedRoute>} />

          {/* ==================== DOCTOR ROUTES ==================== */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/my-patients" element={<ProtectedRoute allowedRole="doctor"><MyPatients /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRole="doctor"><MyPatients /></ProtectedRoute>} />
          <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRole="doctor"><PatientDetails /></ProtectedRoute>} />
          <Route path="/doctor/patient-history" element={<ProtectedRoute allowedRole="doctor"><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/appointments/pending" element={<ProtectedRoute allowedRole="doctor"><DoctorPendingAppointments /></ProtectedRoute>} />
          <Route path="/doctor/today-schedule" element={<ProtectedRoute allowedRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/upcoming-schedule" element={<ProtectedRoute allowedRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/visit-history" element={<ProtectedRoute allowedRole="doctor"><DoctorVisitHistory /></ProtectedRoute>} />
          <Route path="/doctor/lab-records" element={<ProtectedRoute allowedRole="doctor"><DoctorLabRecords /></ProtectedRoute>} />
          <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRole="doctor"><DoctorPrescriptions /></ProtectedRoute>} />
          <Route path="/doctor/my-schedule" element={<ProtectedRoute allowedRole="doctor"><DoctorSchedule /></ProtectedRoute>} />
          <Route path="/doctor/billing" element={<ProtectedRoute allowedRole="doctor"><DoctorBilling /></ProtectedRoute>} />
          <Route path="/doctor/messages" element={<ProtectedRoute allowedRole="doctor"><DoctorMessages /></ProtectedRoute>} />
          <Route path="/doctor/my-profile" element={<ProtectedRoute allowedRole="doctor"><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor/settings" element={<ProtectedRoute allowedRole="doctor"><DoctorSettings /></ProtectedRoute>} />
          <Route path="/doctor/video-consultations" element={<ProtectedRoute allowedRole="doctor"><DoctorVideoConsultations /></ProtectedRoute>} />
          <Route path="/doctor/diagnoses" element={<ProtectedRoute allowedRole="doctor"><DoctorDiagnoses /></ProtectedRoute>} />
          <Route path="/doctor/treatment-plans" element={<ProtectedRoute allowedRole="doctor"><DoctorTreatmentPlans /></ProtectedRoute>} />

          {/* ==================== ADMIN ROUTES - ONE COMPONENT PER ROUTE ==================== */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/all-users" element={<ProtectedRoute allowedRole="admin"><AllUsers /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute allowedRole="admin"><ManagePatients /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRole="admin"><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/pending-doctors" element={<ProtectedRoute allowedRole="admin"><PendingDoctors /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute allowedRole="admin"><AdminViewAppointments /></ProtectedRoute>} />
          <Route path="/admin/schedule" element={<ProtectedRoute allowedRole="admin"><AdminSchedule /></ProtectedRoute>} />
          <Route path="/admin/medical-records" element={<ProtectedRoute allowedRole="admin"><AdminMedicalRecords /></ProtectedRoute>} />
          <Route path="/admin/lab-results" element={<ProtectedRoute allowedRole="admin"><AdminLabResults /></ProtectedRoute>} />
          <Route path="/admin/prescriptions" element={<ProtectedRoute allowedRole="admin"><AdminPrescriptions /></ProtectedRoute>} />
          <Route path="/admin/billing" element={<ProtectedRoute allowedRole="admin"><AdminBilling /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute allowedRole="admin"><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute allowedRole="admin"><AdminMessages /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute allowedRole="admin"><AdminNotifications /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/my-profile" element={<ProtectedRoute allowedRole="admin"><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><AdminProfile /></ProtectedRoute>} />

          {/* ==================== SUPERADMIN ROUTES ==================== */}
          <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRole="superadmin"><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin/manage-admins" element={<ProtectedRoute allowedRole="superadmin"><ManageAdmins /></ProtectedRoute>} />
          <Route path="/superadmin/pending-admins" element={<ProtectedRoute allowedRole="superadmin"><PendingAdmins /></ProtectedRoute>} />
          <Route path="/superadmin/manage-doctors" element={<ProtectedRoute allowedRole="superadmin"><SuperAdminManageDoctors /></ProtectedRoute>} />
          <Route path="/superadmin/manage-patients" element={<ProtectedRoute allowedRole="superadmin"><ManagePatientsSuper /></ProtectedRoute>} />
          <Route path="/superadmin/security" element={<ProtectedRoute allowedRole="superadmin"><Security /></ProtectedRoute>} />
          <Route path="/superadmin/activity-history" element={<ProtectedRoute allowedRole="superadmin"><ActivityHistory /></ProtectedRoute>} />
          <Route path="/superadmin/audit-logs" element={<ProtectedRoute allowedRole="superadmin"><AuditLogs /></ProtectedRoute>} />
          <Route path="/superadmin/messages" element={<ProtectedRoute allowedRole="superadmin"><SuperAdminMessages /></ProtectedRoute>} />

          {/* ==================== CATCH ALL ROUTE ==================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;