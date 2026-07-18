import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './store/AppProvider.jsx'
import { ToastProvider } from './store/ToastProvider.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import ChildProtectedRoute from './routes/ChildProtectedRoute.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import ActivateAccountPage from './pages/ActivateAccountPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import MockTestsPage from './pages/MockTestsPage.jsx'
import MockRegisterPage from './pages/MockRegisterPage.jsx'
import SubscriptionPage from './pages/SubscriptionPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AddChildPage from './pages/AddChildPage.jsx'
import ChangeChildPasswordPage from './pages/ChangeChildPasswordPage.jsx'
import ChildPerformancePage from './pages/ChildPerformancePage.jsx'
import SchoolsPage from './pages/SchoolsPage.jsx'
import ChildLoginPage from './pages/ChildLoginPage.jsx'
import ChildDashboardPage from './pages/ChildDashboardPage.jsx'
import ChildProfilePage from './pages/ChildProfilePage.jsx'
import ChildMockTestsPage from './pages/ChildMockTestsPage.jsx'
import MockAttemptPage from './pages/MockAttemptPage.jsx'
import MockPaymentConfirmationPage from './pages/MockPaymentConfirmationPage.jsx'
import MockPaymentCancelPage from './pages/MockPaymentCancelPage.jsx'

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/activate-account" element={<ActivateAccountPage />} />
            <Route path="/child-login" element={<ChildLoginPage />} />
            <Route path="/confirmation" element={<MockPaymentConfirmationPage />} />
            <Route path="/cancel" element={<MockPaymentCancelPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/mock-tests" element={<MockTestsPage />} />
              <Route path="/mock-tests/:mockID/register" element={<MockRegisterPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/add-child" element={<AddChildPage />} />
              <Route path="/change-child-password/:childID" element={<ChangeChildPasswordPage />} />
              <Route path="/child-performance/:childID" element={<ChildPerformancePage />} />
              <Route path="/schools" element={<SchoolsPage />} />
            </Route>

            <Route element={<ChildProtectedRoute />}>
              <Route path="/child-dashboard" element={<ChildDashboardPage />} />
              <Route path="/child-profile" element={<ChildProfilePage />} />
              <Route path="/child-mocks" element={<ChildMockTestsPage />} />
              <Route path="/child-mocks/:mockID" element={<MockAttemptPage />} />
              <Route path="/child-mocks/:mockID/result" element={<MockAttemptPage />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AppProvider>
  )
}

export default App
