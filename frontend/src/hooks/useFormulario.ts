import { useState } from "react";

// Valores de un formulario: texto o casillas de verificación.
export type Valores = Record<string, string | boolean>;

// "reglas" es un objeto { campo: (valor, valores) => mensaje }. Cada regla
// devuelve el mensaje de error, o "" si el campo es válido.
export type Reglas<T extends Valores> = {
  [K in keyof T]?: (valor: T[K], valores: T) => string;
};

type Errores<T> = Partial<Record<keyof T, string>>;

// Estado de un formulario con validación en tiempo real: cada cambio valida
// su campo y deja el mensaje listo para mostrarlo debajo.
export function useFormulario<T extends Valores>(
  inicial: T,
  reglas: Reglas<T>,
) {
  const [valores, setValores] = useState<T>(inicial);
  const [errores, setErrores] = useState<Errores<T>>({});

  const validarCampo = <K extends keyof T>(campo: K, datos: T): string =>
    reglas[campo]?.(datos[campo], datos) ?? "";

  const cambiar = <K extends keyof T>(campo: K, valor: T[K]) => {
    const nuevos = { ...valores, [campo]: valor };
    setValores(nuevos);
    setErrores((previos) => ({
      ...previos,
      [campo]: validarCampo(campo, nuevos),
    }));
  };

  // Valida un campo sin cambiarlo (al salir de él).
  const tocar = <K extends keyof T>(campo: K) => {
    setErrores((previos) => ({
      ...previos,
      [campo]: validarCampo(campo, valores),
    }));
  };

  const validarTodo = (): boolean => {
    const nuevos: Errores<T> = {};
    (Object.keys(reglas) as (keyof T)[]).forEach((campo) => {
      nuevos[campo] = validarCampo(campo, valores);
    });
    setErrores(nuevos);
    return Object.values(nuevos).every((mensaje) => !mensaje);
  };

  // Cambia varios campos a la vez (por ejemplo región y comuna) y los valida.
  const reiniciarCampos = (cambios: Partial<T>) => {
    const nuevos = { ...valores, ...cambios };
    setValores(nuevos);
    setErrores((previos) => {
      const siguientes = { ...previos };
      (Object.keys(cambios) as (keyof T)[]).forEach((campo) => {
        siguientes[campo] = campo in previos ? validarCampo(campo, nuevos) : "";
      });
      return siguientes;
    });
  };

  const fijarError = <K extends keyof T>(campo: K, mensaje: string) => {
    setErrores((previos) => ({ ...previos, [campo]: mensaje }));
  };

  const reiniciar = (datos: T = inicial) => {
    setValores(datos);
    setErrores({});
  };

  return {
    valores,
    errores,
    cambiar,
    tocar,
    validarTodo,
    fijarError,
    reiniciar,
    reiniciarCampos,
  };
}
