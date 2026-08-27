/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
/**
 * Code samples for the documentation center.
 *
 * IMPORTANT: these are constants, NOT i18n strings. They must never be moved
 * into `src/i18n/locales/*.json` (the WO forbids code samples in locale files
 * to avoid bloating them). Explanation text around them uses `t()` with keys
 * defined alongside the doc sections.
 *
 * All samples reflect the real new-api OpenAI-compatible surface:
 *   base path `/v1`, Bearer token auth, standard request/response shapes.
 */

export const QUICK_START_CURL = `curl https://zhonguoyunji.com/v1/chat/completions \\
  -H "Authorization: Bearer $NEWAPI_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "Hello, who are you?" }
    ]
  }'`

export const QUICK_START_PYTHON = `from openai import OpenAI

client = OpenAI(
    base_url="https://zhonguoyunji.com/v1",
    api_key="sk-your-token",
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello, who are you?"}],
)
print(response.choices[0].message.content)`

export const QUICK_START_NODE = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://zhonguoyunji.com/v1",
  apiKey: "sk-your-token",
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello, who are you?" }],
});
console.log(response.choices[0].message.content);`

export const AUTH_REQUEST = `curl https://zhonguoyunji.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-token" \\
  -H "Content-Type: application/json" \\
  -d '{ "model": "gpt-4o-mini", "messages": [{ "role": "user", "content": "Hi" }] }'`

export const CHAT_COMPLETIONS_REQUEST = `curl https://zhonguoyunji.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Explain embeddings in one sentence." }
    ],
    "temperature": 0.7,
    "max_tokens": 512,
    "stream": false
  }'`

export const CHAT_COMPLETIONS_STREAM = `curl https://zhonguoyunji.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{ "role": "user", "content": "Count to five." }],
    "stream": true
  }'

# Each chunk is sent as a Server-Sent Event:
# data: {"choices":[{"delta":{"content":"One"}}]}
# data: {"choices":[{"delta":{"content":" "}}]}
# data: [DONE]`

export const MODELS_LIST = `curl https://zhonguoyunji.com/v1/models \\
  -H "Authorization: Bearer sk-your-token"

# Response
# {
#   "object": "list",
#   "data": [
#     { "id": "gpt-4o-mini", "object": "model", "owned_by": "system" },
#     { "id": "text-embedding-3-small", "object": "model", "owned_by": "system" }
#   ]
# }`

export const EMBEDDINGS_REQUEST = `curl https://zhonguoyunji.com/v1/embeddings \\
  -H "Authorization: Bearer sk-your-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "text-embedding-3-small",
    "input": "The quick brown fox jumps over the lazy dog"
  }'

# Response
# {
#   "object": "list",
#   "data": [
#     { "object": "embedding", "index": 0, "embedding": [0.0123, -0.0045, ...] }
#   ],
#   "model": "text-embedding-3-small",
#   "usage": { "prompt_tokens": 8, "total_tokens": 8 }
# }`

export const ERROR_RESPONSE = `{
  "error": {
    "message": "invalid character '}' looking for beginning of object key string",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_request"
  }
}`

export const SDK_CURL = `curl https://zhonguoyunji.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{ "role": "user", "content": "Write a haiku about APIs." }]
  }'`

export const SDK_PYTHON = `from openai import OpenAI

client = OpenAI(
    base_url="https://zhonguoyunji.com/v1",
    api_key="sk-your-token",
)

stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Write a haiku about APIs."}],
    stream=True,
)
for chunk in stream:
    delta = chunk.choices[0].delta.content or ""
    print(delta, end="")`

export const SDK_NODE = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://zhonguoyunji.com/v1",
  apiKey: "sk-your-token",
});

const stream = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Write a haiku about APIs." }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || "";
  process.stdout.write(delta);
}`

export const RETRY_EXAMPLE = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://zhonguoyunji.com/v1",
  apiKey: "sk-your-token",
  maxRetries: 3,
  timeout: 30_000,
});

// Retries automatically on transient 429 / 5xx responses with backoff.
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Summarize this document." }],
});`

export const ERROR_CODE_TABLE: {
  status: string
  code: string
  meaning: string
}[] = [
  {
    status: '400',
    code: 'invalid_request',
    meaning: 'Malformed request body or missing required field.',
  },
  {
    status: '401',
    code: 'invalid_token / unauthorized',
    meaning: 'Missing, expired, or invalid API token.',
  },
  {
    status: '403',
    code: 'permission_denied',
    meaning: 'Token lacks access to the requested model or group.',
  },
  {
    status: '429',
    code: 'rate_limit_exceeded / quota_exceeded',
    meaning: 'Too many requests or insufficient quota / balance.',
  },
  {
    status: '500',
    code: 'internal_error',
    meaning: 'Upstream or gateway error; safe to retry with backoff.',
  },
]
