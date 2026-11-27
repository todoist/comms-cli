import { getCommsClient } from '../../lib/api.js'
import type { MutationOptions } from '../../lib/options.js'
import { formatJson, printDryRun } from '../../lib/output.js'
import { resolveMessageId } from '../../lib/refs.js'

export function pinMessage(ref: string, options: MutationOptions): Promise<void> {
    return setPinned(ref, options, 'pin')
}

export function unpinMessage(ref: string, options: MutationOptions): Promise<void> {
    return setPinned(ref, options, 'unpin')
}

async function setPinned(
    ref: string,
    options: MutationOptions,
    action: 'pin' | 'unpin',
): Promise<void> {
    const messageId = resolveMessageId(ref)
    const client = await getCommsClient()

    if (options.dryRun) {
        const message = await client.conversationMessages.getMessage(messageId)
        const preview =
            message.content.length > 200 ? `${message.content.slice(0, 200)}...` : message.content
        printDryRun(`${action} message`, {
            Message: messageId,
            Conversation: message.conversationId,
            Content: preview,
        })
        return
    }

    const updated =
        action === 'pin'
            ? await client.conversationMessages.pinMessage(messageId)
            : await client.conversationMessages.unpinMessage(messageId)

    if (options.json) {
        if (options.full) {
            console.log(formatJson(updated, 'message', true))
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

    console.log(`Message ${messageId} ${action === 'pin' ? 'pinned' : 'unpinned'}.`)
}
