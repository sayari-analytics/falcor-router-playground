import { Atom, ErrorSentinel, JSONGraphEnvelope, Path, PathSet, Ref, Router, RouterOptions } from '@sayari/falcor-router'
import { NextFunction, Request, Response } from 'express'


export const $atom = <T>(value: T): Atom<T> => ({ $type: 'atom', value })


export const $ref = (path: Path): Ref => ({ $type: 'ref', value: path })


export const $error = (err: unknown): ErrorSentinel => ({ $type: 'error', value: err })


const FalcorParams = new Set(['paths', 'jsonGraph', 'path', 'arguments', 'pathSuffixes', 'thisPaths'])


export const falcorMiddleware = (routerFactory: (options?: RouterOptions) => Router, options?: RouterOptions) => (req: Request, res: Response, next: NextFunction) => {
  const router = routerFactory(options)

  try {
    const params = req.method === 'GET' ? (
      Object.entries(req.query as { [key: string]: string }).reduce<{ [key: string]: unknown }>((params, [key, value]) => {
        params[key] = FalcorParams.has(key) ? JSON.parse(value) : value
        return params
      }, {})
    ) : req.method === 'POST' ? (
      req.body
    ) : {}

    if (params.method === 'get') {
      return router.get(params.paths as PathSet[]).subscribe({
        next: (jsonGraphEnvelope) => res.status(200).json(jsonGraphEnvelope),
        error: (error) => next(error),
      })
    } else if (params.method === 'set') {
      return router.set(params.jsonGraph as JSONGraphEnvelope).subscribe({
        next: (jsonGraphEnvelope) => res.status(200).json(jsonGraphEnvelope),
        error: (error) => next(error),
      })
    } else if (params.method === 'call') {
      return router.call(
        params.path as Path,
        params.arguments as unknown[],
        params.pathSuffixes as PathSet[],
        params.thisPaths as PathSet[]
      ).subscribe({
        next: (jsonGraphEnvelope) => res.status(200).json(jsonGraphEnvelope),
        error: (error) => next(error),
      })
    }

    const errorMessage = params.method === undefined ?
      'Missing Falcor method' :
      `Unknown Falcor method ${params.method}`

    console.error(errorMessage)
    return next({ code: 400, message: errorMessage })
  } catch (e) {
    console.error(e)
    return next({ code: 400, message: 'Malformed falcor request params' })
  }
}
