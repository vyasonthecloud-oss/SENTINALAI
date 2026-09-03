import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { getAuthenticatedAdmin, getAuthenticatedUser } from '@/lib/auth';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';
import { ProductImageManager } from '@/components/admin/ProductImageManager';
import { AdminNav } from '@/components/AdminNav';
import { AdminAccessRequired } from '@/components/AdminAccessRequired';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Product | Sentinel AI Admin',
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    const user = await getAuthenticatedUser();
    return <AdminAccessRequired currentEmail={user?.email} />;
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  let initialImages: string[] = [];
  try {
    initialImages = product.images ? JSON.parse(product.images) : [];
  } catch {
    initialImages = [];
  }

  async function updateProduct(formData: FormData) {
    'use server';
    const serverAdmin = await getAuthenticatedAdmin();
    if (!serverAdmin) {
      redirect('/login?redirect=/admin');
    }

    const title = (formData.get('title') as string) || '';
    const rawPrice = formData.get('price') as string;
    const parsedPrice = parseFloat(rawPrice);
    const image = (formData.get('image') as string) || '';
    const images = (formData.get('images') as string) || '[]';
    const descriptionHtml = (formData.get('descriptionHtml') as string) || '';
    const vendor = (formData.get('vendor') as string) || '';
    const productType = (formData.get('productType') as string) || '';
    const sku = (formData.get('sku') as string) || '';
    const stockQuantity = parseInt((formData.get('stockQuantity') as string) || '0', 10);
    const lowStockThreshold = parseInt((formData.get('lowStockThreshold') as string) || '5', 10);
    const isActive = formData.get('isActive') === 'on';

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      redirect('/admin');
    }

    const finalPrice = isNaN(parsedPrice) ? existing.price : parsedPrice;
    const finalTitle = title.trim() || existing.title;

    await prisma.product.update({
      where: { id },
      data: {
        title: finalTitle,
        price: finalPrice,
        image: image || existing.image,
        images: images || existing.images,
        descriptionHtml: descriptionHtml,
        vendor: vendor || existing.vendor,
        productType: productType || existing.productType,
        sku: sku || existing.sku,
        stockQuantity: isNaN(stockQuantity) ? 0 : stockQuantity,
        lowStockThreshold: isNaN(lowStockThreshold) ? 5 : lowStockThreshold,
        isActive,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/product/${id}`);
    revalidatePath('/collections/all');
    redirect('/admin');
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto font-sans min-h-screen">
      <AdminNav />

      <Link href="/admin" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary mb-4 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Products List
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground font-heading">Edit Product</h1>

      <form action={updateProduct} className="space-y-6 bg-card text-card-foreground p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Title *</label>
          <input
            type="text"
            name="title"
            defaultValue={product.title}
            required
            className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              defaultValue={product.price}
              required
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              defaultValue={product.sku || ''}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              defaultValue={product.stockQuantity}
              min={0}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Low Stock Alert Threshold</label>
            <input
              type="number"
              name="lowStockThreshold"
              defaultValue={product.lowStockThreshold}
              min={0}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/40">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            defaultChecked={product.isActive}
            className="w-4 h-4 accent-primary rounded"
          />
          <label htmlFor="isActive" className="text-xs font-semibold text-foreground cursor-pointer">
            Publish Product Active in Store Catalog
          </label>
        </div>

        {/* Multi-Image Manager */}
        <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
          <ProductImageManager
            initialImage={product.image || ''}
            initialImages={initialImages}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Vendor</label>
            <input
              type="text"
              name="vendor"
              defaultValue={product.vendor}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Product Type / Category</label>
            <input
              type="text"
              name="productType"
              defaultValue={product.productType}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Description (HTML or text)</label>
          <textarea
            name="descriptionHtml"
            defaultValue={product.descriptionHtml}
            rows={6}
            className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
          ></textarea>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] text-sm uppercase tracking-wider cursor-pointer"
          >
            Save Changes
          </button>
          <Link
            href="/admin"
            className="px-6 py-3.5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl font-bold transition flex items-center justify-center text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
