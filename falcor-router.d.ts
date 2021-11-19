declare module '@sayari/falcor-router' {
  import { Observable } from 'rxjs'

  export type Key = string | number

  export type Range = {
    from?: number
    to: number
  }

  export type StandardRange = {
    from: number
    to: number
  }

  export type KeySet = Key | Range | Key[] | Range[]

  export type Path = Key[]

  export type PathSet = KeySet[]

  export type JSONEnvelope<T> = {
    json: T
  }

  export type RouterOptions = {
    debug?: boolean
    maxPaths?: number
    maxRefFollow?: number
  }

  export type JSONGraph<T = object> = T

  export type JSONGraphEnvelope<T = object> = {
    jsonGraph: JSONGraph<T>
    paths?: Array<PathSet>
    invalidate?: Array<PathSet>
  }

  export class DataSource {
    /**
     * The get method retrieves values from the DataSource's associated JSONGraph object.
     */
    get<T = object>(paths: PathSet[]): Observable<JSONGraphEnvelope<T>>;

    /**
     * The set method accepts values to set in the DataSource's associated JSONGraph object.
     */
    set<T = object>(jsonGraphEnvelope: JSONGraphEnvelope): Observable<JSONGraphEnvelope<T>>;

    /**
     * Invokes a function in the DataSource's JSONGraph object.
     */
    call<T = object>(functionPath: Path, args?: unknown[], refSuffixes?: PathSet[], thisPaths?: PathSet[]): Observable<JSONGraphEnvelope<T>>;
  }

  export default class AbstractRouter extends DataSource {

    constructor(routes: Array<Route>, options?: RouterOptions);

    /**
     * When a route misses on a call, get, or set the unhandledDataSource will
     * have a chance to fulfill that request.
     **/
    public routeUnhandledPathsTo(dataSource: DataSource): void;

    // static createClass(routes?: Array<Route>): typeof Router;
    static createClass<T extends Route = Route>(routes: T[]): typeof Router
  }

  export class Router extends AbstractRouter {
    constructor(options?: RouterOptions);
  }

  export type GetRoute<P extends PathSet = PathSet> = {
    route: string
    get(pathset: P): PathValue | PathValue[] | Promise<PathValue | PathValue[]> | Observable<PathValue | PathValue[]>
  }

  export type SetRoute = {
    route: string
    set(jsonGraph: JSONGraph): PathValue | PathValue[] | Promise<PathValue | PathValue[]> | Observable<PathValue | PathValue[]>
  }

  export type CallRoute<P extends PathSet = PathSet> = {
    route: string
    call(callPath: P, args: unknown[]): CallRouteResult | Promise<CallRouteResult> | Observable<CallRouteResult>
  }

  export type CallRouteResult = PathValue | PathValue[] | JSONGraphEnvelope;

  export type Route<P extends PathSet = PathSet> = GetRoute<P> | SetRoute | CallRoute<P>;

  export type Primitive = string | boolean | number | undefined | null;

  export type TerminalSentinel<T = unknown> = Atom<T> | ErrorSentinel

  export type Atom<T = unknown> = { $type: 'atom', value: T, $language?: string, $dataType?: string, [meta: string]: unknown }

  export type Ref = { $type: 'ref', value: Path }

  export type ErrorSentinel = { $type: 'error', value: unknown }

  export type Sentinel = Atom | Ref | ErrorSentinel

  export type PathValue = {
    path: Path
    value: Atom | Ref | ErrorSentinel
  } | {
    path: Path
    invalidated: true
  }
}
