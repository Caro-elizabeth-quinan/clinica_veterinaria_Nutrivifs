import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import BotonEliminar from "../../componentes/BotonEliminar";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import ErrorCampo from "../../componentes/ErrorCampo";
import { claseCampo } from "../../utils/claseCampo";
import { useFormulario, type Reglas } from "../../hooks/useFormulario";
import {
  actualizarCategoriaApi,
  crearCategoriaApi,
  eliminarCategoriaApi,
  obtenerCategoriasApi,
} from "../../servicios/categorias";
import { obtenerProductosApi } from "../../servicios/catalogo";
import type { Categoria, Producto } from "../../tipos";

type FormularioCategoria = { nombre: string; descripcion: string };

const VACIO: FormularioCategoria = { nombre: "", descripcion: "" };

function crearReglas(
  categorias: Categoria[],
  idActual: string | null,
): Reglas<FormularioCategoria> {
  return {
    nombre: (valor) => {
      const nombre = valor.trim();
      if (!nombre) return "El nombre es obligatorio.";
      if (nombre.length < 3) return "Debe tener al menos 3 caracteres.";
      if (nombre.length > 30) return "No puede superar los 30 caracteres.";
      const repetida = categorias.some(
        (categoria) =>
          categoria.id !== idActual &&
          categoria.nombre.toLowerCase() === nombre.toLowerCase(),
      );
      return repetida ? "Ya existe una categoría con ese nombre." : "";
    },
    descripcion: (valor) =>
      valor.trim().length > 150
        ? "La descripción no puede superar los 150 caracteres."
        : "",
  };
}

function mensajeDeError(error: unknown, porDefecto: string): string {
  return axios.isAxiosError(error)
    ? (error.response?.data?.mensaje ?? porDefecto)
    : "Error inesperado.";
}

// Mantenedor de categorías (solo Administrador): listar, crear, editar y
// eliminar contra el backend. Una categoría con productos no se puede eliminar.
export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  // null = creando una nueva; un id = editando esa categoría.
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; tipo: string } | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);

  const formulario = useFormulario<FormularioCategoria>(
    VACIO,
    crearReglas(categorias, editandoId),
  );
  const { valores, errores, cambiar, tocar } = formulario;

  // GET /productos/categorias y GET /productos (para contar productos por categoría)
  const cargar = async () => {
    try {
      const [cats, prods] = await Promise.all([
        obtenerCategoriasApi(),
        obtenerProductosApi(),
      ]);
      setCategorias(cats);
      setProductos(prods);
    } catch (error) {
      setAviso({
        tipo: "alert-danger",
        texto: mensajeDeError(error, "No se pudo conectar con el servidor."),
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const contarProductos = (nombreCategoria: string) =>
    productos.filter((producto) => producto.category === nombreCategoria)
      .length;

  const cancelar = () => {
    setEditandoId(null);
    formulario.reiniciar(VACIO);
  };

  const editar = (categoria: Categoria) => {
    setEditandoId(categoria.id);
    setAviso(null);
    formulario.reiniciar({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? "",
    });
  };

  // DELETE /productos/categorias/{id}
  const eliminar = async (categoria: Categoria) => {
    try {
      await eliminarCategoriaApi(categoria.id);
      setCategorias((actuales) =>
        actuales.filter((item) => item.id !== categoria.id),
      );
      if (editandoId === categoria.id) cancelar();
      setAviso({
        tipo: "alert-success",
        texto: `Categoría "${categoria.nombre}" eliminada.`,
      });
    } catch (error) {
      // 400: "No se puede eliminar: la categoría tiene productos asociados."
      setAviso({
        tipo: "alert-warning",
        texto: mensajeDeError(error, "No se pudo eliminar la categoría."),
      });
    }
  };

  // POST /productos/categorias (nueva) o PUT /productos/categorias/{id} (editar)
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!formulario.validarTodo()) return;

    const datos = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
    };

    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarCategoriaApi({ id: editandoId, ...datos });
        setAviso({ tipo: "alert-success", texto: "Categoría actualizada." });
      } else {
        await crearCategoriaApi({ id: "", ...datos });
        setAviso({ tipo: "alert-success", texto: "Categoría creada." });
      }
      cancelar();
      await cargar(); // recarga lista y conteos (los productos siguen asociados al renombrar)
    } catch (error) {
      setAviso({
        tipo: "alert-danger",
        texto: mensajeDeError(error, "No se pudo guardar la categoría."),
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <EncabezadoPanel etiqueta="MANTENEDOR" titulo="Categorías" />

      {aviso && (
        <p className={`alert ${aviso.tipo}`} role="status">
          {aviso.texto}
        </p>
      )}

      <div className="row g-4 align-items-start">
        <div className="col-12 col-xxl-8">
          <div className="admin-table-wrap table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Productos</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={5}>Cargando categorías...</td>
                  </tr>
                )}
                {!cargando && categorias.length === 0 && (
                  <tr>
                    <td colSpan={5}>Aún no hay categorías.</td>
                  </tr>
                )}
                {categorias.map((categoria) => (
                  <tr
                    key={categoria.id}
                    className={
                      categoria.id === editandoId ? "table-active" : undefined
                    }
                  >
                    <td>{categoria.id}</td>
                    <td>{categoria.nombre}</td>
                    <td>
                      <small>{categoria.descripcion || "—"}</small>
                    </td>
                    <td>{contarProductos(categoria.nombre)}</td>
                    <td className="admin-actions flex-nowrap">
                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() => editar(categoria)}
                      >
                        Editar
                      </button>
                      <BotonEliminar alEliminar={() => eliminar(categoria)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* En pantallas medianas el formulario va arriba; en grandes, al lado. */}
        <div className="col-12 col-xxl-4 order-first order-xxl-last">
          <form className="admin-form" noValidate onSubmit={enviar}>
            <h2 className="h5 m-0 fw-bold">
              {editandoId ? `Editar ${editandoId}` : "Nueva categoría"}
            </h2>

            {/* El código lo asigna el backend (CAT01, CAT02…) y no se edita. */}
            <label>
              Código categoría
              <input
                type="text"
                name="id"
                className="form-control"
                value={editandoId ?? "Se asigna al guardar"}
                readOnly
                disabled
              />
              <small className="campo-ayuda">Lo asigna el sistema.</small>
            </label>

            <label>
              Nombre
              <input
                type="text"
                maxLength={30}
                name="nombre"
                className={claseCampo(errores.nombre, "form-control")}
                value={valores.nombre}
                onChange={(e) => cambiar("nombre", e.target.value)}
                onBlur={() => tocar("nombre")}
              />
              <ErrorCampo mensaje={errores.nombre} />
            </label>

            <label>
              Descripción (opcional)
              <textarea
                rows={3}
                maxLength={150}
                name="descripcion"
                className={claseCampo(errores.descripcion, "form-control")}
                value={valores.descripcion}
                onChange={(e) => cambiar("descripcion", e.target.value)}
                onBlur={() => tocar("descripcion")}
              />
              <ErrorCampo mensaje={errores.descripcion} />
            </label>

            {editandoId && (
              <small className="campo-ayuda">
                Si cambias el nombre, sus productos siguen asociados.
              </small>
            )}

            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="btn-primary" disabled={guardando}>
                {guardando
                  ? "Guardando..."
                  : editandoId
                    ? "Guardar cambios"
                    : "Crear categoría"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}