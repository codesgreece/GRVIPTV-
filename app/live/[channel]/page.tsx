import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelWatchClient } from "@/components/live/ChannelWatchClient";
import {
  getChannelById,
  getRelatedChannels,
} from "@/lib/live/channels";
import type { LiveChannel } from "@/lib/live/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ channel: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { channel: slug } = await params;
  try {
    const channel = await getChannelById(slug);
    if (!channel) {
      return { title: "Channel not found" };
    }
    return {
      title: `${channel.name} Live`,
      description: `Watch ${channel.name} live on GRVIP OTT.`,
      openGraph: {
        title: `${channel.name} Live | GRVIP OTT`,
        description: `Watch ${channel.name} live on GRVIP OTT.`,
      },
    };
  } catch {
    return { title: "Live TV" };
  }
}

function toPublicChannel(channel: {
  id: string;
  name: string;
  logo: string | null;
  category: string;
  tvgId: string;
  tvgName: string;
  streamUrl: string;
  sourceUrl: string;
}): LiveChannel {
  return {
    id: channel.id,
    name: channel.name,
    logo: channel.logo,
    category: channel.category,
    tvgId: channel.tvgId,
    tvgName: channel.tvgName,
    streamUrl: channel.streamUrl,
  };
}

export default async function ChannelLivePage({ params }: PageProps) {
  const { channel: slug } = await params;

  let channel;
  try {
    channel = await getChannelById(slug);
  } catch {
    notFound();
  }

  if (!channel) notFound();

  let related: LiveChannel[] = [];
  try {
    related = await getRelatedChannels(channel, 10);
  } catch {
    related = [];
  }

  return (
    <ChannelWatchClient channel={toPublicChannel(channel)} related={related} />
  );
}
