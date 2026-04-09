"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { PRODUCT_PAGE_POLICY_LINKS } from "@/config/product-page";

interface AccordionSection {
  title: string;
  content: string;
}

const SECTION_MARKERS = [
  { pattern: /size\s*(?:and|&)\s*material/i, title: "Size and Material" },
  { pattern: /return\s*(?:and|&)\s*exchange/i, title: "Return & Exchange" },
  { pattern: /warranty/i, title: "Warranty Policy" },
  { pattern: /ethic(?:al(?:ly)?|s)\s*(?:made|production)?/i, title: "Ethical Production" },
  { pattern: /more\s*information/i, title: "More Information" },
];
const HIDDEN_SECTION_TITLES = new Set(["Warranty Policy"]);

function stripEmptyTags(html: string): string {
  return html
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "<br/>")
    .trim();
}

function linkifyPolicySections(html: string): string {
  let output = html;
  if (PRODUCT_PAGE_POLICY_LINKS.returnExchange) {
    output = output.replace(
      /(return\s*(?:and|&)\s*exchange\s*policy)/gi,
      `<a href="${PRODUCT_PAGE_POLICY_LINKS.returnExchange}" class="underline hover:text-[#b89a57]">$1</a>`,
    );
  }
  if (PRODUCT_PAGE_POLICY_LINKS.warranty) {
    output = output.replace(
      /(warranty\s*policy)/gi,
      `<a href="${PRODUCT_PAGE_POLICY_LINKS.warranty}" class="underline hover:text-[#b89a57]">$1</a>`,
    );
  }
  return output;
}

export function parseDescriptionSections(
  description: string,
): AccordionSection[] {
  if (!description?.trim()) {
    return [];
  }

  const cleaned = stripEmptyTags(description);
  const sections: AccordionSection[] = [];
  let remaining = cleaned;
  let descriptionContent = "";

  // Try to split by markers
  for (const marker of SECTION_MARKERS) {
    const match = remaining.match(marker.pattern);
    if (!match) continue;

    const splitIndex = remaining.indexOf(match[0]);
    if (splitIndex > 0 && !descriptionContent) {
      descriptionContent = remaining.substring(0, splitIndex);
    } else if (splitIndex > 0 && sections.length > 0) {
      sections[sections.length - 1].content = stripEmptyTags(
        remaining.substring(0, splitIndex),
      );
    }

    remaining = remaining.substring(splitIndex + match[0].length);

    // Find the next marker or end
    let nextSplitIndex = remaining.length;
    for (const nextMarker of SECTION_MARKERS) {
      const nextMatch = remaining.match(nextMarker.pattern);
      if (nextMatch) {
        const idx = remaining.indexOf(nextMatch[0]);
        if (idx > 0 && idx < nextSplitIndex) {
          nextSplitIndex = idx;
        }
      }
    }

    sections.push({
      title: marker.title,
      content: stripEmptyTags(remaining.substring(0, nextSplitIndex)),
    });

    remaining = remaining.substring(nextSplitIndex);
  }

  // First section is always "Description"
  const result: AccordionSection[] = [];
  const mainContent = descriptionContent || (sections.length === 0 ? cleaned : "");

  if (mainContent.trim()) {
    result.push({
      title: "Description",
      content: stripEmptyTags(mainContent),
    });
  }

  // Add parsed sections with policy links
  sections.forEach((section) => {
    if (section.content.trim() && !HIDDEN_SECTION_TITLES.has(section.title)) {
      result.push({
        ...section,
        content: linkifyPolicySections(section.content),
      });
    }
  });

  // If nothing was parsed, just wrap everything as description
  if (result.length === 0 && cleaned.trim()) {
    result.push({ title: "Description", content: cleaned });
  }

  return result;
}

interface ProductAccordionProps {
  description: string;
}

export default function ProductAccordion({
  description,
}: ProductAccordionProps) {
  const sections = parseDescriptionSections(description);
  const [openIndex, setOpenIndex] = useState<number | null>(
    sections.length > 0 ? 0 : null,
  );

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1320px] px-3 sm:px-6 lg:px-8">
      <div className="border-t border-[#e6dfd2]">
        {sections.map((section, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={section.title} className="border-b border-[#e6dfd2]">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="text-[15px] font-semibold tracking-[0.02em] text-[#1f1a13]">
                  {section.title}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[#9b917f] transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-[2000px] pb-6" : "max-h-0"
                }`}
              >
                <div
                  className="prose prose-sm max-w-none text-[14px] leading-[1.85] text-[#5c564d] [&_a]:text-[#b89a57] [&_a]:transition [&_a:hover]:text-[#8a6e31] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:text-[#1f1a13] [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-[#1f1a13] [&_h3]:mb-2 [&_p]:mb-3"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(section.content, {
                      ADD_ATTR: ["target"],
                    }),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
