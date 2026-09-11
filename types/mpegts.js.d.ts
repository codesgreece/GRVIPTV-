declare module "mpegts.js" {
  const mpegts: {
    createPlayer: (
      mediaDataSource: {
        type: string;
        isLive?: boolean;
        url?: string;
        cors?: boolean;
        withCredentials?: boolean;
      },
      config?: Record<string, unknown>,
    ) => {
      attachMediaElement: (mediaElement: HTMLMediaElement) => void;
      load: () => void;
      play: () => Promise<void>;
      pause: () => void;
      unload: () => void;
      detachMediaElement: () => void;
      destroy: () => void;
      on: (event: string, listener: (...args: unknown[]) => void) => void;
    };
    getFeatureList: () => {
      mseLivePlayback: boolean;
      mseH264Playback?: boolean;
      networkStreamIO?: boolean;
    };
    Events: {
      ERROR: string;
      LOADING_COMPLETE: string;
      RECOVERED_EARLY_EOF: string;
      MEDIA_INFO: string;
      STATISTICS_INFO: string;
    };
    isSupported: () => boolean;
  };

  export default mpegts;
}
