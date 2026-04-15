import CategoryContent from "./CategoryContent";
import { getCategories, getVariationProducts } from "@/lib/woocommerce";

export const revalidate = 300; // ISR: refresh every 5 minutes

export default async function ProductCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const [categories, categoryProducts] = await Promise.all([
    getCategories(),
    getVariationProducts({ categorySlug: slug }),
  ]);

  return (
    <CategoryContent 
      categorySlug={slug}
      initialCategories={categories}
      initialProducts={categoryProducts}
    />
  );
}
