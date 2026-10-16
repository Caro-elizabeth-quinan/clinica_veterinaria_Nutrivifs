import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ProveedorCarrito } from "./contexto/CarritoContexto";
import { ProveedorSesion } from "./contexto/SesionContexto";
import { sembrarDatosIniciales } from "./servicios/almacenamiento";
// Bootstrap 5 va primero para que los estilos propios del sitio lo ajusten.
import "bootstrap/dist/css/bootstrap.min.css";
// Íconos de Bootstrap (redes sociales, pasos de la agenda, etc.).
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "./estilos/app.css";

// Los datos base deben existir antes de montar la aplicación.
sembrarDatosIniciales();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <ProveedorCarrito>
          <App />
        </ProveedorCarrito>
      </ProveedorSesion>
    </BrowserRouter>
  </StrictMode>,
);
