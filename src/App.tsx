import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import Dashboard from './pages/Dashboard'
import CitiesList from './pages/CitiesList'
import CityForm from './pages/CityForm'
import CityDetail from './pages/CityDetail'
import LanguagesList from './pages/LanguagesList'
import LanguageForm from './pages/LanguageForm'
import LanguageDetail from './pages/LanguageDetail'
import ContactsList from './pages/ContactsList'
import ContactForm from './pages/ContactForm'
import ContactDetail from './pages/ContactDetail'
import HotelsList from './pages/HotelsList'
import HotelForm from './pages/HotelForm'
import HotelDetail from './pages/HotelDetail'
import ActivitiesList from './pages/ActivitiesList'
import ActivityDetail from './pages/ActivityDetail'
import CreateActivityUser from './pages/CreateActivityUser'
import TouristSpotsList from './pages/TouristSpotsList'
import TouristSpotForm from './pages/TouristSpotForm'
import TouristSpotDetail from './pages/TouristSpotDetail'
import TranslationsList from './pages/TranslationsList'
import TranslationsForm from './pages/TranslationsForm'
import TranslationsDetail from './pages/TranslationsDetail'
import ReviewsList from './pages/ReviewsList'
import ReviewDetail from './pages/ReviewDetail'
import AdminLayout from './layout/AdminLayout'
import ErrorBoundary from './components/ErrorBoundary'
import { getAccessToken, isAdmin } from './lib/auth'

const RequireAuth: React.FC<{ children: React.ReactElement }>=({ children }) => {
  const token = getAccessToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

const RequireAdmin: React.FC<{ children: React.ReactElement }>=({ children }) => {
  const token = getAccessToken()
  const adminRole = isAdmin()
  
  if (!token) return <Navigate to="/login" replace />
  if (!adminRole) return <Navigate to="/unauthorized" replace />
  
  return children
}

export default function App(){
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cities" element={<CitiesList />} />
          <Route path="cities/new" element={<CityForm />} />
          <Route path="cities/:id/edit" element={<CityForm />} />
          <Route path="cities/:id/view" element={<CityDetail />} />
          <Route path="languages" element={<LanguagesList />} />
          <Route path="languages/new" element={<LanguageForm />} />
          <Route path="languages/:id/edit" element={<LanguageForm />} />
          <Route path="languages/:id/view" element={<LanguageDetail />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="contacts/new" element={<ContactForm />} />
          <Route path="contacts/:id/edit" element={<ContactForm />} />
          <Route path="contacts/:id/view" element={<ContactDetail />} />
          <Route path="hotels" element={<HotelsList />} />
          <Route path="hotels/new" element={<HotelForm />} />
          <Route path="hotels/:id/edit" element={<HotelForm />} />
          <Route path="hotels/:id/view" element={<HotelDetail />} />
          <Route path="activities" element={<ActivitiesList />} />
          <Route path="activities/create-user" element={<CreateActivityUser />} />
          <Route path="activities/:id/view" element={<ActivityDetail />} />
          <Route path="tourist-spots" element={<TouristSpotsList />} />
          <Route path="tourist-spots/new" element={<TouristSpotForm />} />
          <Route path="tourist-spots/:id/edit" element={<TouristSpotForm />} />
          <Route path="tourist-spots/:id/view" element={<TouristSpotDetail />} />
          <Route path="translations" element={<TranslationsList />} />
          <Route path="translations/view/:entityType/:entityId" element={<TranslationsDetail />} />
          <Route path="translations/edit/:entityType/:entityId" element={<TranslationsForm />} />
          <Route path="reviews" element={<ReviewsList />} />
          <Route path="reviews/:id" element={<ReviewDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
