import DocumentoLegal from "../componentes/DocumentoLegal";
import { FECHA_TERMINOS, SECCIONES_TERMINOS } from "../datos/sitio";

export default function Terminos() {
  return (
    <DocumentoLegal
      titulo="Términos y condiciones"
      texto="Reglas de uso del sitio, compras, pagos y tratamiento de tus datos."
      fecha={FECHA_TERMINOS}
      secciones={SECCIONES_TERMINOS}
      relacionado={{ texto: "Ver Política de privacidad", ruta: "/privacidad" }}
    />
  );
}
