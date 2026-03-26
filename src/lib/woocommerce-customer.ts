import { WooCommerceCustomer, CustomerRegisterData } from "@/types/customer";

const WC_API_URL = process.env.WC_API_URL?.trim();
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY?.trim();
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET?.trim();

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
}

// Create a new customer in WooCommerce
export async function createWCCustomer(data: CustomerRegisterData): Promise<WooCommerceCustomer | null> {
  try {
    if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      throw new Error("Missing WooCommerce credentials");
    }

    const customerData = {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      username: data.email.split("@")[0] + Math.floor(Math.random() * 1000),
      billing: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.billing?.phone || "",
        address_1: data.billing?.address || "",
        city: data.billing?.city || "",
        postcode: data.billing?.postcode || "",
        country: "IN",
        state: "",
        company: "",
        address_2: "",
      },
      shipping: {
        first_name: data.firstName,
        last_name: data.lastName,
        address_1: data.billing?.address || "",
        city: data.billing?.city || "",
        postcode: data.billing?.postcode || "",
        country: "IN",
        state: "",
        company: "",
        address_2: "",
      },
    };

    const response = await fetch(`${WC_API_URL}/customers`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("WooCommerce customer creation error:", error);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error creating WooCommerce customer:", error);
    return null;
  }
}

// Get customer by email
export async function getCustomerByEmail(email: string): Promise<WooCommerceCustomer | null> {
  try {
    if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      throw new Error("Missing WooCommerce credentials");
    }

    const response = await fetch(
      `${WC_API_URL}/customers?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const customers = await response.json();
    return customers[0] || null;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

// Get customer by ID
export async function getCustomerById(id: number): Promise<WooCommerceCustomer | null> {
  try {
    if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      throw new Error("Missing WooCommerce credentials");
    }

    const response = await fetch(`${WC_API_URL}/customers/${id}`, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    return null;
  }
}

// Update customer
export async function updateCustomer(
  id: number, 
  data: Partial<WooCommerceCustomer>
): Promise<WooCommerceCustomer | null> {
  try {
    if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      throw new Error("Missing WooCommerce credentials");
    }

    const response = await fetch(`${WC_API_URL}/customers/${id}`, {
      method: "PUT",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error updating customer:", error);
    return null;
  }
}

// Get customer orders
export async function getCustomerOrders(customerId: number): Promise<unknown[]> {
  try {
    if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      throw new Error("Missing WooCommerce credentials");
    }

    const response = await fetch(
      `${WC_API_URL}/orders?customer=${customerId}&per_page=100`,
      {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return [];
  }
}

// Note: WooCommerce doesn't provide a direct login API with username/password
// We verify the customer exists and use JWT for session management
export async function verifyCustomerCredentials(
  email: string
): Promise<WooCommerceCustomer | null> {
  // In a real implementation, you might use a plugin like JWT Authentication for WP REST API
  // For now, we verify the customer exists in WooCommerce
  return getCustomerByEmail(email);
}
