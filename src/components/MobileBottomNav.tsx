"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Heart, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

function MobileBottomNavInner() {
  const pathname = usePathname();
  
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const isActive = (href: string) => {
    if (href === "/shop") {
      return pathname === "/shop" || 
             pathname.startsWith("/product") || 
             pathname.startsWith("/product-category");
    }
    return pathname === href;
  };

  const navItems = [
    { 
      href: "/shop", 
      label: "Shop", 
      icon: ShoppingBag,
      badge: null
    },
    { 
      href: "/wishlist", 
      label: "Wishlist", 
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null
    },
    { 
      href: "/cart", 
      label: "Cart", 
      icon: ShoppingCart,
      badge: totalItems > 0 ? totalItems : null
    },
    { 
      href: "/account", 
      label: "Account", 
      icon: User,
      badge: null
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${
                active ? "text-[#b59a5c]" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon 
                  size={22} 
                  strokeWidth={active ? 2.5 : 2}
                />
                {item.badge !== null && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#b59a5c] text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? "text-[#b59a5c]" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default dynamic(() => Promise.resolve(MobileBottomNavInner), { ssr: false });
