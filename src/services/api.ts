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

// =================================================================
// 4. FUNGSI CRUD LOGISTIK COMPANY (BARU 🚀)
// =================================================================
export const getCompanies = async () => {
  const response = await apiQuotation.get('/companies')
  return response.data
}

export const createCompany = async (companyData: any) => {
  const response = await apiQuotation.post('/companies', companyData)
  return response.data
}

export const updateCompany = async (id: string | number, companyData: any) => {
  const response = await apiQuotation.put(`/companies/${id}`, companyData)
  return response.data
}

export const deleteCompany = async (id: string | number) => {
  const response = await apiQuotation.delete(`/companies/${id}`)
  return response.data
}

export const getEmployees = async () => {
  const response = await apiQuotation.get('/employees')
  return response.data
}

export const createEmployee = async (employeeData: any) => {
  const response = await apiQuotation.post('/employees', employeeData)
  return response.data
}

export const updateEmployee = async (id: string, employeeData: any) => {
  const response = await apiQuotation.put(`/employees/${id}`, employeeData)
  return response.data
}

export const deleteEmployee = async (id: string) => {
  const response = await apiQuotation.delete(`/employees/${id}`)
  return response.data
}

export default apiQuotation
