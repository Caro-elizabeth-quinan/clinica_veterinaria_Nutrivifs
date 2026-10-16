import { useState } from "react";
import { Link } from "react-router-dom";
import AlertaStockCritico from "../../componentes/AlertaStockCritico";
import BotonEliminar from "../../componentes/BotonEliminar";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import { useSesion } from "../../hooks/useSesion";
import { CLAVES, guardar } from "../../servicios/almacenamiento";
import { obtenerProductos } from "../../servicios/catalogo";
import { formatearPrecio } from "../../utils/formato";
import { esStockCritico } from "../../utils/stock";

// Listado de productos. El Vendedor consulta y modifica el stock; el
// Administrador además crea, edita y elimina.
export default function AdminProductos() {
  const { sesion } = useSesion();
  const esAdmin = sesion?.role === "Administrador";
  const [productos, setProductos] = useState(obtenerProductos);

  const eliminar = (codigo: string) => {
    const restantes = productos.filter((producto) => producto.id !== codigo);
    guardar(CLAVES.PRODUCTOS, restantes);
    setProductos(restantes);
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

      <AlertaStockCritico />

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
                    {!esAdmin && (
                      <Link className="admin-edit-button" to={`${ruta}/editar`}>
                        Modificar stock
                      </Link>
                    )}
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
    </>
  );
}
