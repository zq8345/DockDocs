export function BrandNav({ text = "Privacy-first PDF tools" }: { text?: string }) {
  return (
    <div className="hidden rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] sm:block">
      {text}
    </div>
  );
}
