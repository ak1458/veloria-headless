import ShopContent from "./ShopContent";
import { getCategories, getVariationProducts } from "@/lib/woocommerce";

export const revalidate = 300;

export const metadata = {
  title: "Shop | Veloria Vault",
  description: "Browse Veloria Vault's collection of luxury leather handbags, totes, satchels, and accessories.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getVariationProducts(),
  ]);

  return (
    <ShopContent 
      initialCategories={categories} 
      initialProducts={allProducts}
      initialCategorySlug={params.category}
      initialSearchTerm={params.search}
    />
  );
}
