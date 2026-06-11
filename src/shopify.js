import Client from 'shopify-buy';

const domain = import.meta.env.VITE_SHOPIFY_DOMAIN;
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const shopifyClient = Client.buildClient({
  domain: domain,
  storefrontAccessToken: storefrontAccessToken,
  apiVersion: '2024-01'
});

// Helper function to fetch all products
export const fetchAllProducts = async () => {
  try {
    const products = await shopifyClient.product.fetchAll(250);
    return products;
  } catch (error) {
    console.error("Error fetching products from Shopify:", error);
    return [];
  }
};

// Helper function to fetch products by a specific tag (e.g., 'Player Version' or 'Club Jersey')
// Supports comma-separated tags (e.g. 'Argentina,Player Version')
export const fetchProductsByTag = async (tag) => {
  try {
    const tags = tag.split(',').map(t => t.trim());
    const query = tags.map(t => `tag:"${t}"`).join(' AND ');
    const products = await shopifyClient.product.fetchQuery({ first: 250, query });
    return products;
  } catch (error) {
    console.error(`Error fetching products with tag ${tag}:`, error);
    return [];
  }
};

// Helper function to fetch a single product by ID
export const fetchProductById = async (id) => {
  try {
    const product = await shopifyClient.product.fetch(id);
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
};
