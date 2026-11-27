import { getCommsClient } from '../../lib/api.js'
import type { MutationOptions } from '../../lib/options.js'
import { formatJson, printDryRun } from '../../lib/output.js'
import { assertChannelIsPublic } from '../../lib/public-channels.js'
import { resolveCommentId } from '../../lib/refs.js'

export function pinComment(ref: string, options: MutationOptions): Promise<void> {
    return setPinned(ref, options, 'pin')
}

export function unpinComment(ref: string, options: MutationOptions): Promise<void> {
    return setPinned(ref, options, 'unpin')
}

async function setPinned(
    ref: string,
    options: MutationOptions,
    action: 'pin' | 'unpin',
): Promise<void> {
    const commentId = resolveCommentId(ref)

    const client = await getCommsClient()
    const comment = await client.comments.getComment(commentId)
    await assertChannelIsPublic(comment.channelId, comment.workspaceId)

    if (options.dryRun) {
        const preview =
            comment.content.length > 200 ? `${comment.content.slice(0, 200)}...` : comment.content
        printDryRun(`${action} comment`, {
            Comment: commentId,
            Thread: comment.threadId,
            Content: preview,
        })
        return
    }

    const updated =
        action === 'pin'
            ? await client.comments.pinComment(commentId)
            : await client.comments.unpinComment(commentId)

    if (options.json) {
        if (options.full) {
            console.log(formatJson(updated, 'comment', true))
        } else {
            console.log(
                formatJson({
                    id: updated.id,
                    pinnedDate: updated.pinnedDate ?? null,
                    pinnedBy: updated.pinnedBy ?? null,
                }),
            )
        }
        return
    }

    console.log(`Comment ${commentId} ${action === 'pin' ? 'pinned' : 'unpinned'}.`)
}
