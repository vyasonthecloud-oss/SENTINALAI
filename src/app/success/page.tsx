import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="font-sans max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Thank you for your purchase. Your order has been placed and is being processed. 
        (This is a simulated confirmation screen for Sentinel AI).
      </p>
      <Link href="/" className="bg-[#1d88e4] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition shadow">
        Continue Shopping
      </Link>
    </div>
  );
}
