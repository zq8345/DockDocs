import type { BlogArticle } from "@/lib/blog";

export const batch2Articles = [
  {
    slug: "how-to-reduce-pdf-file-size",
    category: "Compress PDF",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    keywords: [
      "reduce pdf file size",
      "make pdf smaller",
      "reduce pdf size online",
      "compress pdf file size",
    ],
    toolHref: "/compress-pdf",
    toolLabel: "Compress PDF",
    relatedTools: [
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "Split PDF", href: "/split-pdf" },
      { label: "Merge PDF", href: "/merge-pdf" },
      { label: "Help Center", href: "/help" },
    ],
    relatedArticleSlugs: [
      "how-to-compress-pdf-for-email",
      "compress-pdf-without-losing-quality",
      "merge-pdf-without-losing-quality",
    ],
    content: {
      en: {
        title: "How to Reduce PDF File Size for Uploads, Email, and Sharing",
        description:
          "Learn how to reduce PDF file size online while keeping documents readable for email, uploads, portals, and everyday sharing.",
        excerpt:
          "Reducing PDF file size is about choosing the right workflow: compress when the file is too large, split when only part is needed, and review before sharing.",
        readingTime: "7 min read",
        ctaTitle: "Reduce PDF file size with DockDocs",
        ctaDescription:
          "Use DockDocs Compress PDF to make large PDFs easier to email, upload, and share.",
        ctaLabel: "Open Compress PDF",
        sections: [
          {
            heading: "Why PDF file size matters",
            paragraphs: [
              "Large PDFs slow down email, fail on upload portals, and create friction for clients, students, teams, and support workflows. A document can look simple but still become too large when it contains scans, images, embedded fonts, forms, or high-resolution pages.",
              "The goal is not always the smallest possible file. The practical goal is a PDF that fits the destination while staying readable and trustworthy. For many workflows, that means reducing size enough for email or upload without destroying page clarity.",
            ],
            links: [{ label: "Compress PDF", href: "/compress-pdf" }],
          },
          {
            heading: "Use compression as the first step",
            paragraphs: [
              "Compression is usually the first workflow to try when the whole document needs to stay together. It can reduce image data, optimize embedded resources, and make a PDF easier to send. Text-based PDFs often compress cleanly, while scanned PDFs need more careful review.",
              "After compression, open the result and check pages with small text, signatures, tables, charts, and scanned images. A smaller file is only useful if the recipient can still read and act on the document.",
            ],
            links: [{ label: "Compress without losing quality", href: "/blog/compress-pdf-without-losing-quality" }],
          },
          {
            heading: "When splitting works better than compression",
            paragraphs: [
              "If the recipient only needs a section of the document, splitting may be better than compressing the entire PDF. Extracting the relevant page range creates a smaller, cleaner file and reduces confusion for the person receiving it.",
              "This is especially useful for long manuals, reports, application packets, scanned archives, and multi-section business documents. A focused file is often more helpful than a heavily compressed full packet.",
            ],
            links: [{ label: "Split PDF pages", href: "/split-pdf" }],
          },
          {
            heading: "A reliable PDF size reduction checklist",
            paragraphs: [
              "Start by checking the destination limit, then compress the PDF, open the output, verify readability, rename the file clearly, and send or upload it. If the file is still too large, split unnecessary pages or reconsider whether the recipient needs an editable Word document instead.",
              "DockDocs keeps this process connected to related tools. You can reduce PDF file size, merge supporting documents, extract page ranges, convert files, or run OCR when scanned text needs to become searchable.",
            ],
            links: [
              { label: "Merge PDF files", href: "/merge-pdf" },
              { label: "PDF to Word", href: "/pdf-to-word" },
            ],
          },
        ],
        faq: [
          {
            question: "What is the easiest way to reduce PDF file size?",
            answer:
              "Use a PDF compression workflow first, then review the compressed output to confirm the file is smaller and still readable.",
          },
          {
            question: "Should I split a PDF instead of compressing it?",
            answer:
              "Split the PDF when the recipient only needs certain pages. Compression is better when the whole document needs to stay together.",
          },
          {
            question: "Can reducing PDF size affect quality?",
            answer:
              "Yes, aggressive compression can reduce scan or image quality. Always open the result before sharing.",
          },
        ],
      },
      zh: {
        title: "如何减小 PDF 文件大小，适合上传、邮件和分享",
        description:
          "了解如何在线减小 PDF 文件大小，同时保持邮件、上传门户和日常分享所需的可读性。",
        excerpt:
          "减小 PDF 大小不仅是压缩，还包括判断是否需要拆分、是否保留完整文档，以及导出后检查。",
        readingTime: "7 分钟阅读",
        ctaTitle: "用 DockDocs 减小 PDF 文件大小",
        ctaDescription: "使用 DockDocs Compress PDF 让大型 PDF 更适合邮件、上传和共享。",
        ctaLabel: "打开压缩 PDF",
        sections: [
          {
            heading: "为什么 PDF 文件大小很重要",
            paragraphs: [
              "大型 PDF 会影响邮件发送、门户上传和客户交付。扫描页、图片、字体、表单和高分辨率页面都可能让文件迅速变大。",
              "目标不是得到最小文件，而是在满足限制的同时保持清晰可读。对正式文档来说，可用性比极限压缩更重要。",
            ],
            links: [{ label: "压缩 PDF", href: "/compress-pdf" }],
          },
          {
            heading: "优先尝试压缩",
            paragraphs: [
              "当整个文档都需要保留时，压缩通常是第一步。文本型 PDF 通常更容易压缩，扫描 PDF 则需要检查清晰度。",
              "压缩后打开文件，检查小字、签名、表格和扫描页，确保收件人仍然可以阅读。",
            ],
          },
          {
            heading: "什么时候应该拆分",
            paragraphs: [
              "如果收件人只需要部分页面，拆分通常比压缩整份文件更合适。提取相关页面可以得到更小、更清楚的文件。",
              "长报告、手册、申请材料和扫描归档都适合先判断是否只需要某个页面范围。",
            ],
            links: [{ label: "拆分 PDF", href: "/split-pdf" }],
          },
        ],
        faq: [
          {
            question: "最简单的减小 PDF 大小方法是什么？",
            answer: "先使用 PDF 压缩流程，然后打开压缩结果检查体积和可读性。",
          },
          {
            question: "什么时候应该拆分而不是压缩？",
            answer: "如果只需要部分页面，拆分比压缩整份文件更清晰。",
          },
          {
            question: "减小 PDF 会影响质量吗？",
            answer: "过度压缩可能影响扫描图或图片质量，分享前应打开检查。",
          },
        ],
      },
    },
  },
  {
    slug: "compress-pdf-without-losing-quality",
    category: "Compress PDF",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    keywords: [
      "compress pdf without losing quality",
      "compress pdf keep quality",
      "reduce pdf size without losing quality",
      "pdf compression quality",
    ],
    toolHref: "/compress-pdf",
    toolLabel: "Compress PDF",
    relatedTools: [
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "OCR PDF", href: "/ocr-pdf" },
      { label: "PDF to Word", href: "/pdf-to-word" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
    relatedArticleSlugs: [
      "how-to-reduce-pdf-file-size",
      "how-to-compress-pdf-for-email",
      "ocr-pdf-to-text-online",
    ],
    content: {
      en: {
        title: "How to Compress a PDF Without Losing Quality",
        description:
          "Learn how to compress PDF files without losing quality by balancing file size, scan clarity, image detail, and document readability.",
        excerpt:
          "Quality-safe PDF compression means making the file smaller while preserving the details the recipient needs to read, verify, and trust.",
        readingTime: "8 min read",
        ctaTitle: "Compress PDFs while preserving readability",
        ctaDescription:
          "Use DockDocs Compress PDF when you need a smaller file that still works for real document handoff.",
        ctaLabel: "Open Compress PDF",
        sections: [
          {
            heading: "What quality means in PDF compression",
            paragraphs: [
              "Quality is not only visual sharpness. A compressed PDF should preserve readable text, complete pages, form fields, signatures, stamps, tables, and important images. A file can be smaller and still useful, but only if those details remain intact.",
              "The right compression level depends on the document type. A scanned contract, a photo-heavy portfolio, a text report, and a classroom handout all need different expectations. Compressing without losing quality starts with knowing what must remain readable.",
            ],
            links: [{ label: "Compress PDF", href: "/compress-pdf" }],
          },
          {
            heading: "Avoid over-compressing scans",
            paragraphs: [
              "Scanned PDFs are the files most likely to show quality loss. If compression makes letters blurry or removes contrast, OCR and human review both become harder. Keep enough resolution for small text, numbers, signatures, and page marks.",
              "When a scanned PDF needs text extraction later, preserve readability first. You can run OCR after compression, but OCR depends on clean source pages.",
            ],
            links: [{ label: "OCR scanned PDFs", href: "/ocr-pdf" }],
          },
          {
            heading: "Review before sharing",
            paragraphs: [
              "After downloading the compressed file, open it and inspect pages that are most likely to fail: small text, charts, scans, signatures, stamps, and pages with dense tables. Do not rely only on file size as the success signal.",
              "If the compressed version looks weak, consider splitting the document, reducing only image-heavy sections, or sending a larger file through a channel that supports it. The best workflow keeps the document useful.",
            ],
            links: [{ label: "Split PDF pages", href: "/split-pdf" }],
          },
          {
            heading: "A quality-safe compression workflow",
            paragraphs: [
              "Use a repeatable sequence: upload, compress, download, open, inspect, rename, and send. This makes compression a controlled document step instead of a blind export.",
              "DockDocs keeps compression connected to other workflows, so users can reduce size, merge packets, convert content, or use OCR depending on the next task.",
            ],
            links: [{ label: "Reduce PDF file size guide", href: "/blog/how-to-reduce-pdf-file-size" }],
          },
        ],
        faq: [
          {
            question: "Can I compress a PDF without losing quality?",
            answer:
              "You can reduce PDF size while preserving practical readability, but aggressive compression may reduce scan or image quality.",
          },
          {
            question: "What pages should I check after compression?",
            answer:
              "Check pages with small text, scans, signatures, tables, images, stamps, and any details the recipient must verify.",
          },
          {
            question: "Does OCR still work after compression?",
            answer:
              "OCR can work after compression if the text remains clear. Over-compressed scans may reduce OCR accuracy.",
          },
        ],
      },
      zh: {
        title: "如何在不降低质量的情况下压缩 PDF",
        description:
          "了解如何压缩 PDF 并平衡文件大小、扫描清晰度、图片细节和文档可读性。",
        excerpt:
          "高质量压缩意味着文件更小，但仍保留收件人需要阅读、验证和信任的细节。",
        readingTime: "8 分钟阅读",
        ctaTitle: "压缩 PDF，同时保持可读性",
        ctaDescription: "当你需要更小但仍适合交付的 PDF 时，使用 DockDocs Compress PDF。",
        ctaLabel: "打开压缩 PDF",
        sections: [
          {
            heading: "PDF 压缩中的质量是什么",
            paragraphs: [
              "质量不只是清晰度，还包括文本、页面、表单、签名、印章、表格和重要图片是否完整可读。",
              "扫描合同、图片作品集、文本报告和课堂讲义需要不同压缩预期。先明确哪些内容必须保持清晰。",
            ],
            links: [{ label: "压缩 PDF", href: "/compress-pdf" }],
          },
          {
            heading: "避免过度压缩扫描件",
            paragraphs: [
              "扫描 PDF 最容易出现质量损失。如果文字边缘变糊或对比度下降，人工阅读和 OCR 都会受影响。",
              "如果后续需要 OCR，应优先保留文字清晰度，再考虑文件体积。",
            ],
            links: [{ label: "OCR PDF", href: "/ocr-pdf" }],
          },
          {
            heading: "分享前检查",
            paragraphs: [
              "下载压缩文件后，检查小字、图表、扫描页、签名、印章和密集表格。不要只看文件大小。",
              "如果质量不足，可以拆分页、减少无关内容，或选择支持更大文件的发送方式。",
            ],
          },
        ],
        faq: [
          {
            question: "能否不降低质量地压缩 PDF？",
            answer: "可以在保持实际可读性的前提下减小体积，但过度压缩可能影响扫描图或图片质量。",
          },
          {
            question: "压缩后应该检查哪些页面？",
            answer: "重点检查小字、扫描页、签名、表格、图片、印章和关键细节。",
          },
          {
            question: "压缩后还能 OCR 吗？",
            answer: "如果文字仍然清晰，OCR 可以继续工作；过度压缩会降低准确率。",
          },
        ],
      },
    },
  },
  {
    slug: "how-to-merge-pdf-files-online",
    category: "Merge PDF",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    keywords: [
      "merge pdf files online",
      "combine pdf online",
      "online pdf merger",
      "merge multiple pdf files",
    ],
    toolHref: "/merge-pdf",
    toolLabel: "Merge PDF",
    relatedTools: [
      { label: "Merge PDF", href: "/merge-pdf" },
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "Split PDF", href: "/split-pdf" },
      { label: "Sitemap", href: "/sitemap" },
    ],
    relatedArticleSlugs: [
      "merge-pdf-without-losing-quality",
      "how-to-reduce-pdf-file-size",
      "how-to-split-pdf-pages",
    ],
    content: {
      en: {
        title: "How to Merge PDF Files Online Into One Organized Document",
        description:
          "Learn how to merge PDF files online, choose the right order, review the final packet, and keep document workflows organized.",
        excerpt:
          "Merging PDFs online is most useful when it creates a clean packet with the right order, clear file name, and practical file size.",
        readingTime: "7 min read",
        ctaTitle: "Merge multiple PDFs into one packet",
        ctaDescription:
          "Use DockDocs Merge PDF to upload multiple PDFs, review order, and prepare one organized output.",
        ctaLabel: "Open Merge PDF",
        sections: [
          {
            heading: "When to merge PDF files",
            paragraphs: [
              "Merge PDFs when the recipient expects one document instead of several attachments. This is common for applications, client packets, invoice groups, school submissions, report bundles, and support evidence.",
              "A merged PDF reduces confusion because the page order is fixed and the recipient can open a single file. It also creates a more professional handoff than sending separate documents with unclear names.",
            ],
            links: [{ label: "Merge PDF", href: "/merge-pdf" }],
          },
          {
            heading: "Prepare files before upload",
            paragraphs: [
              "Open each source PDF and remove outdated drafts, duplicates, or unrelated pages. Rename files so their order is easier to understand before upload.",
              "If one source PDF contains too many pages, split the needed range first. This keeps the merged packet focused and easier to review.",
            ],
            links: [{ label: "Split PDF pages", href: "/split-pdf" }],
          },
          {
            heading: "Choose a logical order",
            paragraphs: [
              "Order should match the reader's next action. Put the cover sheet or summary first, required forms next, supporting documents after that, and optional appendix material last.",
              "Before downloading, review the order preview. This step prevents common mistakes such as placing invoices before proposals or appendices before the main document.",
            ],
          },
          {
            heading: "Review and continue the workflow",
            paragraphs: [
              "After merging, open the output, check page transitions, verify page count, and rename the file clearly. If the merged file is too large, compress it after confirming the content is correct.",
              "A merge workflow often connects to compression, OCR, or PDF to Word depending on what the recipient needs next.",
            ],
            links: [
              { label: "Compress merged PDF", href: "/compress-pdf" },
              { label: "OCR PDF", href: "/ocr-pdf" },
            ],
          },
        ],
        faq: [
          {
            question: "How do I merge PDF files online?",
            answer:
              "Upload multiple PDF files, arrange them in the right order, review the merge preview, and download one combined PDF.",
          },
          {
            question: "Should I compress before or after merging?",
            answer:
              "Usually merge first, review the packet, then compress the final PDF if it is too large.",
          },
          {
            question: "Can I remove pages before merging?",
            answer:
              "Yes. Use a split workflow first if one source PDF contains unrelated pages.",
          },
        ],
      },
      zh: {
        title: "如何在线合并 PDF 文件，生成一个有序文档",
        description: "了解如何在线合并 PDF、选择正确顺序、检查最终文档包，并保持工作流清晰。",
        excerpt: "在线合并 PDF 的价值在于生成一个顺序正确、命名清楚、体积合理的文档包。",
        readingTime: "7 分钟阅读",
        ctaTitle: "将多个 PDF 合并成一个文档包",
        ctaDescription: "使用 DockDocs Merge PDF 上传多个 PDF，检查顺序并准备一个有序输出。",
        ctaLabel: "打开合并 PDF",
        sections: [
          {
            heading: "什么时候需要合并 PDF",
            paragraphs: [
              "当收件人希望收到一个文件而不是多个附件时，就适合合并 PDF。常见场景包括申请材料、客户资料包、发票组和报告合集。",
              "合并后页面顺序固定，收件人只需打开一个文件，交付更专业。",
            ],
            links: [{ label: "合并 PDF", href: "/merge-pdf" }],
          },
          {
            heading: "上传前整理文件",
            paragraphs: [
              "打开每个源文件，删除旧版本、重复文件和无关页面。清楚命名可以帮助确认顺序。",
              "如果某个 PDF 只需要部分页面，先拆分出需要范围，再合并。",
            ],
          },
          {
            heading: "检查顺序和输出",
            paragraphs: [
              "按照阅读顺序排列：摘要或封面在前，必需表单在中间，附件在后。",
              "合并后打开文件，检查页数、交界处、文件名和体积，必要时再压缩。",
            ],
            links: [{ label: "压缩合并 PDF", href: "/compress-pdf" }],
          },
        ],
        faq: [
          {
            question: "如何在线合并 PDF？",
            answer: "上传多个 PDF，调整顺序，查看预览，然后下载一个合并后的 PDF。",
          },
          {
            question: "应该先压缩还是先合并？",
            answer: "通常先合并并检查最终文档，再按需要压缩。",
          },
          {
            question: "合并前可以删除页面吗？",
            answer: "可以。如果源文件包含无关页面，先使用拆分工具。",
          },
        ],
      },
    },
  },
  {
    slug: "how-to-split-pdf-pages",
    category: "Split PDF",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    keywords: [
      "split pdf pages",
      "extract pdf pages",
      "split pdf online",
      "pdf page splitter",
    ],
    toolHref: "/split-pdf",
    toolLabel: "Split PDF",
    relatedTools: [
      { label: "Split PDF", href: "/split-pdf" },
      { label: "Merge PDF", href: "/merge-pdf" },
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "FAQ", href: "/faq" },
    ],
    relatedArticleSlugs: [
      "how-to-merge-pdf-files-online",
      "how-to-reduce-pdf-file-size",
      "merge-pdf-without-losing-quality",
    ],
    content: {
      en: {
        title: "How to Split PDF Pages and Extract Only What You Need",
        description:
          "Learn how to split PDF pages online, extract page ranges, create smaller files, and prepare focused document handoffs.",
        excerpt:
          "Splitting PDF pages helps remove clutter, share only the relevant pages, and create smaller files without over-compressing the original document.",
        readingTime: "7 min read",
        ctaTitle: "Extract the PDF pages you need",
        ctaDescription:
          "Use DockDocs Split PDF to enter page ranges, preview split output, and export focused files.",
        ctaLabel: "Open Split PDF",
        sections: [
          {
            heading: "Why split PDF pages",
            paragraphs: [
              "Split PDF pages when the full document is too long, too large, or includes information the recipient does not need. Extracting only relevant pages creates a cleaner and safer handoff.",
              "This workflow is useful for reports, contracts, manuals, scanned records, school packets, invoices, and application documents where only one section matters.",
            ],
            links: [{ label: "Split PDF", href: "/split-pdf" }],
          },
          {
            heading: "Choose page ranges carefully",
            paragraphs: [
              "Before splitting, open the PDF and note the exact page ranges. Common examples include 1-3 for a cover section, 8-12 for a contract clause, or 20-24 for an appendix.",
              "Check whether the PDF page numbers match printed page numbers. Some documents have cover pages, Roman numerals, or inserts that shift visible numbering.",
            ],
          },
          {
            heading: "Use split output as a focused workflow",
            paragraphs: [
              "After splitting, open the output and confirm the right pages were included. If multiple sections are extracted, export them together in a ZIP or merge selected parts into a new packet.",
              "Splitting can also reduce file size when compression would damage quality. Instead of shrinking every page, remove what is not needed.",
            ],
            links: [
              { label: "Merge selected pages", href: "/merge-pdf" },
              { label: "Reduce PDF file size", href: "/blog/how-to-reduce-pdf-file-size" },
            ],
          },
          {
            heading: "A page extraction checklist",
            paragraphs: [
              "Confirm the page range, run the split workflow, open the output, verify page count, rename the file clearly, and choose whether to compress or merge afterward.",
              "A focused split file is often easier to read, easier to upload, and safer to share than a full PDF packet.",
            ],
          },
        ],
        faq: [
          {
            question: "How do I split PDF pages online?",
            answer:
              "Upload a PDF, enter the page range you want to extract, preview the split output, and export the result.",
          },
          {
            question: "Can I extract multiple page ranges?",
            answer:
              "Yes. A split workflow can support ranges such as 1-3, 8-12, and 20-24 depending on the tool design.",
          },
          {
            question: "Does splitting reduce PDF file size?",
            answer:
              "Yes, if you export fewer pages. It can be better than compression when only part of the document is needed.",
          },
        ],
      },
      zh: {
        title: "如何拆分 PDF 页面，只提取需要的内容",
        description: "了解如何在线拆分 PDF 页面、提取页面范围、创建更小文件并准备清晰交付。",
        excerpt: "拆分 PDF 可以去除无关内容、只分享需要页面，并在不过度压缩的情况下减小文件。",
        readingTime: "7 分钟阅读",
        ctaTitle: "提取你需要的 PDF 页面",
        ctaDescription: "使用 DockDocs Split PDF 输入页面范围、预览拆分结果并导出文件。",
        ctaLabel: "打开拆分 PDF",
        sections: [
          {
            heading: "为什么要拆分 PDF",
            paragraphs: [
              "当完整文档过长、过大或包含收件人不需要的信息时，拆分可以创建更清晰、更安全的交付文件。",
              "报告、合同、手册、扫描记录、发票和申请材料都常需要只提取某些页面。",
            ],
            links: [{ label: "拆分 PDF", href: "/split-pdf" }],
          },
          {
            heading: "认真选择页面范围",
            paragraphs: [
              "拆分前打开 PDF，确认准确页码，例如 1-3、8-12 或 20-24。",
              "注意 PDF 页码和印刷页码可能不一致，封面和目录会造成偏移。",
            ],
          },
          {
            heading: "检查拆分输出",
            paragraphs: [
              "拆分后打开结果，确认页面正确、页数无误、文件名清楚。必要时可以继续压缩或合并。",
              "如果只需要部分内容，拆分通常比压缩完整 PDF 更清晰。",
            ],
          },
        ],
        faq: [
          {
            question: "如何在线拆分 PDF 页面？",
            answer: "上传 PDF，输入要提取的页面范围，预览结果并导出。",
          },
          {
            question: "可以提取多个页面范围吗？",
            answer: "可以，工作流可支持类似 1-3、8-12、20-24 的范围。",
          },
          {
            question: "拆分能减小 PDF 体积吗？",
            answer: "如果导出更少页面，文件通常会更小。",
          },
        ],
      },
    },
  },
  {
    slug: "jpg-to-pdf-on-iphone",
    category: "JPG to PDF",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    keywords: [
      "jpg to pdf on iphone",
      "convert photo to pdf iphone",
      "iphone image to pdf",
      "jpg pdf converter iphone",
    ],
    toolHref: "/jpg-to-pdf",
    toolLabel: "JPG to PDF",
    relatedTools: [
      { label: "JPG to PDF", href: "/jpg-to-pdf" },
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "OCR PDF", href: "/ocr-pdf" },
      { label: "Help Center", href: "/help" },
    ],
    relatedArticleSlugs: [
      "best-jpg-to-pdf-workflow",
      "convert-image-to-pdf-online",
      "ocr-pdf-to-text-online",
    ],
    content: {
      en: {
        title: "How to Convert JPG to PDF on iPhone for Documents and Receipts",
        description:
          "Learn how to convert JPG to PDF on iPhone for receipts, scans, photos, notes, and mobile document workflows.",
        excerpt:
          "iPhone photos often become document inputs. A clean JPG to PDF workflow turns those images into files that are easier to send, upload, and archive.",
        readingTime: "7 min read",
        ctaTitle: "Convert iPhone photos into PDF documents",
        ctaDescription:
          "Use DockDocs JPG to PDF to prepare photos, scans, and receipts as PDF files.",
        ctaLabel: "Open JPG to PDF",
        sections: [
          {
            heading: "Why iPhone photos become PDFs",
            paragraphs: [
              "Receipts, whiteboards, class notes, signed forms, ID copies, and paper records are often captured with an iPhone. Sending them as individual images can be messy, especially when a portal expects one PDF.",
              "Converting JPG images to PDF creates a stable document format with page order, cleaner naming, and easier sharing. It is especially useful when the recipient needs a record rather than a photo album.",
            ],
            links: [{ label: "JPG to PDF", href: "/jpg-to-pdf" }],
          },
          {
            heading: "Prepare photos before conversion",
            paragraphs: [
              "Review the photos first. Delete duplicates, retake blurry pages, rotate sideways images, and crop extra background. Good source images create better PDFs.",
              "If a page contains small text, zoom in and confirm readability before converting. OCR and review workflows depend on clear source images.",
            ],
            links: [{ label: "OCR PDF", href: "/ocr-pdf" }],
          },
          {
            heading: "Arrange the PDF page order",
            paragraphs: [
              "Photos can appear in unexpected order after editing, sharing, or downloading. Before export, arrange pages so the PDF reads naturally from beginning to end.",
              "For receipts, use date order. For forms, follow page numbers. For notes, group by topic. A clear order makes the final PDF easier to trust.",
            ],
          },
          {
            heading: "Export, review, and send",
            paragraphs: [
              "After exporting, open the PDF, check each page, rename the file, and compress it if it is too large for email or upload.",
              "DockDocs keeps this mobile workflow connected to compression, OCR, and merge tools so photos can become part of a larger document packet.",
            ],
            links: [{ label: "Compress exported PDF", href: "/compress-pdf" }],
          },
        ],
        faq: [
          {
            question: "Can I convert iPhone JPG photos to PDF?",
            answer:
              "Yes. Upload JPG photos, arrange their page order, and export them as one PDF document.",
          },
          {
            question: "Should I crop photos before JPG to PDF?",
            answer:
              "Yes, cropping extra background and retaking blurry pages improves the final PDF.",
          },
          {
            question: "Can I OCR a PDF made from iPhone photos?",
            answer:
              "Yes, if the photos contain readable text, OCR can extract searchable text after conversion.",
          },
        ],
      },
      zh: {
        title: "如何在 iPhone 上将 JPG 转为 PDF",
        description: "了解如何把 iPhone 照片、收据、扫描图和笔记转换为适合发送和上传的 PDF。",
        excerpt: "iPhone 照片经常成为文档输入。JPG 转 PDF 可以让图片更适合发送、上传和归档。",
        readingTime: "7 分钟阅读",
        ctaTitle: "将 iPhone 照片转换为 PDF 文档",
        ctaDescription: "使用 DockDocs JPG to PDF 将照片、扫描图和收据准备为 PDF。",
        ctaLabel: "打开 JPG 转 PDF",
        sections: [
          {
            heading: "为什么 iPhone 照片需要变成 PDF",
            paragraphs: [
              "收据、白板、课堂笔记、签字表单和纸质记录常用 iPhone 拍摄。单独发送图片很混乱，很多门户也要求 PDF。",
              "PDF 可以保持页面顺序、文件命名和交付格式，更像正式文档。",
            ],
            links: [{ label: "JPG 转 PDF", href: "/jpg-to-pdf" }],
          },
          {
            heading: "转换前整理照片",
            paragraphs: [
              "删除重复照片、重拍模糊页面、旋转方向、裁剪多余背景。源图片越清楚，PDF 越可靠。",
              "如果图片包含小字，转换前放大检查可读性。",
            ],
          },
          {
            heading: "导出后检查和压缩",
            paragraphs: [
              "导出 PDF 后，打开检查每页、命名文件，并在需要时压缩。",
              "如果图片里有文字，也可以继续使用 OCR 提取文本。",
            ],
            links: [{ label: "OCR PDF", href: "/ocr-pdf" }],
          },
        ],
        faq: [
          {
            question: "可以把 iPhone JPG 照片转成 PDF 吗？",
            answer: "可以。上传 JPG 照片，调整页面顺序，然后导出 PDF。",
          },
          {
            question: "转换前需要裁剪吗？",
            answer: "建议裁剪多余背景并重拍模糊页面。",
          },
          {
            question: "iPhone 照片生成的 PDF 可以 OCR 吗？",
            answer: "如果照片中文字清晰，可以在转换后使用 OCR 提取文本。",
          },
        ],
      },
    },
  },
  {
    slug: "convert-image-to-pdf-online",
    category: "JPG to PDF",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    keywords: [
      "convert image to pdf online",
      "image to pdf online",
      "png to pdf",
      "webp to pdf",
    ],
    toolHref: "/jpg-to-pdf",
    toolLabel: "JPG to PDF",
    relatedTools: [
      { label: "JPG to PDF", href: "/jpg-to-pdf" },
      { label: "Merge PDF", href: "/merge-pdf" },
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "FAQ", href: "/faq" },
    ],
    relatedArticleSlugs: [
      "best-jpg-to-pdf-workflow",
      "jpg-to-pdf-on-iphone",
      "how-to-reduce-pdf-file-size",
    ],
    content: {
      en: {
        title: "How to Convert Images to PDF Online for Clean Document Sharing",
        description:
          "Learn how to convert images to PDF online using JPG, PNG, and WebP workflows for scans, receipts, notes, and photo documents.",
        excerpt:
          "Image to PDF conversion turns photos and screenshots into stable documents that are easier to upload, email, print, and archive.",
        readingTime: "7 min read",
        ctaTitle: "Convert images into a PDF",
        ctaDescription:
          "Use DockDocs JPG to PDF to convert JPG, PNG, and WebP images into one PDF document.",
        ctaLabel: "Open JPG to PDF",
        sections: [
          {
            heading: "Why convert images to PDF online",
            paragraphs: [
              "Images are easy to capture but not always easy to submit. Many portals, teams, and recipients prefer PDF because it keeps pages in order and behaves like a document.",
              "Converting images to PDF is useful for receipts, scans, ID copies, forms, notes, screenshots, product photos, and classroom materials.",
            ],
            links: [{ label: "Convert JPG to PDF", href: "/jpg-to-pdf" }],
          },
          {
            heading: "Use the right image formats",
            paragraphs: [
              "A practical image-to-PDF workflow should handle JPG for photos, PNG for screenshots or text-heavy images, and WebP for downloaded web images.",
              "Before upload, remove duplicates and make sure each image belongs in the final PDF. A clean input set creates a cleaner document.",
            ],
          },
          {
            heading: "Create a document, not a gallery",
            paragraphs: [
              "Arrange images in the order someone should read them. This turns a set of pictures into a document with a clear beginning, middle, and end.",
              "After export, open the PDF, check page order and readability, then compress or merge it if it belongs in a larger packet.",
            ],
            links: [
              { label: "Compress image PDF", href: "/compress-pdf" },
              { label: "Merge PDF packet", href: "/merge-pdf" },
            ],
          },
          {
            heading: "When OCR is the next step",
            paragraphs: [
              "If the images contain printed text, OCR can help extract searchable and copyable content after the PDF is created.",
              "This turns visual pages into reusable document text for summaries, review, search, or editing workflows.",
            ],
            links: [{ label: "OCR PDF to text", href: "/blog/ocr-pdf-to-text-online" }],
          },
        ],
        faq: [
          {
            question: "Which images can I convert to PDF online?",
            answer:
              "Common image-to-PDF workflows support JPG, PNG, and WebP images.",
          },
          {
            question: "Can I convert multiple images into one PDF?",
            answer:
              "Yes. Upload multiple images, arrange their order, and export one PDF document.",
          },
          {
            question: "Should I compress the PDF after converting images?",
            answer:
              "Check the exported file size. Image-based PDFs can be large, so compression may help before email or upload.",
          },
        ],
      },
      zh: {
        title: "如何在线将图片转换为 PDF，方便文档分享",
        description: "了解如何将 JPG、PNG、WebP 图片在线转换为 PDF，适合扫描图、收据、笔记和照片文档。",
        excerpt: "图片转 PDF 可以把照片和截图变成稳定文档，更适合上传、邮件、打印和归档。",
        readingTime: "7 分钟阅读",
        ctaTitle: "将图片转换为 PDF",
        ctaDescription: "使用 DockDocs JPG to PDF 将 JPG、PNG 和 WebP 图片转换为一个 PDF。",
        ctaLabel: "打开 JPG 转 PDF",
        sections: [
          {
            heading: "为什么要在线图片转 PDF",
            paragraphs: [
              "图片容易拍摄，但不一定适合提交。很多门户和团队更喜欢 PDF，因为页面顺序更稳定。",
              "图片转 PDF 适合收据、扫描件、证件复印件、表单、笔记、截图和课堂资料。",
            ],
            links: [{ label: "JPG 转 PDF", href: "/jpg-to-pdf" }],
          },
          {
            heading: "整理图片格式和顺序",
            paragraphs: [
              "实用工作流应支持 JPG、PNG 和 WebP。上传前删除重复图片并确认每张都属于最终文档。",
              "按照阅读顺序排列图片，让 PDF 像文档而不是相册。",
            ],
          },
          {
            heading: "导出后继续处理",
            paragraphs: [
              "导出后检查页面顺序、可读性和文件大小。图片型 PDF 可能需要压缩。",
              "如果图片包含文字，可以继续 OCR 提取文本。",
            ],
            links: [{ label: "OCR PDF", href: "/ocr-pdf" }],
          },
        ],
        faq: [
          {
            question: "哪些图片可以转 PDF？",
            answer: "常见工作流支持 JPG、PNG 和 WebP。",
          },
          {
            question: "可以多张图片生成一个 PDF 吗？",
            answer: "可以。上传多张图片，调整顺序并导出一个 PDF。",
          },
          {
            question: "图片转 PDF 后需要压缩吗？",
            answer: "如果文件较大，建议导出后压缩再发送或上传。",
          },
        ],
      },
    },
  },
  {
    slug: "ocr-pdf-to-text-online",
    category: "OCR PDF",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    keywords: [
      "ocr pdf to text online",
      "pdf ocr to text",
      "extract text from pdf online",
      "scan pdf to text",
    ],
    toolHref: "/ocr-pdf",
    toolLabel: "OCR PDF",
    relatedTools: [
      { label: "OCR PDF", href: "/ocr-pdf" },
      { label: "PDF to Word", href: "/pdf-to-word" },
      { label: "JPG to PDF", href: "/jpg-to-pdf" },
      { label: "Help Center", href: "/help" },
    ],
    relatedArticleSlugs: [
      "how-to-ocr-scanned-pdf-files",
      "convert-image-to-pdf-online",
      "pdf-to-word-for-editing",
    ],
    content: {
      en: {
        title: "How to OCR PDF to Text Online for Searchable Documents",
        description:
          "Learn how to OCR PDF to text online, extract searchable content from scanned PDFs, and use text output in document workflows.",
        excerpt:
          "OCR PDF to text turns scanned pages into searchable, copyable content that can support summaries, editing, review, and document reuse.",
        readingTime: "8 min read",
        ctaTitle: "Extract text from scanned PDFs",
        ctaDescription:
          "Use DockDocs OCR PDF to process scanned pages and copy or download extracted text.",
        ctaLabel: "Open OCR PDF",
        sections: [
          {
            heading: "What OCR PDF to text means",
            paragraphs: [
              "OCR PDF to text means recognizing letters and words inside scanned or image-based PDF pages. The output can be searched, copied, reviewed, summarized, or reused.",
              "A scanned PDF may look readable to a person but still behave like a picture. OCR creates the text layer that makes the document useful in digital workflows.",
            ],
            links: [{ label: "OCR PDF", href: "/ocr-pdf" }],
          },
          {
            heading: "Start with clean scans",
            paragraphs: [
              "OCR accuracy depends on page clarity, contrast, rotation, language, and layout. Straight, high-contrast scans with readable text produce better output.",
              "If the scan is blurry, cropped, shadowed, or low resolution, fix the source before relying on extracted text.",
            ],
          },
          {
            heading: "Review extracted text",
            paragraphs: [
              "OCR output should be reviewed before use. Numbers, names, dates, addresses, and table values are common places where recognition mistakes matter.",
              "Copy the extracted text when you need quick reuse, download it for records, or send it into PDF to Word or AI Workspace when the document needs deeper work.",
            ],
            links: [
              { label: "PDF to Word", href: "/pdf-to-word" },
              { label: "AI Workspace", href: "/ai-workspace" },
            ],
          },
          {
            heading: "Connect OCR with image and PDF workflows",
            paragraphs: [
              "OCR often starts after JPG to PDF or scanning. Images become a PDF, the PDF becomes text, and the text becomes searchable or editable content.",
              "This is why OCR works best as part of a document workflow instead of a standalone result.",
            ],
            links: [{ label: "Convert image to PDF", href: "/blog/convert-image-to-pdf-online" }],
          },
        ],
        faq: [
          {
            question: "How do I OCR PDF to text online?",
            answer:
              "Upload a scanned or image-based PDF, run OCR, review the extracted text, then copy or download it.",
          },
          {
            question: "Is OCR text always accurate?",
            answer:
              "No. Accuracy depends on scan quality, contrast, language, rotation, and page layout.",
          },
          {
            question: "What can I do with extracted OCR text?",
            answer:
              "You can search it, copy it, download it, summarize it, or use it in editing and document review workflows.",
          },
        ],
      },
      zh: {
        title: "如何在线 OCR PDF 转文本，创建可搜索文档",
        description: "了解如何在线 OCR PDF 转文本，从扫描 PDF 中提取可搜索内容，并用于文档工作流。",
        excerpt: "OCR PDF 转文本可以把扫描页变成可搜索、可复制的内容，用于摘要、编辑、审阅和复用。",
        readingTime: "8 分钟阅读",
        ctaTitle: "从扫描 PDF 中提取文本",
        ctaDescription: "使用 DockDocs OCR PDF 处理扫描页面，并复制或下载提取文本。",
        ctaLabel: "打开 OCR PDF",
        sections: [
          {
            heading: "OCR PDF 转文本是什么意思",
            paragraphs: [
              "OCR 会识别扫描或图片型 PDF 页面中的文字，输出可搜索、可复制和可复用的文本。",
              "扫描 PDF 对人可读，但电脑可能只把它当作图片。OCR 创建可用文本层。",
            ],
            links: [{ label: "OCR PDF", href: "/ocr-pdf" }],
          },
          {
            heading: "从清晰扫描开始",
            paragraphs: [
              "OCR 准确率取决于清晰度、对比度、方向、语言和版式。清晰平整的扫描效果更好。",
              "如果源文件模糊、裁切不完整或有阴影，应先改善源文件。",
            ],
          },
          {
            heading: "复核提取文本",
            paragraphs: [
              "OCR 输出需要检查，尤其是数字、姓名、日期、地址和表格值。",
              "可以复制文本、下载文本，或继续进入 PDF 转 Word 和 AI 工作区。",
            ],
            links: [{ label: "PDF 转 Word", href: "/pdf-to-word" }],
          },
        ],
        faq: [
          {
            question: "如何在线 OCR PDF 转文本？",
            answer: "上传扫描 PDF，运行 OCR，复核提取文本，然后复制或下载。",
          },
          {
            question: "OCR 文本总是准确吗？",
            answer: "不是。准确率取决于扫描质量、对比度、语言、方向和版式。",
          },
          {
            question: "提取文本可以做什么？",
            answer: "可以搜索、复制、下载、摘要，或用于编辑和文档审阅。",
          },
        ],
      },
    },
  },
  {
    slug: "pdf-to-word-for-editing",
    category: "PDF to Word",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    keywords: [
      "pdf to word editable",
      "pdf to word for editing",
      "convert pdf to editable word",
      "pdf to docx editable",
    ],
    toolHref: "/pdf-to-word",
    toolLabel: "PDF to Word",
    relatedTools: [
      { label: "PDF to Word", href: "/pdf-to-word" },
      { label: "OCR PDF", href: "/ocr-pdf" },
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "FAQ", href: "/faq" },
    ],
    relatedArticleSlugs: [
      "convert-pdf-to-word-editable-document",
      "ocr-pdf-to-text-online",
      "compress-pdf-without-losing-quality",
    ],
    content: {
      en: {
        title: "PDF to Word for Editing: How to Create an Editable Document",
        description:
          "Learn how to use PDF to Word for editing, convert PDFs into editable documents, and review DOCX output before collaboration.",
        excerpt:
          "PDF to Word is useful when a fixed document needs revisions. The best workflow treats the converted file as an editable draft that should be reviewed.",
        readingTime: "8 min read",
        ctaTitle: "Convert PDF into an editable Word workflow",
        ctaDescription:
          "Use DockDocs PDF to Word to prepare editable document output from static PDFs.",
        ctaLabel: "Open PDF to Word",
        sections: [
          {
            heading: "When PDF to Word helps editing",
            paragraphs: [
              "PDF is designed for stable presentation. Word is designed for revision. If a document needs updated wording, comments, collaboration, or reuse, converting PDF to Word can save time.",
              "This workflow is common for proposals, contracts, resumes, reports, policies, school assignments, and drafts where the original editing file is missing.",
            ],
            links: [{ label: "PDF to Word", href: "/pdf-to-word" }],
          },
          {
            heading: "Check whether the PDF is scanned",
            paragraphs: [
              "If text can be selected in the PDF, conversion is usually more straightforward. If the PDF is scanned, OCR may be needed before the text becomes editable.",
              "Scanned pages require extra review because recognition errors can affect names, numbers, dates, and layout.",
            ],
            links: [{ label: "OCR PDF first", href: "/ocr-pdf" }],
          },
          {
            heading: "Review the editable output",
            paragraphs: [
              "After conversion, check headings, paragraphs, lists, tables, page breaks, and repeated headers. The converted document should be treated as a draft, not a guaranteed perfect source file.",
              "Keep the original PDF as a reference. This makes it easier to compare changes and correct formatting before sharing the editable version.",
            ],
            links: [{ label: "Detailed PDF to Word guide", href: "/blog/convert-pdf-to-word-editable-document" }],
          },
          {
            heading: "Use editing workflow rules",
            paragraphs: [
              "Rename the converted file clearly, decide who owns cleanup, and avoid multiple people editing different versions at the same time.",
              "If the final output needs to be sent as PDF again, export a reviewed PDF and compress it only if the file is too large.",
            ],
            links: [{ label: "Compress final PDF", href: "/compress-pdf" }],
          },
        ],
        faq: [
          {
            question: "Can PDF to Word create an editable document?",
            answer:
              "Yes, PDF to Word can create editable DOCX-style output, but the result should be reviewed and cleaned up.",
          },
          {
            question: "Do scanned PDFs need OCR before editing?",
            answer:
              "Usually yes. OCR helps recognize text before it can become useful editable content.",
          },
          {
            question: "Will the Word file match the PDF exactly?",
            answer:
              "Not always. Complex layouts, tables, and scans may need formatting cleanup after conversion.",
          },
        ],
      },
      zh: {
        title: "PDF 转 Word 编辑：如何创建可编辑文档",
        description: "了解如何将 PDF 转换为可编辑 Word 文档，并在协作前检查 DOCX 输出。",
        excerpt: "当固定 PDF 需要修改时，PDF 转 Word 很有用。转换结果应作为可编辑草稿进行检查。",
        readingTime: "8 分钟阅读",
        ctaTitle: "将 PDF 转入可编辑 Word 工作流",
        ctaDescription: "使用 DockDocs PDF to Word 从静态 PDF 准备可编辑文档输出。",
        ctaLabel: "打开 PDF 转 Word",
        sections: [
          {
            heading: "什么时候需要 PDF 转 Word 编辑",
            paragraphs: [
              "PDF 适合稳定展示，Word 适合修改。如果文档需要更新、评论、协作或复用，转换为 Word 可以节省时间。",
              "提案、合同、简历、报告、政策草稿和作业都常见这种需求。",
            ],
            links: [{ label: "PDF 转 Word", href: "/pdf-to-word" }],
          },
          {
            heading: "先判断是否扫描件",
            paragraphs: [
              "如果 PDF 文字可选择，转换通常更顺畅。如果是扫描件，通常需要先 OCR。",
              "扫描件转换后需要特别检查姓名、数字、日期和版式。",
            ],
            links: [{ label: "先 OCR PDF", href: "/ocr-pdf" }],
          },
          {
            heading: "检查可编辑输出",
            paragraphs: [
              "转换后检查标题、段落、列表、表格、分页和重复页眉。把 Word 文件当作草稿，而不是完美源文件。",
              "保留原始 PDF 作为参考，便于比较和修正格式。",
            ],
          },
        ],
        faq: [
          {
            question: "PDF 转 Word 可以创建可编辑文档吗？",
            answer: "可以，但转换结果需要检查和清理。",
          },
          {
            question: "扫描 PDF 编辑前需要 OCR 吗？",
            answer: "通常需要。OCR 可以先识别文字，再进入可编辑流程。",
          },
          {
            question: "Word 文件会和 PDF 完全一致吗？",
            answer: "不一定。复杂版式、表格和扫描页可能需要格式整理。",
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
