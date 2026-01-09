from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.api import deps
from app.models.note import Note, NoteVersion
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteVersionResponse

router = APIRouter()

@router.get("/", response_model=List[NoteResponse])
def read_notes(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    notes = db.query(Note).filter(Note.owner_id == current_user.id).offset(skip).limit(limit).all()
    return notes

@router.post("/", response_model=NoteResponse, status_code=201)
def create_note(
    *,
    db: Session = Depends(deps.get_db),
    note_in: NoteCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    note = Note(
        title=note_in.title,
        content=note_in.content,
        owner_id=current_user.id
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.get("/{id}/", response_model=NoteResponse)
def read_note(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    note = db.query(Note).filter(Note.id == id, Note.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/{id}/", response_model=NoteResponse)
def update_note(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    note_in: NoteUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    note = db.query(Note).filter(Note.id == id, Note.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Create version snapshot BEFORE update
    version_count = db.query(NoteVersion).filter(NoteVersion.note_id == id).count()
    new_version_number = version_count + 1
    
    version = NoteVersion(
        note_id=note.id,
        version_number=new_version_number,
        title=note.title, # Snapshot old title
        content=note.content, # Snapshot old content
        editor_id=current_user.id
    )
    db.add(version)
    
    # Update note
    note.title = note_in.title
    note.content = note_in.content
    
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{id}/")
def delete_note(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    note = db.query(Note).filter(Note.id == id, Note.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/{id}/versions/", response_model=List[NoteVersionResponse])
def read_note_versions(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    note = db.query(Note).filter(Note.id == id, Note.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    versions = db.query(NoteVersion).filter(NoteVersion.note_id == id).order_by(NoteVersion.version_number.desc()).all()
    return versions

@router.get("/{id}/versions/{version_id}/", response_model=NoteVersionResponse)
def read_note_version(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    version_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    note = db.query(Note).filter(Note.id == id, Note.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    version = db.query(NoteVersion).filter(NoteVersion.id == version_id, NoteVersion.note_id == id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version

@router.post("/{id}/versions/{version_id}/restore/", response_model=NoteResponse)
def restore_note_version(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    version_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    note = db.query(Note).filter(Note.id == id, Note.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    version = db.query(NoteVersion).filter(NoteVersion.id == version_id, NoteVersion.note_id == id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
        
    # Create new version of CURRENT state before restore
    version_count = db.query(NoteVersion).filter(NoteVersion.note_id == id).count()
    new_version_number = version_count + 1
    
    snapshot_current = NoteVersion(
        note_id=note.id,
        version_number=new_version_number,
        title=note.title, 
        content=note.content,
        editor_id=current_user.id
    )
    db.add(snapshot_current)
    
    # Restore content
    note.title = version.title
    note.content = version.content
    
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
