import type { Request, Response } from 'express'
import * as contextService from '../services/context.service.js'
import { ok } from '../utils/response.js'
import type { WeatherQuery } from '../validators/context.validator.js'

export async function weather(_req: Request, res: Response) {
  // validate() đã parse query; Express 5 không cho gán lại req.query nên parse lại từ res.locals
  const query = res.locals.query as WeatherQuery
  ok(res, await contextService.getWeather(query))
}
