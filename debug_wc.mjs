import fs from 'fs';

// Manually parse .env.local to avoid dependency issues
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1].trim()] = value;
  }
});

const WC_API_URL = env.WC_API_URL;
const CONSUMER_KEY = env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = env.WC_CONSUMER_SECRET;

const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

async function testOrder() {
  console.log("Testing WooCommerce Order Creation...");
  console.log("URL:", `${WC_API_URL}/orders`);
  
  const orderData = {
    payment_method: "cod",
    payment_method_title: "Cash on Delivery",
    billing: {
      first_name: "Test",
      last_name: "User",
      address_1: "123 Test St",
      city: "Delhi",
      postcode: "110001",
      country: "IN",
      email: "test@example.com",
      phone: "9876543210"
    },
    line_items: [
      {
        product_id: 1104, // This ID must be valid or the API will returning 400/500
        quantity: 1
      }
    ]
  };

  try {
    const response = await fetch(`${WC_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const status = response.status;
    const data = await response.json();

    console.log("Status:", status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

testOrder();
