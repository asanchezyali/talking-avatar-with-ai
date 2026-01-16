---
name: llms
description: Large Language Model integration patterns. Use when implementing LLM chains, structured outputs, prompt engineering, LangChain, OpenAI API, or conversational AI for avatars.
---

# LLM Integration for Avatars

## Architecture Overview

```
User Input → Prompt Template → LLM → Output Parser → Avatar Response
```

## LangChain Setup

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// Define output schema
const avatarResponseSchema = z.object({
  messages: z.array(
    z.object({
      text: z.string().describe("Text to be spoken by the avatar"),
      facialExpression: z.enum([
        'smile', 'sad', 'angry', 'surprised', 'funnyFace', 'default'
      ]).describe("Facial expression"),
      animation: z.enum([
        'Idle', 'TalkingOne', 'TalkingThree', 'SadIdle',
        'Defeated', 'Angry', 'Surprised', 'DismissingGesture', 'ThoughtfulHeadShake'
      ]).describe("Animation to play"),
    })
  ).max(3),
});

const parser = StructuredOutputParser.fromZodSchema(avatarResponseSchema);
```

## Prompt Template Design

```typescript
const template = `
You are {character_name}, {character_description}.

Your personality traits:
{personality_traits}

Response guidelines:
- Always respond with a JSON array of 1-3 messages
- Each message has: text, facialExpression, animation
- Match expressions and animations to emotional content
- Keep responses conversational and engaging

Available expressions: smile, sad, angry, surprised, funnyFace, default
Available animations: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, Surprised, DismissingGesture, ThoughtfulHeadShake

{format_instructions}
`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", template],
  ["human", "{question}"],
]);
```

## Chain Construction

```typescript
const model = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.7,
});

const chain = prompt.pipe(model).pipe(parser);

// Execute
const response = await chain.invoke({
  character_name: "Jack",
  character_description: "a world traveler",
  personality_traits: "friendly, curious, storyteller",
  question: "Tell me about your adventures",
  format_instructions: parser.getFormatInstructions(),
});
```

## Emotion-to-Expression Mapping

```typescript
const emotionMapping = {
  // Positive emotions
  happy: { expression: 'smile', animations: ['TalkingOne', 'Idle'] },
  excited: { expression: 'surprised', animations: ['Surprised', 'TalkingThree'] },
  amused: { expression: 'funnyFace', animations: ['TalkingOne'] },

  // Negative emotions
  sad: { expression: 'sad', animations: ['SadIdle', 'Defeated'] },
  angry: { expression: 'angry', animations: ['Angry', 'DismissingGesture'] },
  frustrated: { expression: 'angry', animations: ['ThoughtfulHeadShake'] },

  // Neutral
  thinking: { expression: 'default', animations: ['ThoughtfulHeadShake', 'Idle'] },
  neutral: { expression: 'default', animations: ['Idle', 'TalkingOne'] },
};
```

## Conversation Memory

```typescript
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "history",
});

const conversationChain = new ConversationChain({
  llm: model,
  memory,
  prompt: ChatPromptTemplate.fromMessages([
    ["system", template],
    ["placeholder", "{history}"],
    ["human", "{input}"],
  ]),
});
```

## Streaming Responses

```typescript
import { StreamingTextResponse } from "ai";

async function streamResponse(input: string) {
  const stream = await model.stream(input);

  return new StreamingTextResponse(stream);
}
```

## Error Handling

```typescript
async function safeInvoke(chain, input) {
  try {
    return await chain.invoke(input);
  } catch (error) {
    // Return default response on error
    return {
      messages: [{
        text: "I'm having trouble understanding. Could you rephrase that?",
        facialExpression: 'default',
        animation: 'ThoughtfulHeadShake',
      }]
    };
  }
}
```

## Token Optimization

1. **Concise prompts**: Keep system prompts focused
2. **Max tokens**: Set appropriate limits
3. **Caching**: Cache common responses
4. **Streaming**: Use streaming for long responses

```typescript
const model = new ChatOpenAI({
  modelName: "gpt-4",
  maxTokens: 500,        // Limit response length
  temperature: 0.7,
  cache: true,           // Enable caching
});
```

## Alternative Models

```typescript
// Claude
import { ChatAnthropic } from "@langchain/anthropic";
const claude = new ChatAnthropic({ modelName: "claude-3-sonnet" });

// Local models (Ollama)
import { ChatOllama } from "@langchain/community/chat_models/ollama";
const ollama = new ChatOllama({ model: "llama2" });
```

For TTS integration, see `/kokoro-tts` skill.
