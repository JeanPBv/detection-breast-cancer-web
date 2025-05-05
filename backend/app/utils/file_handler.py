import shutil
import uuid
import os
from fastapi import UploadFile

def save_upload_file(upload_file: UploadFile, directory: str = "app/images") -> str:
    os.makedirs(directory, exist_ok=True)
    filename = f"{uuid.uuid4().hex}_{upload_file.filename}"
    file_path = os.path.join(directory, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path
