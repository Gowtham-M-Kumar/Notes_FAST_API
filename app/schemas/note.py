from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.user import UserResponse

class NoteBase(BaseModel):
    title: str
    content: str

class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    pass

class NoteVersionResponse(BaseModel):
    id: int
    version_number: int
    title: str
    content: str
    created_at: datetime
    note: int = Field(alias="note_id")
    editor: Optional[UserResponse] = None

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }

class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user: int = Field(alias="owner_id")
    versions: List[NoteVersionResponse] = []

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }
