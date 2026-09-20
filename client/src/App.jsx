import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AIChat from './components/AIChat.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import ListPage from './pages/ListPage.jsx';
import PackageDetails from './pages/PackageDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StaticPage from './pages/StaticPage.jsx';
import ContentList from './pages/ContentList.jsx';
import Reviews from './pages/Reviews.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminBookings from './admin/AdminBookings.jsx';
import AdminCrud from './admin/AdminCrud.jsx';
import AdminContent from './admin/AdminContent.jsx';
import AdminReviews from './admin/AdminReviews.jsx';
import PaymentResult from './pages/PaymentResult.jsx';
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<ListPage />} />
        <Route path="/packages/:id" element={<PackageDetails />} />
        <Route path="/hajj" element={<ListPage type="hajj" />} />
        <Route path="/flights" element={<ListPage type="flights" />} />
        <Route path="/gallery" element={<ContentList type="gallery" title="Gallery" />} />
        <Route path="/news" element={<ContentList type="news" title="News & Updates" />} />
        <Route
          path="/accreditation"
          element={<ContentList type="accreditations" title="Accreditation" />}
        />
        <Route path="/about" element={<StaticPage field="aboutUs" title="About Us" />} />
        <Route
          path="/terms"
          element={<StaticPage field="termsConditions" title="Terms & Conditions" />}
        />
        <Route path="/refund" element={<StaticPage field="refundPolicy" title="Refund Policy" />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/success" element={<PaymentResult />} />
        <Route path="/payment/fail" element={<PaymentResult />} />
        <Route path="/payment/cancel" element={<PaymentResult />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="packages" element={<AdminCrud type="packages" title="Tour Packages" />} />
          <Route path="hajj" element={<AdminCrud type="hajj" title="Hajj Packages" />} />
          <Route path="flights" element={<AdminCrud type="flights" title="Flights" />} />
          <Route path="gallery" element={<AdminCrud type="gallery" title="Gallery" />} />
          <Route path="news" element={<AdminCrud type="news" title="News" />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
      <Footer />
      <AIChat />
    </BrowserRouter>
  );
}
