import { useState } from "react";
import { Link } from "react-router-dom";
import BotonEliminar from "../../componentes/BotonEliminar";
import { useSesion } from "../../contexto/SesionContexto";
import { guardarPerfiles, leerPerfiles } from "../../servicios/perfiles";

// Listado de usuarios (solo Administrador).
export default function AdminUsuarios() {
  const { sesion } = useSesion();
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
      <div className="admin-heading">
        <div>
          <span className="admin-eyebrow">MANTENEDOR</span>
          <h1>Usuarios</h1>
        </div>
        <Link className="btn-primary" to="/admin/usuarios/nuevo">
          Nuevo usuario
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table>
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
                    <Link className="admin-edit-button" to={`${ruta}/editar`}>
                      Editar
                    </Link>
                    {/* El administrador no puede eliminar su propia cuenta. */}
                    {usuario.email !== sesion?.email && (
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
