import comidaImage from './assets/comida.avif'
import './styles/App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark">L</div>
        <h1>Lucy Fast Food</h1>
        <p>Administración del negocio</p>
        <nav aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#ventas">Ventas</a>
          <a href="#login">Cerrar sesión</a>
        </nav>
      </header>

      <main id="inicio">
        <section className="dashboard-preview" aria-label="Vista previa del dashboard">
          <img src={comidaImage} alt="Comida de Lucy Fast Food" />
          <div>
            <p className="section-label">Lucy Fast Food</p>
            <h2>Sabor increíble a la velocidad de tu antojo.</h2>
            <p>Rápido, fresco y deliciosamente tuyo.</p>
          </div>
        </section>
        <section className="summary-section" aria-labelledby="summary-title">
          <div className="section-heading">
            <div>
              <p className="section-label">Panel principal</p>
              <h2 id="summary-title">Resumen de ventas</h2>
            </div>
            <span>Hoy, 6 de septiembre</span>
          </div>
          <div className="summary-grid">
            <article className="summary-card">
              <span>Ventas del día</span>
              <strong>Bs. 0,00</strong>
            </article>
            <article className="summary-card">
              <span>Productos registrados</span>
              <strong>0</strong>
            </article>
            <article className="summary-card">
              <span>Pedidos registrados</span>
              <strong>0</strong>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
