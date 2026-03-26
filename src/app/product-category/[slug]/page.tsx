import CategoryContent from "./CategoryContent";
import { getCategories, getVariationProducts } from "@/lib/woocommerce";

export const dynamic = "force-dynamic";

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
