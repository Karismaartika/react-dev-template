import axios from 'axios'

// 1. Konfigurasi Dasar Axios ke Backend Service Quotation
export const apiQuotation = axios.create({
  baseURL: 'https://svc-quotation.myzerra.id',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 2. Interceptor Pintar Pembasmi ".success123" di Ekor Token
apiQuotation.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token')

    if (token) {
      // FIX UTAMA: Jika tokennya kemasukan teks ".success123", kita bersihkan otomatis
      if (token.endsWith('.success123')) {
        token = token.replace('.success123', '')
      }

      // Tambahkan Bearer jika belum ada
      if (token.startsWith('Bearer ')) {
        config.headers.Authorization = token
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    console.log(
      'Token bersih yang lolos dikirim ke BE:',
      config.headers.Authorization,
    )
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// =================================================================
// 3. FUNGSI CRUD LOGISTIK BANK ACCOUNT
// =================================================================
export const getBankAccounts = async () => {
  const response = await apiQuotation.get('/bank_accounts')
  return response.data
}

export const createBankAccount = async (bankData: any) => {
  const response = await apiQuotation.post('/bank_accounts', bankData)
  return response.data
}

export const updateBankAccount = async (id: string, bankData: any) => {
  const response = await apiQuotation.put(`/bank_accounts/${id}`, bankData)
  return response.data
}

export const deleteBankAccount = async (id: string) => {
  const response = await apiQuotation.delete(`/bank_accounts/${id}`)
  return response.data
}

export default apiQuotation
