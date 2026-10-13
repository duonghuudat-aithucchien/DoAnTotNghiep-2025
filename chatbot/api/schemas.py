from pydantic import BaseModel, ConfigDict, Field, field_validator
from uuid import UUID


class ChatInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: str | None = None

    @field_validator("message")
    @classmethod
    def valid_message(cls, message):
        message = message.strip()
        if not message:
            raise ValueError("Message must not be blank")
        return message

    @field_validator("conversation_id")
    @classmethod
    def valid_conversation(cls, value):
        if value is not None:
            UUID(value)
        return value


class FeedbackInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    conversation_id: str
    message_id: str
    rating: int = Field(ge=-1, le=2)

    @field_validator("rating")
    @classmethod
    def valid_rating(cls, rating):
        if rating not in {-1, 1, 2}:
            raise ValueError("Use -1, 1 or 2 (product click)")
        return rating

    @field_validator("conversation_id", "message_id")
    @classmethod
    def valid_id(cls, value):
        UUID(value)
        return value

