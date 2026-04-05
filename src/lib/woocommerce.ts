import { LEGACY_SITE_URL } from "@/lib/site";

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

/**
 * Rewrite media URLs to be relative so they are proxied through our Next.js server.
 * This avoids SSL/DNS issues by keeping all requests on the main domain.
 * The absolute path will be caught by the next.config.ts rewrites rule.
 */
function rewriteMediaUrl(url: string | undefined | null): string {
  if (!url) return "";
  // Strip all known WordPress domains and make URLs relative.
  // The relative /wp-content/... paths are caught by next.config.ts rewrites
  // which proxy them through our /api/media/* handler.
  return url
    .replace(/^https?:\/\/(?:www\.)?(?:wp\.)?veloriavault\.com/i, "")
    .replace(/^http:\/\/145\.79\.212\.69/i, "");
}

function logToFile(_msg: string) {
  // Silent fallback for client usage
  void _msg;
}

interface WCFetchOptions {
  revalidate?: number | false;
  cacheBustVersion?: string | false;
}

interface LegacyVariationGalleryItem {
  href?: string;
  data_src?: string;
  data_thumb?: string;
  data_large_image?: string;
  image?: string;
}

type LegacyVariationGalleryMap = Record<string, LegacyVariationGalleryItem[]>;

export async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  options: WCFetchOptions = {},
): Promise<T> {
  if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    console.warn("MISSING WC CREDENTIALS — Build-time skip or misconfiguration.");
    // Return safe fallback for build-time safety
    if (endpoint.includes("/products")) return [] as unknown as T;
    return {} as unknown as T;
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

  try {
    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      ...(options.revalidate === false
        ? { cache: "no-store" as const }
        : {
            next: {
              revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
            },
          }),
    });

    if (!response.ok) {
      const errorMsg = `WooCommerce API error: ${response.status}`;
      logToFile(errorMsg);
      // During build, return an empty version of the response instead of throwing
      if (finalUrl.includes("/products")) {
        return [] as unknown as T;
      }
      return {} as unknown as T;
    }

    const data = await response.json();
    logToFile(
      `[wcFetch] SUCCESS: Received ${Array.isArray(data) ? data.length : "object"} items.`
    );

    // Rewrite all media URLs in the response so images load from wp.veloriavault.com
    return rewriteAllMediaUrls(data) as T;
  } catch (error) {
    console.error("[wcFetch] Error:", error);
    // Return safe fallback to prevent build failure
    if (finalUrl.includes("/products")) {
      return [] as unknown as T;
    }
    return {} as unknown as T;
  }
}

/**
 * Recursively rewrite all image/media URLs in API response data.
 * This ensures every image from WooCommerce points to wp.veloriavault.com
 * instead of veloriavault.com (which now serves Next.js, not WordPress).
 */
function rewriteAllMediaUrls(data: unknown): unknown {
  if (typeof data === "string") {
    return rewriteMediaUrl(data);
  }
  if (Array.isArray(data)) {
    return data.map(rewriteAllMediaUrls);
  }
  if (data && typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      // Only rewrite string values for URL-like keys to avoid corrupting other data
      if (typeof value === "string" && (key === "src" || key === "href" || key === "data_src" || key === "data_thumb" || key === "data_large_image" || key === "image")) {
        result[key] = rewriteMediaUrl(value);
      } else if (typeof value === "object" || Array.isArray(value)) {
        result[key] = rewriteAllMediaUrls(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
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
      src: rewriteMediaUrl(image.src),
      alt: image.alt ?? "",
      name: image.name,
    }));

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

const PRODUCT_SLUG_STOP_WORDS = new Set([
  "bag",
  "bags",
  "tote",
  "satchel",
  "sling",
  "wallet",
  "clutch",
  "crossbody",
  "hobo",
  "shoulder",
]);

function extractHtmlAttribute(
  markup: string | undefined,
  attribute: string,
): string | null {
  if (!markup) {
    return null;
  }

  const match = markup.match(new RegExp(`${attribute}="([^"]*)"`, "i"));
  return match?.[1] || null;
}

function extractSerializedJson(
  html: string,
  variableName: string,
): string | null {
  const marker = `var ${variableName} =`;
  const markerIndex = html.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  let startIndex = markerIndex + marker.length;
  while (/\s/.test(html[startIndex] ?? "")) {
    startIndex += 1;
  }

  const openingChar = html[startIndex];
  const closingChar =
    openingChar === "{"
      ? "}"
      : openingChar === "["
        ? "]"
        : null;

  if (!closingChar) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < html.length; index += 1) {
    const char = html[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === openingChar) {
      depth += 1;
      continue;
    }

    if (char === closingChar) {
      depth -= 1;

      if (depth === 0) {
        return html.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function extractProductSlugFromPermalink(permalink?: string | null): string | null {
  if (!permalink) {
    return null;
  }

  try {
    const url = new URL(permalink, LEGACY_SITE_URL);
    const pathParts = url.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => part.toLowerCase());
    const productIndex = pathParts.indexOf("product");
    const slug = pathParts[productIndex + 1];

    return slug ? fallbackSlug(slug) : null;
  } catch {
    return null;
  }
}

async function getLegacyVariationGalleryMap(
  productPermalink?: string,
): Promise<LegacyVariationGalleryMap> {
  if (!productPermalink) {
    return {};
  }

  try {
    const legacyUrl = new URL(productPermalink, LEGACY_SITE_URL);
    const response = await fetch(legacyUrl.toString(), {
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`Legacy product page error: ${response.status}`);
    }

    const html = await response.text();
    const serialized = extractSerializedJson(
      html,
      "woodmart_variation_gallery_data",
    );

    if (!serialized) {
      return {};
    }

    const parsed = JSON.parse(serialized) as LegacyVariationGalleryMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Error fetching legacy variation gallery:", error);
    return {};
  }
}

function buildVariationImagesFromLegacyGallery(
  variation: WCProduct,
  galleryItems: LegacyVariationGalleryItem[] | undefined,
): WCImage[] {
  const featuredImage = variation.image
    ? {
        id: variation.image.id,
        src: rewriteMediaUrl(variation.image.src),
        alt: variation.image.alt ?? variation.name ?? "",
        name: variation.image.name,
      }
    : null;

  const parsedImages = (galleryItems ?? [])
    .map((item, index) => {
      const src =
        item.href ||
        item.data_large_image ||
        item.data_src ||
        extractHtmlAttribute(item.image, "data-large_image") ||
        extractHtmlAttribute(item.image, "src") ||
        item.data_thumb;

      if (!src) {
        return null;
      }

      return {
        id:
          featuredImage?.src === src
            ? featuredImage.id
            : variation.id * 100 + index + 1,
        src: rewriteMediaUrl(src),
        alt:
          extractHtmlAttribute(item.image, "alt") ||
          extractHtmlAttribute(item.image, "title") ||
          variation.name ||
          "",
      };
    })
    .filter((image): image is WCImage => Boolean(image));

  const images = [];
  const seen = new Set<string>();

  for (const image of parsedImages) {
    if (seen.has(image.src)) {
      continue;
    }

    seen.add(image.src);
    images.push(image);
  }

  if (featuredImage && !seen.has(featuredImage.src)) {
    images.unshift(featuredImage);
  }

  if (images.length) {
    return images;
  }

  if (variation.images?.length) {
    return variation.images;
  }

  return featuredImage ? [featuredImage] : [];
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

function fallbackSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  try {
    const normalizedSlug = fallbackSlug(slug);

    const hydrateMatchedProduct = async (
      matchedProduct: WCProduct | null,
    ): Promise<WCProduct | null> => {
      if (!matchedProduct) {
        return null;
      }

      if (matchedProduct.parent_id > 0) {
        return getProductById(matchedProduct.parent_id);
      }

      return matchedProduct;
    };

    const buildSlugAliases = (value: string): string[] => {
      const normalizedValue = fallbackSlug(value);
      const aliases = new Set<string>([normalizedValue]);
      const trimmedTokens = normalizedValue
        .split("-")
        .filter(Boolean)
        .filter((token) => !PRODUCT_SLUG_STOP_WORDS.has(token));

      if (trimmedTokens.length) {
        aliases.add(trimmedTokens.join("-"));
      }

      return Array.from(aliases).filter(Boolean);
    };

    const findMatchedProduct = (
      products: WCProduct[],
      requestedSlug: string,
    ): WCProduct | null => {
      const aliases = new Set(buildSlugAliases(requestedSlug));
      const exactMatchers = [
        (product: WCProduct) => {
          const permalinkSlug = extractProductSlugFromPermalink(product.permalink);
          return permalinkSlug ? aliases.has(permalinkSlug) : false;
        },
        (product: WCProduct) => aliases.has(fallbackSlug(product.slug)),
        (product: WCProduct) => aliases.has(fallbackSlug(product.name)),
      ];

      for (const matcher of exactMatchers) {
        const parentMatch =
          products.find(
            (product) => product.parent_id === 0 && product.type !== "variation" && matcher(product),
          ) ?? null;

        if (parentMatch) {
          return parentMatch;
        }

        const anyMatch = products.find((product) => matcher(product)) ?? null;
        if (anyMatch) {
          return anyMatch;
        }
      }

      return null;
    };

    const products = await getProducts({ slug: normalizedSlug, per_page: 10 });
    const directMatch = await hydrateMatchedProduct(
      findMatchedProduct(products, normalizedSlug),
    );

    if (directMatch) {
      return directMatch;
    }

    const searchTerms = Array.from(
      new Set(
        buildSlugAliases(normalizedSlug).flatMap((value) => [
          value,
          value.replace(/-/g, " "),
        ]),
      ),
    );

    for (const searchTerm of searchTerms) {
      const searchMatches = await getProducts({
        search: searchTerm,
        per_page: 40,
      });
      const matchedProduct = await hydrateMatchedProduct(
        findMatchedProduct(searchMatches, normalizedSlug),
      );

      if (matchedProduct) {
        return matchedProduct;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function getProductVariations(
  productId: number,
  productPermalink?: string,
): Promise<WCProduct[]> {
  try {
    const [variations, legacyVariationGalleryMap] = await Promise.all([
      wcFetch<WCProduct[]>(`/products/${productId}/variations`, {
        per_page: 100,
        orderby: "menu_order",
        order: "asc",
      }),
      getLegacyVariationGalleryMap(productPermalink),
    ]);

    return variations.map((variation) => ({
      ...variation,
      images: buildVariationImagesFromLegacyGallery(
        variation,
        legacyVariationGalleryMap[String(variation.id)],
      ),
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
    .filter((product): product is WCProduct => Boolean(product))
    .map((product) => toCatalogProduct(product));
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
  const slug =
    extractProductSlugFromPermalink(product.permalink) ??
    parentSlug ??
    product.slug;
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
