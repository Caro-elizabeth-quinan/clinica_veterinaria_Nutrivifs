import { Route, Routes } from "react-router-dom";
import Plantilla from "./componentes/Plantilla";
import PlantillaAdmin from "./componentes/PlantillaAdmin";
import Agendar from "./paginas/Agendar";
import Blog from "./paginas/Blog";
import Carrito from "./paginas/Carrito";
import Consultas from "./paginas/Consultas";
import Contacto from "./paginas/Contacto";
import DetalleBlog from "./paginas/DetalleBlog";
import DetalleProducto from "./paginas/DetalleProducto";
import Inicio from "./paginas/Inicio";
import NoEncontrada from "./paginas/NoEncontrada";
import Perfil from "./paginas/Perfil";
import Terminos from "./paginas/Terminos";
import Privacidad from "./paginas/Privacidad";
import Login from "./paginas/Login";
import Productos from "./paginas/Productos";
import QuienesSomos from "./paginas/QuienesSomos";
import Registro from "./paginas/Registro";
import AdminCategorias from "./paginas/admin/AdminCategorias";
import AdminCitas from "./paginas/admin/AdminCitas";
import AdminInicio from "./paginas/admin/AdminInicio";
import AdminOrdenes from "./paginas/admin/AdminOrdenes";
import AdminProductoForm from "./paginas/admin/AdminProductoForm";
import AdminProductos from "./paginas/admin/AdminProductos";
import AdminUsuarioForm from "./paginas/admin/AdminUsuarioForm";
import AdminUsuarios from "./paginas/admin/AdminUsuarios";

// Rutas de la aplicación: la tienda usa <Plantilla /> (cabecera y pie) y el
// panel usa <PlantillaAdmin /> (menú lateral y control de acceso por rol).
// Los formularios llevan "key" para reiniciar su estado al cambiar de modo.
export default function App() {
  return (
    <Routes>
      <Route element={<Plantilla />}>
        <Route index element={<Inicio />} />
        <Route path="productos" element={<Productos />} />
        <Route path="productos/:codigo" element={<DetalleProducto />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="consultas" element={<Consultas />} />
        <Route path="agendar" element={<Agendar />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:id" element={<DetalleBlog />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="quienes-somos" element={<QuienesSomos />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="terminos" element={<Terminos />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>

      <Route path="admin" element={<PlantillaAdmin />}>
        <Route index element={<AdminInicio />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route
          path="productos/nuevo"
          element={<AdminProductoForm key="nuevo" />}
        />
        <Route
          path="productos/:codigo"
          element={<AdminProductoForm key="ver" soloLectura />}
        />
        <Route
          path="productos/:codigo/editar"
          element={<AdminProductoForm key="editar" />}
        />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route
          path="usuarios/nuevo"
          element={<AdminUsuarioForm key="nuevo" />}
        />
        <Route
          path="usuarios/:email"
          element={<AdminUsuarioForm key="ver" soloLectura />}
        />
        <Route
          path="usuarios/:email/editar"
          element={<AdminUsuarioForm key="editar" />}
        />
        <Route path="ordenes" element={<AdminOrdenes />} />
        <Route path="citas" element={<AdminCitas />} />
      </Route>
    </Routes>
  );
}
