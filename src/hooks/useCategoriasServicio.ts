import { useEffect, useState } from "react";
import { mensajeDeErrorApi } from "../servicios/citas";
import { obtenerCategoriasServicioApi } from "../servicios/servicios";
import type { CategoriaServicio } from "../tipos";

// Carga el catálogo de servicios desde el backend (con estado de carga y error)
export function useCategoriasServicio() {
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;
    obtenerCategoriasServicioApi()
      .then((datos) => {
        if (vigente) setCategorias(datos);
      })
      .catch((e) => {
        if (vigente) {
          setError(
            mensajeDeErrorApi(
              e,
              "No se pudieron cargar los servicios. Intenta nuevamente.",
            ),
          );
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  return { categorias, cargando, error };
}