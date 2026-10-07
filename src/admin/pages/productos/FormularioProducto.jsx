import { useRef, useState } from 'react'
import { useAdmin } from '../../store/AdminStore'
import { useAvisos } from '../../components/Avisos'
import ImagenProducto from '../../components/ImagenProducto'
import { ChevronRightIcon, PlusIcon, XIcon } from '../../../components/icons'
import { prepararFoto } from '../../utils/imagenes'

const MAX_FOTOS = 6
const campo = 'h-12 w-full rounded-lg border bg-blanco px-3 disabled:bg-fondo disabled:text-gris'
const aPesos = (centavos) => (centavos == null ? '' : String(centavos / 100))
const aCentavos = (pesos) => (pesos === '' || pesos == null ? null : Math.round(Number(pesos) * 100))

function Campo({ id, etiqueta, error, ayuda, opcional, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-titanio">
        {etiqueta} {opcional && <span className="font-normal text-gris">(opcional)</span>}
      </label>
      {children}
      {ayuda && !error && <p className="mt-1 text-xs text-gris">{ayuda}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-agotado">{error}</p>}
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <section className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
      <h2 className="mb-4 text-xl uppercase text-titanio">{titulo}</h2>
      {children}
    </section>
  )
}

const vacio = {
  nombre: '', sku: '', descripcion: '', categoria_id: '', marca: '', precio: null, precio_oferta: null,
  peso_kg: '', largo_cm: '', ancho_cm: '', alto_cm: '', imagenes: [], activo: true, tipo: 'inventariado',
}

/** Datos generales, precios, fotos, medidas y tipo. Solo el administrador edita. */
export default function FormularioProducto({ producto, onGuardado }) {
  const { datos, esAdmin, guardarProducto } = useAdmin()
  const avisar = useAvisos()
  const inicial = producto ?? vacio
  const [f, setF] = useState(() => ({
    ...inicial,
    precio: aPesos(inicial.precio),
    precio_oferta: aPesos(inicial.precio_oferta),
    peso_kg: inicial.peso_kg ?? '', largo_cm: inicial.largo_cm ?? '', ancho_cm: inicial.ancho_cm ?? '', alto_cm: inicial.alto_cm ?? '',
  }))
  const [errores, setErrores] = useState({})
  const [subiendo, setSubiendo] = useState(false)
  const archivo = useRef(null)
  const soloLectura = !esAdmin

  const cambiar = (clave) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setF((x) => ({ ...x, [clave]: valor }))
    if (errores[clave]) setErrores((er) => ({ ...er, [clave]: undefined }))
  }
  const marcas = [...new Set(datos.productos.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'es'))

  // Fotos: vista previa local (demo); la primera es la principal.
  const subirFotos = async (e) => {
    const lista = [...e.target.files].slice(0, MAX_FOTOS - f.imagenes.length)
    e.target.value = ''
    if (!lista.length) return
    setSubiendo(true)
    try {
      const nuevas = await Promise.all(lista.map((a) => prepararFoto(a)))
      setF((x) => ({ ...x, imagenes: [...x.imagenes, ...nuevas] }))
    } catch (err) {
      avisar(err.message, 'error')
    } finally {
      setSubiendo(false)
    }
  }
  const moverFoto = (i, dir) => setF((x) => {
    const imgs = [...x.imagenes]
    ;[imgs[i], imgs[i + dir]] = [imgs[i + dir], imgs[i]]
    return { ...x, imagenes: imgs }
  })
  const quitarFoto = (i) => setF((x) => ({ ...x, imagenes: x.imagenes.filter((_, k) => k !== i) }))

  const validar = () => {
    const e = {}
    if (f.nombre.trim().length < 3) e.nombre = 'Escribe el nombre del producto.'
    if (!f.sku.trim()) e.sku = 'El SKU es obligatorio.'
    if (!f.categoria_id) e.categoria_id = 'Elige la categoría.'
    if (!f.marca.trim()) e.marca = 'Escribe la marca.'
    const precio = Number(f.precio)
    if (!(precio > 0)) e.precio = 'El precio debe ser mayor que cero.'
    if (f.precio_oferta !== '' && !(Number(f.precio_oferta) > 0 && Number(f.precio_oferta) < precio)) e.precio_oferta = 'La oferta debe ser menor que el precio.'
    for (const k of ['peso_kg', 'largo_cm', 'ancho_cm', 'alto_cm']) {
      if (f[k] === '' || !(Number(f[k]) > 0)) e[k] = 'Requerido para cotizar envíos.'
    }
    return e
  }

  const guardar = (ev) => {
    ev.preventDefault()
    const e = validar()
    setErrores(e)
    if (Object.keys(e).length) {
      document.getElementById(`prod-${Object.keys(e)[0]}`)?.focus()
      return
    }
    const r = guardarProducto({
      ...(producto ?? {}),
      nombre: f.nombre.trim(),
      sku: f.sku,
      descripcion: f.descripcion.trim(),
      categoria_id: f.categoria_id,
      marca: f.marca.trim(),
      precio: aCentavos(f.precio),
      precio_oferta: aCentavos(f.precio_oferta),
      peso_kg: Number(f.peso_kg),
      largo_cm: Number(f.largo_cm),
      ancho_cm: Number(f.ancho_cm),
      alto_cm: Number(f.alto_cm),
      imagenes: f.imagenes,
      activo: f.activo,
      tipo: f.tipo,
    })
    if (!r.ok) {
      setErrores(r.error.includes('SKU') ? { sku: r.error } : {})
      avisar(r.error, 'error')
      return
    }
    avisar(producto ? 'Cambios guardados.' : `Producto creado: ${r.producto.nombre}.`)
    onGuardado?.(r.producto)
  }

  const input = (clave, extra = {}) => ({
    id: `prod-${clave}`,
    value: f[clave],
    onChange: cambiar(clave),
    disabled: soloLectura,
    'aria-invalid': errores[clave] ? true : undefined,
    'aria-describedby': errores[clave] ? `prod-${clave}-error` : undefined,
    className: `${campo} ${errores[clave] ? 'border-agotado' : 'border-gris/40'}`,
    ...extra,
  })

  return (
    <form onSubmit={guardar} noValidate className="space-y-5">
      {soloLectura && (
        <p className="rounded-lg bg-hielo/15 p-3 text-sm text-titanio">Solo el administrador puede editar los datos y precios. Tú puedes ajustar existencias en la pestaña <strong>Existencias</strong>.</p>
      )}

      <Seccion titulo="Datos generales">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Campo id="prod-nombre" etiqueta="Nombre" error={errores.nombre}><input {...input('nombre', { maxLength: 120 })} /></Campo></div>
          <Campo id="prod-sku" etiqueta="SKU" error={errores.sku}><input {...input('sku', { maxLength: 20, className: `${campo} font-mono uppercase ${errores.sku ? 'border-agotado' : 'border-gris/40'}` })} /></Campo>
          <Campo id="prod-marca" etiqueta="Marca" error={errores.marca}>
            <input {...input('marca', { list: 'marcas-existentes', maxLength: 40 })} />
            <datalist id="marcas-existentes">{marcas.map((m) => <option key={m} value={m} />)}</datalist>
          </Campo>
          <Campo id="prod-categoria_id" etiqueta="Categoría" error={errores.categoria_id}>
            <select {...input('categoria_id')}>
              <option value="">Elige la categoría</option>
              {datos.categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Campo>
          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-titanio">Tipo</legend>
            <div className="grid grid-cols-2 gap-2">
              {[['inventariado', 'Inventariado'], ['sobre_pedido', 'Sobre pedido']].map(([v, t]) => (
                <label key={v} className={`flex min-h-12 items-center gap-2 rounded-lg px-3 text-sm font-semibold ring-2 ${f.tipo === v ? 'bg-hielo/10 ring-hielo' : 'bg-fondo ring-transparent'} ${soloLectura || producto ? 'opacity-70' : 'cursor-pointer'}`}>
                  <input type="radio" name="tipo" value={v} checked={f.tipo === v} onChange={cambiar('tipo')} disabled={soloLectura || Boolean(producto)} className="accent-hielo-texto" />
                  {t}
                </label>
              ))}
            </div>
            {producto && <p className="mt-1 text-xs text-gris">El tipo no se cambia una vez creado (tiene existencias asociadas).</p>}
          </fieldset>
          <div className="sm:col-span-2">
            <Campo id="prod-descripcion" etiqueta="Descripción corta" opcional>
              <textarea {...input('descripcion', { rows: 3, maxLength: 300, className: `w-full rounded-lg border border-gris/40 bg-blanco p-3 disabled:bg-fondo disabled:text-gris` })} />
            </Campo>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold sm:col-span-2">
            <input type="checkbox" checked={f.activo} onChange={cambiar('activo')} disabled={soloLectura} className="h-5 w-5 accent-hielo-texto" />
            Activo (se muestra en la tienda)
          </label>
        </div>
      </Seccion>

      <Seccion titulo="Precio">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="prod-precio" etiqueta="Precio de lista (MXN)" error={errores.precio}>
            <input {...input('precio', { type: 'number', inputMode: 'decimal', min: 0, step: '0.01', className: `${campo} price text-lg ${errores.precio ? 'border-agotado' : 'border-gris/40'}` })} />
          </Campo>
          <Campo id="prod-precio_oferta" etiqueta="Precio de oferta (MXN)" opcional error={errores.precio_oferta} ayuda="Si lo llenas, la tienda muestra el precio de lista tachado.">
            <input {...input('precio_oferta', { type: 'number', inputMode: 'decimal', min: 0, step: '0.01', className: `${campo} price text-lg ${errores.precio_oferta ? 'border-agotado' : 'border-gris/40'}` })} />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Fotos">
        <p className="mb-3 text-sm text-gris">La primera foto es la principal. En el demo se ven solo en este navegador.</p>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {f.imagenes.map((src, i) => (
            <li key={`${i}-${src.slice(-24)}`} className="relative">
              <ImagenProducto producto={{ ...f, imagenes: [src] }} src={src} className="w-full" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-titanio px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-blanco">Principal</span>}
              {!soloLectura && (
                <div className="mt-1 flex justify-between">
                  <button type="button" onClick={() => moverFoto(i, -1)} disabled={i === 0} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-fondo disabled:opacity-30" aria-label={`Mover foto ${i + 1} a la izquierda`}>
                    <ChevronRightIcon width={18} height={18} className="rotate-180" />
                  </button>
                  <button type="button" onClick={() => quitarFoto(i)} className="flex h-9 w-9 items-center justify-center rounded-md text-agotado hover:bg-agotado/10" aria-label={`Eliminar foto ${i + 1}`}>
                    <XIcon width={18} height={18} />
                  </button>
                  <button type="button" onClick={() => moverFoto(i, 1)} disabled={i === f.imagenes.length - 1} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-fondo disabled:opacity-30" aria-label={`Mover foto ${i + 1} a la derecha`}>
                    <ChevronRightIcon width={18} height={18} />
                  </button>
                </div>
              )}
            </li>
          ))}
          {!soloLectura && f.imagenes.length < MAX_FOTOS && (
            <li>
              <button
                type="button"
                onClick={() => archivo.current?.click()}
                disabled={subiendo}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-titanio/20 text-sm font-semibold text-hielo-texto hover:bg-fondo"
              >
                <PlusIcon width={24} height={24} />
                {subiendo ? 'Cargando…' : 'Subir foto'}
              </button>
              <input ref={archivo} type="file" accept="image/*" multiple onChange={subirFotos} className="sr-only" tabIndex={-1} aria-hidden="true" />
            </li>
          )}
        </ul>
        {f.imagenes.length === 0 && soloLectura && <p className="text-sm text-gris">Sin fotos.</p>}
      </Seccion>

      <Seccion titulo="Peso y medidas">
        <p className="mb-3 text-sm text-gris">Se usan para cotizar envíos (empaque incluido).</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[['peso_kg', 'Peso (kg)'], ['largo_cm', 'Largo (cm)'], ['ancho_cm', 'Ancho (cm)'], ['alto_cm', 'Alto (cm)']].map(([k, t]) => (
            <Campo key={k} id={`prod-${k}`} etiqueta={t} error={errores[k]}>
              <input {...input(k, { type: 'number', inputMode: 'decimal', min: 0, step: k === 'peso_kg' ? '0.1' : '1' })} />
            </Campo>
          ))}
        </div>
      </Seccion>

      {!soloLectura && (
        <div className="sticky bottom-0 -mx-4 border-t border-titanio/10 bg-fondo/95 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
          <button type="submit" className="btn-primary h-12 w-full text-lg sm:w-auto">{producto ? 'Guardar cambios' : 'Crear producto'}</button>
        </div>
      )}
    </form>
  )
}
