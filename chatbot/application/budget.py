from datetime import datetime, timezone

class CallBudget:
    """Reserve every provider attempt, including retries, in the shared counter."""
    def __init__(self, settings, conversations):
        self.settings = settings
        self.conversations = conversations
        self.used = 0

    def __call__(self):
        if self.used >= self.settings.llm_max_calls_per_turn:
            raise RuntimeError('Per-turn LLM budget reached')
        key = 'llm:' + datetime.now(timezone.utc).strftime('%Y%m%d')
        if self.conversations.increment(key, 172800) > self.settings.llm_max_calls_per_day:
            raise RuntimeError('Daily LLM budget reached')
        self.used += 1
