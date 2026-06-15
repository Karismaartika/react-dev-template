import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { 
  ArrowUpRight, 
  Building2, 
  Mail, 
  Phone, 
  ShieldCheck,
  Users
} from 'lucide-react'
import api from '../services/api'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const [companies, setCompanies] = useState([])
  const [employees, setEmployees] = useState([])
  const [banks, setBanks] = useState([])
  const [isCompanyLoading, setIsCompanyLoading] = useState(false)

  useEffect(() => {
    setIsCompanyLoading(true)
    api
      .get('/companies')
      .then((res) => {
        if (res.data && res.data.data) {
          setCompanies(res.data.data)
        } else {
          setCompanies(res.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setIsCompanyLoading(false)
      })

    api
      .get('/employees')
      .then((res) => {
        if (res.data && res.data.data) {
          setEmployees(res.data.data)
        } else {
          setEmployees(res.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })

    api
      .get('/bank_accounts')
      .then((res) => {
        if (res.data && res.data.data) {
          setBanks(res.data.data)
        } else {
          setBanks(res.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const stats = [
    {
      title: 'Company',
      value: companies.length,
      icon: '🏢',
      color: '#0ea5e9',
      bg: '#e0f2fe',
      to: '/company',
    },
    {
      title: 'Employee',
      value: employees.length,
      icon: '👨‍💼',
      color: '#22c55e',
      bg: '#dcfce7',
      to: '/employee',
    },
    {
      title: 'Bank Account',
      value: banks.length,
      icon: '🏦',
      color: '#f97316',
      bg: '#ffedd5',
      to: '/bank-account',
    },
    {
      title: 'Quotation',
      value: 12,
      icon: '📄',
      color: '#ef4444',
      bg: '#fee2e2',
      to: '/quotation',
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: '#64748b' }}>Welcome to Zerra ERP Dashboard 🚀</p>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg,#1e3a8a,#1e40af)',
          borderRadius: 20,
          padding: 24,
          color: 'white',
          marginBottom: 25,
        }}
      >
        <h2 style={{ margin: 0 }}>Zerra ERP Control Panel</h2>
        <p style={{ marginTop: 8 }}>
          Manage company, employee, bank & quotation easily
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 20,
        }}
      >
        {stats.map((item, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 16,
                  background: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                {item.icon}
              </div>
             
            </div>

            <h3 style={{ color: '#64748b' }}>{item.title}</h3>
            <h1
              style={{
                fontSize: 34,
                margin: '8px 0 16px',
              }}
            >
              {item.value}
            </h1>
            <Link
              to={item.to}
              style={{
                textDecoration: 'none',
                background: item.color,
                color: 'white',
                padding: '10px 14px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                display: 'inline-block',
              }}
            >
              Open Page
            </Link>
          </div>
        ))}
      </div>

      {/* =========================================================
          DAFTAR EMPLOYEE - ROW LIST VERSION (MEMANJANG KE BAWAH)
          ========================================================= */}
      <div className="mt-8 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Employee Directory
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Daftar eksekutif, staf administrasi, dan seluruh karyawan aktif yang terdaftar di database.
            </p>
          </div>
          <Link
            to="/employee"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 transition-colors px-3 py-2 rounded-xl border border-emerald-100 shadow-sm"
          >
            Manage Employees
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {employees.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada data karyawan yang ditemukan di database backend.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 w-72">Employee Details</th>
                  <th className="px-6 py-4 w-64">Contact Information</th>
                  <th className="px-6 py-4">Assigned Corporate</th>
                  <th className="px-6 py-4 w-40 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-sm divide-y divide-slate-100 bg-white">
                {employees.map((item: any) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/50 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50/60 group-hover:bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/20 shadow-sm flex-shrink-0 transition-colors">
                          <Users size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                            {item.name}
                          </span>
                          <span className="inline-block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mt-0.5">
                            EMP-{item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4.5 space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                        <Mail size={14} className="text-slate-400" />
                        <span className="truncate">{item.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                        <Phone size={14} className="text-slate-400" />
                        <span>{item.phone}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                        <Building2 size={13} className="text-slate-400" />
                        <span>
                          {companies.find((c: any) => Number(c.id) === Number(item.company_id))?.name || 'Zerra Corporate Asset'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4.5 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs px-2.5 py-1 rounded-lg font-bold border border-emerald-100/40 shadow-sm">
                        <ShieldCheck size={13} className="mr-0.5" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Company Master Directory
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Informasi badan hukum, domisili, dan kontak korespondensi resmi perusahaan rekanan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-50 text-cyan-600 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-cyan-100 shadow-sm">
              {isCompanyLoading ? '...' : companies.length} Entities Active
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isCompanyLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm font-medium animate-pulse">
              Menghubungkan ke layanan svc-quotation...
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada data perusahaan yang ditemukan di database backend.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 w-72">Company Profile</th>
                  <th className="px-6 py-4">Address & Location</th>
                  <th className="px-6 py-4 w-60">Contact Details</th>
                  <th className="px-6 py-4 w-44 text-center">Verification</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-sm divide-y divide-slate-100 bg-white">
                {companies.map((company: any) => (
                  <tr 
                    key={company.id} 
                    className="hover:bg-slate-50/50 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {company.logo && company.logo.trim() !== '' ? (
                            <img src={company.logo} alt="logo" className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ fontSize: 16 }}>🏢</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                            {company.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                            {company.legalName || company.legal_name || '-'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-start gap-1.5 text-xs text-slate-600">
                        <span style={{ marginRight: 4 }}>📍</span>
                        <span className="line-clamp-2 leading-relaxed max-w-sm">{company.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span style={{ marginRight: 4 }}>✉️</span>
                        <span className="truncate">{company.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span style={{ marginRight: 4 }}>📞</span>
                        <span>{company.phone}</span>
                      </div>
                      {company.website && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span style={{ marginRight: 4 }}>🌐</span>
                          <a href={company.website} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline font-medium">
                            {company.website.replace('https://', '').replace('http://', '')}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-cyan-50/70 text-cyan-700 text-xs px-2.5 py-1 rounded-lg font-bold border border-cyan-100/40 shadow-sm">
                        <span style={{ marginRight: 4 }}>🛡️</span>
                        Verified Entity
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Bank Account Directory
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Daftar rekening terverifikasi yang digunakan untuk operasional transaksi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-sky-50 text-sky-600 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-sky-100 shadow-sm">
              {banks.length} Accounts Connected
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 w-36">Bank</th>
                <th className="px-6 py-4">Account Holder Name</th>
                <th className="px-6 py-4 w-60">Account Number</th>
                <th className="px-6 py-4 w-32 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 text-sm divide-y divide-slate-100 bg-white">
              {banks.map((item: any) => {
                const name = item.bank_name ? item.bank_name.toUpperCase().trim() : '';
                let badgeStyle = 'bg-slate-50 text-slate-700 border-slate-200';

                if (name.includes('BCA')) {
                  badgeStyle = 'bg-blue-50 text-blue-600 border-blue-200/60';
                } else if (name.includes('MANDIRI')) {
                  badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200/60';
                } else if (name.includes('BRI')) {
                  badgeStyle = 'bg-sky-50 text-sky-600 border-sky-200/60';
                } else if (name.includes('BNI')) {
                  badgeStyle = 'bg-orange-50 text-orange-600 border-orange-200/60';
                } else if (name.includes('CIMB')) {
                  badgeStyle = 'bg-rose-50 text-rose-600 border-rose-200/60';
                }

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/50 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4.5 vertical-middle">
                      <span className={`inline-block font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-widest border shadow-sm ${badgeStyle}`}>
                        {item.bank_name}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {item.account_name}
                    </td>
                    <td className="px-6 py-4.5 font-mono text-slate-500 font-bold tracking-wider group-hover:text-sky-600 transition-colors">
                      {item.account_number}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-100/50 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', marginRight: 4 }} />
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}