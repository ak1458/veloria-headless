import Link from "next/link";
import { getPageBySlug } from "@/lib/wordpress";
import DOMPurify from "isomorphic-dompurify";

interface StaticPageProps {
  slug: string;
  title?: string;
}

export default async function StaticPage({ slug, title }: StaticPageProps) {
  let page = null;
  let error = null;
  
  try {
    page = await getPageBySlug(slug);
  } catch (e) {
    error = e;
    console.error(`Error fetching page ${slug}:`, e);
  }

  // If no page found, show a fallback with the title
  if (!page) {
    return (
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-[#1a1a1a] py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-white">
              {title || "Page"}
            </h1>
          </div>
        </div>

        {/* Page Content - Fallback */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 mb-6">
              We&apos;re currently updating our {title?.toLowerCase() || "policy page"}. 
              Please check back soon or contact our support team for assistance.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#b59a5c] transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-[#1a1a1a] py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-white">
            {title || page.title.rendered}
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div 
          className="prose prose-lg max-w-4xl mx-auto prose-headings:font-serif prose-a:text-[#b59a5c] hover:prose-a:text-[#a08a4f]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content.rendered) }}
        />
      </div>
    </div>
  );
}
