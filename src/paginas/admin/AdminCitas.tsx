import { useState } from "react";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import { CLAVES, guardar, leerLista } from "../../servicios/almacenamiento";
import type { Cita, EstadoCita } from "../../tipos";

// Solicitudes recibidas desde "Agenda tu consulta": confirmar, rechazar o reabrir.
export default function AdminCitas() {
  const [citas, setCitas] = useState(() => leerLista<Cita>(CLAVES.CITAS));

  const cambiarEstado = (id: string, estado: EstadoCita) => {
    const nuevas = citas.map((cita) =>
      cita.id === id ? { ...cita, estado } : cita,
    );
    guardar(CLAVES.CITAS, nuevas);
    setCitas(nuevas);
  };

  return (
    <>
      <EncabezadoPanel etiqueta="ATENCIÓN" titulo="Citas" />

      <p className="admin-lead">
        Solicitudes enviadas desde "Agenda tu consulta". Confirma o rechaza cada
        una.
      </p>

      {citas.length === 0 && (
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
            {[...citas].reverse().map((cita) => (
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
