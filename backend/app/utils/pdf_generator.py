import os
from fpdf import FPDF

class PDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("DejaVu", "", "app/fonts/DejaVuSans.ttf", uni=True)
        self.add_font("DejaVu", "B", "app/fonts/DejaVuSans-Bold.ttf", uni=True)
        self.set_font("DejaVu", "", 12)

    def header(self):
        self.set_fill_color(37, 89, 166)
        self.rect(0, 0, self.w, 20, style='F')

        logo_path = "app/images/logo_iren.png"
        if os.path.exists(logo_path):
            self.image(logo_path, x=10, y=3, w=14)

        self.set_font("DejaVu", "", 16)
        self.set_text_color(255, 255, 255)
        self.set_y(5)
        self.cell(0, 10, "Informe de Diagnóstico", ln=True, align="C")
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", "", 10)
        self.set_text_color(128)
        self.cell(0, 10, f"Página {self.page_no()}", align="C")
