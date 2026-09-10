import { MEDICAL_DISCLAIMER } from '@/constants'

/** Required on every chat / health-advice screen (requirement AI-04) */
export function MedicalDisclaimer() {
  return (
    <p className="border-warning/30 bg-warning/5 rounded-lg border px-3 py-2 text-xs text-neutral-700">
      {MEDICAL_DISCLAIMER}
    </p>
  )
}
