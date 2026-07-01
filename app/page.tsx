import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const MODULES = [
  {
    href: "/seances/nouvelle",
    emoji: "📅",
    label: "Nouvelle séance",
    desc: "Démarrer un rendez-vous",
    featured: true as const,
  },
  {
    href: "/prestations",
    emoji: "✨",
    label: "Prestations",
    desc: "Catalogue des soins",
    featured: true as const,
  },
  {
    href: "/clients",
    emoji: "👤",
    label: "Clientes",
    desc: "Fiches & historique",
    featured: true as const,
  },
  {
    href: "/seances",
    emoji: "📝",
    label: "Séances",
    desc: "Mémorandums en cours",
    featured: false as const,
  },
  {
    href: "/historique",
    emoji: "📚",
    label: "Historique",
    desc: "Séances passées",
    featured: false as const,
  },
  {
    href: "/diffusion",
    emoji: "📤",
    label: "Diffusion",
    desc: "Mail, site & GMB",
    featured: false as const,
  },
  {
    href: "/avis",
    emoji: "⭐",
    label: "Avis Google",
    desc: "Demandes & relances",
    featured: false as const,
  },
  {
    href: "/parametres",
    emoji: "⚙️",
    label: "Paramètres",
    desc: "Salon & intégrations",
    featured: false as const,
  },
];

export default function HomePage() {
  const featured = MODULES.filter((m) => m.featured);
  const rest = MODULES.filter((m) => !m.featured);

  return (
    <AppShell>
      <section className="mb-8 rounded-2xl border border-primary/15 bg-gradient-to-br from-white to-primary/5 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Maison de Beauté — Hyères
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-dark sm:text-4xl">
          Votre bien-être, tout simplement
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dark/70">
          CRM Bianco Esthétique — gérez vos prestations, rédigez les
          mémorandums de séance (réalisé & conseils) et envoyez les demandes
          d&apos;avis Google à vos clientes.
        </p>
      </section>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {featured.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group relative min-h-[120px] overflow-hidden rounded-2xl bg-dark p-4 text-white shadow-card transition hover:scale-[1.01] hover:shadow-soft"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-1 -top-1 text-5xl opacity-15"
            >
              {m.emoji}
            </span>
            <div className="relative z-10">
              <div className="text-base font-bold">{m.label}</div>
              <p className="mt-1 text-xs text-white/75">{m.desc}</p>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-primary" />
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group relative min-h-[100px] overflow-hidden rounded-xl border border-primary/10 bg-white p-4 transition hover:border-primary/30 hover:shadow-soft"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-1 -top-1 text-4xl opacity-10"
            >
              {m.emoji}
            </span>
            <div className="relative z-10">
              <div className="text-sm font-bold text-dark">{m.label}</div>
              <p className="mt-0.5 text-[11px] text-dark/60">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
