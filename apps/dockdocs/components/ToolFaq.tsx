type Locale = "en" | "zh";
type QA = { q: string; a: string };

// FAQ content for the custom-client tools (which don't use the PdfToolPage template).
const FAQS: Record<string, { title: { en: string; zh: string }; items: { en: QA[]; zh: QA[] } }> = {
  "sign-pdf": {
    title: { en: "Sign PDF — FAQ", zh: "PDF 签名常见问题" },
    items: {
      en: [
        { q: "How do I sign a PDF?", a: "Upload the PDF, draw or type your signature, pick the page and position, then Sign & download." },
        { q: "Can I draw my signature?", a: "Yes — draw with your mouse or finger on the pad, or switch to Type to use your name in a signature font." },
        { q: "Is my file uploaded?", a: "No. The signature is stamped onto the PDF in your browser — your file never leaves your device." },
        { q: "Is an electronic signature legal?", a: "Typed and drawn e-signatures are accepted for many everyday documents, but check the requirements for your specific use." },
      ],
      zh: [
        { q: "如何给 PDF 签名？", a: "上传 PDF，手写或打字你的签名，选择页面和位置，然后「签名并下载」。" },
        { q: "可以手写签名吗？", a: "可以——用鼠标或手指在画板上书写，或切换到「打字」用签名字体写你的名字。" },
        { q: "文件会被上传吗？", a: "不会。签名在你的浏览器中盖到 PDF 上，文件不会离开你的设备。" },
        { q: "电子签名有法律效力吗？", a: "打字和手写电子签名在许多日常文档中被接受，具体用途请核对相关要求。" },
      ],
    },
  },
  "crop-pdf": {
    title: { en: "Crop PDF — FAQ", zh: "裁剪 PDF 常见问题" },
    items: {
      en: [
        { q: "How do I crop a PDF?", a: "Upload the PDF, drag the top/right/bottom/left sliders to trim each edge with a live preview, then Crop & download." },
        { q: "Does it crop every page?", a: "Yes — the same margins are applied to all pages so the document stays consistent." },
        { q: "Is the content deleted?", a: "No. Cropping sets the visible area (crop box); the trimmed content is hidden, not removed, so nothing is lost." },
        { q: "Is my file uploaded?", a: "No. Cropping happens in your browser — your PDF never leaves your device." },
      ],
      zh: [
        { q: "如何裁剪 PDF？", a: "上传 PDF，拖动上/右/下/左滑块,边看实时预览边裁掉每一边，然后「裁剪并下载」。" },
        { q: "会裁剪每一页吗？", a: "会——同样的边距应用到所有页面，保持文档一致。" },
        { q: "内容会被删除吗？", a: "不会。裁剪设置的是可见区域(裁剪框)，被裁的内容是隐藏而非删除，不会丢失。" },
        { q: "文件会被上传吗？", a: "不会。裁剪在你的浏览器中完成，PDF 不会离开你的设备。" },
      ],
    },
  },
  "images-to-pdf": {
    title: { en: "Images to PDF — FAQ", zh: "图片转 PDF 常见问题" },
    items: {
      en: [
        { q: "How do I convert images to a PDF?", a: "Add your images, drag them into the order you want, and click Convert to PDF. Each image becomes one page." },
        { q: "Which image formats are supported?", a: "JPG, PNG, WebP, GIF and BMP. (HEIC isn't supported yet.)" },
        { q: "Can I combine many images into one PDF?", a: "Yes — add as many as you like, reorder by dragging, and they're merged into a single PDF in that order." },
        { q: "Is my file uploaded?", a: "No. The PDF is built in your browser — your images never leave your device." },
      ],
      zh: [
        { q: "如何把图片转成 PDF？", a: "添加图片，拖成想要的顺序，点「转换为 PDF」。每张图片占一页。" },
        { q: "支持哪些图片格式？", a: "JPG、PNG、WebP、GIF、BMP。（HEIC 暂不支持。）" },
        { q: "可以把多张图片合成一个 PDF 吗？", a: "可以——想加多少加多少，拖动排序，按该顺序合并成一个 PDF。" },
        { q: "文件会被上传吗？", a: "不会。PDF 在你的浏览器中生成，图片不会离开你的设备。" },
      ],
    },
  },
  "pdf-to-image": {
    title: { en: "PDF to image — FAQ", zh: "PDF 转图片常见问题" },
    items: {
      en: [
        { q: "How do I convert a PDF to JPG or PNG?", a: "Upload the PDF, click the pages you want, choose JPG or PNG, then Convert & download. One page downloads as an image; multiple pages download as a ZIP." },
        { q: "Can I convert only some pages?", a: "Yes. Every page is shown as a thumbnail — click to include or exclude it before converting." },
        { q: "JPG or PNG — which should I pick?", a: "PNG is lossless and great for sharp text and graphics; JPG is smaller and good for photos." },
        { q: "Is my file uploaded?", a: "No. Pages are rendered to images in your browser — your PDF never leaves your device." },
      ],
      zh: [
        { q: "如何把 PDF 转成 JPG 或 PNG？", a: "上传 PDF，点击要转换的页面，选 JPG 或 PNG，然后「转换并下载」。单页直接下载图片，多页打包成 ZIP。" },
        { q: "可以只转部分页面吗？", a: "可以。每一页都以缩略图显示，转换前点击即可选中或排除。" },
        { q: "JPG 还是 PNG？", a: "PNG 无损，适合清晰的文字和图形；JPG 体积更小，适合照片。" },
        { q: "文件会被上传吗？", a: "不会。页面在你的浏览器中渲染成图片，PDF 不会离开你的设备。" },
      ],
    },
  },
  "page-numbers": {
    title: { en: "Add page numbers — FAQ", zh: "PDF 页码常见问题" },
    items: {
      en: [
        { q: "How do I add page numbers to a PDF?", a: "Upload the PDF, pick the position, format, start number and page range, watch the live preview, then Add numbers & download." },
        { q: "Can I start from a specific number or page?", a: "Yes. Set 'Start at' for the first number, and the from/to range for which pages get numbered." },
        { q: "What formats are supported?", a: "Just the number (1), Page 1, 1 / N, or 1 of N — in six positions (top/bottom × left/center/right)." },
        { q: "Is my file uploaded?", a: "No. Numbers are added in your browser — your PDF never leaves your device." },
      ],
      zh: [
        { q: "如何给 PDF 加页码？", a: "上传 PDF，选择位置、格式、起始数字和页码范围，看实时预览，然后「添加页码并下载」。" },
        { q: "可以从指定数字或指定页开始吗？", a: "可以。用「起始数字」设置第一个号码，用「从/到」设置哪些页加页码。" },
        { q: "支持哪些格式？", a: "纯数字(1)、第 1 页、1 / N、1 / 共 N；位置有上/下 × 左/中/右 六种。" },
        { q: "文件会被上传吗？", a: "不会。页码在你的浏览器中添加，PDF 不会离开你的设备。" },
      ],
    },
  },
  "reorder-pages": {
    title: { en: "Reorder PDF pages — FAQ", zh: "PDF 页面排序常见问题" },
    items: {
      en: [
        { q: "How do I reorder pages in a PDF?", a: "Upload the PDF, then drag the page thumbnails into the order you want and click Apply & download." },
        { q: "Can I delete pages too?", a: "Yes. Click the ✕ on any page thumbnail to remove it before downloading." },
        { q: "Does it lose quality or upload my file?", a: "No. Pages keep their original content and everything runs in your browser — the file never leaves your device." },
      ],
      zh: [
        { q: "如何给 PDF 页面排序？", a: "上传 PDF，把页面缩略图拖成你想要的顺序，然后点「应用并下载」。" },
        { q: "可以同时删除页面吗？", a: "可以。点缩略图上的 ✕ 即可在下载前删除该页。" },
        { q: "会降质或上传文件吗？", a: "不会。页面内容不变，全部在浏览器中处理，文件不会离开你的设备。" },
      ],
    },
  },
  "delete-page": {
    title: { en: "Delete PDF pages — FAQ", zh: "删除 PDF 页面常见问题" },
    items: {
      en: [
        { q: "How do I delete pages from a PDF?", a: "Upload the PDF, click the pages you want to remove (they turn red), then click Delete & download." },
        { q: "Can I change my mind?", a: "Yes. Click a marked page again to keep it. You'll always see how many pages remain." },
        { q: "Is my file uploaded?", a: "No. Everything happens in your browser — your PDF never leaves your device." },
      ],
      zh: [
        { q: "如何删除 PDF 里的页面？", a: "上传 PDF，点击要删除的页面（会标红），然后点「删除并下载」。" },
        { q: "点错了能取消吗？", a: "能。再点一次已标记的页面就会保留，界面会实时显示剩余页数。" },
        { q: "文件会被上传吗？", a: "不会。全部在你的浏览器中完成，PDF 不会离开你的设备。" },
      ],
    },
  },
  "rotate-page": {
    title: { en: "Rotate PDF pages — FAQ", zh: "旋转 PDF 页面常见问题" },
    items: {
      en: [
        { q: "How do I rotate pages in a PDF?", a: "Upload the PDF and click a page to turn it 90°. Keep clicking to keep rotating, or use Rotate all 90°." },
        { q: "Can I rotate only some pages?", a: "Yes. Each page rotates independently — click only the pages you need to fix." },
        { q: "Is it private?", a: "Yes. Rotation happens in your browser; your file never leaves your device." },
      ],
      zh: [
        { q: "如何旋转 PDF 页面？", a: "上传 PDF，点击某页即可旋转 90°，连续点继续转，也可用「全部旋转 90°」。" },
        { q: "能只旋转部分页面吗？", a: "能。每页独立旋转，只点你需要纠正的页面即可。" },
        { q: "私密吗？", a: "私密。旋转在你的浏览器中完成，文件不会离开你的设备。" },
      ],
    },
  },
  "merge-pdf": {
    title: { en: "Merge PDF files — FAQ", zh: "合并 PDF 常见问题" },
    items: {
      en: [
        { q: "How do I merge PDF files?", a: "Add your PDFs, drag the file thumbnails into the order you want, then click Merge & download." },
        { q: "Can I control the order?", a: "Yes. Each file shows a thumbnail and a number; drag to reorder before merging." },
        { q: "Are my files uploaded?", a: "No. Merging happens in your browser — your files never leave your device." },
      ],
      zh: [
        { q: "如何合并 PDF 文件？", a: "添加 PDF，把文件缩略图拖成想要的顺序，然后点「合并并下载」。" },
        { q: "能控制合并顺序吗？", a: "能。每个文件都有缩略图和序号，合并前拖动即可调整顺序。" },
        { q: "文件会被上传吗？", a: "不会。合并在你的浏览器中完成，文件不会离开你的设备。" },
      ],
    },
  },
  "split-pdf": {
    title: { en: "Split a PDF — FAQ", zh: "拆分 PDF 常见问题" },
    items: {
      en: [
        { q: "How do I split a PDF?", a: "Upload it, click the ✂ between pages where you want to cut, then Split & download. Each segment becomes a separate PDF, packed into a ZIP." },
        { q: "How do I know what goes into each file?", a: "Pages are tinted and badged by output file, and a live count shows how many files will be created." },
        { q: "Is it private?", a: "Yes. Splitting happens in your browser; your file never leaves your device." },
      ],
      zh: [
        { q: "如何拆分 PDF？", a: "上传后在页面之间点 ✂ 设置切分点，再点「拆分并下载」。每段会变成单独的 PDF，打包成 ZIP。" },
        { q: "怎么看清每个文件包含哪些页？", a: "页面会按所属文件用颜色和「文件N」标注，并实时显示将生成几个文件。" },
        { q: "私密吗？", a: "私密。拆分在你的浏览器中完成，文件不会离开你的设备。" },
      ],
    },
  },
  "add-page": {
    title: { en: "Insert pages into a PDF — FAQ", zh: "向 PDF 插入页面常见问题" },
    items: {
      en: [
        { q: "How do I insert pages into a PDF?", a: "Upload the PDF, click where to insert (at the start or after a page), then choose a PDF or image to insert there and download." },
        { q: "Can I insert an image?", a: "Yes. You can insert another PDF (its pages) or a PNG/JPG image as a new page." },
        { q: "Is my file uploaded?", a: "No. Everything happens in your browser — your files never leave your device." },
      ],
      zh: [
        { q: "如何向 PDF 插入页面？", a: "上传 PDF，点击插入位置（最前或某页之后），再选择要插入的 PDF 或图片，然后下载。" },
        { q: "可以插入图片吗？", a: "可以。你可以插入另一个 PDF（它的页面）或一张 PNG/JPG 图片作为新页面。" },
        { q: "文件会被上传吗？", a: "不会。全部在你的浏览器中完成，文件不会离开你的设备。" },
      ],
    },
  },
  "watermark-pdf": {
    title: { en: "Add a watermark to a PDF — FAQ", zh: "PDF 加水印常见问题" },
    items: {
      en: [
        { q: "How do I add a watermark to a PDF?", a: "Upload the PDF, design a text or image watermark, see it on the live preview, set the pages, then Apply & download." },
        { q: "Can I use an image watermark?", a: "Yes. Switch to Image mode to stamp a logo or picture; you can set position, opacity, and rotation." },
        { q: "Is it private?", a: "Yes. The watermark is applied in your browser; your file never leaves your device." },
      ],
      zh: [
        { q: "如何给 PDF 加水印？", a: "上传 PDF，设计文字或图片水印，在实时预览中查看，选好页码范围，然后「应用并下载」。" },
        { q: "可以用图片水印吗？", a: "可以。切换到「图片」模式即可盖 Logo 或图片，并设置位置、透明度和旋转。" },
        { q: "私密吗？", a: "私密。水印在你的浏览器中应用，文件不会离开你的设备。" },
      ],
    },
  },
  "translate-pdf": {
    title: { en: "Translate a PDF — FAQ", zh: "翻译 PDF 常见问题" },
    items: {
      en: [
        { q: "How do I translate a PDF?", a: "Upload it, pick a target language, and click Translate. The document's text is extracted and translated; you can copy or download the result." },
        { q: "Does it keep the layout?", a: "Not yet — this version translates the text. Layout-preserving translation is on the roadmap." },
        { q: "Is my file uploaded?", a: "The PDF is read in your browser; only the extracted text is sent to the AI to translate. The file itself never leaves your device." },
      ],
      zh: [
        { q: "如何翻译 PDF？", a: "上传 PDF，选择目标语言，点「翻译」。文档文字会被提取并翻译，结果可复制或下载。" },
        { q: "会保留版式吗？", a: "目前不会——此版本翻译文字内容。保留版式的翻译在路线图上。" },
        { q: "文件会被上传吗？", a: "PDF 在你的浏览器中读取，只有提取出的文字会发送给 AI 翻译，文件本身不会离开你的设备。" },
      ],
    },
  },
};

export function ToolFaq({ tool, locale = "en" }: { tool: string; locale?: Locale }) {
  const data = FAQS[tool];
  if (!data) return null;
  const items = data.items[locale] ?? data.items.en;
  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-[color:var(--line)] pt-10">
      <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{data.title[locale] ?? data.title.en}</h2>
      <div className="mt-5 divide-y divide-[color:var(--line)]">
        {items.map((it) => (
          <div key={it.q} className="py-4">
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">{it.q}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{it.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
