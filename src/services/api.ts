import axios from 'axios'

// 1. Ini pusat konfigurasi API lu, otomatis dipakai di semua halaman
export const apiQuotation = axios.create({
  baseURL: 'https://svc-quotation.myzerra.id', // <--- Cukup pastiin baris ini bener
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 2. Ini buat nyelametin halaman Beranda/Dashboard biar gak eror merah lagi
export default apiQuotation