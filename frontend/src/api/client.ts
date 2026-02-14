import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export type User = {
  id: number
  name: string
  email: string
  role: string
  vehicle_mpg?: number
  credits_balance: number
  created_at: string
}

export type Book = {
  id: number
  title: string
  author: string
  isbn?: string
  age_range?: string
  condition?: string
  category?: string
  description?: string
  photo_url?: string
  status: string
  location_lat?: number
  location_lng?: number
  created_at: string
}

export type DeliveryJob = {
  id: number
  book_id: number
  pickup_location?: string
  dropoff_location?: string
  distance_miles?: number
  assigned_driver_id?: number
  status: string
  credit_reward: number
  requester_notes?: string
  created_at: string
  book?: { id: number; title: string; author: string; photo_url?: string; status: string }
  assigned_driver?: { id: number; name: string; email: string }
}

export type MPGEstimate = {
  fuel_cost: number
  net_reward: number
  credit_reward: number
}
