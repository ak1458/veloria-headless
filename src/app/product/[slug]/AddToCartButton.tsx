"use client";

import { useCartStore } from "@/store/cart";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    slug: string;
    href?: string;
    price: number;
    image: string;
    category: string;
  };
  disabled?: boolean;
}

export default function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
        added
          ? "bg-green-600 text-white"
          : disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-veloria-black text-white hover:bg-veloria-gold"
      }`}
      id="add-to-cart-button"
    >
      {added ? (
        <>
          <Check className="w-5 h-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          Add to Cart
        </>
      )}
    </button>
  );
}
