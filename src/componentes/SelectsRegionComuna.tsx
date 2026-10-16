import { REGIONES_COMUNAS } from "../datos/regiones";

// Opciones del select de región.
export function OpcionesRegion() {
  return (
    <>
      <option value="">-- Selecciona la región --</option>
      {Object.keys(REGIONES_COMUNAS).map((region) => (
        <option key={region} value={region}>
          {region}
        </option>
      ))}
    </>
  );
}

// Opciones del select de comuna: dependen de la región elegida.
export function OpcionesComuna({ region }: { region: string }) {
  const comunas = REGIONES_COMUNAS[region] ?? [];

  if (comunas.length === 0) {
    return <option value="">Selecciona primero una región</option>;
  }

  return (
    <>
      <option value="">-- Selecciona la comuna --</option>
      {comunas.map((comuna) => (
        <option key={comuna} value={comuna}>
          {comuna}
        </option>
      ))}
    </>
  );
}
