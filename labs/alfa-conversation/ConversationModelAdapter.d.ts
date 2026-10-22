/** New independent contract. Does not extend or loosen deos.model-adapter/1. */
export type Intent = 'clarify' | 'music' | 'business' | 'content' | 'preferences' | 'unsafe';
export type Field = 'activity' | 'assistantName' | 'tone' | 'canonicalName' | 'description';
export interface ConversationTask {
  version: 'deos.conversation-model/1'; message: string;
  memory: ReadonlyArray<{key: Field; value: string; origin: 'expressed' | 'confirmed'}>;
  missing_fields: ReadonlyArray<'activity' | 'canonicalName' | 'description' | 'rightsHolder'>;
  recent_intents: ReadonlyArray<Intent>; max_output_tokens: 512;
}
export interface ConversationOutput {
  version: 'deos.conversation-model/1'; intent: Intent;
  question: 'activity' | 'canonicalName' | 'description' | 'rightsHolder' | 'goal' | 'audience' | 'review';
  strategy: 'none' | 'music_outline' | 'business_outline' | 'content_outline';
  proposals: ReadonlyArray<{key: Field; value: string; quote: string; source: 'current_message'}>;
}
export interface ConversationModelAdapter {
  version: 'deos.conversation-model/1'; id: string; mode: 'simulated' | 'disabled';
  generate(task: Readonly<ConversationTask>, options: {signal: AbortSignal}): Promise<ConversationOutput>;
}
// Runtime accepts simulated only. There is intentionally no live mode or transport credential.
