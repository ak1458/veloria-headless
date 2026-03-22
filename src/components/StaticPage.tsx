import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import DOMPurify from "isomorphic-dompurify";

interface StaticPageProps {
  slug: string;
  title?: string;
}

export default async function StaticPage({ slug, title }: StaticPageProps) {
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
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
