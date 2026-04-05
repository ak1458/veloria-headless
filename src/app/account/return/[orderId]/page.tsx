export const dynamic = "force-dynamic";

interface ReturnPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function ReturnPage({ params }: ReturnPageProps) {
  const { orderId } = await params;

  return (
    <div className="min-h-screen bg-[#fbfaf7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-serif mb-4">Request a Return</h1>
        <p className="text-gray-600 mb-8">Processing return request for order: {orderId}</p>
        <p className="text-sm text-gray-500 italic">This feature is temporarily under maintenance. Please contact support at care@veloriavault.com to initiate a return.</p>
      </div>
    </div>
  );
}
