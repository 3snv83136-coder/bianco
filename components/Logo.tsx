import Image from "next/image";

type LogoProps = {
  className?: string;
  variant?: "full" | "mark";
};

/**
 * Placeholder logo — remplacer `public/logo.png` quand Salomé envoie le fichier.
 * Tant que le logo n'existe pas, affiche le wordmark typographique Bianco.
 */
export function Logo({ className = "", variant = "full" }: LogoProps) {
  const hasLogoFile = false; // passer à true après ajout de public/logo.png

  if (hasLogoFile) {
    return (
      <Image
        src="/logo.png"
        alt="Bianco Esthétique"
        width={variant === "mark" ? 40 : 160}
        height={variant === "mark" ? 40 : 48}
        className={className}
        priority
      />
    );
  }

  if (variant === "mark") {
    return (
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary ${className}`}
        aria-hidden
      >
        B
      </div>
    );
  }

  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <span className="font-display text-2xl font-semibold tracking-tight text-dark">
        Bianco
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
        Esthétique
      </span>
    </div>
  );
}
