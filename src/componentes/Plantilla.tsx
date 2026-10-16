import { Outlet } from "react-router-dom";
import Encabezado from "./Encabezado";
import PiePagina from "./PiePagina";
import SubirAlInicio from "./SubirAlInicio";

// Estructura común de las páginas de la tienda: cabecera, contenido y pie.
// Los tres roles (Administrador, Vendedor y Cliente) pueden navegar y comprar.
export default function Plantilla() {
  return (
    <>
      <SubirAlInicio />
      <Encabezado />
      <Outlet />
      <PiePagina />
    </>
  );
}
