import { RESTHandler, SearchQuery } from "./RESTHandler"
import { LoadResult, Track, Tracks } from "@lavacoffee/types/dist/rest"

/** REST handler load balancer */
export abstract class RESTManager {
    /** Get the best REST handler to use */
    public abstract get bestRESTHandler(): RESTHandler

    /** Get the best REST handler and also validate it */
    public restHandler(methodCheck?: string): RESTHandler {
        const restHandler = this.bestRESTHandler

        if (
            typeof restHandler !== "object" ||
            restHandler === null
        ) throw new Error("No rest handler is found")

        if (
            typeof methodCheck !== "undefined" &&
            typeof methodCheck === "string" &&
            methodCheck
        ) {
            if (
                typeof Reflect.get(restHandler, methodCheck) !== "function"
            ) throw new TypeError(`No method named '${methodCheck}' found in the REST handler`)
        }

        return restHandler
    }

    /** Load tracks from query */
    public loadTracks(query: SearchQuery): Promise<LoadResult> {
        const restHandler = this.restHandler("loadTracks")
        return restHandler.loadTracks(query)
    }

    /** Decode base64 encoded serialized track */
    public decodeTrack(track: string): Promise<Track> {
        const restHandler = this.restHandler("decodeTrack")
        return restHandler.decodeTrack(track)
    }

    /** Decode base64 encoded serialized tracks */
    public decodeTracks(tracks: string[]): Promise<Tracks> {
        const restHandler = this.restHandler("decodeTracks")
        return restHandler.decodeTracks(tracks)
    }
}
