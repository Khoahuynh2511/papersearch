import dynamic from 'next/dynamic';

// Lazy load BulkGeneration component với SSR enabled
const DynamicBulkGeneration = dynamic(() => import('@/components/BulkGeneration'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  ),
  // ssr: false, // ✅ Bỏ dòng này để enable SSR
});

export default function BulkPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DynamicBulkGeneration />
      </div>
    </div>
  );
} 