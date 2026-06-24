// 占位组件：替代"有页面但功能是桩、会下载空文件"的工具页。诚实地显示"即将推出"，不再假装处理。
import { toHant } from "@/lib/zh-hant";

type Props = { locale?: "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "zh-Hant"; name: string; nameZh?: string; nameEs?: string; namePt?: string; nameFr?: string; nameJa?: string; nameDe?: string };

export function ComingSoonTool({ locale = "en", name, nameZh, nameEs, namePt, nameFr, nameJa, nameDe }: Props) {
  const hant = locale === "zh-Hant";
  // zh-Hant content is the Traditional conversion of whatever the zh branch renders.
  const zh = locale === "zh" || hant;
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const ja = locale === "ja";
  const de = locale === "de";
  const zhT = (s: string) => (hant ? toHant(s) : s);
  const label = es ? (nameEs ?? name) : zh ? zhT(nameZh ?? name) : pt ? (namePt ?? nameEs ?? name) : fr ? (nameFr ?? nameEs ?? name) : ja ? (nameJa ?? name) : de ? (nameDe ?? name) : name;
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center sm:py-36">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface-subtle)] text-2xl">🛠️</div>
      <h1 className="mt-6 text-[26px] font-semibold tracking-[-0.014em]">{label}</h1>
      <p className="mt-3 text-[15px] font-semibold text-[color:var(--accent-strong)]">{zh ? zhT("即将推出") : es ? "Próximamente" : pt ? "Em breve" : fr ? "Bientôt disponible" : ja ? "近日公開" : de ? "Demnächst verfügbar" : "Coming soon"}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">
        {zh
          ? zhT("这个工具正在开发中，暂未上线。先去看看我们已经能用的工具吧。")
          : es
          ? "Esta herramienta está en desarrollo y aún no está disponible. Mientras tanto, prueba las herramientas que ya están listas."
          : pt
          ? "Esta ferramenta está em desenvolvimento e ainda não está disponível. Enquanto isso, experimente as ferramentas que já estão prontas."
          : fr
          ? "Cet outil est en cours de développement et n'est pas encore disponible. En attendant, essayez les outils déjà prêts."
          : ja
          ? "このツールは現在開発中で、まだご利用いただけません。その間、すでにご利用可能なツールをお試しください。"
          : de
          ? "Dieses Tool befindet sich noch in der Entwicklung und ist noch nicht verfügbar. Probieren Sie in der Zwischenzeit die Tools aus, die schon bereitstehen."
          : "This tool is under construction and not available yet. In the meantime, try the tools that are ready."}
      </p>
      <a
        href={hant ? "/zh-Hant/" : zh ? "/zh/" : es ? "/es/" : pt ? "/pt/" : fr ? "/fr/" : ja ? "/ja/" : de ? "/de/" : "/"}
        className="mt-7 inline-flex min-h-11 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:bg-[color:var(--accent-hover)]"
      >
        {zh ? zhT("查看全部工具") : es ? "Ver todas las herramientas" : pt ? "Ver todas as ferramentas" : fr ? "Voir tous les outils" : ja ? "すべてのツールを見る" : de ? "Alle Tools ansehen" : "Browse all tools"}
      </a>
    </div>
  );
}
