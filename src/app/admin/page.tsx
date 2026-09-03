import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin, getAuthenticatedUser } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { revalidatePath } from 'next/cache';
import { AdminNav } from '@/components/AdminNav';
import { AdminAccessRequired } from '@/components/AdminAccessRequired';
import { Trash2, Edit } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Products Management | Sentinel AI',
  description: 'Manage hardware catalog, inventory stock levels, and product availability.',
};

export default async function AdminPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    const user = await getAuthenticatedUser();
    return <AdminAccessRequired currentEmail={user?.email} />;
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  async function deleteProduct(formData: FormData) {
    'use server';
    const serverAdmin = await getAuthenticatedAdmin();
    if (!serverAdmin) return;

    const id = formData.get('id') as string;
    if (id) {
      await prisma.product.delete({ where: { id } });
      revalidatePath('/admin');
      revalidatePath('/');
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans min-h-screen">
      <AdminNav />

      <div className="bg-card text-card-foreground rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold">Image</th>
                <th className="px-6 py-3.5 text-left font-semibold">Title & SKU</th>
                <th className="px-6 py-3.5 text-left font-semibold">Price</th>
                <th className="px-6 py-3.5 text-left font-semibold">Stock</th>
                <th className="px-6 py-3.5 text-left font-semibold">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {products.map((product) => {
                return (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image ? (
                        <div className="relative h-12 w-12 bg-background rounded-xl border border-border/60 overflow-hidden">
                          <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-muted/40 rounded-xl border border-border/40 flex items-center justify-center text-muted-foreground text-xs">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-foreground line-clamp-1">{product.title}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{product.sku || 'No SKU'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold font-mono text-foreground">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      {product.stockQuantity <= 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          Out of Stock (0)
                        </span>
                      ) : product.stockQuantity <= product.lowStockThreshold ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Low Stock ({product.stockQuantity})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          In Stock ({product.stockQuantity})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        product.isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                      <Link
                        href={`/admin/edit/${product.id}`}
                        className="inline-flex items-center gap-1 bg-card hover:bg-muted border border-border text-foreground hover:text-primary px-3 py-1.5 rounded-xl transition-colors font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <form action={deleteProduct} className="inline-block">
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 px-3 py-1.5 rounded-xl transition-colors font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
