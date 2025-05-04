from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExportRequest(BaseModel):
    images: list[str]  # base64-encoded JPEGs

@app.post("/export")
async def export_pdf(data: ExportRequest):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)

    for img_b64 in data.images:
        header, b64data = img_b64.split(",", 1)
        img_data = BytesIO(base64.b64decode(b64data))
        img = Image.open(img_data)
        width, height = letter
        img = img.convert("RGB")
        img = img.resize((int(width), int(height)))
        img_io = BytesIO()
        img.save(img_io, format="JPEG")
        img_io.seek(0)

        pdf.drawImage(ImageReader(img_io), 0, 0, width=width, height=height)
        pdf.showPage()

    pdf.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=export.pdf"})
