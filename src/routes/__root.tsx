import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'

import { useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
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
              background: darkMode ? '#334155' : '#0ea5e9',
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
                m.path === '/' ? pathname === '/' : pathname.startsWith(m.path)

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
                    color: active ? '#0ea5e9' : 'white',
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

          {/* MAIN */}
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
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  }}
                >
                  <img
                    src="https://ui-avatars.com/api/?name=Karisma&background=0ea5e9&color=fff"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

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

            {/* CONTENT */}
            <div
              style={{
                padding: 20,
              }}
            >
              <Outlet />
            </div>
          </div>
        </div>

        <Scripts />
      </body>
    </html>
  )
}
