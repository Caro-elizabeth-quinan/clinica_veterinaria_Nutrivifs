import DocumentoLegal from "../componentes/DocumentoLegal";
import { FECHA_TERMINOS, SECCIONES_PRIVACIDAD } from "../datos/sitio";

export default function Privacidad() {
  return (
    <DocumentoLegal
      titulo="Política de privacidad"
      texto="Qué datos personales recopilamos, para qué los usamos y cuáles son tus derechos."
      fecha={FECHA_TERMINOS}
      secciones={SECCIONES_PRIVACIDAD}
      relacionado={{ texto: "Ver Términos y condiciones", ruta: "/terminos" }}
    />
  );
}
