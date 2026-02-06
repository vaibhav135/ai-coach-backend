/**
 * LiveKit Agent Worker
 *
 * This runs as a separate process from the Hono API server.
 * It connects to LiveKit and handles real-time voice/video interactions.
 *
 * @see https://docs.livekit.io/agents/
 */

import { env } from '@/lib/env.js'

// TODO: Implement LiveKit agent
// Example structure:
//
// import { WorkerOptions, cli, defineAgent } from '@livekit/agents'
// import { OpenAI } from '@livekit/agents-plugin-openai'
//
// const agent = defineAgent({
//   entry: async (ctx) => {
//     // Agent logic here
//   },
// })
//
// cli.runApp(
//   new WorkerOptions({
//     agent,
//     wsUrl: env.LIVEKIT_URL,
//     apiKey: env.LIVEKIT_API_KEY,
//     apiSecret: env.LIVEKIT_API_SECRET,
//   })
// )

console.log('LiveKit Agent Worker')
console.log('LIVEKIT_URL:', env.LIVEKIT_URL)
console.log('Agent worker not yet implemented - see TODO in this file')
