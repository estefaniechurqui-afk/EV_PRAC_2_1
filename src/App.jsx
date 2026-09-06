import { useState } from 'react'
import comidaImage from './assets/comida.avif'
import './styles/App.css'

const API_URL = 'https://localhost:7244'

function App() {
  const [sesionIniciada, setSesionIniciada] = useState(Boolean(localStorage.getItem('token')))
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const iniciarSesion = async (event) => {
    event.preventDefault()
    setCargando(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.mensaje || 'Los datos no son correctos')

      localStorage.setItem('token', data.token)
      localStorage.setItem('nombreUsuario', data.nombre)
      setSesionIniciada(true)
      setPassword('')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setCargando(false)
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nombreUsuario')
    setSesionIniciada(false)
    setMostrarLogin(false)
    setUsuario('')
  }

  if (!sesionIniciada && !mostrarLogin) {
    return (
      <main className="public-page">
        <header className="public-header">
          <a className="public-brand" href="#publicidad">
            <span className="brand-mark">L</span>
            <span>Lucy Fast Food</span>
          </a>
          <button type="button" className="public-login-button" onClick={() => setMostrarLogin(true)}>
            Ingresar
          </button>
        </header>

        <section className="public-hero" id="publicidad">
          <div className="public-copy">
            <p className="section-label">Bienvenidos a Lucy Fast Food</p>
            <h1>El sabor que alegra tu día.</h1>
            <p>Disfruta hamburguesas, papas y bebidas preparadas al momento, con el sabor que ya conoces.</p>
          </div>
          <img src={comidaImage} alt="Comida preparada de Lucy Fast Food" />
        </section>

        <section className="public-menu" aria-labelledby="public-menu-title">
          <div className="section-heading">
            <div>
              <p className="section-label">Nuestro menú</p>
              <h2 id="public-menu-title">Algunas opciones</h2>
            </div>
            <span>Productos disponibles</span>
          </div>
          <div className="public-product-grid">
            <article className="public-product-card"><span>🍔</span><h3>Hamburguesas</h3><p>Preparadas al momento.</p></article>
            <article className="public-product-card"><span>🍟</span><h3>Papas crocantes</h3><p>El acompañamiento perfecto.</p></article>
            <article className="public-product-card"><span>🥤</span><h3>Bebidas frías</h3><p>Para completar tu pedido.</p></article>
          </div>
        </section>

        <footer className="public-footer">Lucy Fast Food · Sabor hecho al momento</footer>
      </main>
    )
  }

  if (!sesionIniciada) {
    return (
      <main className="login-page">
        <section className="login-card" aria-labelledby="login-title">
          <div className="brand-mark">L</div>
          <p className="section-label">Lucy Fast Food</p>
          <h1 id="login-title">Ingresar al sistema</h1>
          <p className="login-description">Usa tu cuenta para administrar productos y ventas.</p>
          <form onSubmit={iniciarSesion}>
            <label htmlFor="usuario">Usuario</label>
            <input id="usuario" value={usuario} onChange={(event) => setUsuario(event.target.value)} required />
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <p className="login-error" role="alert">{error}</p>}
            <button type="submit" disabled={cargando}>{cargando ? 'Ingresando...' : 'Ingresar'}</button>
          </form>
          <button type="button" className="back-public-button" onClick={() => setMostrarLogin(false)}>Volver a la página principal</button>
          <p className="login-help">Usuario de prueba: admin / Admin123!</p>
        </section>
      </main>
    )
  }

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
          <button className="logout-button" type="button" onClick={cerrarSesion}>Cerrar sesión</button>
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
