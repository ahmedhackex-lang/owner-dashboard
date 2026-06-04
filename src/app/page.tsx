// src/app/page.tsx
export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Grocery POS</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Owner Dashboard</p>
        <a 
          href="/login" 
          style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}
        >
          Go to Login
        </a>
      </div>
    </div>
  )
}