import { useState } from "react";
import { Link } from "react-router-dom";
import AlertaStockCritico from "../../componentes/AlertaStockCritico";
import BotonEliminar from "../../componentes/BotonEliminar";
import { useSesion } from "../../contexto/SesionContexto";
import { CLAVES, guardar } from "../../servicios/almacenamiento";
import { obtenerProductos } from "../../servicios/catalogo";
import { formatearPrecio } from "../../utils/formato";
import { esStockCritico } from "../../utils/stock";

// Listado de productos. El Vendedor solo puede ver; el Administrador
// además crea, edita y elimina.
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
      <div className="admin-heading">
        <div>
          <span className="admin-eyebrow">MANTENEDOR</span>
          <h1>Productos</h1>
        </div>
        {esAdmin && (
          <Link className="btn-primary" to="/admin/productos/nuevo">
            Nuevo producto
          </Link>
        )}
      </div>

      <AlertaStockCritico />

      <div className="admin-table-wrap">
        <table>
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
    </>
  );
}
