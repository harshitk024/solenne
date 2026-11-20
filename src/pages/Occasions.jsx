import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getOccasion, occasions } from "../data/store";
import { useCatalog } from "../context/CatalogContext";

export default function Occasions() {
  const { id } = useParams();
  const { products } = useCatalog();
  const occasion = id ? getOccasion(id) : null;

  if (id && !occasion) {
    return (
      <div className="page container empty">
        <h2>That occasion is not on our calendar.</h2>
        <Link to="/occasions" className="btn btn-dark">
          All occasions
        </Link>
      </div>
    );
  }

  const list = occasion ? products.filter((product) => product.occasions.includes(occasion.id)) : [];

  return (
    <div className="page">
      <div className="container">
        <header className="page-hero">
          <p className="crumbs">
            <Link to="/">Home</Link> / <Link to="/occasions">Occasions</Link>
            {occasion ? ` / ${occasion.name}` : ""}
          </p>
          <span className="eyebrow">{occasion ? occasion.season : "For the moment"}</span>
          <h1>{occasion ? occasion.name : "Gifts by occasion"}</h1>
          <p>
            {occasion
              ? `A quieter edit for ${occasion.name.toLowerCase()}. Each piece is ready to be wrapped and noted.`
              : "Choose the reason. We will show you only what belongs."}
          </p>
        </header>

        {!occasion ? (
          <div className="occasion-grid">
            {occasions.map((item) => (
              <Link key={item.id} to={`/occasions/${item.id}`} className="occasion-card">
                <img src={item.image} alt={item.name} />
                <figcaption>
                  <p>{item.season}</p>
                  <h3>{item.name}</h3>
                </figcaption>
              </Link>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
