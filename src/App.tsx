import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Auth
import { Login } from './pages/auth'

// Core Pages
import Unauthorized from './pages/Unauthorized'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'

// Feature Modules (Barrel Imports)
import { CitiesList, CityForm, CityDetail } from './pages/cities'
import { LanguagesList, LanguageForm, LanguageDetail } from './pages/languages'
import { ContactsList, ContactForm, ContactDetail } from './pages/contacts'
import { HotelsList, HotelForm, HotelDetail } from './pages/hotels'
import { ActivitiesList, ActivityDetail, CreateActivityUser } from './pages/activities'
import { TouristSpotsList, TouristSpotForm, TouristSpotDetail } from './pages/tourist-spots'
import { TranslationsList, TranslationsForm, TranslationsDetail } from './pages/translations'
import { ReviewsList, ReviewDetail } from './pages/reviews'

// Layout & Utils
import AdminLayout from './layout/AdminLayout'
import { ErrorBoundary } from './components'
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
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
