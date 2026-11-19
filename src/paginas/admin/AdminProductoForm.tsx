import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import ErrorCampo from "../../componentes/ErrorCampo";
import { claseCampo } from "../../utils/claseCampo";
import { useSesion } from "../../hooks/useSesion";
import { useFormulario, type Reglas } from "../../hooks/useFormulario";
import {
  actualizarProductoApi,
  buscarProductoApi,
  crearProductoApi,
} from "../../servicios/catalogo";
import { obtenerCategoriasApi } from "../../servicios/categorias";
import type { Producto } from "../../tipos";

const MAX_BYTES_IMAGEN = 300 * 1024;

type FormularioProducto = {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  stockCritico: string;
  category: string;
};

const VACIO: FormularioProducto = {
  id: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  stockCritico: "",
  category: "",
};

// El código lo asigna el backend, por eso no se valida aquí.
const REGLAS: Reglas<FormularioProducto> = {
  name: (valor) => {
    const nombre = valor.trim();
    if (!nombre) return "El nombre es obligatorio.";
    if (nombre.length > 100)
      return "El nombre no puede superar los 100 caracteres.";
    return "";
  },
  description: (valor) =>
    valor.trim().length > 255
      ? "La descripción no puede superar los 255 caracteres."
      : "",
  price: (valor) => {
    const precio = valor.trim();
    if (!precio) return "El precio es obligatorio.";
    if (!/^\d+$/.test(precio)) {
      return "Ingresa un número entero mayor o igual a 0 (pesos, sin decimales).";
    }
    return "";
  },
  stock: (valor) => {
    const stock = valor.trim();
    if (!stock) return "El stock es obligatorio.";
    if (!/^\d+$/.test(stock)) {
      return "El stock debe ser un número entero mayor o igual a 0.";
    }
    return "";
  },
  stockCritico: (valor) =>
    valor.trim() && !/^\d+$/.test(valor.trim())
      ? "El stock crítico debe ser un número entero mayor o igual a 0."
      : "",
  category: (valor) => (valor ? "" : "Selecciona una categoría."),
};

function leerComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = rechazar;
    lector.readAsDataURL(archivo);
  });
}

function mensajeDeError(error: unknown, porDefecto: string): string {
  return axios.isAxiosError(error)
    ? (error.response?.data?.mensaje ?? porDefecto)
    : "Error inesperado.";
}

// Nuevo, editar y mostrar producto. "soloLectura" corresponde a "Mostrar".
// Crear y editar: solo Administrador. El Vendedor solo ve el detalle.
export default function AdminProductoForm({
  soloLectura = false,
}: {
  soloLectura?: boolean;
}) {
  const { codigo = "" } = useParams();
  const { sesion } = useSesion();
  const navegar = useNavigate();
  const esAdmin = sesion?.role === "Administrador";

  const [producto, setProducto] = useState<Producto | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const formulario = useFormulario<FormularioProducto>(VACIO, REGLAS);
  const { valores, errores, cambiar, tocar } = formulario;

  const [imagen, setImagen] = useState("");
  const [errorImagen, setErrorImagen] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Carga las categorías (GET /productos/categorias) y, si es edición o detalle,
  // el producto (GET /productos/{codigo})
  useEffect(() => {
    async function cargar() {
      try {
        const cats = await obtenerCategoriasApi();
        setCategorias(cats.map((c) => c.nombre));

        if (codigo) {
          const encontrado = await buscarProductoApi(codigo);
          setProducto(encontrado);
          setImagen(encontrado.image ?? "");
          formulario.reiniciar({
            id: encontrado.id,
            name: encontrado.name,
            description: encontrado.description ?? "",
            price: String(encontrado.price),
            stock: String(encontrado.stock),
            stockCritico: String(encontrado.stockCritico ?? ""),
            category: encontrado.category,
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNoEncontrado(true);
        } else {
          setMensaje(mensajeDeError(error, "No se pudo conectar con el servidor."));
        }
      } finally {
        setCargando(false);
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  if (cargando) {
    return (
      <div className="d-flex align-items-center gap-3 py-4" role="status">
        <div className="spinner-border text-primary" aria-hidden="true" />
        <span>Cargando...</span>
      </div>
    );
  }

  if (noEncontrado) {
    return (
      <EncabezadoPanel titulo="Producto no encontrado">
        <Link className="btn-secondary" to="/admin/productos">
          Volver al listado
        </Link>
      </EncabezadoPanel>
    );
  }

  // Alerta en vivo cuando el stock es igual o inferior al stock crítico.
  const stockCritico =
    /^\d+$/.test(valores.stock.trim()) &&
    /^\d+$/.test(valores.stockCritico.trim()) &&
    Number(valores.stock) <= Number(valores.stockCritico);

  const elegirImagen = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setErrorImagen("El archivo debe ser una imagen.");
    } else if (archivo.size > MAX_BYTES_IMAGEN) {
      setErrorImagen("La imagen no puede superar los 300 KB.");
    } else {
      setErrorImagen("");
      setImagen(await leerComoDataUrl(archivo));
    }
  };

  // POST /productos (nuevo) o PUT /productos/{codigo} (editar)
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!formulario.validarTodo() || errorImagen) {
      setMensaje("Revisa los campos marcados en rojo.");
      return;
    }

    const critico = valores.stockCritico.trim();
    const datos: Producto = {
      id: producto?.id ?? "",
      name: valores.name.trim(),
      description: valores.description.trim(),
      species: producto?.species ?? "",
      price: Number(valores.price.trim()),
      stock: Number(valores.stock),
      stockCritico: critico === "" ? 0 : Number(critico),
      category: valores.category,
      image: imagen,
    };

    setGuardando(true);
    setMensaje("");
    try {
      if (producto) {
        await actualizarProductoApi(datos);
      } else {
        await crearProductoApi(datos);
      }
      navegar("/admin/productos");
    } catch (error) {
      // 400: datos inválidos o categoría inexistente · 403: sin permiso
      setMensaje(mensajeDeError(error, "No se pudo guardar el producto."));
    } finally {
      setGuardando(false);
    }
  };

  const campo = (nombre: keyof FormularioProducto) => ({
    name: nombre,
    className: claseCampo(
      errores[nombre],
      nombre === "category" ? "form-select" : "form-control",
    ),
    value: valores[nombre],
    disabled: soloLectura,
    onBlur: () => tocar(nombre),
  });

  const titulo = !producto
    ? "Nuevo producto"
    : soloLectura
      ? "Detalle del producto"
      : "Editar producto";

  return (
    <>
      <EncabezadoPanel etiqueta="PRODUCTOS" titulo={titulo}>
        <div className="admin-heading-actions">
          {soloLectura && esAdmin && (
            <Link
              className="btn-primary"
              to={`/admin/productos/${encodeURIComponent(codigo)}/editar`}
            >
              Editar
            </Link>
          )}
          <Link className="btn-secondary" to="/admin/productos">
            Volver al listado
          </Link>
        </div>
      </EncabezadoPanel>

      <form className="admin-form" noValidate onSubmit={enviar}>
        <label>
          Código producto
          <input
            type="text"
            className="form-control"
            value={producto?.id ?? "Se asigna al guardar"}
            readOnly
            disabled
          />
          <small className="campo-ayuda">Lo asigna el sistema (ME001, ME002…).</small>
        </label>

        <label>
          Nombre
          <input
            type="text"
            maxLength={100}
            {...campo("name")}
            onChange={(e) => cambiar("name", e.target.value)}
          />
          <ErrorCampo mensaje={errores.name} />
        </label>

        <label>
          Descripción (opcional)
          <textarea
            rows={3}
            maxLength={255}
            {...campo("description")}
            onChange={(e) => cambiar("description", e.target.value)}
          />
          <ErrorCampo mensaje={errores.description} />
        </label>

        <div className="row g-3">
          <label className="col-md-6">
            Precio
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              {...campo("price")}
              onChange={(e) => cambiar("price", e.target.value)}
            />
            <ErrorCampo mensaje={errores.price} />
            <small className="campo-ayuda">
              En pesos, sin puntos ni decimales. Mínimo 0.
            </small>
          </label>

          <label className="col-md-6">
            Categoría
            <select
              {...campo("category")}
              onChange={(e) => cambiar("category", e.target.value)}
            >
              <option value="">-- Selecciona la categoría --</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            <ErrorCampo mensaje={errores.category} />
          </label>
        </div>

        <div className="row g-3">
          <label className="col-md-6">
            Stock
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              {...campo("stock")}
              onChange={(e) => cambiar("stock", e.target.value)}
            />
            <ErrorCampo mensaje={errores.stock} />
            <small className="campo-ayuda">
              Cantidad en inventario. Solo números enteros.
            </small>
          </label>

          <label className="col-md-6">
            Stock crítico (opcional)
            <input
              type="text"
              inputMode="numeric"
              {...campo("stockCritico")}
              onChange={(e) => cambiar("stockCritico", e.target.value)}
            />
            <ErrorCampo mensaje={errores.stockCritico} />
            <small className="campo-ayuda">
              Se alerta cuando el stock sea igual o inferior.
            </small>
          </label>
        </div>

        {stockCritico && (
          <p className="admin-alert" role="alert">
            <strong>⚠ Stock crítico:</strong> el stock es igual o inferior al
            stock crítico definido.
          </p>
        )}

        {!soloLectura && (
          <label>
            Imagen (opcional)
            <input
              type="file"
              name="image"
              accept="image/*"
              className={claseCampo(errorImagen, "form-control")}
              onChange={elegirImagen}
            />
            <ErrorCampo mensaje={errorImagen} />
            <small className="campo-ayuda">
              Archivo de imagen de hasta 300 KB.
            </small>
          </label>
        )}
        {imagen && (
          <img
            className="admin-image-preview"
            src={imagen}
            alt="Vista previa del producto"
          />
        )}

        {!soloLectura && (
          <button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar producto"}
          </button>
        )}
        <p className="profile-message" role="status">
          {mensaje}
        </p>
      </form>
    </>
  );
}