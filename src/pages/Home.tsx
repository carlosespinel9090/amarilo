import { Card } from '../components/Card'
import { InfoBadge } from '../components/InfoBadge'

export function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Inicio
      </h1>

      <InfoBadge
        title="Componente en SCSS"
        subtitle="Usa variables y mixins de src/styles"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          title="Componente Card"
          description="Haz click en esta tarjeta para abrir la modal."
        />
        <Card
          title="Otro ejemplo"
          description="Cada Card maneja su propio estado de modal."
        />
      </div>
    </div>
  )
}
