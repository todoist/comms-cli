import type { Channel } from '@todoist/comms-sdk'

import { getCommsClient } from './api.js'
import { CliError } from './errors.js'
import { includePrivateChannels } from './global-args.js'

const joinedChannelCache = new Map<number, Channel[]>()
const workspacePublicChannelCache = new Map<number, Set<string>>()

/** The channels the user has joined, with their names. One request per workspace. */
export async function getJoinedChannels(workspaceId: number): Promise<Channel[]> {
    const cached = joinedChannelCache.get(workspaceId)
    if (cached) return cached

    const client = await getCommsClient()
    const channels = await client.channels.getChannels({ workspaceId })
    joinedChannelCache.set(workspaceId, channels)
    return channels
}

/** IDs of the public channels the user has joined. */
export async function getPublicChannelIds(workspaceId: number): Promise<Set<string>> {
    const joined = await getJoinedChannels(workspaceId)
    return new Set(joined.filter((ch) => ch.public).map((ch) => ch.id))
}

// Every public channel in the workspace, joined or not. Much bigger than the joined list (all
// members of every public channel) and empty for guests, so it's only used for unjoined channels.
async function getWorkspacePublicChannelIds(workspaceId: number): Promise<Set<string>> {
    const cached = workspacePublicChannelCache.get(workspaceId)
    if (cached) return cached

    const client = await getCommsClient()
    const channels = await client.workspaces.getPublicChannels(workspaceId)
    const publicIds = new Set(channels.map((ch) => ch.id))
    workspacePublicChannelCache.set(workspaceId, publicIds)
    return publicIds
}

export function clearPublicChannelCache(): void {
    joinedChannelCache.clear()
    workspacePublicChannelCache.clear()
}

async function isPublicChannel(channelId: string, workspaceId: number): Promise<boolean> {
    const joined = await getJoinedChannels(workspaceId)
    return (
        joined.find((ch) => ch.id === channelId)?.public ??
        // getChannels only returns joined channels, so an unjoined one could still be public.
        (await getWorkspacePublicChannelIds(workspaceId)).has(channelId)
    )
}

/**
 * Throws unless the channel is public or --include-private-channels is set. Callers that
 * already have the channel pass its `public` flag, which skips the lookups.
 */
export async function assertChannelIsPublic(
    channelId: string,
    workspaceId: number,
    isPublic?: boolean,
): Promise<void> {
    if (includePrivateChannels()) return
    if (!(isPublic ?? (await isPublicChannel(channelId, workspaceId)))) {
        throw new CliError('NOT_FOUND', 'This thread belongs to a private channel.', [
            'Use --include-private-channels to access it',
        ])
    }
}
