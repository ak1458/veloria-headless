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

const WC_API_URL = process.env.WC_API_URL?.trim();
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY?.trim();
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET?.trim();
const DEFAULT_REVALIDATE_SECONDS = 300;

function logToFile(_msg: string) {
  // Silent fallback for client usage
}

interface WCFetchOptions {
  revalidate?: number | false;
  cacheBustVersion?: string | false;
}

export async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  options: WCFetchOptions = {},
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

  // Remove newlines and use standard Basic Auth header
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

  const cacheBustVersion = options.cacheBustVersion ?? "3";
  if (cacheBustVersion) {
    url.searchParams.append("v", cacheBustVersion);
  }

  const finalUrl = url.toString();
  if (process.env.NODE_ENV !== "production") {
    console.log(`[wcFetch] FETCHING: ${finalUrl}`);
  }

  const response = await fetch(finalUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Basic ${auth}`,
      "Accept": "application/json",
    },
    ...(options.revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS } }),
  });

  if (!response.ok) {
    const errorMsg = `WooCommerce API error: ${response.status}`;
    logToFile(errorMsg);
    throw new Error(errorMsg);
  }

  const data = await response.json();
  logToFile(`[wcFetch] SUCCESS: Received ${Array.isArray(data) ? data.length : "object"} items.`);
  return data;
}

const CATALOG_PRODUCT_FIELDS = [
  "id",
  "name",
  "slug",
  "permalink",
  "type",
  "parent_id",
  "price",
  "regular_price",
  "sale_price",
  "on_sale",
  "images",
  "categories",
  "attributes",
  "menu_order",
  "stock_status",
  "stock_quantity",
];

function toCatalogProduct(product: Partial<WCProduct>): WCProduct {
  const images = (product.images ?? [])
    .map((image) => ({
      id: image.id,
      src: image.src,
      alt: image.alt ?? "",
      name: image.name,
    }))
    .slice(0, 1);

  return {
    id: product.id ?? 0,
    name: product.name ?? "",
    slug: product.slug ?? "",
    permalink: product.permalink ?? "",
    type: product.type ?? "variation",
    parent_id: product.parent_id ?? 0,
    description: "",
    short_description: "",
    price: product.price ?? "",
    regular_price: product.regular_price ?? "",
    sale_price: product.sale_price ?? "",
    on_sale: product.on_sale ?? false,
    image: images[0],
    images,
    categories: (product.categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      count: category.count ?? 0,
      image: category.image ?? null,
    })),
    average_rating: "0",
    rating_count: 0,
    stock_status: product.stock_status ?? "instock",
    stock_quantity: product.stock_quantity ?? null,
    sku: "",
    related_ids: [],
    attributes: (product.attributes ?? []).map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      option: attribute.option,
      options: attribute.options,
      variation: attribute.variation,
      visible: attribute.visible,
    })),
    variations: [],
    menu_order: product.menu_order ?? 0,
    meta_data: [],
  };
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
  fields?: string[];
} = {}): Promise<WCProduct[]> {
  const {
    per_page = 20,
    page = 1,
    orderby = "menu_order",
    order = "asc",
    include,
    fields,
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
  if (fields?.length) params._fields = fields.join(",");

  const products = await wcFetch<WCProduct[]>("/products", params);
  return products.sort((left, right) => {
    if (left.menu_order !== right.menu_order) {
      return left.menu_order - right.menu_order;
    }

    return (left.name ?? "").localeCompare(right.name ?? "");
  });
}

function dedupeParentIds(products: Array<Pick<WCProduct, "parent_id">>): number[] {
  return Array.from(
    new Set(
      products
        .map((product) => product.parent_id)
        .filter((parentId): parentId is number => parentId > 0),
    ),
  );
}

async function getParentProductsFromVariations(search?: string): Promise<WCProduct[]> {
  const variations = await getProducts({
    per_page: 100,
    search,
    fields: ["id", "parent_id"],
  });
  const parentIds = dedupeParentIds(variations);

  if (!parentIds.length) {
    return [];
  }

  return getProducts({
    include: parentIds,
    per_page: parentIds.length,
    orderby: "menu_order",
    order: "asc",
  });
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
    const products = await getProducts({ slug, per_page: 10 });
    
    // 1. Try to find the parent product first
    const parent = products.find((p) => p.parent_id === 0 && p.type !== "variation");
    if (parent) return parent;

    // 2. If not found, check if the slug matched a variation and get its parent
    const variation = products.find((p) => p.parent_id > 0);
    if (variation?.parent_id) {
      return await getProductById(variation.parent_id);
    }

    // 3. Last resort: try exact slug match if API filtering was fuzzy
    const exactMatch = products.find(p => p.slug === slug);
    if (exactMatch) return exactMatch;

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

    // Keep variations as-is to avoid N+1 request timeouts on Vercel
    return variations.map(v => ({
      ...v,
      // Ensure images array exists even if it only contains the variation's featured image
      images: v.images?.length ? v.images : (v.image ? [v.image] : [])
    }));
  } catch (error) {
    console.error("Error fetching product variations:", error);
    return [];
  }
}

export async function getCategories(): Promise<WCCategory[]> {
  return wcFetch<WCCategory[]>("/products/categories", {
    per_page: 100,
    hide_empty: true,
    _fields: "id,name,slug,description,count,image",
  });
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
  let products = await getProducts({
    per_page: 100,
    search: options.search,
    fields: CATALOG_PRODUCT_FIELDS,
  });

  if (!products.length) {
    return [];
  }

  if (options.categorySlug) {
    products = products.filter((product) =>
      product.categories?.some((category) => category.slug === options.categorySlug),
    );
  }

  return products.map((product) => toCatalogProduct(product));
}

export async function getParentProducts(options: {
  per_page?: number;
  categorySlug?: string;
  search?: string;
} = {}): Promise<WCProduct[]> {
  let parentProducts = await getProducts({
    per_page: options.per_page ?? 100,
    type: "variable",
    search: options.search,
    orderby: "menu_order",
    order: "asc",
  });

  parentProducts = parentProducts.filter((product) => product.parent_id === 0);

  if (!parentProducts.length) {
    parentProducts = await getParentProductsFromVariations(options.search);
  }

  if (options.categorySlug) {
    parentProducts = parentProducts.filter((product) =>
      product.categories.some((category) => category.slug === options.categorySlug)
    );
  }

  return parentProducts;
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

