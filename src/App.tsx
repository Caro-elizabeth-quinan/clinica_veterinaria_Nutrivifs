import { Route, Routes } from "react-router-dom";

// Proyecto base en blanco: solo comprueba que React, TypeScript, Vite,
// React Router, Bootstrap 5 y Bootstrap Icons están instalados y funcionando.
// Este archivo se reemplaza al copiar el código de la tienda.

interface Paquete {
  nombre: string;
  uso: string;
  icono: string;
}

const PAQUETES: Paquete[] = [
  { nombre: "react / react-dom", uso: "Componentes e interfaz", icono: "bi-filetype-jsx" },
  { nombre: "typescript", uso: "Tipos e interfaces", icono: "bi-filetype-tsx" },
  { nombre: "vite", uso: "Servidor de desarrollo y compilación", icono: "bi-lightning-charge-fill" },
  { nombre: "react-router-dom", uso: "Navegación entre páginas", icono: "bi-signpost-split-fill" },
  { nombre: "bootstrap", uso: "Grilla y diseño responsivo", icono: "bi-bootstrap-fill" },
  { nombre: "bootstrap-icons", uso: "Íconos del sitio", icono: "bi-emoji-smile-fill" },
  { nombre: "oxlint", uso: "Revisión de código (npm run lint)", icono: "bi-check2-circle" },
];

function Inicio() {
  return (
    <main className="container py-5">
      <div className="text-center mb-5">
        <img src="/img/logo.svg" alt="" width={64} height={64} />
        <h1 className="mt-3 fw-bold">Clínica NutriDifs</h1>
        <p className="lead text-secondary">
          Proyecto base en React. Si ves esta página, todo quedó instalado.
        </p>
      </div>

      <div className="row g-3">
        {PAQUETES.map((paquete) => (
          <div key={paquete.nombre} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex align-items-center gap-3">
                <i className={`bi ${paquete.icono} fs-2 text-success`} aria-hidden="true" />
                <div>
                  <h2 className="h6 mb-1">{paquete.nombre}</h2>
                  <p className="mb-0 text-secondary small">{paquete.uso}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-secondary mt-5 mb-0">
        DSY1104 – 2026 · Carolina Quinan · Liza Micele · Benatha Louime
      </p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Inicio />} />
    </Routes>
  );
}
