import Router, { StandardRange, PathSet, GetRoute, Path, Atom, Ref, ErrorSentinel, PathValue, JSONGraph, JSONGraphEnvelope, RouterOptions } from '@sayari/falcor-router'
import { from, Observable, of, throwError } from 'rxjs'
import { range } from 'ramda'
import { catchError, delay, map } from 'rxjs/operators'


/**
 * Mock Services
 */
const labelService = (ids: string[]): Observable<{ id: string, label: string }> => {
  return throwError('500')
  // return from(ids).pipe(
  //   map<string, { id: string, label: string }>((id) => {
  //     return { id, label: `label for entity ${id}` }
  //   }),
  //   delay(1000)
  // )
}


/**
 * Router
 */
const BaseRouter = Router.createClass([
  {
    route: 'application.name',
    get: () => {
      return [{
        path: ['application', 'name'],
        value: { $type: 'atom', value: 'Hello World Application' }
      }, {
        path: ['application', 'version'],
        value: { $type: 'atom', value: '0.1' }
      }]
    }
  },
  {
    route: 'sayari.resource.entity[{keys}].label',
    get: (path) => {
      // return path[3].map((id) => {
      //   return {
      //     path: ['sayari', 'resource', 'entity', id, 'label'],
      //     value: { $type: 'atom', value: `entity label for entity ${id}` },
      //   }
      // })
      return labelService(path[3]).pipe(
        map<{ id: string, label: string }, PathValue>(({ id, label }) => {
          return {
            path: ['sayari', 'resource', 'entity', id, 'label'],
            value: { $type: 'atom', value: label },
          }
        }),
        catchError((err) => {
          return from(path[3]).pipe(
            map<string, PathValue>((id) => {
              return {
                path: ['sayari', 'resource', 'entity', id, 'label'],
                value: { $type: 'error', value: err },
              }
            })
          )
        })
      )
    }
  },
  {
    route: 'sayari.resource.entity[{keys}][{keys}][{ranges}].value',
    get: (path) => {
      const pathValues = (path[3] as string[]).reduce<PathValue[]>((pathValues, id) => {
        path[4].forEach((field) => {
          path[5].forEach((pathRange) => {
            const { from, to } = pathRange

            range(from, to + 1).forEach((index) => {
              pathValues.push({
                path: ['sayari', 'resource', 'entity', id, field, index, 'value'],
                value: { $type: 'atom', value: `entity value for field ${field} at index ${index}` },
              })
            })
          })
        })
        return pathValues
      }, [])

      return pathValues
    }
  }
])


class FalcorRouter extends BaseRouter {
  get<T = object>(pathSets: PathSet[]) {
    return from(super.get<T>(pathSets))
  }

  set<T = object>(jsonGraphEnvelope: JSONGraphEnvelope) {
    return from(super.set<T>(jsonGraphEnvelope))
  }

  call<T = object>(path: Path, args: unknown[], pathSuffixes?: PathSet[], thisPaths?: PathSet[]) {
    return from(super.call<T>(path, args, pathSuffixes, thisPaths))
  }
}


export const CreateFalcorRouter = (options?: RouterOptions) => new FalcorRouter(options)
