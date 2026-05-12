import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Building2,
  Globe,
  ImagePlus,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

export const Route = createFileRoute('/company')({
  component: CompanyPage,
})

type Company = {
  id: number
  name: string
  legalName: string
  address: string
  email: string
  phone: string
  website: string
  logo: string
}

function CompanyPage() {
  // ================= COMPANY DATA =================
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      name: 'Zerra',
      legalName: 'PT Zerra Teknologi',
      address: 'Malang, Jawa Timur',
      email: 'zerra@gmail.com',
      phone: '08123456789',
      website: 'https://myzerra.id',
      logo: '/logo-zerra.png',
    },
    {
      id: 2,
      name: 'Cahaya Mustika',
      legalName: 'CV Cahaya Mustika',
      address: 'Malang, Jawa Timur',
      email: 'cahayamustika@gmail.com',
      phone: '08987654321',
      website: 'https://cahayamustika.id',
      logo: '/logo-cm.png',
    },
  ])

  // ================= FORM =================
  const [form, setForm] = useState<Company>({
    id: 0,
    name: '',
    legalName: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    logo: '',
  })

  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  // ================= HANDLE CHANGE =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // ================= SUBMIT =================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !form.name ||
      !form.legalName ||
      !form.address ||
      !form.email ||
      !form.phone
    ) {
      alert('Semua field wajib diisi')
      return
    }

    if (isEdit && editIndex !== null) {
      const updated = [...companies]

      updated[editIndex] = form

      setCompanies(updated)

      cancelEdit()
    } else {
      setCompanies([
        ...companies,
        {
          ...form,
          id: Date.now(),
        },
      ])

      setForm({
        id: 0,
        name: '',
        legalName: '',
        address: '',
        email: '',
        phone: '',
        website: '',
        logo: '',
      })
    }
  }

  // ================= EDIT =================
  const handleEdit = (index: number) => {
    setForm(companies[index])

    setEditIndex(index)
    setIsEdit(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ================= CANCEL =================
  const cancelEdit = () => {
    setIsEdit(false)
    setEditIndex(null)

    setForm({
      id: 0,
      name: '',
      legalName: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      logo: '',
    })
  }

  // ================= DELETE =================
  const handleDelete = (index: number) => {
    if (confirm('Apakah yakin ingin menghapus perusahaan ini?')) {
      setCompanies(companies.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              Company Management
            </h1>

            <p className="text-slate-500 mt-1">
              Manage multi company data & logo
            </p>
          </div>

          <div className="bg-white border rounded-2xl px-5 py-3 shadow-sm">
            <span className="text-slate-500 text-sm">Total Company :</span>

            <span className="ml-2 font-bold text-sky-600 text-lg">
              {companies.length}
            </span>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50">
            <h2 className="flex items-center gap-2 font-bold text-slate-700">
              {isEdit ? (
                <PencilLine size={18} className="text-amber-500" />
              ) : (
                <Plus size={18} className="text-sky-500" />
              )}

              {isEdit ? 'Edit Company' : 'Add New Company'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* LOGO */}
            <div className="mb-8 flex items-center gap-5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border bg-slate-100 shadow-sm">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImagePlus size={30} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-600">
                  Company Logo URL
                </label>

                <input
                  type="text"
                  name="logo"
                  placeholder="/logo-zerra.png"
                  value={form.logo}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Upload logo ke folder public lalu isi: /nama-logo.png
                </p>
              </div>
            </div>

            {/* INPUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* COMPANY NAME */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Company Name
                </label>

                <div className="relative mt-2">
                  <Building2
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Zerra"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* LEGAL NAME */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Legal Name
                </label>

                <input
                  type="text"
                  name="legalName"
                  value={form.legalName}
                  onChange={handleChange}
                  placeholder="PT Zerra Teknologi Integrasi"
                  className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* ADDRESS */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Address
                </label>

                <div className="relative mt-2">
                  <MapPin
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Malang, Jawa Timur"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Email
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="company@gmail.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Phone Number
                </label>

                <div className="relative mt-2">
                  <Phone
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="08123456789"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* WEBSITE */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Website
                </label>

                <div className="relative mt-2">
                  <Globe
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://myzerra.id"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                className={`px-6 py-3 rounded-xl text-white font-bold shadow-lg transition active:scale-95 ${
                  isEdit
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                {isEdit ? 'Save Changes' : 'Add Company'}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* COMPANY LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition"
            >
              {/* TOP */}
              <div className="bg-gradient-to-r from-sky-500 to-cyan-400 h-24 relative">
                <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-lg">
                  <img
                    src={
                      company.logo && company.logo.trim() !== ''
                        ? company.logo
                        : 'https://ui-avatars.com/api/?name=Company'
                    }
                    alt="logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* CONTENT */}
              <div className="pt-14 px-6 pb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {company.name}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {company.legalName}
                </p>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 text-slate-400" />
                    {company.address}
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" />
                    {company.phone}
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-slate-400" />

                    <a
                      href={company.website}
                      target="_blank"
                      className="text-sky-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" />
                    {company.email}
                  </div>
                </div>

                {/* ACTION */}
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 transition"
                  >
                    <PencilLine size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(index)}
                    className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
