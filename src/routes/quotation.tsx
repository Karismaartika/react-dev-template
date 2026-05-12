import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { FileText, Plus, Printer, Trash2 } from 'lucide-react'

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
   UTILS
========================= */

const rupiah = (value: number) => 'Rp ' + value.toLocaleString('id-ID')

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
     CALCULATION
  ========================= */

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0)

  const discount = subtotal * (discountPercent / 100)

  const afterDiscount = subtotal - discount

  const vat = afterDiscount * 0.11

  const grandTotal = afterDiscount + vat

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
      {/* FORM */}
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
            <label className="text-sm font-semibold text-slate-600">
              Company
            </label>

            <select
              value={selectedCompany}
              onChange={(e) => {
                const companyId = +e.target.value

                setSelectedCompany(companyId)

                const employee = employees.find(
                  (e) => e.companyId === companyId,
                )

                const bank = bankAccounts.find((b) => b.companyId === companyId)

                if (employee) {
                  setSelectedEmployee(employee.id)
                }

                if (bank) {
                  setSelectedBank(bank.id)
                }
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
            <label className="text-sm font-semibold text-slate-600">
              Prepared By
            </label>

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
            <label className="text-sm font-semibold text-slate-600">
              Bank Account
            </label>

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

          {/* QUOTE */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Quote Number
            </label>

            <input
              type="text"
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            />
          </div>

          {/* CUSTOMER NAME */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Customer Name
            </label>

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
            <label className="text-sm font-semibold text-slate-600">
              Customer Company
            </label>

            <input
              type="text"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              placeholder="PT Maju Jaya"
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            />
          </div>

          {/* DISCOUNT */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Discount %
            </label>

            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            />
          </div>
        </div>

        {/* ITEM */}
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
                  onChange={(e) =>
                    updateItem(item.id, 'description', e.target.value)
                  }
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
                  onChange={(e) =>
                    updateItem(item.id, 'price', +e.target.value)
                  }
                  className="md:col-span-3 border rounded-xl p-3"
                />

                <button
                  onClick={() => removeItem(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                >
                  <Trash2 size={18} className="mx-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
          >
            <Printer size={18} />
            Print PDF
          </button>
        </div>
      </div>

      {/* PDF */}
      <div
        id="print-area"
        className="
    bg-white
    max-w-[850px]
    mx-auto
    p-6
    text-[12px]
    text-black
    leading-tight
    print:max-w-full
    print:shadow-none
    print:p-4
  "
      >
        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-3">
          <div className="flex gap-4">
            <img src={company?.logo} className="w-20 h-20 object-cover" />

            <div>
              <h1 className="font-black text-3xl uppercase">
                {company?.legalName}
              </h1>

              <p>{company?.address}</p>

              <div className="flex gap-4 mt-2 text-sm">
                <span>{company?.email}</span>

                <span>{company?.website}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <h2 className="font-black text-2xl">QUOTATION</h2>

            <div className="mt-3 space-y-1">
              <p>
                <b>DATE :</b> {date}
              </p>

              <p>
                <b>QUOTE :</b> {quoteNumber}
              </p>
            </div>
          </div>
        </div>

        {/* PREPARED */}
        <div className="flex justify-between mt-8">
          <div className="space-y-2">
            <p>Prepared by : {employee?.name}</p>

            <p>Phone : {employee?.phone}</p>

            <p>Email : {employee?.email}</p>
          </div>

          <div className="text-right">
            <p>To :</p>

            <p className="font-bold">{customerName}</p>

            <p className="font-bold">{customerCompany}</p>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full border-collapse border mt-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2">No</th>

              <th className="border p-2">Item</th>

              <th className="border p-2">Qty</th>

              <th className="border p-2">Price</th>

              <th className="border p-2">Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="border p-2">{index + 1}</td>

                <td className="border p-2 whitespace-pre-line">
                  {item.description}
                </td>

                <td className="border p-2 text-center">{item.qty}</td>

                <td className="border p-2">{rupiah(item.price)}</td>

                <td className="border p-2">{rupiah(item.qty * item.price)}</td>
              </tr>
            ))}

            <tr>
              <td colSpan={4} className="border p-2 text-right font-bold">
                Total
              </td>

              <td className="border p-2">{rupiah(subtotal)}</td>
            </tr>

            <tr>
              <td colSpan={4} className="border p-2 text-right font-bold">
                VAT 11%
              </td>

              <td className="border p-2">{rupiah(vat)}</td>
            </tr>

            <tr>
              <td
                colSpan={4}
                className="border p-2 text-right font-black text-lg"
              >
                Grand Total
              </td>

              <td className="border p-2 font-black text-lg">
                {rupiah(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* PAYMENT */}
        <div className="mt-12">
          <h2 className="font-bold mb-3">Payment Information</h2>

          <div className="space-y-1">
            <p>Bank : {bank?.bank}</p>

            <p>Account Number : {bank?.accountNumber}</p>

            <p>Account Name : {bank?.accountName}</p>
          </div>
        </div>

        {/* SIGN */}
        <div className="mt-6 flex justify-end text-center">
          <div>
            <p>Sincerely,</p>

            <p className="font-bold">{company?.legalName}</p>

            <div className="h-24" />

            <p className="font-bold text-lg">{employee?.name}</p>

            <p>{employee?.position}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
