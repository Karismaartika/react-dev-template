import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'

export const Route = createFileRoute('/quotation')({
  component: QuotationPage,
})

function formatRupiah(value: number) {
  return 'Rp ' + value.toLocaleString('id-ID')
}

function QuotationPage() {
  const printRef = useRef<HTMLDivElement | null>(null)

  const [logo, setLogo] = useState<string | null>(null)

  const [form, setForm] = useState({
    customerName: '',
    customerCompany: '',
    date: '',
    quoteNumber: '',
    itemName: '',
    qty: 1,
    price: 0,
  })

  const [items, setItems] = useState<any[]>([])

  // ✅ FIX HANDLE CHANGE (NUMBER SAFE)
  const handleChange = (e: any) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: name === 'qty' || name === 'price' ? Number(value) : value,
    }))
  }

  // ✅ HANDLE LOGO
  const handleLogo = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // ✅ ADD ITEM (SAFE UPDATE)
  const addItem = () => {
    if (!form.itemName || form.qty <= 0) {
      alert('Isi item dengan benar!')
      return
    }

    setItems((prev) => [
      ...prev,
      {
        name: form.itemName,
        qty: Number(form.qty),
        price: Number(form.price),
      },
    ])

    setForm((prev) => ({
      ...prev,
      itemName: '',
      qty: 1,
      price: 0,
    }))
  }

  // ✅ REMOVE ITEM
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // ✅ CALCULATION (AMAN)
  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.qty) * Number(item.price),
    0,
  )

  const vat = subtotal * 0.11
  const total = subtotal + vat

  // ✅ DOWNLOAD PDF
  const handleDownload = async () => {
    const element = printRef.current
    if (!element) return

    const html2pdf = (await import('html2pdf.js')).default

    html2pdf()
      .set({
        margin: 0.5,
        filename: 'quotation.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save()
  }

  return (
    <div className="min-h-screen bg-sky-100 p-6 flex justify-center">
      <div className="w-full max-w-7xl grid md:grid-cols-2 gap-6">
        {/* ================= FORM ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-sky-700 mb-4">
            Form Quotation
          </h2>

          <input
            name="customerName"
            placeholder="Nama Customer"
            value={form.customerName}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />

          <input
            name="customerCompany"
            placeholder="Perusahaan"
            value={form.customerCompany}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />

          <input
            name="quoteNumber"
            placeholder="No Quotation"
            value={form.quoteNumber}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded"
          />

          <input type="file" onChange={handleLogo} className="mb-4" />

          <hr className="my-4" />

          <h3 className="font-semibold mb-2 text-sky-700">Tambah Item</h3>

          <input
            name="itemName"
            placeholder="Nama Barang"
            value={form.itemName}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />

          <input
            name="qty"
            type="number"
            value={form.qty}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />

          <button
            onClick={addItem}
            className="bg-sky-500 text-white w-full py-2 rounded hover:bg-sky-600"
          >
            + Tambah Item
          </button>
        </div>

        {/* ================= PREVIEW ================= */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white py-2 rounded-xl hover:bg-green-600"
          >
            Download PDF
          </button>

          <div ref={printRef} className="bg-white p-6 rounded-2xl shadow-xl">
            {/* HEADER FLEX (LOGO KIRI - NAMA TENGAH) */}
            <div className="flex items-center justify-between mb-4">
              {logo && <img src={logo} className="h-14" />}
              <div className="text-center flex-1">
                <h1 className="text-xl font-bold text-sky-700">
                  PT Zerra Teknologi Integrasi
                </h1>
                <p className="text-sm">Jl. Joyogrand Blok E No.14, Malang</p>
              </div>
              <div className="w-14" /> {/* spacer kanan */}
            </div>

            <div className="flex justify-between mb-4 text-sm">
              <p>Date: {form.date || '-'}</p>
              <p>Quote: {form.quoteNumber || '-'}</p>
            </div>

            <div className="mb-4 text-sm">
              <p>To: {form.customerName || '-'}</p>
              <p>Company: {form.customerCompany || '-'}</p>
            </div>

            {/* TABLE */}
            <table className="w-full border mb-4 text-sm">
              <thead className="bg-sky-100">
                <tr>
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2 text-center">{item.qty}</td>
                    <td className="border p-2">{formatRupiah(item.price)}</td>
                    <td className="border p-2">
                      {formatRupiah(item.qty * item.price)}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => removeItem(i)}
                        className="text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTAL */}
            <div className="text-right text-sm">
              <p>Subtotal: {formatRupiah(subtotal)}</p>
              <p>PPN (11%): {formatRupiah(vat)}</p>
              <p className="font-bold text-lg text-sky-700">
                Total: {formatRupiah(total)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
