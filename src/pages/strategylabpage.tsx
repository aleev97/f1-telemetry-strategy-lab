import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { PageHeader } from '@/components/ui/pageheader'
import { StrategyForm } from '@/features/strategy/strategyform'
import { StrategyStatus } from '@/features/strategy/strategystatus'
import { DEFAULT_VALUES, strategySchema, type StrategyFormValues } from '@/features/strategy/schema'
import { StrategyResults } from '@/features/strategy/strategyresults'

export default function StrategyLabPage() {
  const methods = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange', // valida mientras se escribe
  })

  return (
    <>
      <PageHeader
        eyebrow="Strategy Lab"
        title="Calculadora de estrategia"
        description="Define la carrera, los neumáticos y tu plan de paradas. La validación es en tiempo real."
      />

      <FormProvider {...methods}>
        {/* Sin submit: el cálculo será en vivo. preventDefault evita que Enter recargue la página */}
        <form
          noValidate
          onSubmit={(e) => e.preventDefault()}
          className="grid gap-6 lg:grid-cols-2 lg:items-start"
        >
          <StrategyForm />
          <StrategyStatus />
        </form>
        <div className="mt-6">
          <StrategyResults />
        </div>
      </FormProvider>
    </>
  )
}