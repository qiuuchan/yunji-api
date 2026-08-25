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
import { useTranslation } from 'react-i18next'

import { CodeBlock } from '@/components/ai-elements/code-block'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import {
  AUTH_REQUEST,
  CHAT_COMPLETIONS_REQUEST,
  CHAT_COMPLETIONS_STREAM,
  EMBEDDINGS_REQUEST,
  ERROR_CODE_TABLE,
  ERROR_RESPONSE,
  MODELS_LIST,
  QUICK_START_CURL,
  QUICK_START_NODE,
  QUICK_START_PYTHON,
  RETRY_EXAMPLE,
  SDK_CURL,
  SDK_NODE,
  SDK_PYTHON,
} from '../content/code-samples'

type DocSectionProps = {
  id: string
  titleKey: string
  children: React.ReactNode
}

function DocSection({ id, titleKey, children }: DocSectionProps) {
  const { t } = useTranslation()
  return (
    <section
      id={id}
      data-doc-section={id}
      className='border-border/40 scroll-mt-24 border-b py-10 first:pt-2'
    >
      <h2 className='text-2xl font-bold tracking-tight'>{t(titleKey)}</h2>
      <div className='text-foreground/90 mt-4 space-y-4 text-sm leading-relaxed'>
        {children}
      </div>
    </section>
  )
}

const FAQ_ITEMS: { qKey: string; aKey: string }[] = [
  {
    qKey: 'Where do I get an API token?',
    aKey: 'Create a token from the dashboard "Tokens" page; it is shown once on creation.',
  },
  {
    qKey: 'Which base URL should I use?',
    aKey: 'Use your instance base URL with the /v1 path, e.g. https://your-instance.example.com/v1.',
  },
  {
    qKey: 'Do you support streaming?',
    aKey: 'Yes. Set "stream": true on chat completions; chunks arrive as Server-Sent Events.',
  },
  {
    qKey: 'How are rate limits enforced?',
    aKey: 'Limits and quotas are per token; exceeding them returns HTTP 429 with a retry-after hint.',
  },
]

export function DocsContent() {
  const { t } = useTranslation()

  return (
    <div className='max-w-3xl min-w-0'>
      <DocSection id='quick-start' titleKey='Quick start'>
        <p>{t('Get a response in about five minutes.')}</p>
        <p>
          {t(
            'Install the official OpenAI SDK, point it at your instance base URL, and use your token as the API key.'
          )}
        </p>
        <CodeBlock
          code={QUICK_START_CURL}
          language='bash'
          title='cURL'
          showToolbar
        />
        <CodeBlock
          code={QUICK_START_PYTHON}
          language='python'
          title='Python'
          showToolbar
        />
        <CodeBlock
          code={QUICK_START_NODE}
          language='javascript'
          title='Node.js'
          showToolbar
        />
      </DocSection>

      <DocSection id='authentication' titleKey='Authentication'>
        <p>
          {t(
            'All requests are authenticated with a Bearer token passed in the Authorization header.'
          )}
        </p>
        <CodeBlock
          code={AUTH_REQUEST}
          language='bash'
          title='Authorization'
          showToolbar
        />
        <p>
          {t(
            'Keep your token secret. Treat it like a password and rotate it if it leaks.'
          )}
        </p>
      </DocSection>

      <DocSection id='api-reference' titleKey='API reference'>
        <p>
          {t(
            'The API is OpenAI-compatible and served under the /v1 base path.'
          )}
        </p>

        <h3
          id='chat-completions'
          className='scroll-mt-24 pt-2 text-lg font-semibold'
        >
          {t('Chat completions')}
        </h3>
        <p>
          {t(
            'POST /v1/chat/completions — send messages and receive a model response. Set "stream": true for token streaming.'
          )}
        </p>
        <CodeBlock
          code={CHAT_COMPLETIONS_REQUEST}
          language='bash'
          title='chat/completions'
          showToolbar
        />
        <CodeBlock
          code={CHAT_COMPLETIONS_STREAM}
          language='bash'
          title='streaming'
          showToolbar
        />

        <h3 id='models' className='scroll-mt-24 pt-2 text-lg font-semibold'>
          {t('List models')}
        </h3>
        <p>{t('GET /v1/models — list the models available to your token.')}</p>
        <CodeBlock
          code={MODELS_LIST}
          language='bash'
          title='models'
          showToolbar
        />

        <h3 id='embeddings' className='scroll-mt-24 pt-2 text-lg font-semibold'>
          {t('Embeddings')}
        </h3>
        <p>
          {t(
            'POST /v1/embeddings — turn text into a vector for search, clustering, or classification.'
          )}
        </p>
        <CodeBlock
          code={EMBEDDINGS_REQUEST}
          language='bash'
          title='embeddings'
          showToolbar
        />
      </DocSection>

      <DocSection id='error-codes' titleKey='Error codes'>
        <p>
          {t(
            'Errors return a JSON body with an "error" object. Inspect the HTTP status and the "code" field to handle them programmatically.'
          )}
        </p>
        <CodeBlock
          code={ERROR_RESPONSE}
          language='json'
          title='error shape'
          showToolbar
        />
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left text-sm'>
            <thead>
              <tr className='border-border border-b'>
                <th className='py-2 pr-4 font-medium'>{t('Status')}</th>
                <th className='py-2 pr-4 font-medium'>{t('Code')}</th>
                <th className='py-2 font-medium'>{t('Meaning')}</th>
              </tr>
            </thead>
            <tbody>
              {ERROR_CODE_TABLE.map((row) => (
                <tr key={row.status} className='border-border/40 border-b'>
                  <td className='py-2 pr-4 font-mono'>{row.status}</td>
                  <td className='text-muted-foreground py-2 pr-4 font-mono'>
                    {row.code}
                  </td>
                  <td className='text-muted-foreground py-2'>
                    {t(row.meaning)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id='sdks' titleKey='SDK examples'>
        <p>
          {t('Use the OpenAI SDK in any language by overriding the base URL.')}
        </p>
        <CodeBlock code={SDK_CURL} language='bash' title='cURL' showToolbar />
        <CodeBlock
          code={SDK_PYTHON}
          language='python'
          title='Python'
          showToolbar
        />
        <CodeBlock
          code={SDK_NODE}
          language='javascript'
          title='Node.js'
          showToolbar
        />
      </DocSection>

      <DocSection id='best-practices' titleKey='Best practices'>
        <p>
          {t(
            'Streaming: enable "stream": true for chat UIs to improve perceived latency.'
          )}
        </p>
        <p>
          {t(
            'Retries: retry transient 429/5xx errors with exponential backoff. The SDKs can do this for you.'
          )}
        </p>
        <CodeBlock
          code={RETRY_EXAMPLE}
          language='javascript'
          title='retry config'
          showToolbar
        />
      </DocSection>

      <DocSection id='faq' titleKey='FAQ'>
        <Accordion className='mt-2'>
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.qKey} value={`faq-${index}`}>
              <AccordionTrigger>{t(item.qKey)}</AccordionTrigger>
              <AccordionContent>
                <p className='text-muted-foreground'>{t(item.aKey)}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DocSection>
    </div>
  )
}
