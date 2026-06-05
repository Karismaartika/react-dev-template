import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import bannerImage from '../assets/login-banner.jpg'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  // Mengubah nama state menjadi email agar sesuai dengan fungsinya saat ini
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 🌐 1. Tembak langsung ke endpoint login server produksi yang baru
      const response = await fetch('https://svc-quotation.myzerra.id/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,       // 💡 Sesuai Swagger: Menggunakan key "email"
          password: password, // Menggunakan key "password"
        }),
      })

      // Jika server mengalami crash internal (Error 500)
      if (response.status === 500) {
        throw new Error('Server Backend mengalami internal error (500). Silakan hubungi tim Backend/Mentor.')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Email atau password salah!')
      }

      // 💡 Sesuai Swagger: Mengambil data dari key "access_token"
      const token = data.access_token

      if (token) {
        // Pastikan token tersimpan menggunakan format standar Bearer
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`

        // Simpan token asli dari backend produksi secara otomatis ke Local Storage
        localStorage.setItem('token', formattedToken)
        localStorage.setItem('loggedIn', 'true')
        
        alert('Login Berhasil! Token asli produksi otomatis disimpan.')
        navigate({ to: '/' })
      } else {
        alert('Login sukses, tetapi struktur respons server tidak menyediakan access_token.')
      }
    } catch (error: any) {
      // ⚡ 2. MODE CADANGAN BYPASS JIRA (Hanya terpicu jika server MyZerra benar-benar offline/down)
      console.warn(
        'Koneksi server utama bermasalah atau data salah. Mengaktifkan mode aman lokal...',
        error,
      )

      // Cetak detail error ke console agar kamu bisa memantau jika ada masalah validasi data
      console.error('Detail login error:', error.message)

      // Pesan peringatan agar kamu tahu jika login gagal menembak server asli
      alert(`Gagal Login ke Server Asli:\n${error.message || error}\n\nSilakan periksa kembali email & password, atau hubungi tim Backend.`);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-6xl h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl flex">
        {/* LEFT SIDE BANNER */}
        <div className="hidden lg:block w-[45%] relative h-full">
          <img
            src={bannerImage}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-900/55" />

          <div className="absolute inset-0 z-10 flex flex-col justify-center px-10 text-white">
            <h1 className="text-4xl font-bold tracking-tight">MyZerra</h1>

            <p className="mt-4 text-white/90 leading-relaxed max-w-sm text-sm">
              Kelola inventaris, transaksi, pelanggan, dan laporan bisnis dalam
              satu platform.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex-1 flex items-center justify-center px-10 bg-white">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">
              Selamat Datang
            </h2>

            <p className="text-slate-500 mt-2 mb-8">
              Masuk ke akun MyZerra Anda
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input + Fitur Mata */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-11 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                    required
                    disabled={isLoading}
                  />
                  {/* Tombol Toggle Mata */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.757 0 8.774 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Tombol Login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 text-sm disabled:bg-blue-400"
              >
                <span>{isLoading ? 'Memproses...' : 'Login'}</span>
                {!isLoading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                )}
              </button>
            </form>

            <p className="text-center mt-5 text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Registrasi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}