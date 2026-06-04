import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { FileText, Plus, Printer, Trash2, Mail, Globe } from 'lucide-react'

export const Route = createFileRoute('/quotation')({
  component: QuotationPage,
})

/* =========================
   MASTER DATA
========================= */

const companies = [
  {
    id: 1,
    name: 'Zerra',
    legalName: 'PT Zerra Teknologi',
    tagline: 'Where Security Meets Intelligence',
    address: 'Jl. Joyogrand Blok EE No. 14, Merjosari, Lowokwaru',
    email: 'zerrateknologiintegrasi@gmail.com',
    phone: '08123456789',
    website: 'myzerra.id',
    logo: '/logo-zerra.png',
  },
  {
    id: 2,
    name: 'Cahaya Mustika',
    legalName: 'CV Cahaya Mustika',
    tagline: 'Office Equipment Center',
    address: 'Malang, Jawa Timur',
    email: 'cahayamustika@gmail.com',
    phone: '08987654321',
    website: 'cahayamustika.id',
    logo: '/logo-cm.png',
  },
]

const employees = [
  {
    id: 1,
    name: 'Valentinus Aldo',
    email: 'aldo@gmail.com',
    phone: '08123456789',
    position: 'Director',
    companyId: 1,
  },
  {
    id: 2,
    name: 'Kharisma Artika',
    email: 'kharisma@gmail.com',
    phone: '08111111111',
    position: 'Frontend Developer',
    companyId: 1,
  },
  {
    id: 3,
    name: 'Budi Santoso',
    email: 'budi@gmail.com',
    phone: '082222222222',
    position: 'Marketing',
    companyId: 2,
  },
]

const bankAccounts = [
  {
    id: 1,
    bank: 'BCA',
    accountName: 'PT Zerra Teknologi',
    accountNumber: '1230000000',
    companyId: 1,
  },
  {
    id: 2,
    bank: 'BRI',
    accountName: 'CV Cahaya Mustika',
    accountNumber: '987654321',
    companyId: 2,
  },
]

/* =========================
   TYPES
========================= */

type Item = {
  id: number
  description: string
  qty: number
  price: number
}

/* =========================
   COMPONENT
========================= */

function QuotationPage() {
  const [selectedCompany, setSelectedCompany] = useState(1)
  const [selectedEmployee, setSelectedEmployee] = useState(1)
  const [selectedBank, setSelectedBank] = useState(1)
  const [quoteNumber, setQuoteNumber] = useState('SPN-ZRA/III/2026/001')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [customerName, setCustomerName] = useState('')
  const [customerCompany, setCustomerCompany] = useState('')
  
  const [discountPercent, setDiscountPercent] = useState(0)
  const [vatPercent, setVatPercent] = useState(11)

  const [items, setItems] = useState<Item[]>([
    {
      id: Date.now(),
      description:
        '(Contoh)\nMeja Kerja Ichiko\nSpesifikasi :\n- Type : UNO UOD 1031\n- Particle Board Fin. Tacosid\n- Ukuran : 120 X 60 X 75 cm',
      qty: 1,
      price: 1000000,
    },
  ])

  /* =========================
     AUTOMATIC NUMBER GENERATOR LOGIC
  ========================= */
  useEffect(() => {
    const currentTotalQuotations = 4;
    const nextSequence = currentTotalQuotations + 1;
    
    const currentYear = new Date().getFullYear();
    const generatedNumber = `SPN-ZRA/III/${currentYear}/${String(nextSequence).padStart(3, '0')}`;
    
    setQuoteNumber(generatedNumber);
  }, []);

  /* =========================
     FILTER DATA
  ========================= */

  const filteredEmployees = employees.filter(
    (e) => e.companyId === selectedCompany,
  )

  const filteredBanks = bankAccounts.filter(
    (b) => b.companyId === selectedCompany,
  )

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

  /* =========================
     RENDER RUPIAH FUNCTION (SPLIT FOR ALIGNMENT)
  ========================= */
  const renderCurrency = (value: number, prefix = '') => {
    return (
      <div className="flex justify-between w-full px-1">
        <span>{prefix}Rp</span>
        <span>{value.toLocaleString('id-ID')}</span>
      </div>
    )
  }

  /* =========================
     ITEM ACTION
  ========================= */

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        description: '',
        qty: 1,
        price: 0,
      },
    ])
  }

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id))
  }

  const updateItem = (id: number, field: keyof Item, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  /* =========================
     PRINT
  ========================= */

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
      {/* Trik CSS Cetak Akurat & Pengatur Ketebalan Font */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 20mm !important; 
            margin: 0 !important;
            box-shadow: none !important;
            font-weight: 500 !important; 
          }
          html, body {
            background-color: #fff !important;
          }
        }
      `}</style>

      {/* FORM GENERATOR INPUT */}
      <div className="bg-white rounded-3xl shadow-sm border p-6 mb-6 print:hidden">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="text-sky-600" />
          <h1 className="text-3xl font-bold text-slate-800">
            Quotation Generator
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* COMPANY */}
          <div>
            <label className="text-sm font-semibold text-slate-600">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => {
                const companyId = +e.target.value
                setSelectedCompany(companyId)

                const employee = employees.find((e) => e.companyId === companyId)
                const bank = bankAccounts.find((b) => b.companyId === companyId)

                if (employee) setSelectedEmployee(employee.id)
                if (bank) setSelectedBank(bank.id)
              }}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.legalName}
                </option>
              ))}
            </select>
          </div>

          {/* PREPARED BY */}
          <div>
            <label className="text-sm font-semibold text-slate-600">Prepared By</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(+e.target.value)}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            >
              {filteredEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* BANK */}
          <div>
            <label className="text-sm font-semibold text-slate-600">Bank Account</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(+e.target.value)}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            >
              {filteredBanks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bank} - {b.accountNumber}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div>
            <label className="text-sm font-semibold text-slate-600">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            />
          </div>

          {/* QUOTE NUMBER */}
          <div>
            <label className="text-sm font-semibold text-slate-600">Quote Number</label>
            <input
              type="text"
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            />
          </div>

          {/* CUSTOMER NAME */}
          <div>
            <label className="text-sm font-semibold text-slate-600">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Yusuf Deni"
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            />
          </div>

          {/* CUSTOMER COMPANY */}
          <div>
            <label className="text-sm font-semibold text-slate-600">Customer Company</label>
            <input
              type="text"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              placeholder="PT Maju Jaya"
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            />
          </div>

          {/* DISCOUNT & TAX INPUTS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-600">Discount %</label>
              <input
                type="number"
                min="0"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full mt-2 px-4 py-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Tax / VAT %</label>
              <input
                type="number"
                min="0"
                value={vatPercent}
                onChange={(e) => setVatPercent(Number(e.target.value))}
                className="w-full mt-2 px-4 py-3 border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* LIST ITEM SECTION */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-xl">Quotation Item</h2>
            <button
              onClick={addItem}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 border rounded-2xl p-4"
              >
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  rows={5}
                  className="md:col-span-6 border rounded-xl p-3"
                />
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, 'qty', +e.target.value)}
                  className="md:col-span-2 border rounded-xl p-3"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(item.id, 'price', +e.target.value)}
                  className="md:col-span-3 border rounded-xl p-3"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl p-3"
                >
                  <Trash2 size={18} className="mx-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Printer size={18} />
            Print PDF
          </button>
        </div>
      </div>

      {/* PDF OUTPUT VIEW AREA */}
      <div
        id="print-area"
        className="bg-white max-w-[850px] mx-auto p-6 text-[12px] text-black leading-tight print:max-w-full print:shadow-none print:p-4 font-medium"
      >
        {/* LOGO & PROFILE */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex gap-4 items-start max-w-[70%]">
            <img src={company?.logo} className="w-16 h-16 object-contain mt-1" />
            <div>
              <h1 className="font-black text-2xl uppercase tracking-wide text-slate-900">
                {company?.legalName}
              </h1>
              <p className="text-[11px] font-bold text-slate-500 mb-1 italic">
                {company?.tagline}
              </p>
              <p className="text-slate-800 font-semibold leading-normal">{company?.address}</p>
              
              {/* Info Kontak dengan Icon Kecil */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-800 font-bold">
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-slate-600" /> {company?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={12} className="text-slate-600" /> {company?.website}
                </span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Judul Quotation Menurun */}
          <div className="text-right min-w-[25%]">
            <h2 className="font-black text-2xl tracking-wider text-slate-900 border-b-2 border-slate-400 pb-1 mb-2">
              QUOTATION
            </h2>
            <div className="space-y-1 text-[11px] font-bold">
              <div className="flex justify-between gap-2">
                <span className="text-slate-700">DATE :</span>
                <span className="text-slate-900">{date}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-700">QUOTE :</span>
                <span className="font-mono text-slate-900">{quoteNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CLIENT DETAILS */}
        <div className="flex justify-between mt-6 text-[11px] font-semibold">
          <div className="space-y-1">
            <p><span className="text-slate-600 font-bold">Prepared by :</span> <span className="font-black text-slate-900">{employee?.name}</span></p>
            <p><span className="text-slate-600 font-bold">Phone :</span> <span className="text-slate-900 font-bold">{employee?.phone}</span></p>
            <p><span className="text-slate-600 font-bold">Email :</span> <span className="text-slate-900 font-bold">{employee?.email}</span></p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-slate-600 font-bold">To :</p>
            <p className="font-black text-sm text-slate-900">{customerName || '-'}</p>
            <p className="font-black text-slate-800">{customerCompany || '-'}</p>
          </div>
        </div>

        {/* Teks Pembuka Dinamis */}
        <div className="mt-6 text-[11px] leading-relaxed text-slate-900 font-semibold">
          <p>Dengan hormat,</p>
          <p className="mt-1">
            Besama ini kami dari <b className="font-black text-black">{company?.legalName}</b> mengajukan penawaran penawaran, adapun harga yang kami ajukan yaitu, sebagai berikut :
          </p>
        </div>

        {/* ITEM PRICE TABLE */}
        <table className="w-full border-collapse border-2 border-slate-400 mt-4 text-[11px]">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-black border-b-2 border-slate-400">
              <th className="border border-slate-400 p-2 text-center w-8">No</th>
              <th className="border border-slate-400 p-2 text-left">Item</th>
              <th className="border border-slate-400 p-2 text-center w-12">Qty</th>
              <th className="border border-slate-400 p-2 text-left w-28">Price</th>
              <th className="border border-slate-400 p-2 text-left w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="text-slate-900 font-semibold border-b border-slate-300">
                <td className="border border-slate-300 p-2 text-center font-bold">{index + 1}</td>
                <td className="border border-slate-300 p-2 whitespace-pre-line leading-normal font-bold text-slate-950">{item.description}</td>
                <td className="border border-slate-300 p-2 text-center font-bold">{item.qty}</td>
                <td className="border border-slate-300 p-2 font-bold">{renderCurrency(item.price)}</td>
                <td className="border border-slate-300 p-2 font-black">{renderCurrency(item.qty * item.price)}</td>
              </tr>
            ))}

            {/* Subtotal */}
            <tr className="bg-slate-50 border-t-2 border-slate-400">
              <td colSpan={4} className="border border-slate-300 p-2 text-right font-black text-slate-800">Total</td>
              <td className="border border-slate-300 p-2 font-black text-slate-950">{renderCurrency(subtotal)}</td>
            </tr>

            {/* Discount */}
            {discountPercent > 0 && (
              <tr className="text-red-700">
                <td colSpan={4} className="border border-slate-300 p-2 text-right font-black">
                  Discount ({discountPercent}%)
                </td>
                <td className="border border-slate-300 p-2 font-black">{renderCurrency(discount, '-')}</td>
              </tr>
            )}

            {/* VAT/Pajak */}
            {vatPercent > 0 && (
              <tr className="text-slate-900">
                <td colSpan={4} className="border border-slate-300 p-2 text-right font-black text-slate-800">
                  VAT ({vatPercent}%)
                </td>
                <td className="border border-slate-300 p-2 font-black text-slate-950">{renderCurrency(vat)}</td>
              </tr>
            )}

            {/* Grand Total - Diperkecil & Sejajar Rata Kiri-Kanan */}
            <tr className="bg-slate-200 text-slate-900 border-t-2 border-slate-400">
              <td colSpan={4} className="border border-slate-400 p-2 text-right font-black text-sm uppercase">
                Grand Total
              </td>
              <td className="border border-slate-400 p-2 font-black text-sm text-black">
                {renderCurrency(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* PAYMENT INFORMATION */}
        <div className="mt-8 text-[11px]">
          <h2 className="font-black text-slate-900 border-b-2 border-slate-400 pb-1 mb-2 w-48">
            Payment Information
          </h2>
          <div className="space-y-0.5 text-slate-900 font-bold">
            <p><span className="text-slate-600">Bank :</span> <span className="font-black">{bank?.bank}</span></p>
            <p><span className="text-slate-600">Account Number :</span> <span className="font-mono font-black text-black">{bank?.accountNumber}</span></p>
            <p><span className="text-slate-600">Account Name :</span> <span className="font-black">{bank?.accountName}</span></p>
          </div>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="mt-8 flex justify-end text-center text-[11px] font-bold">
          <div className="min-w-[200px]">
            <p className="text-slate-700">Sincerely,</p>
            <p className="font-black text-black uppercase">{company?.legalName}</p>
            <div className="h-20" />
            <p className="font-black text-sm text-black border-b-2 border-black pb-0.5 inline-block px-4">
              {employee?.name}
            </p>
            <p className="text-slate-600 mt-1 font-bold">{employee?.position}</p>
          </div>
        </div>
      </div>
    </div>
  )
}