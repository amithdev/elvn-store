import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: '3mfpn0-ud.myshopify.com',
  storefrontAccessToken: 'd95dc718fcec116e936f3606e9f8b92b',
  apiVersion: '2024-01'
});

async function test() {
  try {
    const products = await client.product.fetchAll();
    console.log(`Found ${products.length} products`);
    if (products.length > 0) {
      console.log(products[0].title);
    }
  } catch (e) {
    console.error(e);
  }
}

test();
