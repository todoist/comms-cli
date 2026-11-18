import type { CustomFetch } from '@todoist/comms-sdk'
import { vi } from 'vitest'

/**
 * Builds a `customFetch` stub that answers every request with a 200 and the given JSON body, to run
 * the real SDK client without a network.
 *
 * @param body - The raw wire payload (snake_case, `*_ts` epoch seconds) to answer with.
 */
export function mockJsonFetch(body: unknown) {
    return vi.fn<CustomFetch>().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        text: async () => JSON.stringify(body),
        json: async () => body,
    })
}
