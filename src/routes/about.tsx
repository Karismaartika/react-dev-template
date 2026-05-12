import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div
      style={{
        padding: 24,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            color: '#0f172a',
          }}
        >
          About Zerra ERP
        </h1>

        <p
          style={{
            color: '#64748b',
            marginTop: 8,
            fontSize: 15,
          }}
        >
          Modern ERP Dashboard built with TanStack Router + React + TypeScript.
        </p>
      </div>

      {/* CONTENT */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 20,
        }}
      >
        {/* CARD 1 */}
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 14,
            }}
          >
            🚀
          </div>

          <h2
            style={{
              marginTop: 0,
              color: '#0f172a',
            }}
          >
            Fast Performance
          </h2>

          <p
            style={{
              color: '#64748b',
              lineHeight: 1.7,
            }}
          >
            Zerra ERP menggunakan teknologi modern React dan TanStack Router
            untuk menghasilkan aplikasi yang cepat, ringan, dan responsive.
          </p>
        </div>

        {/* CARD 2 */}
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 14,
            }}
          >
            📊
          </div>

          <h2
            style={{
              marginTop: 0,
              color: '#0f172a',
            }}
          >
            ERP Dashboard
          </h2>

          <p
            style={{
              color: '#64748b',
              lineHeight: 1.7,
            }}
          >
            Dashboard dilengkapi statistik, grafik, CRUD management, quotation
            invoice, dan monitoring data perusahaan secara realtime.
          </p>
        </div>

        {/* CARD 3 */}
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 14,
            }}
          >
            💻
          </div>

          <h2
            style={{
              marginTop: 0,
              color: '#0f172a',
            }}
          >
            Developer
          </h2>

          <p
            style={{
              color: '#64748b',
              lineHeight: 1.7,
            }}
          >
            Dibuat oleh Karisma Artika Putri sebagai project ERP modern dengan
            fokus pada UI/UX clean, responsive, dan mudah dikembangkan.
          </p>
        </div>
      </div>
    </div>
  )
}
