import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { NumberField } from '@/components/ui/numberfield'
import { Panel } from '@/components/ui/panel'
import { TYRES } from '@/lib/tyres'
import { DEFAULT_VALUES, DRY_COMPOUNDS, MAX_STINTS, type StrategyFormValues } from './schema'

/** Tres discos de neumático. Debajo hay radios nativos: teclado y lectores de pantalla gratis */
function TyrePicker({ index }: { index: number }) {
  const { register } = useFormContext<StrategyFormValues>()

  return (
    <fieldset>
      <legend className="mb-1.5 text-[10px] uppercase tracking-widest text-muted">
        Stint {index + 1} · compuesto
      </legend>
      <div className="flex gap-3">
        {DRY_COMPOUNDS.map((c) => (
          <label key={c} className="cursor-pointer" title={TYRES[c].label}>
            <input
              type="radio"
              value={c}
              className="peer sr-only"
              {...register(`stints.${index}.compound`)}
            />
            <span
              style={{ ['--tyre' as string]: TYRES[c].color }}
              className="flex size-11 items-center justify-center rounded-full border-4 border-[var(--tyre)] text-sm font-bold text-[var(--tyre)] opacity-50 transition-all hover:opacity-80 peer-checked:scale-110 peer-checked:bg-[var(--tyre)] peer-checked:text-[#0B0E14] peer-checked:opacity-100 peer-checked:shadow-[0_0_16px_var(--tyre)] peer-focus-visible:ring-2 peer-focus-visible:ring-white"
            >
              {TYRES[c].letter}
            </span>
            <span className="sr-only">{TYRES[c].label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function StrategyForm() {
  const {
    register,
    control,
    reset,
    formState: { errors },
  } = useFormContext<StrategyFormValues>()

  const { fields, append, remove } = useFieldArray({ control, name: 'stints' })

  const raceHasError = Boolean(errors.raceLaps || errors.baseLapSec || errors.pitLossSec)

  return (
    <div className="space-y-6">
      <Panel title="Carrera" led={raceHasError ? 'warn' : 'ok'}>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            label="Vueltas"
            unit="vueltas"
            step="1"
            error={errors.raceLaps?.message}
            {...register('raceLaps', { valueAsNumber: true })}
          />
          <NumberField
            label="Vuelta base"
            unit="s"
            step="0.01"
            error={errors.baseLapSec?.message}
            {...register('baseLapSec', { valueAsNumber: true })}
          />
          <NumberField
            label="Tiempo en boxes"
            unit="s"
            step="0.1"
            error={errors.pitLossSec?.message}
            {...register('pitLossSec', { valueAsNumber: true })}
          />
        </div>
      </Panel>

      <Panel title="Neumáticos · supuestos editables" led={errors.tyres ? 'warn' : 'ok'}>
        <div className="space-y-4">
          {DRY_COMPOUNDS.map((c) => (
            <div key={c} className="grid grid-cols-[auto_1fr_1fr] items-start gap-3">
              <span
                className="mt-6 flex size-10 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: TYRES[c].color, color: '#0B0E14' }}
                title={TYRES[c].label}
              >
                {TYRES[c].letter}
              </span>
              <NumberField
                label={`${TYRES[c].label} · ritmo vs. base`}
                unit="s"
                step="0.01"
                error={errors.tyres?.[c]?.offsetSec?.message}
                {...register(`tyres.${c}.offsetSec`, { valueAsNumber: true })}
              />
              <NumberField
                label="Degradación"
                unit="s/vuelta"
                step="0.01"
                error={errors.tyres?.[c]?.degSec?.message}
                {...register(`tyres.${c}.degSec`, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Plan de paradas"
        led={errors.stints ? 'warn' : 'ok'}
        aside={
          <span className="text-[11px] uppercase tracking-widest text-muted">
            {fields.length}/{MAX_STINTS} stints
          </span>
        }
      >
        <div className="space-y-5">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
              <TyrePicker index={index} />

              <NumberField
                label="Vueltas"
                unit="vueltas"
                step="1"
                error={errors.stints?.[index]?.laps?.message}
                {...register(`stints.${index}.laps`, { valueAsNumber: true })}
              />

              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
                aria-label={`Quitar el stint ${index + 1}`}
                className="mt-6 rounded-lg border border-white/10 p-2.5 text-muted transition-colors hover:text-white disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => append({ compound: 'MEDIUM', laps: 10 })}
            disabled={fields.length >= MAX_STINTS}
            className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs uppercase tracking-widest transition-shadow hover:glow-team disabled:opacity-30"
          >
            <Plus className="size-3.5" />
            Agregar stint
          </button>

          <button
            type="button"
            onClick={() => reset(DEFAULT_VALUES)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted transition-colors hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            Restablecer
          </button>
        </div>
      </Panel>
    </div>
  )
}