from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
import os

from app import crud, auth
from app.database import get_db
from app.schemas import AttachmentOut

router = APIRouter(prefix="/attachments", tags=["attachments"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("", response_model=list[AttachmentOut], status_code=201)
async def upload_attachment(post_id: str, files: list[UploadFile] = File(...), current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Accept multiple files and save each to local upload dir. Returns created attachment records."""
    created = []
    for file in files:
        filename = file.filename
        safe_name = f"{current_user.user_id}_{filename}"
        dest_path = os.path.join(UPLOAD_DIR, safe_name)
        try:
            with open(dest_path, "wb") as out_file:
                content = await file.read()
                out_file.write(content)
        except Exception:
            # on failure, skip this file and continue (could instead abort)
            continue
        rec = crud.create_attachment_record(db, user_id=current_user.user_id, post_id=post_id, filename=filename, file_path=dest_path, file_type=file.content_type, file_size=len(content))
        created.append(rec)
    if not created:
        raise HTTPException(status_code=500, detail="No files were saved")
    return created


@router.get("/{attachment_id}")
def get_attachment(attachment_id: str, db: Session = Depends(get_db)):
    from app.models import Attachment
    att = db.query(Attachment).filter(Attachment.attachment_id == attachment_id, Attachment.is_deleted == False).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")
    # return metadata; actual file serving should be done by static server in production
    return att
