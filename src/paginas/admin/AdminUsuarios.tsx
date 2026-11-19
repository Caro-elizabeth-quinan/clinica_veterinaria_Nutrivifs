import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BotonEliminar from "../../componentes/BotonEliminar";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import { useSesion } from "../../hooks/useSesion";
import {
  desbloquearUsuarioApi,
  eliminarUsuarioApi,
  listarUsuariosApi,
  type UsuarioApi,
} from "../../servicios/usuarios";

function mensajeDeError(error: unknown, porDefecto: string): string {
  return axios.isAxiosError(error)
    ? (error.response?.data?.mensaje ?? porDefecto)
    : "Error inesperado.";
}

// Listado de usuarios desde el backend (solo Administrador): ver, crear,
// editar, eliminar y desbloquear cuentas.
export default function AdminUsuarios() {
  const { sesion } = useSesion();
  const [usuarios, setUsuarios] = useState<UsuarioApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState<{ texto: string; tipo: string } | null>(
    null,
  );

  // GET /api/v1/usuarios
  useEffect(() => {
    async function cargar() {
      try {
        setUsuarios(await listarUsuariosApi());
      } catch (error) {
        setAviso({
          tipo: "alert-danger",
          texto: mensajeDeError(error, "No se pudo conectar con el servidor."),
        });
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // DELETE /api/v1/usuarios/{id}
  const eliminar = async (usuario: UsuarioApi) => {
    try {
      await eliminarUsuarioApi(usuario.id);
      setUsuarios((actuales) => actuales.filter((u) => u.id !== usuario.id));
      setAviso({ tipo: "alert-success", texto: `Usuario ${usuario.email} eliminado.` });
    } catch (error) {
      // 400: "No se puede eliminar: el usuario tiene compras registradas."
      setAviso({
        tipo: "alert-warning",
        texto: mensajeDeError(error, "No se pudo eliminar el usuario."),
      });
    }
  };

  // PATCH /api/v1/usuarios/{id}/desbloquear
  const desbloquear = async (usuario: UsuarioApi) => {
    try {
      const actualizado = await desbloquearUsuarioApi(usuario.id);
      setUsuarios((actuales) =>
        actuales.map((u) => (u.id === usuario.id ? actualizado : u)),
      );
      setAviso({ tipo: "alert-success", texto: `Cuenta ${usuario.email} desbloqueada.` });
    } catch (error) {
      setAviso({
        tipo: "alert-danger",
        texto: mensajeDeError(error, "No se pudo desbloquear la cuenta."),
      });
    }
  };

  return (
    <>
      <EncabezadoPanel etiqueta="MANTENEDOR" titulo="Usuarios">
        <Link className="btn-primary" to="/admin/usuarios/nuevo">
          Nuevo usuario
        </Link>
      </EncabezadoPanel>

      {aviso && (
        <p className={`alert ${aviso.tipo}`} role="status">
          {aviso.texto}
        </p>
      )}

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
            {cargando && (
              <tr>
                <td colSpan={6}>Cargando usuarios...</td>
              </tr>
            )}
            {usuarios.map((usuario) => {
              const ruta = `/admin/usuarios/${encodeURIComponent(usuario.email)}`;

              return (
                <tr key={usuario.id}>
                  <td>{usuario.run || "—"}</td>
                  <td>
                    {usuario.name} {usuario.apellido || ""}
                    {usuario.locked && (
                      <span className="admin-badge-critical ms-2">Bloqueada</span>
                    )}
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
                    {usuario.locked && (
                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() => desbloquear(usuario)}
                      >
                        Desbloquear
                      </button>
                    )}
                    {/* El administrador no puede eliminar su propia cuenta. */}
                    {usuario.email !== sesion?.email && (
                      <BotonEliminar alEliminar={() => eliminar(usuario)} />
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