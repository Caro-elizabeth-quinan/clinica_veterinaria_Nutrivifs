import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AlertaStockCritico from "../../componentes/AlertaStockCritico";
import BotonEliminar from "../../componentes/BotonEliminar";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import { useSesion } from "../../hooks/useSesion";
import {
  eliminarProductoApi,
  obtenerProductosApi,
} from "../../servicios/catalogo";
import type { Producto } from "../../tipos";
import { formatearPrecio } from "../../utils/formato";
import { esStockCritico } from "../../utils/stock";

// Listado de productos desde el backend. El Vendedor solo consulta (ver lista
// y detalle); el Administrador además crea, edita y elimina (Anexo 1).
export default function AdminProductos() {
  const { sesion } = useSesion();
  const esAdmin = sesion?.role === "Administrador";

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  // GET /api/v1/productos
  useEffect(() => {
    async function cargar() {
      try {
        setProductos(await obtenerProductosApi());
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setMensaje("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // DELETE /api/v1/productos/{codigo} (solo Administrador)
  const eliminar = async (codigo: string) => {
    setMensaje("");
    try {
      await eliminarProductoApi(codigo);
      setProductos((actuales) =>
        actuales.filter((producto) => producto.id !== codigo),
      );
    } catch (error) {
      // 400: el producto aparece en boletas · 403: sin permiso
      setMensaje(
        axios.isAxiosError(error)
          ? (error.response?.data?.mensaje ??
              "No se pudo eliminar el producto.")
          : "Error inesperado.",
      );
    }
  };

  return (
    <>
      <EncabezadoPanel etiqueta="MANTENEDOR" titulo="Productos">
        {esAdmin && (
          <Link className="btn-primary" to="/admin/productos/nuevo">
            Nuevo producto
          </Link>
        )}
      </EncabezadoPanel>

      <AlertaStockCritico productos={productos} />

      {mensaje && (
        <p className="alert alert-danger" role="alert">
          {mensaje}
        </p>
      )}

      {cargando ? (
        <div className="d-flex align-items-center gap-3 py-4" role="status">
          <div className="spinner-border text-primary" aria-hidden="true" />
          <span>Cargando productos...</span>
        </div>
      ) : (
        <div className="admin-table-wrap table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Nombre</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio</th>
                <th scope="col">Stock</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const ruta = `/admin/productos/${encodeURIComponent(producto.id)}`;

                return (
                  <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.name}</td>
                    <td>{producto.category}</td>
                    <td>{formatearPrecio(producto.price)}</td>
                    <td>
                      {producto.stock}{" "}
                      {esStockCritico(producto) && (
                        <span className="admin-badge-critical">
                          Stock crítico
                        </span>
                      )}
                    </td>
                    <td className="admin-actions">
                      <Link className="admin-edit-button" to={ruta}>
                        Ver
                      </Link>
                      {esAdmin && (
                        <>
                          <Link
                            className="admin-edit-button"
                            to={`${ruta}/editar`}
                          >
                            Editar
                          </Link>
                          <BotonEliminar
                            alEliminar={() => eliminar(producto.id)}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}