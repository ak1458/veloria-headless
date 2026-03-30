"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { getRelativeProductLink, type WCProduct } from "@/lib/woocommerce";

interface HomeProductCardProps {
  product: WCProduct;
  imageLoading?: "lazy" | "eager";
}

export default function HomeProductCard({
  product,
  imageLoading = "lazy",
}: HomeProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const productLink = getRelativeProductLink(product);
  const price = Number(product.price || product.regular_price || 0);
  const regularPrice = Number(product.regular_price || 0);
  const onSale = product.on_sale && price < regularPrice;
  
  const image = product.images[0]?.src || "/images/bag-placeholder.svg";
  const categoryName = product.categories[0]?.name || "Luxury Bag";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      href: productLink,
      price,
      image,
      category: categoryName,
    });
    openCart();
  };

  return (
    <div className="group flex flex-col h-full">
      {/* Image Container - Large image with rounded corners */}
      <Link href={productLink} className="block relative aspect-square overflow-hidden rounded-xl bg-[#e5e2dd]">
        {/* Sale Badge */}
        {onSale && (
          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black text-white text-[10px] font-bold tracking-wider rounded">
            SALE
          </div>
        )}

        {/* Product Image - Large, fills container */}
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={imageLoading === "eager"}
        />
      </Link>

      {/* Product Info */}
      <div className="pt-3 text-center flex flex-col flex-grow">
        <h3 className="text-sm font-medium text-gray-900 mb-1 leading-tight">
          <Link href={productLink} className="hover:text-[#b59a5c] transition-colors">
            {product.name}
          </Link>
        </h3>
        
        <p className="text-xs text-gray-500 mb-2">{categoryName}</p>
        
        {/* Price */}
        <div className="flex items-center justify-center space-x-2 mb-3">
          {onSale && (
            <span className="text-xs text-gray-400 line-through">
              &#8377;{regularPrice.toLocaleString("en-IN")}
            </span>
          )}
          <span className="text-sm font-semibold text-gray-900">
            &#8377;{price.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Add to Cart Button - Black like original */}
        <button
          onClick={handleAddToCart}
          className="mt-auto w-full py-2.5 bg-black text-white text-xs font-bold tracking-wider uppercase rounded hover:bg-gray-800 transition-colors"
          style={{ fontFamily: 'var(--font-lato), sans-serif' }}
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}
