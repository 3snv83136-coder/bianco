import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/prestations", label: "Prestations" },
  { href: "/clients", label: "Clientes" },
  { href: "/seances", label: "Séances" },
  { href: "/historique", label: "Historique" },
  { href: "/diffusion", label: "Diffusion" },
  { href: "/produits", label: "Produits" },
  { href: "/parametres", label: "Paramètres" },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-20 border-b border-primary/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-dark/80 transition hover:bg-primary/5 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="text-right text-[11px] text-dark/50">
            <div className="font-medium text-dark/70">Hyères</div>
            <div>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        </div>
      </header>

      {(title || subtitle) && (
        <div className="border-b border-primary/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            {title && (
              <h1 className="font-display text-3xl font-semibold text-dark">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-dark/70">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-primary/10 bg-white/95 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5 gap-0">
          {NAV.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-2.5 text-[10px] font-medium text-dark/60 hover:text-primary"
            >
              <span className="text-lg leading-none">
                {item.href === "/"
                  ? "🏠"
                  : item.href === "/prestations"
                    ? "✨"
                    : item.href === "/clients"
                      ? "👤"
                      : item.href === "/seances"
                        ? "📅"
                        : "📚"}
              </span>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
