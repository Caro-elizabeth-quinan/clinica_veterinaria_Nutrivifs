import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorCampo, { claseCampo } from "../../componentes/ErrorCampo";
import { useSesion } from "../../contexto/SesionContexto";
import { CATEGORIAS_PRODUCTO } from "../../datos/productos";
import { useFormulario, type Reglas } from "../../hooks/useFormulario";
import { CLAVES, guardar } from "../../servicios/almacenamiento";
import { buscarProducto, obtenerProductos } from "../../servicios/catalogo";
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

function crearReglas(codigoActual: string): Reglas<FormularioProducto> {
  return {
    id: (valor) => {
      const codigo = valor.trim();
      if (!codigo) return "El código es obligatorio.";
      if (codigo.length < 3)
        return "El código debe tener al menos 3 caracteres.";
      if (
        codigo !== codigoActual &&
        obtenerProductos().some(
          (item) => item.id.toLowerCase() === codigo.toLowerCase(),
        )
      ) {
        return "Ya existe un producto con este código.";
      }
      return "";
    },
    name: (valor) => {
      const nombre = valor.trim();
      if (!nombre) return "El nombre es obligatorio.";
      if (nombre.length > 100)
        return "El nombre no puede superar los 100 caracteres.";
      return "";
    },
    description: (valor) =>
      valor.trim().length > 500
        ? "La descripción no puede superar los 500 caracteres."
        : "",
    price: (valor) => {
      const precio = valor.trim().replace(",", ".");
      if (!precio) return "El precio es obligatorio.";
      if (!/^\d+(\.\d+)?$/.test(precio)) {
        return "Ingresa un número mayor o igual a 0 (puede tener decimales).";
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
}

function leerComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = rechazar;
    lector.readAsDataURL(archivo);
  });
}

// Nuevo, editar y mostrar producto. "soloLectura" corresponde a "Mostrar".
export default function AdminProductoForm({
  soloLectura = false,
}: {
  soloLectura?: boolean;
}) {
  const { codigo = "" } = useParams();
  const { sesion } = useSesion();
  const navegar = useNavigate();
  const producto = codigo ? buscarProducto(codigo) : null;

  const formulario = useFormulario<FormularioProducto>(
    producto
      ? {
          id: producto.id,
          name: producto.name,
          description: producto.description ?? "",
          price: String(producto.price),
          stock: String(producto.stock),
          stockCritico: String(producto.stockCritico ?? ""),
          category: producto.category,
        }
      : VACIO,
    crearReglas(codigo),
  );
  const { valores, errores, cambiar, tocar } = formulario;

  const [imagen, setImagen] = useState(producto?.image ?? "");
  const [errorImagen, setErrorImagen] = useState("");
  const [mensaje, setMensaje] = useState("");

  if (codigo && !producto) {
    return (
      <div className="admin-heading">
        <h1>Producto no encontrado</h1>
        <Link className="btn-secondary" to="/admin/productos">
          Volver al listado
        </Link>
      </div>
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

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();

    if (!formulario.validarTodo() || errorImagen) {
      setMensaje("Revisa los campos marcados en rojo.");
      return;
    }

    const critico = valores.stockCritico.trim();
    const datos: Producto = {
      id: valores.id.trim(),
      name: valores.name.trim(),
      description: valores.description.trim(),
      species: producto?.species ?? "",
      price: Number(valores.price.trim().replace(",", ".")),
      stock: Number(valores.stock),
      stockCritico: critico === "" ? "" : Number(critico),
      category: valores.category,
      image: imagen,
    };

    const productos = obtenerProductos();
    const indice = productos.findIndex((item) => item.id === codigo);

    if (indice >= 0) {
      productos[indice] = datos;
    } else {
      productos.push(datos);
    }

    guardar(CLAVES.PRODUCTOS, productos);
    navegar("/admin/productos");
  };

  const campo = (nombre: keyof FormularioProducto) => ({
    name: nombre,
    className: claseCampo(errores[nombre]),
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
      <div className="admin-heading">
        <div>
          <span className="admin-eyebrow">PRODUCTOS</span>
          <h1>{titulo}</h1>
        </div>
        <div className="admin-heading-actions">
          {soloLectura && sesion?.role === "Administrador" && (
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
      </div>

      <form className="admin-form" noValidate onSubmit={enviar}>
        <label>
          Código producto
          <input
            type="text"
            placeholder="ME023"
            autoComplete="off"
            readOnly={Boolean(producto)}
            {...campo("id")}
            onChange={(e) => cambiar("id", e.target.value)}
          />
          <ErrorCampo mensaje={errores.id} />
          <small className="campo-ayuda">Texto, mínimo 3 caracteres.</small>
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
            maxLength={500}
            {...campo("description")}
            onChange={(e) => cambiar("description", e.target.value)}
          />
          <ErrorCampo mensaje={errores.description} />
        </label>

        <div className="admin-form-row">
          <label>
            Precio
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              {...campo("price")}
              onChange={(e) => cambiar("price", e.target.value)}
            />
            <ErrorCampo mensaje={errores.price} />
            <small className="campo-ayuda">
              Mínimo 0 (producto gratis). Acepta decimales.
            </small>
          </label>

          <label>
            Categoría
            <select
              {...campo("category")}
              onChange={(e) => cambiar("category", e.target.value)}
            >
              <option value="">-- Selecciona la categoría --</option>
              {CATEGORIAS_PRODUCTO.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            <ErrorCampo mensaje={errores.category} />
          </label>
        </div>

        <div className="admin-form-row">
          <label>
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

          <label>
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
              className={claseCampo(errorImagen)}
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
          <button type="submit" className="btn-primary">
            Guardar producto
          </button>
        )}
        <p className="profile-message" role="status">
          {mensaje}
        </p>
      </form>
    </>
  );
}
