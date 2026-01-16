# DDD Advanced Patterns Reference

## Domain Events

```typescript
// Base event
abstract class DomainEvent {
  readonly occurredOn: Date = new Date();
  abstract get eventName(): string;
}

// Specific event
class MessageProcessed extends DomainEvent {
  get eventName() { return 'message.processed'; }

  constructor(
    public readonly conversationId: string,
    public readonly messageId: string,
    public readonly response: AvatarResponse
  ) {
    super();
  }
}
```

## Event Sourcing

```typescript
class ConversationAggregate {
  private events: DomainEvent[] = [];
  private state: ConversationState;

  apply(event: DomainEvent): void {
    this.events.push(event);
    this.state = this.evolve(this.state, event);
  }

  private evolve(state: ConversationState, event: DomainEvent): ConversationState {
    switch (event.eventName) {
      case 'message.added':
        return { ...state, messages: [...state.messages, event.message] };
      case 'expression.changed':
        return { ...state, currentExpression: event.expression };
      default:
        return state;
    }
  }
}
```

## CQRS Pattern

```typescript
// Commands
interface ProcessMessageCommand {
  conversationId: string;
  userMessage: string;
}

class ProcessMessageHandler {
  async handle(command: ProcessMessageCommand): Promise<void> {
    const conversation = await this.repo.findById(command.conversationId);
    conversation.processMessage(command.userMessage);
    await this.repo.save(conversation);
  }
}

// Queries
interface GetConversationQuery {
  conversationId: string;
}

class GetConversationHandler {
  async handle(query: GetConversationQuery): Promise<ConversationDTO> {
    return this.readModel.getConversation(query.conversationId);
  }
}
```

## Specification Pattern

```typescript
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

class ValidMessageSpecification implements Specification<Message> {
  isSatisfiedBy(message: Message): boolean {
    return (
      message.text.length > 0 &&
      message.text.length <= 500 &&
      this.isValidExpression(message.facialExpression)
    );
  }
}
```

## Factory Pattern

```typescript
class ConversationFactory {
  create(characterConfig: CharacterConfig): Conversation {
    return new Conversation(
      ConversationId.generate(),
      characterConfig.name,
      characterConfig.personality,
      []
    );
  }

  reconstitute(data: ConversationData): Conversation {
    return new Conversation(
      new ConversationId(data.id),
      data.characterName,
      data.personality,
      data.messages.map(m => Message.fromData(m))
    );
  }
}
```

## Saga Pattern

```typescript
class ProcessUserInputSaga {
  private steps: SagaStep[] = [];

  async execute(input: UserInput): Promise<void> {
    try {
      // Step 1: Generate LLM response
      const llmResponse = await this.llmService.generate(input);
      this.steps.push({ type: 'llm', result: llmResponse });

      // Step 2: Generate audio
      const audio = await this.ttsService.synthesize(llmResponse.text);
      this.steps.push({ type: 'tts', result: audio });

      // Step 3: Generate lip sync
      const lipSync = await this.lipSyncService.generate(audio);
      this.steps.push({ type: 'lipsync', result: lipSync });

    } catch (error) {
      await this.compensate();
      throw error;
    }
  }

  private async compensate(): Promise<void> {
    // Rollback in reverse order
    for (const step of this.steps.reverse()) {
      await this.rollback(step);
    }
  }
}
```

## Anti-Corruption Layer

```typescript
// External API response (their format)
interface ElevenLabsResponse {
  audio_base64: string;
  duration_ms: number;
  sample_rate: number;
}

// Our domain model
interface SpeechAudio {
  data: Buffer;
  durationSeconds: number;
  sampleRate: number;
}

// ACL translates between them
class ElevenLabsACL {
  translate(external: ElevenLabsResponse): SpeechAudio {
    return {
      data: Buffer.from(external.audio_base64, 'base64'),
      durationSeconds: external.duration_ms / 1000,
      sampleRate: external.sample_rate,
    };
  }
}
```

## Module Structure

```
conversation/
├── domain/
│   ├── model/
│   │   ├── Conversation.ts          # Aggregate root
│   │   ├── Message.ts               # Entity
│   │   ├── FacialExpression.ts      # Value object
│   │   └── Animation.ts             # Value object
│   ├── events/
│   │   ├── MessageAdded.ts
│   │   └── ConversationStarted.ts
│   ├── services/
│   │   └── ResponseGenerator.ts     # Domain service
│   ├── repositories/
│   │   └── ConversationRepository.ts # Interface
│   └── specifications/
│       └── ValidMessageSpec.ts
├── application/
│   ├── commands/
│   │   └── ProcessMessage.ts
│   ├── queries/
│   │   └── GetConversation.ts
│   └── services/
│       └── ConversationService.ts
└── infrastructure/
    ├── persistence/
    │   └── MongoConversationRepo.ts
    ├── adapters/
    │   ├── OpenAIAdapter.ts
    │   └── ElevenLabsAdapter.ts
    └── acl/
        └── ElevenLabsACL.ts
```
