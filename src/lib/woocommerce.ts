export interface WCImage {
  id: number;
  src: string;
  alt: string;
  name?: string;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image: WCImage | null;
}

export interface WCAttribute {
  id: number;
  name: string;
  slug: string;
  option: string;
  options?: string[];
  variation?: boolean;
  visible?: boolean;
}

export interface WCMetaData {
  id: number;
  key: string;
  value: unknown;
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  parent_id: number;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  image?: WCImage;         // WC REST API v3: singular image object (used by variations)
  images: WCImage[];        // WC REST API v3: image gallery array (used by parent products)
  categories: WCCategory[];
  average_rating: string;
  rating_count: number;
  stock_status: string;
  stock_quantity?: number | null;
  sku: string;
  related_ids: number[];
  attributes: WCAttribute[];
  variations: number[];
  menu_order: number;
  price_html?: string;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  meta_data: WCMetaData[];
}

export interface WCReview {
  id: number;
  date_created: string;
  date_created_gmt: string;
  product_id: number;
  status: string;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  reviewer_avatar_urls: {
    [key: string]: string;
  };
}

const WC_API_URL = process.env.WC_API_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
}

async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
): Promise<T> {
  if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(
      "Missing required WooCommerce environment variables. " +
      "Please check WC_API_URL, WC_CONSUMER_KEY, and WC_CONSUMER_SECRET"
    );
  }

  const url = new URL(`${WC_API_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  console.log(`[wcFetch] Fetching ${url.toString()} (Key length: ${CONSUMER_KEY?.length || 0})`);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      "User-Agent": "Veloria-Vault-NextJS",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`WooCommerce API error: ${response.status}`);
  }

  return response.json();
}

export async function getProducts(options: {
  per_page?: number;
  page?: number;
  category?: number;
  search?: string;
  slug?: string;
  orderby?: string;
  order?: string;
  include?: number[];
  type?: string;
} = {}): Promise<WCProduct[]> {
  const {
    per_page = 20,
    page = 1,
    orderby = "menu_order",
    order = "asc",
    include,
    ...rest
  } = options;

  const params: Record<string, string | number | boolean> = {
    per_page,
    page,
    orderby,
    order,
  };

  if (rest.category) params.category = rest.category;
  if (rest.search) params.search = rest.search;
  if (rest.slug) params.slug = rest.slug;
  if (rest.type) params.type = rest.type;
  if (include?.length) params.include = include.join(",");

  try {
    const products = await wcFetch<WCProduct[]>("/products", params);
    return products.sort((left, right) => {
      if (left.menu_order !== right.menu_order) {
        return left.menu_order - right.menu_order;
      }

      return left.name.localeCompare(right.name);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: number): Promise<WCProduct | null> {
  try {
    return await wcFetch<WCProduct>(`/products/${id}`);
  } catch (error) {
    console.error("Error fetching product by id:", error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  try {
    const products = await getProducts({ slug, per_page: 50 });
    const parent = products.find((product) => product.parent_id === 0 && product.type !== "variation");

    if (parent) {
      return parent;
    }

    const firstVariation = products.find((product) => product.parent_id > 0);
    if (firstVariation?.parent_id) {
      return getProductById(firstVariation.parent_id);
    }

    return null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function getProductVariations(productId: number): Promise<WCProduct[]> {
  try {
    const variations = await wcFetch<WCProduct[]>(`/products/${productId}/variations`, {
      per_page: 100,
      orderby: "menu_order",
      order: "asc",
    });

    // WC variations endpoint only returns a singular `image`, not the full `images[]` gallery.
    // Each variation also exists as a product with a full images array (multiple angles).
    // Fetch each variation as a product in parallel to get the complete gallery.
    const enriched = await Promise.all(
      variations.map(async (variation) => {
        try {
          const fullProduct = await wcFetch<WCProduct>(`/products/${variation.id}`);
          return {
            ...variation,
            images: fullProduct.images || [],
          };
        } catch {
          // If individual fetch fails, keep the variation as-is
          return variation;
        }
      })
    );

    return enriched;
  } catch (error) {
    console.error("Error fetching product variations:", error);
    return [];
  }
}

export async function getCategories(): Promise<WCCategory[]> {
  try {
    return await wcFetch<WCCategory[]>("/products/categories", {
      per_page: 100,
      hide_empty: true,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getProductReviews(params: {
  product?: number;
  per_page?: number;
  page?: number;
} = {}): Promise<WCReview[]> {
  try {
    const fetchParams: Record<string, string | number | boolean> = {
      per_page: params.per_page || 10,
      page: params.page || 1,
      status: "approved",
    };

    if (params.product) {
      fetchParams.product = params.product;
    }

    return await wcFetch<WCReview[]>("/products/reviews", fetchParams);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
}

export async function getVariationProducts(options: {
  categorySlug?: string;
  search?: string;
} = {}): Promise<WCProduct[]> {
  const products = await getProducts({
    per_page: 100,
    search: options.search,
    orderby: "menu_order",
    order: "asc",
  });

  // Create a map of parent_id to parent slug for linking
  const parentSlugMap = new Map<number, string>();
  products
    .filter((p) => p.parent_id === 0)
    .forEach((p) => parentSlugMap.set(p.id, p.slug));

  const variations = products
    .filter((product) => product.type === "variation")
    .filter((product) => {
      if (!options.categorySlug) {
        return true;
      }

      return product.categories.some((category) => category.slug === options.categorySlug);
    })
    .map((variation) => {
      // Ensure variation has proper permalink with parent slug
      const parentSlug = parentSlugMap.get(variation.parent_id);
      if (parentSlug && !variation.permalink.includes(parentSlug)) {
        // Build proper permalink if API doesn't provide it
        const colorAttr = variation.attributes.find((a) => a.slug === "pa_color");
        const colorValue = colorAttr ? encodeURIComponent(colorAttr.option.toLowerCase().replace(/\s+/g, "-")) : "";
        variation.permalink = `https://veloriavault.com/product/${parentSlug}/${colorValue ? `?attribute_pa_color=${colorValue}` : ""}`;
      }
      return variation;
    });

  return variations;
}

export async function getParentProducts(options: {
  per_page?: number;
  categorySlug?: string;
  search?: string;
} = {}): Promise<WCProduct[]> {
  try {
    // Fetch all products then filter for parent products (not variations)
    const products = await getProducts({
      per_page: options.per_page ?? 100,
      search: options.search,
      orderby: "menu_order",
      order: "asc",
    });

    // Filter to only include parent products (not variations)
    // Parent products have parent_id === 0
    let parentProducts = products.filter((product) => product.parent_id === 0);

    // Filter by category if provided
    if (options.categorySlug) {
      parentProducts = parentProducts.filter((product) =>
        product.categories.some((category) => category.slug === options.categorySlug)
      );
    }

    return parentProducts;
  } catch (error) {
    console.error("Error fetching parent products:", error);
    return [];
  }
}

export async function getProductsByIds(ids: number[]): Promise<WCProduct[]> {
  if (!ids.length) {
    return [];
  }

  const products = await getProducts({ include: ids, per_page: ids.length });

  return ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is WCProduct => Boolean(product));
}

export async function getRelatedProducts(product: WCProduct): Promise<WCProduct[]> {
  const variationProducts = await getVariationProducts();

  return variationProducts
    .filter((candidate) => candidate.parent_id !== product.id && candidate.id !== product.id)
    .filter((candidate) =>
      candidate.categories.some((category) =>
        product.categories.some((productCategory) => productCategory.id === category.id),
      ),
    )
    .slice(0, 4);
}

function fallbackSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getVariationQueryValue(
  product: Pick<WCProduct, "permalink" | "attributes">,
  attributeSlug = "pa_color",
): string | null {
  if (product.permalink) {
    try {
      const url = new URL(product.permalink);
      return url.searchParams.get(`attribute_${attributeSlug}`);
    } catch {
      return null;
    }
  }

  const attribute = product.attributes.find((item) => item.slug === attributeSlug);
  return attribute?.option ? fallbackSlug(attribute.option) : null;
}

export function getRelativeProductLink(product: WCProduct, parentSlug?: string): string {
  if (product.permalink) {
    try {
      const url = new URL(product.permalink);
      // Extract pathname and search for relative URL
      return `${url.pathname}${url.search}`;
    } catch {
      // Ignore invalid URL and use the fallback below.
    }
  }

  // For variations, we need the parent slug
  // Try to extract parent slug from permalink or use provided one
  let slug = parentSlug ?? product.slug;
  
  // If this is a variation and we have a permalink, try to extract parent slug
  if (product.parent_id > 0 && product.permalink) {
    try {
      const url = new URL(product.permalink);
      const pathParts = url.pathname.split("/").filter(Boolean);
      // WooCommerce permalinks are like /product/parent-product-slug/
      const productIndex = pathParts.indexOf("product");
      if (productIndex >= 0 && pathParts[productIndex + 1]) {
        slug = pathParts[productIndex + 1];
      }
    } catch {
      // Use fallback slug
    }
  }
  
  const colorValue = getVariationQueryValue(product);
  return colorValue ? `/product/${slug}?attribute_pa_color=${colorValue}` : `/product/${slug}`;
}

export interface WCCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  description: string;
  date_expires: string | null;
  usage_limit: number | null;
  usage_count: number;
  minimum_amount: string;
  maximum_amount: string;
  product_ids: number[];
  excluded_product_ids: number[];
  customer_emails: string[];
}

export async function getCouponByCode(code: string): Promise<WCCoupon | null> {
  try {
    const coupons = await wcFetch<WCCoupon[]>("/coupons", { code });
    return coupons.length > 0 ? coupons[0] : null;
  } catch (error) {
    console.error("Error fetching coupon by code:", error);
    return null;
  }
}

