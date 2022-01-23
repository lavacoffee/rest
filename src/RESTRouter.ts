import { RESTHandler } from "./RESTHandler"
import { ResponseData } from "undici/types/dispatcher"

const SymbolNodejsUtilInspectCustom = Symbol.for("nodejs.util.inspect.custom")

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const methods = ["get", "post", "delete", "patch", "put"] as const
const reflectors = [
    "toString",
    "valueOf",
    "inspect",
    "constructor",
    Symbol.toPrimitive,
    SymbolNodejsUtilInspectCustom
] as const

/** Router interface */
export type IRouter = {
    (query: Record<string, string>): IRouter
    readonly get: () => Promise<ResponseData>
    readonly post: (body?: unknown) => Promise<ResponseData>
    readonly delete: (body?: unknown) => Promise<ResponseData>
    readonly patch: (body?: unknown) => Promise<ResponseData>
    readonly put: (body?: unknown) => Promise<ResponseData>
    readonly toString: () => string
    readonly valueOf: () => string
    readonly inspect: () => string
    readonly constructor: () => string
    readonly [Symbol.toPrimitive]: () => string
    readonly [SymbolNodejsUtilInspectCustom]: () => string
} & {
    readonly [route: string]: IRouter
}

/** REST route builder */
export function RESTRouter(rest: RESTHandler): IRouter
export function RESTRouter(rest: RESTHandler): unknown {
    let query: Record<string, string> | undefined
    const route = [""]

    const handler: ProxyHandler<typeof noop> = {
        get(_, prop) {
            if (reflectors.includes(prop as typeof reflectors[number])) {
                return () => `${route.join("/")}${query ? `?${new URLSearchParams(query)}` : ""}`
            }

            if (methods.includes(prop as typeof methods[number])) {
                return (body?: unknown) => rest.request(
                    prop as string,
                    `${route.join("/")}${query ? `?${new URLSearchParams(query)}` : ""}`,
                    body
                )
            }

            route.push(prop as string)
            return new Proxy(noop, handler)
        },
        apply(_, __, args) {
            query = args[0]
            return new Proxy(noop, handler)
        }
    }

    return new Proxy(noop, handler)
}
