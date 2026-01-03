import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/../../shared/data";
import { useRoute } from "wouter";
import NotFound from "./NotFound";

export default function Category() {
  const [, params] = useRoute("/category/:id");
  const categoryId = params?.id || "all";
  
  const category = categories.find(c => c.id === categoryId);
  
  if (!category && categoryId !== "all") return <NotFound />;

  const categoryProducts = categoryId === "all" 
    ? products 
    : products.filter(p => p.category === categoryId);

  const categoryName = category ? category.name : "Všetky produkty";

  return (
    <Layout>
      <div className="bg-secondary/5 py-12 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-black tracking-tight text-foreground md:text-6xl uppercase">
              {categoryName}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Preskúmajte našu prémiovú kolekciu {categoryName.toLowerCase()}. Navrhnuté pre výkon a štýl.
            </p>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xl text-muted-foreground">V tejto kategórii sa nenašli žiadne produkty.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
