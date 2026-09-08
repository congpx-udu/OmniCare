import { MEDICAL_DISCLAIMER } from '@/constants'

/** Required on every chat / health-advice screen (requirement AI-04) */
export function MedicalDisclaimer() {
  return (
    <p className="rounded-md bg-warning/10 px-3 py-2 text-xs text-gray-700">{MEDICAL_DISCLAIMER}</p>
  )
}
