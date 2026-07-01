import { AppShell } from "@/components/AppShell";
import { ParametresForm } from "@/components/parametres/ParametresForm";
import { getParametres } from "@/lib/parametres";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const parametres = await getParametres();

  return (
    <AppShell
      title="Paramètres"
      subtitle="Informations du salon et intégrations"
    >
      <div className="mx-auto max-w-xl">
        <ParametresForm initial={parametres} />
      </div>
    </AppShell>
  );
}
