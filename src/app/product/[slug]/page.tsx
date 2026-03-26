import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";
import PremiumProductCard from "@/components/PremiumProductCard";
import {
  getProductBySlug,
  getProductVariations,
  getRelatedProducts,
} from "@/lib/woocommerce";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Veloria Vault`,
    description: stripHtml(product.short_description || product.description),
    openGraph: {
      title: product.name,
      description: stripHtml(product.short_description || product.description),
      images: product.images[0]?.src ? [product.images[0].src] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [variations, relatedProducts] = await Promise.all([
    getProductVariations(product.id),
    getRelatedProducts(product),
  ]);

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <ProductDetails product={product} variations={variations} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-[#fafafa] border-t border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-serif font-medium text-gray-900 mb-8 text-center">
              Related products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <PremiumProductCard 
                  key={relatedProduct.id} 
                  product={relatedProduct} 
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
