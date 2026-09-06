import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://localhost:7244'

function App() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/productos`)
        if (!response.ok) throw new Error('No se pudieron cargar los productos')
        setProductos(await response.json())
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setCargando(false)
      }
    }

    cargarProductos()
  }, [])

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Lucy Fast Food, inicio">
          <span className="brand-mark">L</span>
          <span>Lucy Fast Food</span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#menu">Menú</a>
          <a href="#nosotros">Nosotros</a>
          <a className="login-link" href="#login">Ingresar</a>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="inicio">
          <div className="hero-copy">
            <p className="eyebrow">Sabor hecho al momento</p>
            <h1>Comida rápida con sabor de casa.</h1>
            <p className="hero-text">Hamburguesas, papas y bebidas preparadas para disfrutar sin complicaciones.</p>
            <a className="primary-button" href="#menu">Ver el menú</a>
          </div>
          <div className="hero-plate" aria-label="Hamburguesa con papas" role="img">
            <span className="plate-shadow" />
            <span className="burger">🍔</span>
            <span className="fries">🍟</span>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Nuestro menú</p>
              <h2>Lo que tenemos para ti</h2>
            </div>
            <span className="menu-count">{productos.length} opciones</span>
          </div>

          {cargando && <p className="status-message">Cargando productos...</p>}
          {error && <p className="status-message error-message">{error}. Verifica que el backend esté encendido.</p>}
          {!cargando && !error && productos.length === 0 && <p className="status-message">Todavía no hay productos registrados.</p>}
          {!cargando && !error && productos.length > 0 && (
            <div className="product-grid">
              {productos.map((producto) => (
                <article className="product-card" key={producto.id}>
                  <div className="product-image">
                    {producto.imagen ? <img src={producto.imagen} alt={producto.nombre} /> : <span aria-hidden="true">🍔</span>}
                  </div>
                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>{producto.nombre}</h3>
                      <strong>Bs. {Number(producto.precio).toFixed(2)}</strong>
                    </div>
                    <p>{producto.descripcion}</p>
                    <span className="category-tag">{producto.categoria}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="about-section" id="nosotros">
          <p className="eyebrow">Hecho para compartir</p>
          <h2>Una parada sencilla para comer bien.</h2>
          <p>En Lucy Fast Food preparamos cada pedido con ingredientes frescos y atención cercana.</p>
        </section>
      </main>

      <footer id="login">
        <span>Lucy Fast Food</span>
        <a href="mailto:contacto@lucyfastfood.com">Contacto</a>
      </footer>
    </div>
  )
}

export default App
