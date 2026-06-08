import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { FileText, Globe, Mail, Plus, Printer, Trash2, List, FilePlus, Eye } from 'lucide-react'
import api from '../services/api'

export const Route = createFileRoute('/quotation')({
  component: QuotationPage,
})

/* =========================
   TYPES DEFINITIONS
========================= */
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
  id: string | number // Diubah agar bisa menerima string id lokal temporer
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

/* =========================
   MAIN COMPONENT
========================= */
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
      id: 'init-1',
      description: '(Contoh) Meja Kerja Ichiko\nSpesifikasi :\n- Type : UNO UOD 1031\n- Ukuran : 120 X 60 X 75 cm',
      qty: 1,
      price: 1000000,
    },
  ])

  /* =========================
     FETCH ALL INITIAL DATA
  ========================= */
  const loadAllData = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      
      const [resCompany, resEmployee, resBank, resQuotes] = await Promise.all([
        api.get('/companies'),
        api.get('/employees'),
        api.get('/bank_accounts'),
        api.get('/quotations').catch(() => ({ data: { data: [] } }))
      ])

      const fetchedCompanies: CompanyType[] = resCompany.data?.data || []
      const fetchedEmployees: EmployeeType[] = resEmployee.data?.data || []
      
      let fetchedBanks: BankAccountType[] = []
      if (Array.isArray(resBank.data)) {
        fetchedBanks = resBank.data
      } else if (resBank.data && Array.isArray(resBank.data.data)) {
        fetchedBanks = resBank.data.data
      }

      const fetchedQuotes: QuotationData[] = resQuotes.data?.data || resQuotes.data || []

      setCompanies(fetchedCompanies)
      setEmployees(fetchedEmployees)
      setBankAccounts(fetchedBanks)
      setQuotations(fetchedQuotes)

      if (fetchedCompanies.length > 0 && selectedCompany === 0) {
        initFormDefaults(fetchedCompanies[0].id, fetchedEmployees, fetchedBanks, fetchedQuotes.length)
      }

    } catch (err: any) {
      console.error("Gagal memuat data:", err)
      setErrorMsg("Gagal sinkronisasi data dengan API server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const initFormDefaults = (companyId: number, emps = employees, banks = bankAccounts, currentTotal = quotations.length) => {
    setSelectedCompany(companyId)
    const firstEmp = emps.find((e) => e.company_id === companyId)
    const firstBank = banks.find((b) => b.company_id === companyId)
    if (firstEmp) setSelectedEmployee(firstEmp.id)
    if (firstBank) setSelectedBank(firstBank.id)
    
    const currentYear = new Date().getFullYear()
    setQuoteNumber(`SPN-ZRA/III/${currentYear}/${String(currentTotal + 1).padStart(3, '0')}`)
  }

  /* =========================
     FILTER RELATIONAL DATA
  ========================= */
  const filteredEmployees = employees.filter((e) => e.company_id === selectedCompany)
  const filteredBanks = bankAccounts.filter((b) => b.company_id === selectedCompany)

  const company = companies.find((c) => c.id === selectedCompany)
  const employee = filteredEmployees.find((e) => e.id === selectedEmployee)
  const bank = filteredBanks.find((b) => b.id === selectedBank)

  /* =========================
     CALCULATION LOGIC
  ========================= */
  const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0)
  const discount = subtotal * (discountPercent / 100)
  const afterDiscount = subtotal - discount
  const vat = afterDiscount * (vatPercent / 100)
  const grandTotal = afterDiscount + vat

  const renderCurrency = (value: number, prefix = '') => (
    <div className="flex justify-between w-full px-1">
      <span>{prefix}Rp</span>
      <span>{value.toLocaleString('id-ID')}</span>
    </div>
  )

  /* =========================
     ITEMS CRUD INNER FORM
  ========================= */
  const addItem = () => {
    const randomId = 'item-' + Math.random().toString(36).substr(2, 9)
    setItems([...items, { id: randomId, description: '', qty: 1, price: 0 }])
  }
  const removeItem = (id: string | number) => {
    setItems(items.filter((i) => i.id !== id))
  }
  const updateItem = (id: string | number, field: keyof Item, value: any) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  /* =========================
     API ACTIONS (SAVE & DELETE)
  ========================= */
  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany || !selectedEmployee || !selectedBank) {
      alert("Harap lengkapi entitas data master (Company, Employee, Bank)!")
      return
    }

    try {
      setSubmitting(true)
      setErrorMsg('')

      // Bersihkan properti ID lokal temporer agar tidak merusak validasi tipe data integer/increment di server backend
      const cleanedItems = items.map(({ description, qty, price }) => ({
        description,
        qty: Number(qty),
        price: Number(price)
      }))

      const payload = {
        quote_number: quoteNumber,
        date,
        customer_name: customerName,
        customer_company: customerCompany,
        company_id: Number(selectedCompany),
        employee_id: Number(selectedEmployee),
        bank_account_id: Number(selectedBank),
        discount_percent: Number(discountPercent),
        vat_percent: Number(vatPercent),
        items: cleanedItems,
      }

      if (editId) {
        await api.put(`/quotations/${editId}`, payload)
        setSuccessMsg("Quotation berhasil diperbarui!")
      } else {
        await api.post('/quotations', payload)
        setSuccessMsg("Quotation baru berhasil disimpan ke database!")
      }

      resetForm()
      await loadAllData()
      setActiveTab('list')

      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || "Gagal menyimpan berkas quotation ke server backend. Cek kembali kelengkapan field data.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuotation = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus arsip data penawaran ini?")) return
    try {
      await api.delete(`/quotations/${id}`)
      setQuotations(quotations.filter((q) => q.id !== id))
      setSuccessMsg("Arsip data berhasil dihapus.")
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert("Gagal menghapus data dari server.")
    }
  }

  const handleEditClick = (quote: QuotationData) => {
    setEditId(quote.id)
    setQuoteNumber(quote.quote_number)
    setDate(quote.date)
    setCustomerName(quote.customer_name)
    setCustomerCompany(quote.customer_company)
    setSelectedCompany(quote.company_id)
    setSelectedEmployee(quote.employee_id)
    setSelectedBank(quote.bank_account_id)
    setDiscountPercent(quote.discount_percent)
    setVatPercent(quote.vat_percent)
    
    if (typeof quote.items === 'string') {
      try { 
        const parsed = JSON.parse(quote.items)
        setItems(parsed.map((item: any, idx: number) => ({ ...item, id: item.id || `edit-${idx}` })))
      } catch { setItems([]) }
    } else {
      setItems((quote.items || []).map((item, idx) => ({ ...item, id: item.id || `edit-${idx}` })))
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
    setItems([{ id: 'init-1', description: '', qty: 1, price: 0 }])
    if (companies.length > 0) initFormDefaults(companies[0].id)
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
         ========================================================================== */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-800">Quotation Data Directory</h2>
            <p className="text-xs text-slate-500">Daftar rekapan seluruh arsip invoice penawaran harga perusahaan yang tersimpan di sistem.</p>
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
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">Tidak ada data penawaran yang ditemukan. Klik tab Create untuk menambah baru.</td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 font-medium text-slate-800">
                      <td className="p-4 font-mono font-bold text-sky-600">{q.quote_number}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{q.customer_name}</div>
                        <div className="text-xs text-slate-500">{q.customer_company}</div>
                      </td>
                      <td className="p-4 text-slate-600">{q.date}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button type="button" onClick={() => handleTriggerPrintPreview(q)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1 text-xs font-bold transition-all">
                          <Eye size={14} /> View Detail & Print
                        </button>
                        <button type="button" onClick={() => handleEditClick(q)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 text-xs font-bold transition-all">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteQuotation(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================================
         TAB 2: INPUT FORM AREA
         ========================================================================== */}
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
                onChange={(e) => {
                  const companyId = +e.target.value
                  initFormDefaults(companyId)
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500"
              >
                <option value={0}>Pilih Perusahaan Master</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.legal_name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Prepared By</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(+e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
                disabled={filteredEmployees.length === 0}
              >
                <option value={0}>Pilih Karyawan</option>
                {filteredEmployees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bank Account</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(+e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
                disabled={filteredBanks.length === 0}
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
                    <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', +e.target.value)} className="w-full border rounded-xl p-2.5 bg-white font-bold text-sm text-slate-700" required />
                  </div>
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-400">Harga Satuan</span>
                    <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', +e.target.value)} className="w-full border rounded-xl p-2.5 bg-white font-bold text-sm text-slate-700" required />
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
         ========================================================================== */}
      {activeTab === 'print' && selectedQuotationForPrint && (() => {
        const q = selectedQuotationForPrint
        const printComp = companies.find((c) => c.id === q.company_id)
        const printEmp = employees.find((e) => e.id === q.employee_id)
        const printBank = bankAccounts.find((b) => b.id === q.bank_account_id)
        
        let parsedItems: Item[] = []
        if (typeof q.items === 'string') {
          try { parsedItems = JSON.parse(q.items) } catch { parsedItems = [] }
        } else {
          parsedItems = q.items || []
        }

        const sTotal = parsedItems.reduce((acc, item) => acc + item.qty * item.price, 0)
        const discValue = sTotal * (q.discount_percent / 100)
        const postDisc = sTotal - discValue
        const taxValue = postDisc * (q.vat_percent / 100)
        const gTotal = postDisc + taxValue

        return (
          <div>
            <div className="bg-white p-4 border rounded-2xl mb-6 shadow-sm flex justify-between items-center print:hidden">
              <span className="text-sm font-semibold text-slate-700">Pratinjau Dokumen Dokumen: <b className="font-mono">{q.quote_number}</b></span>
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
                  {printComp?.logo && <img src={printComp.logo} className="w-16 h-16 object-contain mt-1 rounded-lg" alt="Logo" />}
                  <div>
                    <h1 className="font-black text-2xl uppercase tracking-wide text-slate-900">{printComp?.legal_name || 'NAMA PERUSAHAAN'}</h1>
                    {printComp?.tagline && <p className="text-[11px] font-bold text-slate-500 italic mb-1">{printComp.tagline}</p>}
                    <p className="text-slate-800 font-semibold leading-normal mt-1">{printComp?.address}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] font-bold">
                      {printComp?.email && <span className="flex items-center gap-1"><Mail size={12} /> {printComp.email}</span>}
                      {printComp?.website && <span className="flex items-center gap-1"><Globe size={12} /> {printComp.website}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right min-w-[25%]">
                  <h2 className="font-black text-2xl tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">QUOTATION</h2>
                  <div className="space-y-1 text-[11px] font-bold">
                    <div className="flex justify-between gap-3"><span className="text-slate-500">DATE :</span><span>{q.date}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">QUOTE NO :</span><span className="font-mono text-slate-900 font-black">{q.quote_number}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6 text-[11px] font-semibold border-b border-dashed border-slate-200 pb-4">
                <div className="space-y-1">
                  <p><span className="text-slate-500 font-bold">Prepared by :</span> <span className="font-black text-slate-900 uppercase">{printEmp?.name || '-'}</span></p>
                  <p><span className="text-slate-500 font-bold">Phone :</span> <span className="text-slate-900">{printEmp?.phone || '-'}</span></p>
                  <p><span className="text-slate-500 font-bold">Email :</span> <span className="text-slate-900">{printEmp?.email || '-'}</span></p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-slate-500 font-bold uppercase tracking-wider">To / Kepada Yth :</p>
                  <p className="font-black text-sm text-slate-900 uppercase">{q.customer_name}</p>
                  <p className="font-black text-slate-800 uppercase">{q.customer_company}</p>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-900 font-semibold">
                <p>Dengan hormat,</p>
                <p className="mt-1">Bersama ini kami dari <b className="font-black text-black">{printComp?.legal_name}</b> mengajukan penawaran harga dengan rincian sebagai berikut :</p>
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
                    <tr key={item.id} className="text-slate-900 font-semibold border-b border-slate-300 break-inside-avoid">
                      <td className="border border-slate-300 p-2 text-center font-bold">{index + 1}</td>
                      <td className="border border-slate-300 p-2 whitespace-pre-line leading-normal text-slate-950">{item.description}</td>
                      <td className="border border-slate-300 p-2 text-center font-black">{item.qty}</td>
                      <td className="border border-slate-300 p-2">{renderCurrency(item.price)}</td>
                      <td className="border border-slate-300 p-2 font-black text-slate-950">{renderCurrency(item.qty * item.price)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 border-t-2 border-slate-900 font-bold">
                    <td colSpan={4} className="border border-slate-300 p-2 text-right font-black uppercase">Total</td>
                    <td className="border border-slate-300 p-2 font-black text-slate-950">{renderCurrency(sTotal)}</td>
                  </tr>
                  {q.discount_percent > 0 && (
                    <tr className="text-red-700 font-bold bg-white">
                      <td colSpan={4} className="border border-slate-300 p-2 text-right font-black uppercase">Discount ({q.discount_percent}%)</td>
                      <td className="border border-slate-300 p-2 font-black">{renderCurrency(discValue, '-')}</td>
                    </tr>
                  )}
                  {q.vat_percent > 0 && (
                    <tr className="text-slate-900 font-bold bg-white">
                      <td colSpan={4} className="border border-slate-300 p-2 text-right font-black uppercase">VAT ({q.vat_percent}%)</td>
                      <td className="border border-slate-300 p-2 font-black text-slate-950">{renderCurrency(taxValue)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 text-slate-900 border-t-2 border-slate-900 font-black">
                    <td colSpan={4} className="border border-slate-900 p-2.5 text-right text-sm uppercase">Grand Total</td>
                    <td className="border border-slate-900 p-2.5 font-black text-sm bg-slate-100">{renderCurrency(gTotal)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 flex justify-between items-start break-inside-avoid">
                <div className="text-[11px]">
                  <h2 className="font-black text-slate-900 border-b border-slate-900 pb-0.5 mb-2 w-40 uppercase tracking-wider">Payment Info</h2>
                  <p><span className="text-slate-500 font-semibold">Bank:</span> <span className="font-black uppercase">{printBank?.bank_name || '-'}</span></p>
                  <p><span className="text-slate-500 font-semibold">A/C No:</span> <span className="font-mono font-black">{printBank?.account_number || '-'}</span></p>
                  <p><span className="text-slate-500 font-semibold">A/C Name:</span> <span className="font-black uppercase">{printBank?.account_name || '-'}</span></p>
                </div>
                <div className="text-center min-w-[200px]">
                  <p className="text-slate-500">Sincerely,</p>
                  <p className="font-black text-black uppercase mt-0.5">{printComp?.legal_name}</p>
                  <div className="h-16" />
                  <p className="font-black text-black border-b border-black pb-0.5 inline-block px-4 uppercase">{printEmp?.name}</p>
                  {printEmp?.position && <p className="text-slate-500 font-bold italic text-[10px]">{printEmp.position}</p>}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}