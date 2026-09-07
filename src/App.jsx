import { useEffect, useState } from 'react'
import comidaImage from './assets/comida.avif'
import './styles/App.css'

const API_URL = 'https://localhost:7244'
const formatoMoneda = (valor) => `Bs. ${Number(valor).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
const productoVacio = { nombre: '', descripcion: '', precio: '', categoria: '', imagen: '', disponible: true }
const ventaVacia = { productoId: '', cantidad: 1 }
const categoriaVacia = { nombre: '' }

function App() {
  const [sesionIniciada, setSesionIniciada] = useState(Boolean(localStorage.getItem('token')))
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [categorias, setCategorias] = useState([])
  const [ventas, setVentas] = useState([])
  const [cargandoVentas, setCargandoVentas] = useState(false)
  const [errorVentas, setErrorVentas] = useState('')
  const [vista, setVista] = useState('inicio')
  const [menuAbierto, setMenuAbierto] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [productoForm, setProductoForm] = useState(productoVacio)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [ventaForm, setVentaForm] = useState(ventaVacia)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [categoriaForm, setCategoriaForm] = useState(categoriaVacia)
  const [mensajeAdmin, setMensajeAdmin] = useState('')
  const [errorAdmin, setErrorAdmin] = useState('')

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/productos`)
        if (!response.ok) throw new Error('No se pudieron cargar los productos')
        setProductos(await response.json())
      } catch {
        setProductos([])
      } finally {
        setCargandoProductos(false)
      }
    }

    cargarProductos()
  }, [])

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categorias`)
        if (!response.ok) throw new Error('No se pudieron cargar las categorías')
        setCategorias(await response.json())
      } catch {
        setCategorias([])
      }
    }

    cargarCategorias()
  }, [])

  useEffect(() => {
    if (!sesionIniciada) return

    const cargarVentas = async () => {
      setCargandoVentas(true)
      setErrorVentas('')

      try {
        const response = await fetch(`${API_URL}/api/ventas`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!response.ok) throw new Error('No se pudo cargar el resumen de ventas')
        setVentas(await response.json())
      } catch (salesError) {
        setErrorVentas(salesError.message)
      } finally {
        setCargandoVentas(false)
      }
    }

    cargarVentas()
  }, [sesionIniciada])

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
    setMenuAbierto('')
  }

  const peticionProtegida = async (ruta, opciones = {}) => fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      ...opciones.headers,
    },
  })

  const prepararProducto = (producto = productoVacio) => {
    setProductoSeleccionado(producto.id ? producto : null)
    setProductoForm({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio || '',
      categoria: producto.categoria || '',
      categoriaId: producto.categoriaId || '',
      imagen: producto.imagen || '',
      disponible: producto.disponible ?? true,
    })
    setVista('producto-form')
    setMensajeAdmin('')
    setErrorAdmin('')
  }

  const guardarProducto = async (event) => {
    event.preventDefault()
    setErrorAdmin('')
    setMensajeAdmin('')

    try {
      const productoPayload = {
        ...productoForm,
        precio: Number(productoForm.precio),
        imagen: productoForm.imagen?.trim() || null,
      }
      const response = await peticionProtegida(
        productoSeleccionado ? `/api/productos/${productoSeleccionado.id}` : '/api/productos',
        { method: productoSeleccionado ? 'PUT' : 'POST', body: JSON.stringify(productoPayload) },
      )
      if (!response.ok) throw new Error('No se pudo guardar el producto')

      const productoGuardado = productoSeleccionado
        ? { ...productoSeleccionado, ...productoForm, precio: Number(productoForm.precio) }
        : await response.json()
      setProductos((actuales) => productoSeleccionado
        ? actuales.map((item) => item.id === productoGuardado.id ? productoGuardado : item)
        : [...actuales, productoGuardado])
      setVista('productos')
      setMensajeAdmin('Producto guardado correctamente.')
    } catch (saveError) {
      setErrorAdmin(saveError.message)
    }
  }

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Quieres eliminar este producto?')) return
    const response = await peticionProtegida(`/api/productos/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setProductos((actuales) => actuales.filter((producto) => producto.id !== id))
      setProductoSeleccionado(null)
      setMensajeAdmin('Producto eliminado correctamente.')
    } else {
      setErrorAdmin('No se puede eliminar este producto porque puede tener ventas relacionadas.')
    }
  }

  const prepararVenta = (venta = ventaVacia) => {
    setVentaSeleccionada(venta.id ? venta : null)
    setVentaForm({ productoId: venta.productoId || '', cantidad: venta.cantidad || 1 })
    setVista('venta-form')
    setMensajeAdmin('')
    setErrorAdmin('')
  }

  const guardarVenta = async (event) => {
    event.preventDefault()
    setErrorAdmin('')
    setMensajeAdmin('')

    try {
      const body = { productoId: Number(ventaForm.productoId), cantidad: Number(ventaForm.cantidad) }
      const response = await peticionProtegida(
        ventaSeleccionada ? `/api/ventas/${ventaSeleccionada.id}` : '/api/ventas',
        { method: ventaSeleccionada ? 'PUT' : 'POST', body: JSON.stringify(body) },
      )
      if (!response.ok) throw new Error('No se pudo guardar la venta')

      const ventaNueva = ventaSeleccionada
        ? await (async () => {
          const detalleResponse = await peticionProtegida(`/api/ventas/${ventaSeleccionada.id}`)
          if (!detalleResponse.ok) throw new Error('La venta se guardó, pero no se pudo actualizar el detalle')
          return detalleResponse.json()
        })()
        : await response.json()
      setVentas((actuales) => ventaSeleccionada
        ? actuales.map((item) => item.id === ventaNueva.id ? ventaNueva : item)
        : [ventaNueva, ...actuales])
      setVentaSeleccionada(ventaNueva)
      setVista('ventas')
      setMensajeAdmin('Venta guardada correctamente.')
    } catch (saveError) {
      setErrorAdmin(saveError.message)
    }
  }

  const eliminarVenta = async (id) => {
    if (!window.confirm('¿Quieres eliminar esta venta?')) return
    const response = await peticionProtegida(`/api/ventas/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setVentas((actuales) => actuales.filter((venta) => venta.id !== id))
      setVentaSeleccionada(null)
      setMensajeAdmin('Venta eliminada correctamente.')
    } else {
      setErrorAdmin('No se pudo eliminar la venta.')
    }
  }

  const prepararCategoria = (categoria = categoriaVacia) => {
    setCategoriaSeleccionada(categoria.id ? categoria : null)
    setCategoriaForm({ nombre: categoria.nombre || '' })
    setVista('categoria-form')
    setMensajeAdmin('')
    setErrorAdmin('')
  }

  const guardarCategoria = async (event) => {
    event.preventDefault()
    setErrorAdmin('')
    setMensajeAdmin('')

    try {
      const response = await peticionProtegida(
        categoriaSeleccionada ? `/api/categorias/${categoriaSeleccionada.id}` : '/api/categorias',
        { method: categoriaSeleccionada ? 'PUT' : 'POST', body: JSON.stringify(categoriaForm) },
      )
      if (!response.ok) throw new Error('No se pudo guardar la categoría')

      const categoriaGuardada = categoriaSeleccionada
        ? { ...categoriaSeleccionada, ...categoriaForm }
        : await response.json()
      setCategorias((actuales) => categoriaSeleccionada
        ? actuales.map((item) => item.id === categoriaGuardada.id ? categoriaGuardada : item)
        : [...actuales, categoriaGuardada])
      setVista('categorias')
      setCategoriaSeleccionada(categoriaGuardada)
      setMensajeAdmin('Categoría guardada correctamente.')
    } catch (saveError) {
      setErrorAdmin(saveError.message)
    }
  }

  const eliminarCategoria = async (id) => {
    if (!window.confirm('¿Quieres eliminar esta categoría?')) return
    const response = await peticionProtegida(`/api/categorias/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setCategorias((actuales) => actuales.filter((categoria) => categoria.id !== id))
      setCategoriaSeleccionada(null)
      setMensajeAdmin('Categoría eliminada correctamente.')
    } else {
      setErrorAdmin('No se puede eliminar una categoría que tiene productos.')
    }
  }

  const totalVentas = ventas.reduce((total, venta) => total + Number(venta.total), 0)

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
          {cargandoProductos && <p className="public-status">Cargando productos...</p>}
          {!cargandoProductos && productos.length === 0 && (
            <p className="public-status">Todavía no hay productos disponibles.</p>
          )}
          {!cargandoProductos && productos.length > 0 && (
            <div className="public-product-grid">
              {productos.map((producto) => (
                <article className="public-product-card" key={producto.id}>
                  <div className="public-product-image">
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} />
                    ) : (
                      <img className="default-product-image" src={comidaImage} alt="Imagen general de comida" />
                    )}
                  </div>
                  <div className="public-product-content">
                    <div className="public-product-title">
                      <h3>{producto.nombre}</h3>
                      <strong>Bs. {Number(producto.precio).toFixed(2)}</strong>
                    </div>
                    <p>{producto.descripcion}</p>
                    <span className="public-category">{producto.categoria}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
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
          <button className={vista === 'inicio' ? 'nav-active' : ''} type="button" onClick={() => setVista('inicio')}>Inicio</button>
          <div className="nav-dropdown">
            <button className={vista.startsWith('producto') ? 'nav-active dropdown-trigger' : 'dropdown-trigger'} type="button" onClick={() => setMenuAbierto(menuAbierto === 'productos' ? '' : 'productos')} aria-expanded={menuAbierto === 'productos'}>Productos <span aria-hidden="true">⌄</span></button>
            {menuAbierto === 'productos' && <div className="dropdown-menu"><button type="button" onClick={() => { setVista('productos'); setMenuAbierto('') }}>Detalle</button><button type="button" onClick={() => { prepararProducto(); setMenuAbierto('') }}>Agregar</button></div>}
          </div>
          <div className="nav-dropdown">
            <button className={vista.startsWith('venta') ? 'nav-active dropdown-trigger' : 'dropdown-trigger'} type="button" onClick={() => setMenuAbierto(menuAbierto === 'ventas' ? '' : 'ventas')} aria-expanded={menuAbierto === 'ventas'}>Ventas <span aria-hidden="true">⌄</span></button>
            {menuAbierto === 'ventas' && <div className="dropdown-menu"><button type="button" onClick={() => { setVista('ventas'); setMenuAbierto('') }}>Detalle</button><button type="button" onClick={() => { prepararVenta(); setMenuAbierto('') }}>Registrar</button></div>}
          </div>
          <button className={vista.startsWith('categoria') ? 'nav-active' : ''} type="button" onClick={() => setVista('categorias')}>Categorías</button>
          <button className="logout-button" type="button" onClick={cerrarSesion}>Cerrar sesión</button>
        </nav>
      </header>

      <main id="inicio">
        {(mensajeAdmin || errorAdmin) && <p className={errorAdmin ? 'admin-message error-message' : 'admin-message'}>{errorAdmin || mensajeAdmin}</p>}
        {vista === 'productos' && (
          <section className="management-section" aria-labelledby="products-title">
            <div className="section-heading"><div><p className="section-label">Administración</p><h2 id="products-title">Productos</h2></div><button className="primary-admin-button" type="button" onClick={() => prepararProducto()}>Nuevo producto</button></div>
            <div className="management-grid">
              <div className="record-list">
                {productos.map((producto) => <button className={productoSeleccionado?.id === producto.id ? 'record-item selected' : 'record-item'} type="button" key={producto.id} onClick={() => setProductoSeleccionado(producto)}><span>{producto.nombre}</span><strong>{formatoMoneda(producto.precio)}</strong></button>)}
              </div>
              <div className="record-detail">
                {productoSeleccionado ? <><p className="section-label">Detalle del producto</p><h3>{productoSeleccionado.nombre}</h3><p>{productoSeleccionado.descripcion}</p><p><strong>Categoría:</strong> {productoSeleccionado.categoria}</p><p><strong>Estado:</strong> {productoSeleccionado.disponible ? 'Disponible' : 'No disponible'}</p><div className="detail-actions"><button type="button" onClick={() => prepararProducto(productoSeleccionado)}>Editar</button><button className="danger-button" type="button" onClick={() => eliminarProducto(productoSeleccionado.id)}>Eliminar</button></div></> : <p>Selecciona un producto para ver su detalle.</p>}
              </div>
            </div>
          </section>
        )}
        {vista === 'producto-form' && <ProductForm form={productoForm} setForm={setProductoForm} categorias={categorias} editing={productoSeleccionado} onSubmit={guardarProducto} onCancel={() => setVista('productos')} />}
        {vista === 'ventas' && (
          <section className="management-section" aria-labelledby="sales-title">
            <div className="section-heading"><div><p className="section-label">Administración</p><h2 id="sales-title">Ventas</h2></div><button className="primary-admin-button" type="button" onClick={() => prepararVenta()}>Nueva venta</button></div>
            <div className="management-grid">
              <div className="record-list">
                {ventas.map((venta) => <button className={ventaSeleccionada?.id === venta.id ? 'record-item selected' : 'record-item'} type="button" key={venta.id} onClick={() => setVentaSeleccionada(venta)}><span>{venta.producto}</span><strong>{formatoMoneda(venta.total)}</strong></button>)}
              </div>
              <div className="record-detail">
                {ventaSeleccionada ? <><p className="section-label">Detalle de la venta</p><h3>{ventaSeleccionada.producto}</h3><p><strong>Cantidad:</strong> {ventaSeleccionada.cantidad}</p><p><strong>Total:</strong> {formatoMoneda(ventaSeleccionada.total)}</p><p><strong>Fecha:</strong> {new Date(ventaSeleccionada.fecha).toLocaleString('es-BO')}</p><div className="detail-actions"><button type="button" onClick={() => prepararVenta(ventaSeleccionada)}>Editar</button><button className="danger-button" type="button" onClick={() => eliminarVenta(ventaSeleccionada.id)}>Eliminar</button></div></> : <p>Selecciona una venta para ver su detalle.</p>}
              </div>
            </div>
          </section>
        )}
        {vista === 'venta-form' && <SaleForm form={ventaForm} setForm={setVentaForm} productos={productos} editing={ventaSeleccionada} onSubmit={guardarVenta} onCancel={() => setVista('ventas')} />}
        {vista === 'categorias' && (
          <section className="management-section" aria-labelledby="categories-title">
            <div className="section-heading"><div><p className="section-label">Administración</p><h2 id="categories-title">Categorías</h2></div><button className="primary-admin-button" type="button" onClick={() => prepararCategoria()}>Nueva categoría</button></div>
            <div className="management-grid">
              <div className="record-list">
                {categorias.map((categoria) => <button className={categoriaSeleccionada?.id === categoria.id ? 'record-item selected' : 'record-item'} type="button" key={categoria.id} onClick={() => setCategoriaSeleccionada(categoria)}><span>{categoria.nombre}</span></button>)}
              </div>
              <div className="record-detail">
                {categoriaSeleccionada ? <><p className="section-label">Detalle de la categoría</p><h3>{categoriaSeleccionada.nombre}</h3><p>Los productos de esta categoría se muestran en el catálogo.</p><div className="detail-actions"><button type="button" onClick={() => prepararCategoria(categoriaSeleccionada)}>Editar</button><button className="danger-button" type="button" onClick={() => eliminarCategoria(categoriaSeleccionada.id)}>Eliminar</button></div></> : <p>Selecciona una categoría para ver su detalle.</p>}
              </div>
            </div>
          </section>
        )}
        {vista === 'categoria-form' && <CategoryForm form={categoriaForm} setForm={setCategoriaForm} editing={categoriaSeleccionada} onSubmit={guardarCategoria} onCancel={() => setVista('categorias')} />}
        {vista === 'inicio' && <>
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
              <strong>{cargandoVentas ? '...' : formatoMoneda(totalVentas)}</strong>
            </article>
            <article className="summary-card">
              <span>Productos registrados</span>
              <strong>{productos.length}</strong>
            </article>
            <article className="summary-card">
              <span>Pedidos registrados</span>
              <strong>{cargandoVentas ? '...' : ventas.length}</strong>
            </article>
          </div>
          {errorVentas && <p className="summary-error" role="alert">{errorVentas}</p>}
        </section>
        </>}
      </main>
    </div>
  )
}

function ProductForm({ form, setForm, categorias, editing, onSubmit, onCancel }) {
  const actualizar = (campo, valor) => setForm((actual) => ({ ...actual, [campo]: valor }))

  return (
    <section className="form-section" aria-labelledby="product-form-title">
      <p className="section-label">Productos</p>
      <h2 id="product-form-title">{editing ? 'Editar producto' : 'Registrar producto'}</h2>
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Nombre<input value={form.nombre} onChange={(event) => actualizar('nombre', event.target.value)} required /></label>
        <label>Descripción<textarea value={form.descripcion} onChange={(event) => actualizar('descripcion', event.target.value)} /></label>
        <div className="form-row"><label>Precio<input type="number" min="0.01" step="0.01" value={form.precio} onChange={(event) => actualizar('precio', event.target.value)} required /></label><label>Categoría<select value={form.categoriaId || ''} onChange={(event) => { const categoria = categorias.find((item) => item.id === Number(event.target.value)); setForm((actual) => ({ ...actual, categoriaId: categoria?.id || null, categoria: categoria?.nombre || '' })) }} required><option value="">Selecciona una categoría</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}</select></label></div>
        <label>Imagen (URL)<input type="url" value={form.imagen} onChange={(event) => actualizar('imagen', event.target.value)} /></label>
        <label className="check-label"><input type="checkbox" checked={form.disponible} onChange={(event) => actualizar('disponible', event.target.checked)} /> Disponible</label>
        <div className="form-actions"><button type="submit">Guardar producto</button><button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button></div>
      </form>
    </section>
  )
}

function SaleForm({ form, setForm, productos, editing, onSubmit, onCancel }) {
  return (
    <section className="form-section" aria-labelledby="sale-form-title">
      <p className="section-label">Ventas</p>
      <h2 id="sale-form-title">{editing ? 'Editar venta' : 'Registrar venta'}</h2>
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Producto<select value={form.productoId} onChange={(event) => setForm((actual) => ({ ...actual, productoId: event.target.value }))} required><option value="">Selecciona un producto</option>{productos.filter((producto) => producto.disponible).map((producto) => <option key={producto.id} value={producto.id}>{producto.nombre} - {formatoMoneda(producto.precio)}</option>)}</select></label>
        <label>Cantidad<input type="number" min="1" step="1" value={form.cantidad} onChange={(event) => setForm((actual) => ({ ...actual, cantidad: event.target.value }))} required /></label>
        <p className="form-note">El total se calcula automáticamente según el producto y la cantidad.</p>
        <div className="form-actions"><button type="submit">Guardar venta</button><button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button></div>
      </form>
    </section>
  )
}

function CategoryForm({ form, setForm, editing, onSubmit, onCancel }) {
  return (
    <section className="form-section" aria-labelledby="category-form-title">
      <p className="section-label">Categorías</p>
      <h2 id="category-form-title">{editing ? 'Editar categoría' : 'Registrar categoría'}</h2>
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Nombre<input value={form.nombre} onChange={(event) => setForm({ nombre: event.target.value })} required maxLength="80" /></label>
        <div className="form-actions"><button type="submit">Guardar categoría</button><button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button></div>
      </form>
    </section>
  )
}

export default App
