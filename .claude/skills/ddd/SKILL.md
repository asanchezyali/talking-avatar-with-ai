---
name: ddd
description: Domain-Driven Design patterns and practices. Use when designing domain models, aggregates, entities, value objects, repositories, services, bounded contexts, or refactoring to DDD architecture.
---

# Domain-Driven Design (DDD)

## Strategic Patterns

### Bounded Contexts
Explicit boundaries where a domain model applies. Each context has its own ubiquitous language.

```
apps/
  backend/
    modules/
      avatar/           # Avatar bounded context
        domain/
        application/
        infrastructure/
      speech/           # Speech bounded context
        domain/
        application/
        infrastructure/
```

### Context Mapping
- **Shared Kernel**: Shared code between contexts
- **Anti-Corruption Layer**: Translate between external and internal models
- **Published Language**: Well-documented API contracts

## Tactical Patterns

### Entities
Objects with identity that persists over time.

```typescript
// Entity with identity
class Avatar {
  constructor(
    private readonly id: AvatarId,
    private name: string,
    private expression: FacialExpression
  ) {}

  get getId(): AvatarId { return this.id; }

  changeExpression(expression: FacialExpression): void {
    this.expression = expression;
    this.recordEvent(new ExpressionChanged(this.id, expression));
  }
}
```

### Value Objects
Immutable objects defined by their attributes.

```typescript
// Value Object - immutable, no identity
class FacialExpression {
  private constructor(private readonly value: ExpressionType) {}

  static smile(): FacialExpression { return new FacialExpression('smile'); }
  static sad(): FacialExpression { return new FacialExpression('sad'); }

  equals(other: FacialExpression): boolean {
    return this.value === other.value;
  }
}
```

### Aggregates
Cluster of entities and value objects with a root entity.

```typescript
// Aggregate Root
class Conversation {
  private messages: Message[] = [];

  addMessage(text: string, expression: FacialExpression, animation: Animation): void {
    if (this.messages.length >= 3) {
      throw new MaxMessagesExceeded();
    }
    this.messages.push(new Message(text, expression, animation));
  }
}
```

### Domain Services
Operations that don't belong to entities.

```typescript
class LipSyncService {
  async generateLipSync(audio: AudioBuffer): Promise<LipSyncData> {
    // Domain logic for lip sync generation
  }
}
```

### Repositories
Abstractions for aggregate persistence.

```typescript
interface ConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findById(id: ConversationId): Promise<Conversation | null>;
}
```

## Application Layer

### Use Cases / Application Services

```typescript
class ProcessUserMessageUseCase {
  constructor(
    private readonly llmService: LLMService,
    private readonly ttsService: TTSService,
    private readonly lipSyncService: LipSyncService
  ) {}

  async execute(input: UserMessageInput): Promise<AvatarResponse> {
    const response = await this.llmService.generateResponse(input.text);
    const audio = await this.ttsService.synthesize(response.text);
    const lipSync = await this.lipSyncService.generate(audio);

    return new AvatarResponse(response, audio, lipSync);
  }
}
```

## Directory Structure for This Project

```
apps/backend/
  modules/
    conversation/
      domain/
        entities/
        value-objects/
        services/
        events/
        repositories/
      application/
        use-cases/
        dtos/
      infrastructure/
        repositories/
        external-services/
```

For detailed patterns, see [DDD_PATTERNS.md](DDD_PATTERNS.md).
