from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session
import os
from typing import Optional

from app import crud, auth
from app.database import get_db
from app.schemas import AttachmentOut

router = APIRouter(prefix="/attachments", tags=["attachments"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("", response_model=list[AttachmentOut], status_code=201)
async def upload_attachment(
    post_id: str = Form(...),
    files: Optional[list[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Accept single or multiple files and save each to local upload dir. Returns created attachment records.
    
    Supports both:
    - Multiple files: files parameter (list of UploadFile)
    - Single file: file parameter (single UploadFile) for frontend compatibility
    """
    if not post_id:
        raise HTTPException(status_code=400, detail="post_id is required")
    
    # Normalize to a list of files
    upload_files = []
    if files:
        upload_files.extend(files)
    if file:
        upload_files.append(file)
    
    if not upload_files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    created = []
    for upload_file in upload_files:
        filename = upload_file.filename
        safe_name = f"{current_user.user_id}_{filename}"
        dest_path = os.path.join(UPLOAD_DIR, safe_name)
        try:
            with open(dest_path, "wb") as out_file:
                content = await upload_file.read()
                out_file.write(content)
        except Exception:
            # on failure, skip this file and continue (could instead abort)
            continue
        rec = crud.create_attachment_record(db, user_id=current_user.user_id, post_id=post_id, filename=filename, file_path=dest_path, file_type=upload_file.content_type, file_size=len(content))
        created.append(rec)
    if not created:
        raise HTTPException(status_code=500, detail="No files were saved")
    return created
