import { useEffect, useState } from "react";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import {
  cambiarEstadoCitaApi,
  listarCitasApi,
  mensajeDeErrorApi,
} from "../../servicios/citas";
import type { Cita, EstadoCita } from "../../tipos";

// Solicitudes recibidas desde "Agenda tu consulta": confirmar, rechazar o reabrir.
// Los datos vienen del backend (GET /citas) y los cambios se guardan con PATCH.
export default function AdminCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setCitas(await listarCitasApi());
      } catch (e) {
        setError(
          mensajeDeErrorApi(e, "No se pudieron cargar las citas."),
        );
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const cambiarEstado = async (id: string, estado: EstadoCita) => {
    setError("");
    try {
      const actualizada = await cambiarEstadoCitaApi(id, estado);
      setCitas((actuales) =>
        actuales.map((cita) => (cita.id === id ? actualizada : cita)),
      );
    } catch (e) {
      setError(mensajeDeErrorApi(e, "No se pudo actualizar la cita."));
    }
  };

  return (
    <>
      <EncabezadoPanel etiqueta="ATENCIÓN" titulo="Citas" />

      <p className="admin-lead">
        Solicitudes enviadas desde "Agenda tu consulta". Confirma o rechaza cada
        una.
      </p>

      {error && <p className="admin-alert">{error}</p>}
      {cargando && <p className="admin-alert">Cargando citas...</p>}
      {!cargando && !error && citas.length === 0 && (
        <p className="admin-alert">Aún no hay solicitudes de consulta.</p>
      )}

      <div className="admin-table-wrap table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">N°</th>
              <th scope="col">Dueño</th>
              <th scope="col">Mascota</th>
              <th scope="col">Consulta</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.id}</td>
                <td>
                  {cita.nombre}
                  <br />
                  <small>
                    {cita.rut} · {cita.correo} · {cita.telefono}
                  </small>
                </td>
                <td>
                  {cita.mascota}
                  <br />
                  <small>{cita.especie}</small>
                </td>
                <td>
                  {cita.tipoConsulta}
                  <br />
                  <small>{cita.motivo}</small>
                </td>
                <td>{cita.fecha.split("-").reverse().join("-")}</td>
                <td>
                  <span
                    className={`admin-status admin-status-${cita.estado.toLowerCase()}`}
                  >
                    {cita.estado}
                  </span>
                </td>
                <td className="admin-actions">
                  {cita.estado === "Pendiente" ? (
                    <>
                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() => cambiarEstado(cita.id, "Confirmada")}
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() => cambiarEstado(cita.id, "Rechazada")}
                      >
                        Rechazar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="admin-edit-button"
                      onClick={() => cambiarEstado(cita.id, "Pendiente")}
                    >
                      Reabrir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}