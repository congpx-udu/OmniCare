import { z } from 'zod'

const coordsQuery = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
})

const cityQuery = z.object({
  city: z.string().trim().min(2, 'Tên thành phố quá ngắn').max(80),
})

/** GET /context/weather?lat=&lon= hoặc ?city= */
export const weatherQuerySchema = z.object({
  query: z.union([coordsQuery, cityQuery], {
    error: 'Cần lat & lon hoặc city',
  }),
})

export type WeatherQuery = z.infer<typeof weatherQuerySchema>['query']
