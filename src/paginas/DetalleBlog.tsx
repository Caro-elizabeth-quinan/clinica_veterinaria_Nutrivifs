import { Navigate, useParams } from "react-router-dom";
import ArticuloBlog1 from "./ArticuloBlog1";
import ArticuloBlog2 from "./ArticuloBlog2";

// /blog/1 y /blog/2 muestran cada artículo; cualquier otro vuelve al listado.
export default function DetalleBlog() {
  const { id } = useParams();

  if (id === "1") return <ArticuloBlog1 />;
  if (id === "2") return <ArticuloBlog2 />;
  return <Navigate to="/blog" replace />;
}
