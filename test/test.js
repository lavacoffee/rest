const { RESTHandler } = require("../")
const config = require("./config.json")
const assert = require("assert/strict")

describe("@lavacoffee/rest", function() {
    const rest = new RESTHandler(config)

    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    const loadResult = {
        "loadType": "TRACK_LOADED",
        "playlistInfo": {},
        "tracks": [
            {
                "track": "QAAAoQIAPFJpY2sgQXN0bGV5IC0gTmV2ZXIgR29ubmEgR2l2ZSBZb3UgVXAgKE9mZmljaWFsIE11c2ljIFZpZGVvKQALUmljayBBc3RsZXkAAAAAAAM8IAALZFF3NHc5V2dYY1EAAQAraHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQAHeW91dHViZQAAAAAAAAAA",
                "info": {
                "identifier": "dQw4w9WgXcQ",
                "isSeekable": true,
                "author": "Rick Astley",
                "length": 212000,
                "isStream": false,
                "position": 0,
                "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
                "uri": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "sourceName": "youtube"
                }
            }
        ]
    }

    const rawTrack = "QAAAjQIAJVJpY2sgQXN0bGV5IC0gTmV2ZXIgR29ubmEgR2l2ZSBZb3UgVXAADlJpY2tBc3RsZXlWRVZPAAAAAAADPCAAC2RRdzR3OVdnWGNRAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9ZFF3NHc5V2dYY1EAB3lvdXR1YmUAAAAAAAAAAA=="
    const track = {
        "track": "QAAAjQIAJVJpY2sgQXN0bGV5IC0gTmV2ZXIgR29ubmEgR2l2ZSBZb3UgVXAADlJpY2tBc3RsZXlWRVZPAAAAAAADPCAAC2RRdzR3OVdnWGNRAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9ZFF3NHc5V2dYY1EAB3lvdXR1YmUAAAAAAAAAAA==",
        "info": {
        "identifier": "dQw4w9WgXcQ",
        "isSeekable": true,
        "author": "RickAstleyVEVO",
        "length": 212000,
        "isStream": false,
        "position": 0,
        "title": "Rick Astley - Never Gonna Give You Up",
        "uri": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "sourceName": "youtube"
        }
    }
    const tracks = [track]

    const plugins = [
        {
            name: "spotify-plugin",
            version: "1.0.6"
        }
    ]

    const routeplannerStatus = {
        class: null,
        details: null
    }

    it("/loadtracks", async function() {
        const result = await rest.loadTracks({ query: url })
        assert.deepEqual(result, loadResult)
    })

    it("/decodetrack", async function() {
        const result = await rest.decodeTrack(rawTrack)
        assert.deepEqual(result, track)
    })

    it("/decodetracks", async function() {
        const result = await rest.decodeTracks([rawTrack])
        assert.deepEqual(result, tracks)
    })

    it("/plugins", async function() {
        const result = await rest.plugins()
        assert.deepEqual(result, plugins)
    })

    it("/routeplanner/status", async function() {
        const result = await rest.routeplannerStatus()
        assert.deepEqual(result, routeplannerStatus)
    })
})
