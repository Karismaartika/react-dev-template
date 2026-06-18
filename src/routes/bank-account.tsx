import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Building2,
  CreditCard,
  Landmark,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
// FIX 1: Import apiQuotation dari service API agar sinkron menembak server hosting online
import {
  apiQuotation,
  createBankAccount,
  deleteBankAccount,
  getBankAccounts,
  updateBankAccount,
} from '../services/api'

export const Route = createFileRoute('/bank-account')({
  component: BankAccountPage,
})

/* =========================
   TYPES
========================= */
type Company = {
  id: number
  name: string
  legal_name: string
  address: string
  email: string
  phone: string
  website: string
  logo: string
}

type BankAccount = {
  id: string | number
  bank: string         // Mapping ke bank_name di BE
  accountName: string  // Mapping ke account_name di BE
  accountNumber: string // Mapping ke account_number di BE
  companyId: number    // Mapping ke company_id di BE
}

/* =========================
   COMPONENT
========================= */
function BankAccountPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  /* =========================
     FORM STATE
  ========================= */
  const [form, setForm] = useState<BankAccount>({
    id: 0,
    bank: '',
    accountName: '',
    accountNumber: '',
    companyId: 0,
  })

  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<string | number | null>(null)

  /* =========================
     LOAD INITIAL MASTER DATA
  ========================= */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingCompanies(true)
        
        // FIX 2: Tembak memakai apiQuotation + berikan limit besar agar CV Cahaya Mustika ikut ketarik
        const resCompany = await apiQuotation.get('/companies?limit=100')
        const fetchedCompanies: Company[] = resCompany.data?.data || resCompany.data || []
        
        setCompanies(fetchedCompanies)

        // Set default companyId pada form input
        if (fetchedCompanies.length > 0) {
          setForm((prev) => ({ ...prev, companyId: fetchedCompanies[0].id }))
        }
      } catch (err) {
        console.error('Gagal memuat daftar master company dari API:', err)
        
        // Fallback cadangan jika API mendadak terputus
        const savedCompanies = localStorage.getItem('companies')
        if (savedCompanies) {
          const parsed = JSON.parse(savedCompanies)
          setCompanies(parsed)
          if (parsed.length > 0) {
            setForm((prev) => ({ ...prev, companyId: parsed[0].id }))
          }
        }
      } finally {
        setLoadingCompanies(false)
      }

      // Ambil list akun bank dari database server
      await fetchBankAccounts()
    }

    loadInitialData()
  }, [])

  /* =========================
     BANK DATA LIVE API
  ========================= */
  const fetchBankAccounts = async () => {
    setLoading(true)
    try {
      const res = await getBankAccounts()
      const rawData = res.data || []

      // Memetakan struktur snake_case API ke camelCase internal state UI
      const mappedData: BankAccount[] = rawData.map((item: any) => ({
        id: item.id,
        bank: item.bank_name,
        accountName: item.account_name,
        accountNumber: item.account_number,
        companyId: Number(item.company_id) || 0,
      }))

      setAccounts(mappedData)
    } catch (err) {
      console.error('Gagal mengambil data rekening dari server:', err)
      alert('Gagal memuat data dari server.')
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === 'companyId' ? Number(e.target.value) : e.target.value,
    })
  }

  /* =========================
     SUBMIT (CREATE & UPDATE)
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.bank || !form.accountName || !form.accountNumber || Number(form.companyId) === 0) {
      alert('Semua field termasuk pilihan nama PT wajib diisi!')
      return
    }

    const payload = {
      bank_name: form.bank,
      account_name: form.accountName,
      account_number: form.accountNumber,
      company_id: Number(form.companyId),
    }

    try {
      if (isEdit && editId !== null) {
        await updateBankAccount(editId.toString(), payload)
        alert('Data rekening berhasil diperbarui! 🎉')
        cancelEdit()
      } else {
        await createBankAccount(payload)
        alert('Rekening baru berhasil ditambahkan! 🚀')

        setForm({
          id: 0,
          bank: '',
          accountName: '',
          accountNumber: '',
          companyId: companies.length > 0 ? companies[0].id : 0,
        })
      }

      await fetchBankAccounts()
    } catch (err) {
      console.error('Gagal memproses aksi submit:', err)
      alert('Terjadi kesalahan saat menyimpan data ke server backend.')
    }
  }

  const handleEdit = (account: BankAccount) => {
    setForm(account)
    setIsEdit(true)
    setEditId(account.id)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const cancelEdit = () => {
    setIsEdit(false)
    setEditId(null)
    setForm({
      id: 0,
      bank: '',
      accountName: '',
      accountNumber: '',
      companyId: companies.length > 0 ? companies[0].id : 0,
    })
  }

  const handleDelete = async (id: string | number) => {
    if (confirm('Apakah yakin ingin menghapus rekening ini?')) {
      try {
        await deleteBankAccount(id.toString())
        alert('Rekening berhasil dihapus! 🗑️')
        await fetchBankAccounts()
      } catch (err) {
        console.error('Gagal menghapus data rekening:', err)
        alert('Gagal menghapus data dari server.')
      }
    }
  }

  return (
    <div className="p-6 min-h-screen bg-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bank Account</h1>
          <p className="text-slate-500">Manage company bank accounts</p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border">
          <span className="text-slate-500 text-sm">Total Account :</span>
          <span className="font-bold text-sky-600 ml-2 text-lg">
            {accounts.length}
          </span>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            {isEdit ? (
              <Pencil size={18} className="text-amber-500" />
            ) : (
              <Plus size={18} className="text-sky-500" />
            )}
            {isEdit ? 'Edit Bank Account' : 'Add Bank Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* COMPANY DROPDOWN */}
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Company
              </label>
              <div className="relative mt-2">
                <Building2
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <select
                  name="companyId"
                  value={form.companyId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  {loadingCompanies ? (
                    <option>Loading daftar PT...</option>
                  ) : companies.length === 0 ? (
                    <option value={0}>Tidak ada PT di database</option>
                  ) : (
                    companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {/* FIX 3: Tambah fallback company.legal_name || company.name agar tidak kosong blank */}
                        {company.legal_name || company.name || `Company ID ${company.id}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* BANK */}
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Bank Name
              </label>
              <div className="relative mt-2">
                <Landmark
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  type="text"
                  name="bank"
                  placeholder="BCA / BRI / Mandiri"
                  value={form.bank}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* ACCOUNT NAME */}
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Account Name
              </label>
              <input
                type="text"
                name="accountName"
                placeholder="Nama Pemilik Rekening"
                value={form.accountName}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* ACCOUNT NUMBER */}
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Account Number
              </label>
              <div className="relative mt-2">
                <CreditCard
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="123456789"
                  value={form.accountNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl text-white font-semibold shadow transition ${
                isEdit
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              {isEdit ? 'Save Changes' : 'Add Account'}
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-semibold">
            Memuat data dari server backend...
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-slate-600 text-sm">
                <th className="text-left px-6 py-4 font-bold">Company</th>
                <th className="text-left px-6 py-4 font-bold">Bank</th>
                <th className="text-left px-6 py-4 font-bold">Account Name</th>
                <th className="text-left px-6 py-4 font-bold">Account Number</th>
                <th className="text-center px-6 py-4 font-bold">Action</th>
              </tr>
            </thead>

            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Tidak ada data rekening bank di database backend.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  // FIX MATCHING: Membandingkan ID dengan tipe number secara aman
                  const company = companies.find((c) => Number(c.id) === Number(acc.companyId))
                  // FIX 4: Gunakan fallback pencarian nama company di baris tabel agar tidak blank kosong
                  const displayCompanyName = company?.legal_name || company?.name || 'Loading / Perusahaan Tidak Ditemukan'

                  return (
                    <tr
                      key={acc.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {displayCompanyName}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {acc.bank}
                      </td>
                      <td className="px-6 py-4">{acc.accountName}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {acc.accountNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(acc)}
                            className="p-2 rounded-lg hover:bg-amber-100 text-amber-600 transition"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(acc.id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}