import { useState } from "react";
import { Link } from "react-router-dom";
import BotonEliminar from "../../componentes/BotonEliminar";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import { useSesion } from "../../hooks/useSesion";
import { guardarPerfiles, leerPerfiles } from "../../servicios/perfiles";

// Listado de usuarios. El Administrador ve, edita y elimina; el Vendedor
// solo consulta y crea nuevos clientes.
export default function AdminUsuarios() {
  const { sesion } = useSesion();
  const esAdmin = sesion?.role === "Administrador";
  const [usuarios, setUsuarios] = useState(leerPerfiles);

  const eliminar = (email: string) => {
    const restantes = leerPerfiles().filter(
      (usuario) => usuario.email !== email,
    );
    guardarPerfiles(restantes);
    setUsuarios(restantes);
  };

  return (
    <>
      <EncabezadoPanel etiqueta="MANTENEDOR" titulo="Usuarios">
        <Link className="btn-primary" to="/admin/usuarios/nuevo">
          {esAdmin ? "Nuevo usuario" : "Nuevo cliente"}
        </Link>
      </EncabezadoPanel>

      <div className="admin-table-wrap table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">RUN</th>
              <th scope="col">Nombre</th>
              <th scope="col">Correo</th>
              <th scope="col">Tipo</th>
              <th scope="col">Comuna</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => {
              const ruta = `/admin/usuarios/${encodeURIComponent(usuario.email)}`;

              return (
                <tr key={usuario.email}>
                  <td>{usuario.run || "—"}</td>
                  <td>
                    {usuario.name} {usuario.apellido || ""}
                  </td>
                  <td>{usuario.email}</td>
                  <td>{usuario.role || "Cliente"}</td>
                  <td>{usuario.comuna || "—"}</td>
                  <td className="admin-actions">
                    <Link className="admin-edit-button" to={ruta}>
                      Ver
                    </Link>
                    {esAdmin && (
                      <Link className="admin-edit-button" to={`${ruta}/editar`}>
                        Editar
                      </Link>
                    )}
                    {/* El administrador no puede eliminar su propia cuenta. */}
                    {esAdmin && usuario.email !== sesion?.email && (
                      <BotonEliminar
                        alEliminar={() => eliminar(usuario.email)}
                      />
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
