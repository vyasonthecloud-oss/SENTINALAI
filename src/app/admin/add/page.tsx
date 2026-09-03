import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
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
  title: 'Add Product | Sentinel AI Admin',
};

export default async function AddProductPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    const user = await getAuthenticatedUser();
    return <AdminAccessRequired currentEmail={user?.email} />;
  }

  async function addProduct(formData: FormData) {
    'use server';
    const serverAdmin = await getAuthenticatedAdmin();
    if (!serverAdmin) return;

    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const sku = (formData.get('sku') as string) || '';
    const image = (formData.get('image') as string) || '';
    const images = (formData.get('images') as string) || '[]';
    const descriptionHtml = formData.get('descriptionHtml') as string;
    const stockQuantity = parseInt((formData.get('stockQuantity') as string) || '0', 10);
    const lowStockThreshold = parseInt((formData.get('lowStockThreshold') as string) || '5', 10);
    const isActive = formData.get('isActive') === 'on';
    
    // Auto-generate basic fields for a custom product
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const shopifyId = 'custom-' + Date.now();

    if (title && !isNaN(price)) {
      await prisma.product.create({
        data: {
          title,
          price,
          sku: sku || null,
          image: image || '',
          images: images,
          descriptionHtml: descriptionHtml || '',
          handle,
          shopifyId,
          vendor: 'Sentinel AI',
          productType: 'Custom',
          tags: '',
          stockQuantity: isNaN(stockQuantity) ? 0 : stockQuantity,
          lowStockThreshold: isNaN(lowStockThreshold) ? 5 : lowStockThreshold,
          isActive,
        }
      });
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath('/collections/all');
      redirect('/admin');
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto font-sans min-h-screen">
      <AdminNav />

      <Link href="/admin" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary mb-4 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Products List
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground font-heading">Add New Product</h1>

      <form action={addProduct} className="space-y-6 bg-card text-card-foreground p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Title *</label>
          <input
            type="text"
            name="title"
            required
            className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            placeholder="e.g. Raspberry Pi 5 8GB"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              required
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
              placeholder="e.g. 7499"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
              placeholder="e.g. RPI5-8GB-01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Initial Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              defaultValue={50}
              min={0}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Low Stock Alert Threshold</label>
            <input
              type="number"
              name="lowStockThreshold"
              defaultValue={5}
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
            defaultChecked
            className="w-4 h-4 accent-primary rounded"
          />
          <label htmlFor="isActive" className="text-xs font-semibold text-foreground cursor-pointer">
            Publish Product Active in Store Catalog
          </label>
        </div>

        {/* Multi-Image Upload & Preview Manager */}
        <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
          <ProductImageManager />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Description (HTML or plain text)</label>
          <textarea
            name="descriptionHtml"
            rows={4}
            className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-foreground transition"
            placeholder="Detailed component specifications and features..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-2 text-sm uppercase tracking-wider"
        >
          Create & Save Product
        </button>
      </form>
    </div>
  );
}
