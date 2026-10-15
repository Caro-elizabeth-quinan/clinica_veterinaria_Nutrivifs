import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSesion } from "../contexto/SesionContexto";
import Encabezado from "./Encabezado";
import PiePagina from "./PiePagina";

// De la tienda, el Vendedor solo puede ver productos (lista y detalle).
function permitidaParaVendedor(ruta: string): boolean {
  return ruta === "/" || ruta === "/login" || ruta.startsWith("/productos");
}

// Estructura común de las páginas de la tienda: cabecera, contenido y pie.
export default function Plantilla() {
  const { sesion } = useSesion();
  const { pathname } = useLocation();

  if (sesion?.role === "Vendedor" && !permitidaParaVendedor(pathname)) {
    return <Navigate to="/admin/productos" replace />;
  }

  return (
    <>
      <Encabezado />
      <Outlet />
      <PiePagina />
    </>
  );
}
