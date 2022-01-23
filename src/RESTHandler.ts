import { Pool } from "undici"
import { IRouter, RESTRouter } from "./RESTRouter"
import { HttpMethod, RequestOptions, ResponseData } from "undici/types/dispatcher"
import { RoutePlannerStatus, Plugins, LoadResult, Track, Tracks } from "@lavacoffee/types/dist/rest"

const URLRegex = /^(?:http|https):\/\//

function validateOptions(options: RESTOptions) {
    if (
        typeof options !== "object" ||
        options === null
    ) throw new TypeError("'options' must exist and be an object")

    if (
        typeof options.host !== "string" ||
        !options.host
    ) throw new TypeError("'options.host' must exist and be a non-empty string")

    if (
        typeof options.password !== "string" ||
        !options.password
    ) throw new TypeError("'options.password' must exist and be a non-empty string")

    if (
        options.port !== undefined &&
        (
            typeof options.port !== "number" ||
            isNaN(options.port)
        )
    ) throw new TypeError("'options.port' must be a valid number")

    if (
        options.secure !== undefined &&
        typeof options.secure !== "boolean"
    ) throw new TypeError("'options.secure' must be a boolean")

    if (
        options.requestTimeout !== undefined &&
        (
            typeof options.requestTimeout !== "number" ||
            isNaN(options.requestTimeout)
        )
    ) throw new TypeError("'options.requestTimeout' must be a valid number")

    if (
        options.maxConnections !== undefined &&
        (
            options.maxConnections !== null &&
            (
                typeof options.maxConnections !== "number" ||
                isNaN(options.maxConnections)
            )
        )
    ) throw new TypeError("'options.maxConnections' must be null or a valid number")
}

/** REST handler instance */
export class RESTHandler {
    /** The rest handler options */
    public options!: RESTOptions
    /** The rest handler connection pool */
    public pool: Pool
    /** Totat of request calls since constructed */
    public calls = 0

    public constructor(options: RESTOptions) {
        validateOptions(options)

        Object.defineProperty(this, "options", { value: options })
        this.pool = new Pool(this.url, { connections: this.options.maxConnections })
    }

    /** Rest api router */
    public get router(): IRouter {
        return RESTRouter(this)
    }

    /** The rest api url */
    public get url(): string {
        const protocol = this.options.secure ? "https" : "http"
        const port = this.options.port !== undefined ? `:${this.options.port}` : ""
        return `${protocol}://${this.options.host}${port}`
    }

    /** Load tracks from query */
    public async loadTracks(query: SearchQuery): Promise<LoadResult> {
        if (
            typeof query !== "object" ||
            query === null
        ) throw new TypeError("'query' must present and be an object")

        if (
            typeof query.query !== "string"
        ) throw new TypeError("'query.query' must present and be a string")

        if (
            query.source !== undefined &&
            (
                typeof query.source !== "string" ||
                !query.source
            )
        ) throw new TypeError("'query.source' must be a non-empty string")

        const source = query.source ?? "ytsearch"
        let search = query.query

        if (!URLRegex.test(search)) search = `${source}:${search}`

        const result = await this.router.loadtracks({ identifier: search }).get()
        return result.body.json()
    }

    /** Decode base64 encoded serialized track */
    public async decodeTrack(track: string): Promise<Track> {
        if (
            typeof track !== "string" ||
            !track
        ) throw new TypeError("'track' must present and be a non-empty string")

        const result = await this.router.decodetrack({ track }).get()

        return {
            track,
            info: await result.body.json()
        }
    }

    /** Decode base64 encoded serialized tracks */
    public async decodeTracks(tracks: string[]): Promise<Tracks> {
        if (!Array.isArray(tracks)) throw new TypeError("'tracks' must present and be a string array")

        const result = await this.router.decodetracks.post(tracks)
        return result.body.json()
    }

    /** Get the lavalink server plugins */
    public async plugins(): Promise<Plugins> {
        const result = await this.router.plugins.get()
        return result.body.json()
    }

    /** Get the lavalink server routeplanner status */
    public async routeplannerStatus(): Promise<RoutePlannerStatus> {
        const result = await this.router.routeplanner.status.get()
        return result.body.json()
    }

    /** Unmark a failed address */
    public async unmarkAddress(address: string): Promise<boolean> {
        if (
            typeof address !== "string" ||
            !address
        ) throw new TypeError("'address' must present and be a non-empty string")

        const result = await this.router.routeplanner.free.address.post({ address })
        return result.statusCode === 204
    }

    /** Unmark all failed address */
    public async unmarkAllAddress(): Promise<boolean> {
        const result = await this.router.routeplanner.free.all.post()
        return result.statusCode === 204
    }

    /** Do api request to the server */
    public async request(method: string, route: string, body?: unknown): Promise<ResponseData> {
        const headers: Record<string, string> = {
            Authorization: this.options.password
        }

        const options: RequestOptions = {
            path: route,
            method: method.toUpperCase() as HttpMethod,
            headersTimeout: this.options.requestTimeout,
            headers
        }

        if (body !== undefined) {
            headers["Content-Type"] = "application/json"
            options.body = JSON.stringify(body)
        }

        const result = await this.pool.request(options)
        this.calls++

        if (result.statusCode >= 400) throw new Error(`Request failed with response code: ${result.statusCode}`)

        return result
    }
}

/** REST handler options */
export interface RESTOptions {
    /** The lavalink server host url */
    host: string
    /** THe lavalink server password */
    password: string
    /** THe lavalink server port */
    port?: number
    /** Whether to use secure protocol */
    secure?: boolean
    /** Timeout for api calls */
    requestTimeout?: number
    /** The max http connections that can be opened at once, null for unlimited */
    maxConnections?: null | number
}

/** Search Query for /loadtracks endpoint */
export interface SearchQuery {
    /** Query to search for */
    query: string
    /** The source to search from */
    source?: string
}
