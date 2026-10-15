import { useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useSesion } from "../contexto/SesionContexto";
import { guardarPerfiles, leerPerfiles } from "../servicios/perfiles";

function calcularEdad(fecha: string): number | null {
  if (!fecha) return null;
  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad >= 0 ? edad : null;
}

export default function PerfilPersonal() {
  const { sesion, iniciarSesion } = useSesion();
  const perfilActual = useMemo(() => sesion ? leerPerfiles().find(p => p.email === sesion.email) : undefined, [sesion]);
  const [nombre, setNombre] = useState(perfilActual?.name ?? sesion?.name ?? "");
  const [apellido, setApellido] = useState(perfilActual?.apellido ?? sesion?.apellido ?? "");
  const [fecha, setFecha] = useState(perfilActual?.birthDate ?? "");
  const [correo, setCorreo] = useState(perfilActual?.email ?? sesion?.email ?? "");
  const [direccion, setDireccion] = useState(perfilActual?.direccion ?? "");
  const [region, setRegion] = useState(perfilActual?.region ?? "");
  const [mensaje, setMensaje] = useState("");
  const edad = calcularEdad(fecha);

  if (!sesion) return <Navigate to="/login" replace />;

  const guardarCambios = (e: FormEvent) => {
    e.preventDefault(); setMensaje("");
    const emailNormalizado = correo.trim().toLowerCase();
    if (!nombre.trim() || !apellido.trim() || !emailNormalizado || !direccion.trim() || !region.trim()) {
      setMensaje("Completa todos los campos obligatorios."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) { setMensaje("Ingresa un correo electrónico válido."); return; }
    const perfiles = leerPerfiles();
    if (perfiles.some(p => p.email === emailNormalizado && p.email !== sesion.email)) { setMensaje("Ese correo ya está registrado en otra cuenta."); return; }
    const indice = perfiles.findIndex(p => p.email === sesion.email);
    if (indice < 0) { setMensaje("No se encontró el perfil para guardar los cambios."); return; }
    perfiles[indice] = { ...perfiles[indice], name: nombre.trim(), apellido: apellido.trim(), birthDate: fecha, email: emailNormalizado, direccion: direccion.trim(), region: region.trim() };
    guardarPerfiles(perfiles);
    iniciarSesion(perfiles[indice]);
    setMensaje("Perfil actualizado correctamente.");
  };

  return <main className="container py-5" style={{ minHeight: "65vh", maxWidth: 850 }}>
    <div className="card shadow-sm border-0"><div className="card-body p-4 p-md-5">
      <div className="d-flex align-items-center gap-3 mb-4"><div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, fontSize: 26 }} aria-hidden="true">{nombre.charAt(0).toUpperCase() || "U"}</div><div><h1 className="h2 mb-1">Mi perfil</h1><p className="text-secondary mb-0">Consulta y actualiza tus datos personales.</p></div></div>
      <div className="alert alert-light border"><strong>Rol de usuario:</strong> {sesion.role} <span className="text-secondary">(no editable)</span></div>
      <form onSubmit={guardarCambios} className="row g-3" noValidate>
        <div className="col-md-6"><label className="form-label" htmlFor="perfil-nombre">Nombre *</label><input id="perfil-nombre" className="form-control" value={nombre} onChange={e=>setNombre(e.target.value)} maxLength={60} required /></div>
        <div className="col-md-6"><label className="form-label" htmlFor="perfil-apellido">Apellido *</label><input id="perfil-apellido" className="form-control" value={apellido} onChange={e=>setApellido(e.target.value)} maxLength={60} required /></div>
        <div className="col-md-6"><label className="form-label" htmlFor="perfil-fecha">Fecha de nacimiento</label><input id="perfil-fecha" type="date" className="form-control" value={fecha} max={new Date().toISOString().slice(0,10)} onChange={e=>setFecha(e.target.value)} /><div className="form-text">Edad: {edad === null ? "por calcular" : `${edad} años`}</div></div>
        <div className="col-md-6"><label className="form-label" htmlFor="perfil-correo">Correo electrónico *</label><input id="perfil-correo" type="email" className="form-control" value={correo} onChange={e=>setCorreo(e.target.value)} maxLength={100} required /></div>
        <div className="col-12"><label className="form-label" htmlFor="perfil-direccion">Dirección *</label><input id="perfil-direccion" className="form-control" value={direccion} onChange={e=>setDireccion(e.target.value)} maxLength={120} required /></div>
        <div className="col-12"><label className="form-label" htmlFor="perfil-region">Región *</label><input id="perfil-region" className="form-control" value={region} onChange={e=>setRegion(e.target.value)} maxLength={100} required /></div>
        {mensaje && <div className="col-12"><div className={`alert ${mensaje.includes("correctamente") ? "alert-success" : "alert-danger"}`} role="status">{mensaje}</div></div>}
        <div className="col-12"><button className="btn btn-primary px-4" type="submit">Guardar cambios</button></div>
      </form>
    </div></div></main>;
}
