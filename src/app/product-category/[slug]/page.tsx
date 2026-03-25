import CategoryContent from "./CategoryContent";
import { getCategories, getVariationProducts } from "@/lib/woocommerce";

// Generate static params for build time
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories
    .filter((c) => ["tote-bag", "satchel-bag", "sling-bag", "crossbody", "clutch", "wallet", "hand-bag", "handheld-bag", "laptop-bag", "work-bag"].includes(c.slug))
    .map((c) => ({ slug: c.slug }));
}

export default async function ProductCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch data at build time
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getVariationProducts(),
  ]);

  return (
    <CategoryContent 
      categorySlug={slug}
      initialCategories={categories}
      initialProducts={allProducts}
    />
  );
}
