export type RawM3uChannel = {
  name: string;
  streamUrl: string;
  tvgId: string;
  tvgName: string;
  tvgLogo: string;
  groupTitle: string;
};

export type LiveChannel = {
  id: string;
  name: string;
  logo: string | null;
  category: string;
  tvgId: string;
  tvgName: string;
  /** Same-origin playback URL — never the upstream credentialed URL */
  streamUrl: string;
};

export type LiveChannelInternal = LiveChannel & {
  sourceUrl: string;
};

export type ChannelsPayload = {
  channels: LiveChannel[];
  categories: string[];
  updatedAt: string;
  count: number;
};

export type ChannelsErrorPayload = {
  error: true;
  message: string;
};
