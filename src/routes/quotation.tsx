import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Eye, FilePlus, FileText, Globe, List, Mail, Plus, Printer, Trash2 } from 'lucide-react'
import api from '../services/api'

export const Route = createFileRoute('/quotation')({
  component: QuotationPage,
})

/* ==========================================================================
   TYPES DEFINITIONS
   ========================================================================== */
type CompanyType = {
  id: number
  name: string
  legal_name: string
  tagline?: string
  address: string
  email: string
  phone: string
  website: string
  logo: string
}

type EmployeeType = {
  id: number
  name: string
  email: string
  phone: string
  position?: string
  company_id: number
}

type BankAccountType = {
  id: number
  bank_name: string
  account_name: string
  account_number: string
  company_id: number
}

type Item = {
  id: number
  description: string
  qty: number
  price: number
}

type QuotationData = {
  id: number
  quote_number: string
  date: string
  customer_name: string
  customer_company: string
  company_id: number
  employee_id: number
  bank_account_id: number
  discount_percent: number
  vat_percent: number
  items: Item[] | string
  grand_total?: number
}

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */
function QuotationPage() {
  // Master data state
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [employees, setEmployees] = useState<EmployeeType[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccountType[]>([])
  
  // CRUD & Tab States
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'print'>('list')
  const [quotations, setQuotations] = useState<QuotationData[]>([])
  const [selectedQuotationForPrint, setSelectedQuotationForPrint] = useState<QuotationData | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const LIMIT_PER_PAGE = 10

  // Form Fields States
  const [editId, setEditId] = useState<number | null>(null)
  const [quoteNumber, setQuoteNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [customerName, setCustomerName] = useState('')
  const [customerCompany, setCustomerCompany] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<number>(0)
  const [selectedEmployee, setSelectedEmployee] = useState<number>(0)
  const [selectedBank, setSelectedBank] = useState<number>(0)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [vatPercent, setVatPercent] = useState<number>(11)
  const [items, setItems] = useState<Item[]>([
    {
      id: Date.now(),
      description: '(Contoh) Meja Kerja Ichiko\nSpesifikasi :\n- Type : UNO UOD 1031\n- Ukuran : 120 X 60 X 75 cm',
      qty: 1,
      price: 1000000,
    },
  ])

  /* ==========================================================================
     FETCH ALL INITIAL DATA (TOTAL UNLOCKED - NO LIMIT)
     ========================================================================== */
  const loadAllData = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      
      // 1. Fetch master data pendukung
      const [resCompany, resEmployee, resBank] = await Promise.all([
        api.get('/companies'),
        api.get('/employees'),
        api.get('/bank_accounts')
      ])

      const fetchedCompanies: CompanyType[] = resCompany.data?.data || []
      const fetchedEmployees: EmployeeType[] = resEmployee.data?.data || []
      
      let fetchedBanks: BankAccountType[] = []
      if (Array.isArray(resBank.data)) {
        fetchedBanks = resBank.data
      } else if (resBank.data && Array.isArray(resBank.data.data)) {
        fetchedBanks = resBank.data.data
      }

      setCompanies(fetchedCompanies)
      setEmployees(fetchedEmployees)
      setBankAccounts(fetchedBanks)

      // 2. Fetch DATA QUOTATION - Set LIMIT ke 9999 agar keluar semua datanya tanpa batasan!
      const resQuotes = await api.get('/quotations/', {
        params: {
          page: 1,
          limit: 9999
        }
      }).catch((err) => {
        console.error("Gagal fetch quotations:", err)
        return { data: { data: [], total: 0 } }
      })

      let fetchedQuotes: QuotationData[] = []
      let totalCount = 0

      if (resQuotes && resQuotes.data) {
        if (Array.isArray(resQuotes.data.data)) {
          fetchedQuotes = resQuotes.data.data
          totalCount = resQuotes.data.total || resQuotes.data.data.length
        } else if (Array.isArray(resQuotes.data)) {
          fetchedQuotes = resQuotes.data
          totalCount = resQuotes.data.length
        }
      }

      setTotalItems(totalCount)
      setTotalPages(1) 

      // Urutkan berdasarkan ID terbesar ke terkecil
      // Urutkan berdasarkan ID terbesar ke terkecil
      const sortedQuotes = [...fetchedQuotes].sort((a, b) => Number(b.id) - Number(a.id))
      setQuotations(sortedQuotes)

      // 🛠️ TAMBAHKAN LOGIKA INI SUPAYA OTOMATIS TERISI SEJAK AWAL FORM DIBUKA
      if (fetchedCompanies.length > 0 && !editId) {
        const defaultCompanyId = fetchedCompanies[0].id
        setSelectedCompany(defaultCompanyId)
        const firstEmp = fetchedEmployees.find((e) => Number(e.company_id) === Number(defaultCompanyId))
        const firstBank = fetchedBanks.find((b) => Number(b.company_id) === Number(defaultCompanyId))
        
        setSelectedEmployee(firstEmp ? firstEmp.id : 0)
        setSelectedBank(firstBank ? firstBank.id : 0)
        
        const currentYear = new Date().getFullYear()
        setQuoteNumber(`SPN-ZRA/III/${currentYear}/${String(totalCount + 1).padStart(3, '0')}`)
      }

    } catch (err) {
      console.error("Gagal memuat data:", err)
      setErrorMsg("Gagal sinkronisasi data daftar quotation dengan API server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [currentPage])

  const initFormDefaults = (companyId: number, emps = employees, banks = bankAccounts) => {
    setSelectedCompany(companyId)
    const firstEmp = emps.find((e) => Number(e.company_id) === Number(companyId))
    const firstBank = banks.find((b) => Number(b.company_id) === Number(companyId))
    
    setSelectedEmployee(firstEmp ? firstEmp.id : 0)
    setSelectedBank(firstBank ? firstBank.id : 0)
    
    const currentYear = new Date().getFullYear()
    setQuoteNumber(`SPN-ZRA/III/${currentYear}/${String(totalItems + 1).padStart(3, '0')}`)
  }

  /* ==========================================================================
     FILTER RELATIONAL DATA
     ========================================================================== */
  const filteredEmployees = employees.filter((e) => Number(e.company_id) === Number(selectedCompany))
  const filteredBanks = bankAccounts.filter((b) => Number(b.company_id) === Number(selectedCompany))

  /* ==========================================================================
     CALCULATION LOGIC (FORM LOCAL)
     ========================================================================== */
  const itemsSubtotal = items.reduce((acc, item) => acc + (Number(item.qty || 0) * Number(item.price || 0)), 0)
  const itemsDiscount = itemsSubtotal * (Number(discountPercent || 0) / 100)
  const afterDiscount = itemsSubtotal - itemsDiscount
  const itemsVat = afterDiscount * (Number(vatPercent || 0) / 100)
  const grandTotalValue = afterDiscount + itemsVat

  const renderCurrency = (value: number, prefix = '') => (
    <div className="flex justify-between w-full px-1">
      <span>{prefix}Rp</span>
      <span>{value.toLocaleString('id-ID')}</span>
    </div>
  )

  /* ==========================================================================
     ITEMS CRUD INNER FORM
     ========================================================================== */
  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', qty: 1, price: 0 }])
  }
  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id))
  }
  const updateItem = (id: number, field: keyof Item, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  /* ==========================================================================
     API ACTIONS (SAVE & DELETE)
     ========================================================================== */
  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCompany === 0 || selectedEmployee === 0 || selectedBank === 0) {
      alert("Harap pilih Company, Employee, dan Bank Account yang valid sebelum menyimpan!")
      return
    }

    try {
      setSubmitting(true)
      setErrorMsg('')

      const cleanItems = items.map(({ description, qty, price }) => ({
        description,
        qty: Number(qty),
        price: Number(price)
      }))

      const pureDate = date.includes('T') ? date.split('T')[0] : date
      const isoDateTimeString = `${pureDate}T00:00:00Z`

      const payload = {
        quote_number: quoteNumber,
        date: isoDateTimeString,
        customer_name: customerName,
        customer_company: customerCompany,
        company_id: Number(selectedCompany),
        employee_id: Number(selectedEmployee),
        bank_account_id: Number(selectedBank),
        discount_percent: Number(discountPercent || 0),
        vat_percent: Number(vatPercent || 0),
        items: cleanItems,
        grand_total: Number(grandTotalValue)
      }

      // 🛠️ LANGKAH PERBAIKAN: Ambil data inputan form ke variabel sementara
      let savedData = { ...payload, id: editId || Date.now() } as QuotationData

      if (editId) {
        // 🛠️ PERBAIKAN: Hapus tanda "/" di paling belakang agar tidak memicu Network Error
        await api.put(`/quotations/${editId}`, payload)
        setSuccessMsg("Quotation berhasil diperbarui! 🎉")
      } else {
        const response = await api.post('/quotations/', payload)
        // Jika server Go mengembalikan ID baru, kita masukkan ke data pratinjau
        if (response.data && response.data.id) {
          savedData.id = response.data.id
        }
        setSuccessMsg("Quotation baru berhasil disimpan ke database! 🚀")
      }

      // 🛠️ LANGKAH PERBAIKAN: Kunci data agar tidak hilang saat di-reset
      setSelectedQuotationForPrint(savedData)

      resetForm()
      setActiveTab('print') // 🛠️ OTOMATIS BERPINDAH KE TAB PREVIEW SETELAH SAVE
      setCurrentPage(1)
      await loadAllData()

      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      const messageFromServer = err.response?.data?.error || err.response?.data?.message || err.message
      setErrorMsg(typeof messageFromServer === 'string' ? messageFromServer : "Gagal menyimpan berkas quotation.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuotation = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus arsip data penawaran ini?")) return
    try {
      setLoading(true)
      await api.delete(`/quotations/${id}`) 
      setSuccessMsg("Arsip data berhasil dihapus. 🗑️")
      await loadAllData()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      const serverMessage = err.response?.data?.error || err.response?.data?.message || err.message
      alert(`Gagal menghapus data dari server: ${serverMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (quote: QuotationData) => {
    setEditId(quote.id)
    setQuoteNumber(quote.quote_number)
    setDate(quote.date ? quote.date.split('T')[0] : new Date().toISOString().split('T')[0])
    setCustomerName(quote.customer_name)
    setCustomerCompany(quote.customer_company)
    setSelectedCompany(quote.company_id)
    setSelectedEmployee(quote.employee_id)
    setSelectedBank(quote.bank_account_id)
    setDiscountPercent(Number(quote.discount_percent || 0))
    setVatPercent(Number(quote.vat_percent || 0))
    
    if (typeof quote.items === 'string') {
      try { setItems(JSON.parse(quote.items)) } catch { setItems([]) }
    } else {
      setItems(quote.items || [])
    }
    setActiveTab('form')
  }

  const handleTriggerPrintPreview = (quote: QuotationData) => {
    setSelectedQuotationForPrint(quote)
    setActiveTab('print')
  }

  const resetForm = () => {
    setEditId(null)
    setCustomerName('')
    setCustomerCompany('')
    setDiscountPercent(0)
    setVatPercent(10) // Kita ubah default ke 10% agar langsung sinkron dengan form gambar 1
    setDate(new Date().toISOString().split('T')[0])
    setItems([{ id: Date.now(), description: 'kursi', qty: 10, price: 1000 }]) // Default item sesuai testing terakhirmu
    
    // 🛠️ FIX LOGIKA: Menghitung ulang urutan nomor otomatis dengan aman berdasarkan total penawaran yang ada
    if (companies.length > 0) {
      const defaultCompanyId = companies[0].id
      setSelectedCompany(defaultCompanyId)
      
      const currentYear = new Date().getFullYear()
      // Menggunakan alternatif quotations.length agar jumlah nomor urutnya selalu akurat dan tidak melompat kosong
      const nextSequence = quotations.length + 1
      setQuoteNumber(`SPN-ZRA/III/${currentYear}/${String(nextSequence).padStart(3, '0')}`)
    } else {
      setQuoteNumber('')
    }
  }

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Sinkronisasi Basis Data Server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
      {/* Stylesheet Cetak A4 */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden !important; }
          #real-print-area, #real-print-area * { visibility: visible !important; }
          #real-print-area {
            position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important; padding: 20mm !important; margin: 0 !important;
            box-shadow: none !important; color: #000000 !important;
          }
        }
      `}</style>

      {/* TOP NOTIFICATIONS */}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-xl mb-4 print:hidden flex justify-between items-center text-sm">
          <span><b>Error:</b> {errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="font-bold">×</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-5 py-3 rounded-xl mb-4 print:hidden text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex gap-2 mb-6 print:hidden">
        <button
          type="button"
          onClick={() => { setActiveTab('list'); setSelectedQuotationForPrint(null); }}
          className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'list' ? 'bg-sky-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border'}`}
        >
          <List size={16} /> Quotation Directory
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('form'); if(!editId) resetForm(); }}
          className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'form' ? 'bg-sky-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border'}`}
        >
          <FilePlus size={16} /> {editId ? 'Modify / Edit Form' : 'Create New Quotation'}
        </button>
      </div>

      {/* ==========================================================================
          TAB 1: DIRECTORY LIST TABLE
          ========================================================================= */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border shadow-sm p-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-800">Quotation Data Directory</h2>
              <p className="text-xs text-slate-500">Daftar rekapan seluruh arsip invoice penawaran harga perusahaan.</p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase">Filter PT:</span>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(Number(e.target.value))
                  setCurrentPage(1)
                  setTimeout(() => { loadAllData() }, 50)
                }}
                className="px-3 py-2 border rounded-xl bg-slate-50 text-xs font-bold text-slate-700"
              >
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase">
                  <th className="p-4">Quote Number</th>
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">Tidak ada data penawaran.</td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 font-medium text-slate-800">
                      <td className="p-4 font-mono font-bold text-sky-600">{q.quote_number || q.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{q.customer_name || 'No Name'}</div>
                        <div className="text-xs text-slate-500">{q.customer_company || '-'}</div>
                      </td>
                      <td className="p-4 text-slate-600">{q.date ? q.date.split('T')[0] : '-'}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button type="button" onClick={() => handleTriggerPrintPreview(q)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1 text-xs font-bold transition-all">
                          <Eye size={14} /> View Detail & Print
                        </button>
                        <button type="button" onClick={() => handleEditClick(q)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 text-xs font-bold transition-all">Edit</button>
                        <button type="button" onClick={() => handleDeleteQuotation(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-all"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-xs text-slate-500 font-bold">
              Menampilkan <span className="text-slate-800">{quotations.length}</span> dari <span className="text-slate-800">{totalItems}</span> data.
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50 hover:bg-slate-50"
              >Sebelumnya</button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setCurrentPage(pNum)}
                  className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${currentPage === pNum ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >{pNum}</button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50 hover:bg-slate-50"
              >Selanjutnya</button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          TAB 2: INPUT FORM AREA
          ========================================================================= */}
      {activeTab === 'form' && (
        <form onSubmit={handleSaveQuotation} className="bg-white rounded-3xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-600"><FileText size={28} /></div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{editId ? 'Update Quotation' : 'New Quotation Generator'}</h1>
              <p className="text-sm text-slate-500">Isi data relasi master secara realtime lalu simpan data langsung ke database server.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Master</label>
              <select
                value={selectedCompany}
                onChange={(e) => initFormDefaults(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
              >
                <option value={0}>Pilih Perusahaan Master</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.legal_name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Prepared By</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
              >
                <option value={0}>Pilih Karyawan</option>
                {filteredEmployees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bank Account</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
              >
                <option value={0}>Pilih Rekening</option>
                {filteredBanks.map((b) => <option key={b.id} value={b.id}>{b.bank_name} - {b.account_number}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Quote Number</label>
              <input type="text" value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Yusuf Deni" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Company</label>
              <input type="text" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} placeholder="PT Maju Jaya" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Discount %</label>
                <input type="number" min="0" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">VAT %</label>
                <input type="number" min="0" value={vatPercent} onChange={(e) => setVatPercent(Number(e.target.value))} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700" />
              </div>
            </div>
          </div>

          {/* LIST ITEM BARIS DINAMIS */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl text-slate-800">Quotation Item Specification</h2>
              <button type="button" onClick={addItem} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm transition-colors">
                <Plus size={16} /> Add New Row Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 items-start shadow-sm">
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-400">Item No {index + 1} - Deskripsi & Spesifikasi</span>
                    <textarea value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} rows={3} className="w-full border rounded-xl p-2.5 bg-white font-medium text-sm text-slate-700" required />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-400">Qty</span>
                    <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} className="w-full border rounded-xl p-2.5 bg-white font-bold text-sm text-slate-700" required />
                  </div>
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-400">Harga Satuan</span>
                    <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))} className="w-full border rounded-xl p-2.5 bg-white font-bold text-sm text-slate-700" required />
                  </div>
                  <div className="md:col-span-1 flex flex-col justify-end h-full self-end">
                    <button type="button" onClick={() => removeItem(item.id)} className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 rounded-xl p-3 transition-all flex items-center justify-center">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex justify-end gap-3">
            <button type="button" onClick={() => { setActiveTab('list'); resetForm(); }} className="px-6 py-3 border rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" disabled={submitting} className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50">
              {submitting ? 'Sedang Menyimpan...' : editId ? 'Simpan Perubahan (Update)' : 'Save Quotation to Server'}
            </button>
          </div>
        </form>
      )}

      {/* ==========================================================================
          TAB 3: DETAIL VIEW & PRINT DOCUMENT
          ========================================================================= */}
      {activeTab === 'print' && selectedQuotationForPrint && (() => {
        const q = selectedQuotationForPrint
        
        const printComp = companies.find((c) => c.id === q.company_id) || { legal_name: 'NAMA PERUSAHAAN', tagline: '', address: '', email: '', website: '', logo: '' }
        const printEmp = employees.find((e) => e.id === q.employee_id) || { name: '___________________', phone: '-', email: '-', position: '' }
        const printBank = bankAccounts.find((b) => b.id === q.bank_account_id) || { bank_name: '-', account_number: '-', account_name: '-' }
        
        let parsedItems: Item[] = []
        if (typeof q.items === 'string') {
          try { parsedItems = JSON.parse(q.items) } catch { parsedItems = [] }
        } else {
          parsedItems = q.items || []
        }

        // 🛠️ COALESCING REVOLUTION: Deteksi variabel database secara real-time (snake_case / camelCase fallback)
        const currentDiscountPercent = Number(q.discount_percent ?? (q as any).discountPercent ?? 0)
        const currentVatPercent = Number(q.vat_percent ?? (q as any).vatPercent ?? 0)

        const sTotal = parsedItems.reduce((acc, item) => acc + (Number(item.qty || 0) * Number(item.price || 0)), 0)
        const discValue = sTotal * (currentDiscountPercent / 100)
        const postDisc = sTotal - discValue
        const taxValue = postDisc * (currentVatPercent / 100)
        const gTotal = postDisc + taxValue

        return (
          <div>
            <div className="bg-white p-4 border rounded-2xl mb-6 shadow-sm flex justify-between items-center print:hidden">
              <span className="text-sm font-semibold text-slate-700">Pratinjau Dokumen: <b className="font-mono">{q.quote_number}</b></span>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setActiveTab('list'); setSelectedQuotationForPrint(null); }} className="px-4 py-2 border rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors">Kembali ke Daftar</button>
                <button type="button" onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs shadow-md transition-all">
                  <Printer size={14} /> Cetak Sekarang (Print / Save PDF)
                </button>
              </div>
            </div>

            <div id="real-print-area" className="bg-white max-w-[850px] mx-auto p-8 rounded-3xl shadow-sm border text-[12px] text-black leading-tight font-medium print:border-none print:shadow-none">
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-5">
                <div className="flex gap-4 items-start max-w-[70%]">
                  {printComp.logo && <img src={printComp.logo} className="w-16 h-16 object-contain mt-1 rounded-lg" alt="Logo" />}
                  <div>
                    <h1 className="font-black text-2xl uppercase tracking-wide text-slate-900">{printComp.legal_name}</h1>
                    {printComp.tagline && <p className="text-[11px] font-bold text-slate-500 italic mb-1">{printComp.tagline}</p>}
                    <p className="text-slate-800 font-semibold leading-normal mt-1">{printComp.address}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] font-bold">
                      {printComp.email && <span className="flex items-center gap-1"><Mail size={12} /> {printComp.email}</span>}
                      {printComp.website && <span className="flex items-center gap-1"><Globe size={12} /> {printComp.website}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right min-w-[25%]">
                  <h2 className="font-black text-2xl tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">QUOTATION</h2>
                  <div className="space-y-1 text-[11px] font-bold">
                    <div className="flex justify-between gap-3"><span className="text-slate-500">DATE :</span><span>{q.date ? q.date.split('T')[0] : '-'}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">QUOTE NO :</span><span className="font-mono text-slate-900 font-black">{q.quote_number}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6 text-[11px] font-semibold border-b border-dashed border-slate-200 pb-4">
                <div className="space-y-1">
                  <p><span className="text-slate-500 font-bold">Prepared by :</span> <span className="font-black text-slate-900 uppercase">{printEmp.name}</span></p>
                  <p><span className="text-slate-500 font-bold">Phone :</span> <span className="text-slate-900">{printEmp.phone}</span></p>
                  <p><span className="text-slate-500 font-bold">Email :</span> <span className="text-slate-900">{printEmp.email}</span></p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-slate-500 font-bold uppercase tracking-wider">To / Kepada Yth :</p>
                  <p className="font-black text-sm text-slate-900 uppercase">{q.customer_name}</p>
<p className="font-black text-slate-800 uppercase">{q.customer_company || (q as any).customerCompany || '-'}</p>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-900 font-semibold">
                <p>Dengan hormat,</p>
                <p className="mt-1">Bersama ini kami dari <b className="font-black text-black">{printComp.legal_name}</b> mengajukan penawaran harga dengan rincian sebagai berikut :</p>
              </div>

              <table className="w-full border-collapse border-2 border-slate-900 mt-4 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-900">
                    <th className="border border-slate-900 p-2 text-center w-8">No</th>
                    <th className="border border-slate-900 p-2 text-left">Item Description</th>
                    <th className="border border-slate-900 p-2 text-center w-12">Qty</th>
                    <th className="border border-slate-900 p-2 text-left w-28">Price</th>
                    <th className="border border-slate-900 p-2 text-left w-32">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedItems.map((item, index) => (
                    <tr key={item.id || index} className="text-slate-900 font-semibold border-b border-slate-300 break-inside-avoid">
                      <td className="border border-slate-300 p-2 text-center font-bold">{index + 1}</td>
                      <td className="border border-slate-300 p-2 whitespace-pre-line leading-normal text-slate-950">{item.description}</td>
                      <td className="border border-slate-300 p-2 text-center font-black">{item.qty}</td>
                      <td className="border border-slate-300 p-2">{renderCurrency(item.price)}</td>
                      <td className="border border-slate-300 p-2 font-black text-slate-950">{renderCurrency(item.qty * item.price)}</td>
                    </tr>
                  ))}
                  
                 {/* 1. TOTAL */}
                  <tr className="bg-slate-50 border-t-2 border-slate-900 font-bold">
                    <td colSpan={4} className="border border-slate-300 p-2 text-right font-black uppercase">Total</td>
                    <td className="border border-slate-300 p-2 font-black text-slate-950">
                      {renderCurrency(sTotal)}
                    </td>
                  </tr>
                  
                  {/* 2. DISCOUNT */}
                  <tr className="text-red-700 font-bold bg-white">
                    <td colSpan={4} className="border border-slate-300 p-2 text-right font-black uppercase">
                      Discount ({currentDiscountPercent}%)
                    </td>
                    <td className="border border-slate-300 p-2 font-black">
                      {renderCurrency(discValue, '-')}
                    </td>
                  </tr>

                  {/* 3. VAT / PPN */}
                  <tr className="text-slate-900 font-bold bg-white">
                    <td colSpan={4} className="border border-slate-300 p-2 text-right font-black uppercase">
                      VAT / PPN ({currentVatPercent}%)
                    </td>
                    <td className="border border-slate-300 p-2 font-black text-slate-950">
                      {renderCurrency(taxValue)}
                    </td>
                  </tr>

                  {/* 4. GRAND TOTAL */}
                  <tr className="bg-slate-100 text-slate-900 border-t-2 border-slate-900 font-black">
                    <td colSpan={4} className="border border-slate-900 p-2.5 text-right text-sm uppercase">Grand Total</td>
                    <td className="border border-slate-900 p-2.5 font-black text-sm bg-slate-100">
                      {renderCurrency(gTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 flex justify-between items-start break-inside-avoid">
                <div className="text-[11px]">
                  <h2 className="font-black text-slate-900 border-b border-slate-900 pb-0.5 mb-2 w-40 uppercase tracking-wider">Payment Info</h2>
                  <p><span className="text-slate-500 font-semibold">Bank:</span> <span className="font-black uppercase">{printBank.bank_name}</span></p>
                  <p><span className="text-slate-500 font-semibold">A/C No:</span> <span className="font-mono font-black">{printBank.account_number}</span></p>
                  <p><span className="text-slate-500 font-semibold">A/C Name:</span> <span className="font-black uppercase">{printBank.account_name}</span></p>
                </div>
                <div className="text-center min-w-[200px]">
                  <p className="text-slate-500">Sincerely,</p>
                  <p className="font-black text-black uppercase mt-0.5">{printComp.legal_name}</p>
                  <div className="h-16" />
                  <p className="font-black text-black border-b border-black pb-0.5 inline-block px-4 uppercase">{printEmp.name}</p>
                  {printEmp.position && <p className="text-slate-500 font-bold italic text-[10px]">{printEmp.position}</p>}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}