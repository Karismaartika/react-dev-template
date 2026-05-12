import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const stats = [
    {
      title: 'Company',
      value: 3,
      icon: '🏢',
      color: '#0ea5e9',
      bg: '#e0f2fe',
      to: '/company',
    },
    {
      title: 'Employee',
      value: 5,
      icon: '👨‍💼',
      color: '#22c55e',
      bg: '#dcfce7',
      to: '/employee',
    },
    {
      title: 'Bank Account',
      value: 2,
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
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: '#64748b' }}>Welcome to Zerra ERP Dashboard 🚀</p>
      </div>

      {/* 🔥 HERO */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
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

      {/* CARD */}
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
              transition: '0.3s',
            }}
          >
            {/* TOP */}
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

              <span
                style={{
                  background: '#f1f5f9',
                  padding: '6px 10px',
                  borderRadius: 10,
                  fontSize: 12,
                }}
              >
                Manage
              </span>
            </div>

            {/* CONTENT */}
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
    </div>
  )
}
