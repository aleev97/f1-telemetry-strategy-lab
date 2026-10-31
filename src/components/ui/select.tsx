import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder: string
  disabled?: boolean
}

export function Select({ label, value, onChange, options, placeholder, disabled }: SelectProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border border-white/10 bg-surface py-2.5 pl-3 pr-9 text-sm [color-scheme:dark] focus:border-team focus:outline-none disabled:opacity-50"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </span>
    </label>
  )
}