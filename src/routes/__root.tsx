import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
  useRouterState,
} from '@tanstack/react-router'

import { useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: ({ location }) => {
    // saat SSR jangan akses localStorage
    if (typeof window === 'undefined') {
      return
    }

    const isLogin = localStorage.getItem('loggedIn')

    // 🟢 IZINKAN AKSES: Biarkan halaman login DAN register bisa diakses publik tanpa login
    if (location.pathname === '/login' || location.pathname === '/register') {
      return
    }

    // redirect kalau belum login
    if (!isLogin) {
      throw redirect({
        to: '/login',
      })
    }
  },

  component: RootLayout,
})

function RootLayout() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  })

  const [darkMode, setDarkMode] = useState(false)

  const menu = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Company', path: '/company', icon: '🏢' },
    { name: 'Employee', path: '/employee', icon: '👨‍💼' },
    { name: 'Bank Account', path: '/bank-account', icon: '🏦' },
    { name: 'Quotation', path: '/quotation', icon: '📄' },
  ]

  // 🟢 CEK HALAMAN: Tentukan apakah user sedang di halaman auth (login/register)
  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <html>
      <head>
        <HeadContent />
      </head>

      <body
        style={{
          margin: 0,
          fontFamily: 'Inter, sans-serif',
          background: darkMode ? '#1e293b' : '#f1f5f9',
          transition: '0.3s',
        }}
      >
        {isAuthPage ? (
          /* 🟢 LAYOUT KHUSUS HALAMAN LOGIN & REGISTER (POLOSAN TANPA NAVBAR/SIDEBAR) */
          <div style={{ minHeight: '100vh' }}>
            <Outlet />
          </div>
        ) : (
          /* 🏢 LAYOUT DASHBOARD UTAMA INTERNAL MYZERRA (DENGAN SIDEBAR & TOPBAR) */
          <div
            style={{
              display: 'flex',
              minHeight: '100vh',
            }}
          >
            {/* SIDEBAR */}
            <div
              style={{
                width: 220,
                background: darkMode
                  ? '#334155'
                  : 'linear-gradient(180deg,#1e3a8a,#1e40af)',
                color: 'white',
                padding: 18,
                transition: '0.3s',
                boxSizing: 'border-box',
              }}
            >
              {/* LOGO */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 30,
                }}
              >
                <img
                  src="/logo-zerra.png"
                  style={{
                    width: 40,
                    height: 40,
                  }}
                />

                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 800,
                  }}
                >
                  MyZerra
                </h2>
              </div>

              {/* MENU */}
              {menu.map((m) => {
                const active =
                  m.path === '/'
                    ? pathname === '/'
                    : pathname.startsWith(m.path)

                return (
                  <Link
                    key={m.path}
                    to={m.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '13px 15px',
                      marginTop: 10,
                      borderRadius: 16,
                      background: active ? 'white' : 'transparent',
                      color: active ? '#1e3a8a' : 'white',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: '0.2s',
                      fontSize: 15,
                    }}
                  >
                    <span>{m.icon}</span>
                    {m.name}
                  </Link>
                )
              })}
            </div>

            {/* MAIN AREA */}
            <div
              style={{
                flex: 1,
                background: darkMode ? '#1e293b' : '#f1f5f9',
                transition: '0.3s',
              }}
            >
              {/* TOPBAR */}
              <div
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                {/* DARK MODE */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  style={{
                    border: 'none',
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    cursor: 'pointer',
                    background: darkMode ? '#475569' : 'white',
                    fontSize: 16,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  }}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>

                {/* PROFILE + LOGOUT */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <button
                    onClick={() => {
                      localStorage.removeItem('loggedIn')
                      window.location.href = '/login'
                    }}
                    style={{
                      border: 'none',
                      background: '#ef4444',
                      color: 'white',
                      padding: '10px 14px',
                      borderRadius: 14,
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* CONTENT AREA */}
              <div
                style={{
                  padding: 20,
                }}
              >
                <Outlet />
              </div>
            </div>
          </div>
        )}

        <Scripts />
      </body>
    </html>
  )
}
