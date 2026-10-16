import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router no mueve el scroll al cambiar de página: sin esto, al entrar
// a un producto desde el Inicio (o desde "Productos relacionados") la página
// nueva se abría a la altura en que estaba la anterior.
// "instant" evita la animación del scroll-behavior: smooth de base.css.
export default function SubirAlInicio() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
