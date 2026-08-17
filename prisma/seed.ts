import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching catalog from Tomson Electronics...');
  
  // Shopify products.json API returns up to 250 products if limit=250 is specified
  // We'll fetch 100 products initially to seed the DB
  const response = await fetch('https://www.tomsonelectronics.com/products.json?limit=100');
  const data = await response.json();
  
  const products = data.products || [];
  console.log(`Found ${products.length} products. Seeding database...`);

  for (const p of products) {
    const priceStr = p.variants?.[0]?.price || "0";
    const compareAtPriceStr = p.variants?.[0]?.compare_at_price;
    const price = parseFloat(priceStr);
    const compareAtPrice = compareAtPriceStr ? parseFloat(compareAtPriceStr) : null;
    const sku = p.variants?.[0]?.sku || "";
    const image = p.images?.[0]?.src || "";
    const tags = p.tags ? p.tags.join(', ') : "";

    await prisma.product.upsert({
      where: { shopifyId: p.id.toString() },
      update: {},
      create: {
        shopifyId: p.id.toString(),
        title: p.title,
        handle: p.handle,
        descriptionHtml: p.body_html || "",
        vendor: p.vendor || "",
        productType: p.product_type || "",
        tags: tags,
        price: price,
        compareAtPrice: compareAtPrice,
        sku: sku || null,
        image: image,
        stockQuantity: 50,
        lowStockThreshold: 5,
        isActive: true,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
