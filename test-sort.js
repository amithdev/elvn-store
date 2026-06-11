import Client from 'shopify-buy';

const shopifyClient = Client.buildClient({
  domain: '3mfpn0-ud.myshopify.com',
  storefrontAccessToken: '98d5a15b3c37517c5bba8f4c1d283af3',
  apiVersion: '2024-01'
});

shopifyClient.product.fetchAll(10).then(products => {
  products.forEach(p => {
    console.log(`${p.title}: ${p.variants[0]?.price?.amount}`);
  });
}).catch(console.error);
