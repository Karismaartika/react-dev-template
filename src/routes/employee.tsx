import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import api, { 
  createEmployee, 
  deleteEmployee, 
  getEmployees, 
  updateEmployee 
} from '../services/api'

export const Route = createFileRoute('/employee')({
  component: EmployeePage,
})

/* =========================
   TYPES
========================= */
type Company = {
  id: number
  name: string
  legal_name: string // Disamakan menjadi snake_case agar sesuai dengan database backend
  address: string
  email: string
  phone: string
  website: string
  logo: string
}

type Employee = {
  id: string | number
  name: string
  email: string
  phone: string
  company_id: number
}

/* =========================
   COMPONENT
========================= */
function EmployeePage() {
  const [search, setSearch] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<string | number | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  const [form, setForm] = useState<Omit<Employee, 'id'>>({
    name: '',
    email: '',
    phone: '',
    company_id: 0, // Di-set default 0 sebelum data perusahaan ter-load
  })

  /* =========================
     EFFECT LOGIC
  ========================= */
  useEffect(() => {
    // Memanggil fungsi sinkronisasi master data dari API backend dan lokal
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoadingCompanies(true)
      
      // 1. Ambil data seluruh Perusahaan (PT) langsung dari API Backend server secara Realtime
      const resCompany = await api.get('/companies')
      const fetchedCompanies: Company[] = resCompany.data?.data || resCompany.data || []
      
      setCompanies(fetchedCompanies)

      // 2. Set default company_id di form jika data perusahaan tersedia
      if (fetchedCompanies.length > 0) {
        setForm((prev) => ({ ...prev, company_id: fetchedCompanies[0].id }))
      }
    } catch (error) {
      console.error('Gagal mengambil data master kumpuan PT dari API:', error)
      
      // Fallback jika API bermasalah, baca dari localStorage
      const savedCompanies = localStorage.getItem('companies')
      if (savedCompanies) {
        const parsed = JSON.parse(savedCompanies)
        setCompanies(parsed)
        if (parsed.length > 0) {
          setForm((prev) => ({ ...prev, company_id: parsed[0].id }))
        }
      }
    } finally {
      setLoadingCompanies(false)
    }

    // 3. Ambil data karyawan dari database
    await loadEmployees()
  }

  /* =========================
     LOAD EMPLOYEE API
  ========================= */
  const loadEmployees = async () => {
    try {
      const response = await getEmployees()
      console.log('Employee API Response:', response)
      setEmployees(response.data || response || [])
    } catch (error) {
      console.error('Failed load employees', error)
    }
  }

  /* =========================
     FILTER
  ========================= */
  const filteredData = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()),
  )

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: name === 'company_id' ? Number(value) : value,
    })
  }

  /* =========================
     SUBMIT (CONNECTED TO API)
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.phone || Number(form.company_id) === 0) {
      alert('Semua field termasuk pilihan PT wajib diisi!')
      return
    }

    try {
      if (isEdit && editId !== null) {
        await updateEmployee(String(editId), form)
        alert('Data employee berhasil diperbarui di database! 🎉')
      } else {
        await createEmployee(form)
        alert('Data employee baru berhasil disimpan ke database! 🚀')
      }
      
      await loadEmployees()
      resetForm()
    } catch (error) {
      console.error('Gagal menyimpan data ke backend:', error)
      alert('Gagal memproses data ke server Swagger. Silakan cek console!')
    }
  }

  /* =========================
     EDIT TRIGGER
  ========================= */
  const handleEdit = (emp: Employee) => {
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      company_id: Number(emp.company_id),
    })
    setEditId(emp.id)
    setIsEdit(true)
    setOpenModal(true)
  }

  /* =========================
     DELETE (CONNECTED TO API)
  ========================= */
  const handleDelete = async (id: string | number) => {
    if (confirm('Apakah yakin ingin menghapus employee dari database?')) {
      try {
        await deleteEmployee(String(id))
        alert('Data employee berhasil dihapus! 🗑️')
        await loadEmployees()
      } catch (error) {
        console.error('Gagal menghapus data di backend:', error)
        alert('Gagal menghapus data dari server Swagger.')
      }
    }
  }

  /* =========================
     RESET FORM
  ========================= */
  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      company_id: companies.length > 0 ? companies[0].id : 0,
    })
    setIsEdit(false)
    setEditId(null)
    setOpenModal(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              Employee Management
            </h1>
            <p className="text-slate-500 mt-1">
              Manage employee & company data
            </p>
          </div>

          <button
            onClick={() => {
              if (companies.length === 0) {
                alert('Sistem sedang memuat data PT atau daftar PT kosong di database.')
              }
              setOpenModal(true)
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* TOPBAR */}
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* SEARCH */}
            <div className="relative w-full md:w-96">
              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* TOTAL */}
            <div className="bg-sky-50 text-sky-700 px-5 py-3 rounded-2xl font-bold">
              Total Employee : {employees.length}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-600 text-sm">
                  <th className="text-left px-6 py-4 font-bold">Employee</th>
                  <th className="text-left px-6 py-4 font-bold">Contact</th>
                  <th className="text-left px-6 py-4 font-bold">Company</th>
                  <th className="text-center px-6 py-4 font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-all"
                  >
                    {/* EMPLOYEE */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                          <Users className="text-sky-600" size={20} />
                        </div>
                        <div>
                          <h2 className="font-bold text-slate-800">
                            {emp.name}
                          </h2>
                          <p className="text-sm text-slate-500">EMP-{emp.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={15} />
                          {emp.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={15} />
                          {emp.phone}
                        </div>
                      </div>
                    </td>

                    {/* COMPANY */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Building2 size={16} />
                        {
                          companies.find((c) => Number(c.id) === Number(emp.company_id))
                            ?.legal_name || 'Unknown Company'
                        }
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2 rounded-xl bg-amber-100 text-amber-600 hover:scale-105 transition-all"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 rounded-xl bg-red-100 text-red-600 hover:scale-105 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {isEdit ? 'Edit Employee' : 'Add Employee'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Input employee information
                </p>
              </div>

              <button
                onClick={resetForm}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* NAME */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Employee Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Input employee name"
                  className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Input email"
                  className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Input phone"
                  className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* COMPANY */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Company
                </label>
                <select
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {loadingCompanies ? (
                    <option>Loading seluruh daftar PT...</option>
                  ) : companies.length === 0 ? (
                    <option value={0}>Tidak ada PT terdaftar di basis data</option>
                  ) : (
                    companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.legal_name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* BUTTON */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  {isEdit ? 'Save Changes' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}