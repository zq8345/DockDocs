// 占位组件：替代"有页面但功能是桩、会下载空文件"的工具页。诚实地显示"即将推出"，不再假装处理。
type Props = { locale?: "en" | "zh" | "es" | "pt" | "fr"; name: string; nameZh?: string; nameEs?: string; namePt?: string; nameFr?: string };

export function ComingSoonTool({ locale = "en", name, nameZh, nameEs, namePt, nameFr }: Props) {
  const zh = locale === "zh";
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const label = es ? (nameEs ?? name) : zh ? (nameZh ?? name) : pt ? (namePt ?? nameEs ?? name) : fr ? (nameFr ?? nameEs ?? name) : name;
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center sm:py-36">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface-subtle)] text-2xl">🛠️</div>
      <h1 className="mt-6 text-[26px] font-semibold tracking-[-0.014em]">{label}</h1>
      <p className="mt-3 text-[15px] font-semibold text-[color:var(--accent-strong)]">{zh ? "即将推出" : es ? "Próximamente" : pt ? "Em breve" : fr ? "Bientôt disponible" : "Coming soon"}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">
        {zh
          ? "这个工具正在开发中，暂未上线。先去看看我们已经能用的工具吧。"
          : es
          ? "Esta herramienta está en desarrollo y aún no está disponible. Mientras tanto, prueba las herramientas que ya están listas."
          : pt
          ? "Esta ferramenta está em desenvolvimento e ainda não está disponível. Enquanto isso, experimente as ferramentas que já estão prontas."
          : fr
          ? "Cet outil est en cours de développement et n'est pas encore disponible. En attendant, essayez les outils déjà prêts."
          : "This tool is under construction and not available yet. In the meantime, try the tools that are ready."}
      </p>
      <a
        href={zh ? "/zh/" : es ? "/es/" : pt ? "/pt/" : fr ? "/fr/" : "/"}
        className="mt-7 inline-flex min-h-11 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:bg-[color:var(--accent-hover)]"
      >
        {zh ? "查看全部工具" : es ? "Ver todas las herramientas" : pt ? "Ver todas as ferramentas" : fr ? "Voir tous les outils" : "Browse all tools"}
      </a>
    </div>
  );
}
