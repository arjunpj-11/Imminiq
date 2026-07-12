// Node 22 provides a stable, standards-compliant global fetch implementation.
// Select it before loading Cerebras so the SDK does not initialize node-fetch v2,
// whose legacy URL stack imports Node's deprecated built-in `punycode` module.
import '@cerebras/cerebras_cloud_sdk/shims/web'
import Cerebras from '@cerebras/cerebras_cloud_sdk'
import { env } from '../../../config/env'

const cerebras = new Cerebras({
  apiKey: env.CEREBRAS_API_KEY,
  warmTCPConnection: false,
})

const getResponseText = (response: unknown) => {
  const completion = response as {
    choices?: Array<{
      message?: {
        content?:
          | string
          | Array<{
              type?: string
              text?: string
            }>
          | null
      }
    }>
  }

  const content =
    completion.choices?.[0]?.message?.content

  if (typeof content === 'string') {
    if (!content.trim()) {
      throw new Error('Cerebras returned an empty response')
    }

    return content
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => part.text || '')
      .join('')
      .trim()

    if (!text) {
      throw new Error('Cerebras returned an empty response')
    }

    return text
  }

  throw new Error('Cerebras returned an empty response')
}

/**
 * Generic text chat fallback.
 * Keep this for future non-schema Cerebras usage.
 */
export const cerebrasChat = async (
  prompt: string,
  system?: string
) => {
  const response =
    await cerebras.chat.completions.create({
      model: 'qwen-3-235b-a22b-instruct-2507',

      messages: [
        ...(system
          ? [
              {
                role: 'system' as const,
                content: system,
              },
            ]
          : []),

        {
          role: 'user' as const,
          content: prompt,
        },
      ],

      temperature: 0.2,
    })

  return getResponseText(response)
}

// ============================================================
// STRUCTURED OUTPUT SCHEMAS
// ============================================================

const roadmapStructureResponseSchema = {
  type: 'object',
  additionalProperties: false,

  properties: {
    title: {
      type: 'string',
    },

    description: {
      type: 'string',
    },

    topics: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,

        properties: {
          title: {
            type: 'string',
          },

          description: {
            type: 'string',
          },

          order: {
            type: 'integer',
          },

          children: {
            type: 'array',
            items: {
              $ref: '#/$defs/roadmapNode',
            },
          },
        },

        required: [
          'title',
          'description',
          'order',
          'children',
        ],
      },
    },
  },

  required: [
    'title',
    'description',
    'topics',
  ],

  $defs: {
    roadmapNode: {
      type: 'object',
      additionalProperties: false,

      properties: {
        title: {
          type: 'string',
        },

        description: {
          type: 'string',
        },

        order: {
          type: 'integer',
        },

        children: {
          type: 'array',
          items: {
            $ref: '#/$defs/roadmapNode',
          },
        },
      },

      required: [
        'title',
        'description',
        'order',
        'children',
      ],
    },
  },
}

const roadmapEvaluationResponseSchema = {
  type: 'object',
  additionalProperties: false,

  properties: {
    score: {
      type: 'integer',
    },

    grade: {
      type: 'string',
      enum: [
        'Poor',
        'Fair',
        'Good',
        'Very Good',
        'Excellent',
      ],
    },

    summary: {
      type: 'string',
    },

    missingTopics: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,

        properties: {
          title: {
            type: 'string',
          },

          description: {
            type: 'string',
          },

          reason: {
            type: 'string',
          },

          suggestedParentTitle: {
            type: 'string',
          },
        },

        required: [
          'title',
          'description',
          'reason',
          'suggestedParentTitle',
        ],
      },
    },
  },

  required: [
    'score',
    'grade',
    'summary',
    'missingTopics',
  ],
}

// ============================================================
// STRUCTURED CEREBRAS FALLBACKS
// ============================================================

export const cerebrasRoadmapStructureChat = async (
  prompt: string,
  system?: string
) => {
  const response =
    await cerebras.chat.completions.create({
    model: 'qwen-3-235b-a22b-instruct-2507',

      messages: [
        ...(system
          ? [
              {
                role: 'system' as const,
                content: system,
              },
            ]
          : []),

        {
          role: 'user' as const,
          content: prompt,
        },
      ],

      temperature: 0.2,

      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'roadmap_structure',
          strict: true,
          schema: roadmapStructureResponseSchema,
        },
      },
    })

  return getResponseText(response)
}

export const cerebrasRoadmapEvaluationChat = async (
  prompt: string,
  system?: string
) => {
  const response =
    await cerebras.chat.completions.create({
     model: 'qwen-3-235b-a22b-instruct-2507',

      messages: [
        ...(system
          ? [
              {
                role: 'system' as const,
                content: system,
              },
            ]
          : []),

        {
          role: 'user' as const,
          content: prompt,
        },
      ],

      temperature: 0.2,

      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'roadmap_evaluation',
          strict: true,
          schema: roadmapEvaluationResponseSchema,
        },
      },
    })

  return getResponseText(response)
}
