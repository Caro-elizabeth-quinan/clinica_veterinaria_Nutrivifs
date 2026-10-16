import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import ErrorCampo from "../../componentes/ErrorCampo";
import { claseCampo } from "../../utils/claseCampo";
import { useSesion } from "../../hooks/useSesion";
import { useFormulario, type Reglas } from "../../hooks/useFormulario";
import { CLAVES, guardar } from "../../servicios/almacenamiento";
import {
  buscarProducto,
  obtenerProductos,
  siguienteCodigoProducto,
} from "../../servicios/catalogo";
import { nombresCategorias } from "../../servicios/categorias";
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
  // El Vendedor solo puede modificar el stock de un producto existente.
  const soloStock =
    !soloLectura && Boolean(producto) && sesion?.role === "Vendedor";

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
      : { ...VACIO, id: siguienteCodigoProducto() },
    crearReglas(codigo),
  );
  const { valores, errores, cambiar, tocar } = formulario;

  const [imagen, setImagen] = useState(producto?.image ?? "");
  const [errorImagen, setErrorImagen] = useState("");
  const [mensaje, setMensaje] = useState("");

  if (codigo && !producto) {
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

    if (indice >= 0 && soloStock) {
      // El Vendedor solo cambia el stock: el resto del producto se conserva.
      productos[indice] = { ...productos[indice], stock: datos.stock };
    } else if (indice >= 0) {
      productos[indice] = datos;
    } else {
      productos.push(datos);
    }

    guardar(CLAVES.PRODUCTOS, productos);
    navegar("/admin/productos");
  };

  const campo = (nombre: keyof FormularioProducto) => ({
    name: nombre,
    className: claseCampo(
      errores[nombre],
      nombre === "category" ? "form-select" : "form-control",
    ),
    value: valores[nombre],
    disabled: soloLectura || (soloStock && nombre !== "stock"),
    onBlur: () => tocar(nombre),
  });

  const titulo = !producto
    ? "Nuevo producto"
    : soloLectura
      ? "Detalle del producto"
      : soloStock
        ? "Modificar stock"
        : "Editar producto";

  return (
    <>
      <EncabezadoPanel etiqueta="PRODUCTOS" titulo={titulo}>
        <div className="admin-heading-actions">
          {soloLectura && (
            <Link
              className="btn-primary"
              to={`/admin/productos/${encodeURIComponent(codigo)}/editar`}
            >
              {sesion?.role === "Administrador" ? "Editar" : "Modificar stock"}
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
            autoComplete="off"
            readOnly
            {...campo("id")}
            onChange={(e) => cambiar("id", e.target.value)}
          />
          <ErrorCampo mensaje={errores.id} />
          <small className="campo-ayuda">Se asigna automáticamente.</small>
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

        <div className="row g-3">
          <label className="col-md-6">
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

          <label className="col-md-6">
            Categoría
            <select
              {...campo("category")}
              onChange={(e) => cambiar("category", e.target.value)}
            >
              <option value="">-- Selecciona la categoría --</option>
              {nombresCategorias().map((categoria) => (
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

        {!soloLectura && !soloStock && (
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
          <button type="submit" className="btn-primary">
            {soloStock ? "Guardar stock" : "Guardar producto"}
          </button>
        )}
        <p className="profile-message" role="status">
          {mensaje}
        </p>
      </form>
    </>
  );
}
