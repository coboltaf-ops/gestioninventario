export default function InventarioComidasHome() {
  return (
    <div style={{ minHeight: '100vh', padding: '40px', color: '#1e293b' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
            paddingBottom: '20px',
            borderBottom: '3px solid #ea580c',
          }}
        >
          <div
            style={{
              width: '150px',
              height: '150px',
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px',
            }}
          >
            🍽️
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#ea580c', marginBottom: '8px' }}>🍽️ INVENTARIO COMIDAS</h1>
            <p style={{ fontSize: '16px', color: '#aaa' }}>Selecciona una opción del menú lateral para comenzar</p>
          </div>
        </div>
      </div>
    </div>
  )
}
