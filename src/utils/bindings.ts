// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "media.getVolume", input: never, result: number },
    mutations: 
        { key: "media.invokeMediaProperties", input: never, result: null } | 
        { key: "media.invokeMethod", input: Method, result: null } | 
        { key: "media.invokePlaybackInfo", input: never, result: null } | 
        { key: "media.invokeTimelineProperties", input: never, result: null } | 
        { key: "spotify.invokeUri", input: string, result: null },
    subscriptions: 
        { key: "media.mediaPropertiesChanged", input: never, result: MediaSessionData } | 
        { key: "media.playbackInfoChanged", input: never, result: MediaPlaybackData } | 
        { key: "media.sessionChanged", input: never, result: SessionChangedData } | 
        { key: "media.timelinePropertiesChanged", input: never, result: MediaTimelineData } | 
        { key: "media.volumeChanged", input: never, result: number }
};

export interface MediaPlaybackData { isPlaying: boolean }

export interface MediaSessionData { isPlayEnabled: boolean, isPauseEnabled: boolean, isPlayOrPauseEnabled: boolean, isPreviousEnabled: boolean, isNextEnabled: boolean, title: string, artist: string, album: string, thumbnail: ThumbnailData }

export interface MediaTimelineData { timelineStartTime: number, timelineEndTime: number, timelinePosition: number }

export type Method = "play" | "pause" | "next" | "previous" | { setPlaybackPosition: number } | { setVolume: number }

export interface SessionChangedData { appId: string, sessionActive: boolean }

export interface TailwindPalette { shades: Array<TailwindShade> }

export interface TailwindShade { number: string, hexcode: string, rgb: [number, number, number] }

export interface ThumbnailData { base64: string, palette: TailwindPalette, prominantColor: [number, number, number] }
