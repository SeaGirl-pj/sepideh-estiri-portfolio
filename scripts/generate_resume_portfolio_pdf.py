"""
Generate Resume & Portfolio PDF from src/data/portfolio.json (single source of truth).

Run:
  py scripts/generate_resume_portfolio_pdf.py

Or via npm:
  npm run generate:resume
"""

from __future__ import annotations

import json
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "src" / "data" / "portfolio.json"
PUBLIC = ROOT / "public"

NAVY = HexColor("#0C2340")
TEAL = HexColor("#0D9488")
MUTED = HexColor("#4A5568")
LIGHT_BG = HexColor("#F7FAFC")
LINE = HexColor("#D0E4E4")
ACCENT_SOFT = HexColor("#E6F7F5")


def load_data() -> dict:
    with DATA_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def wrap_text(c, text, x, y, max_w, font="Helvetica", size=9, leading=4.4 * mm, color=MUTED):
    c.setFillColor(color)
    c.setFont(font, size)
    words = text.split()
    line = ""
    while words:
        test = (line + " " + words[0]).strip()
        if c.stringWidth(test, font, size) <= max_w:
            line = test
            words.pop(0)
        else:
            if line:
                c.drawString(x, y, line)
                y -= leading
            line = ""
            # force long token
            if c.stringWidth(words[0], font, size) > max_w:
                c.drawString(x, y, words.pop(0))
                y -= leading
    if line:
        c.drawString(x, y, line)
        y -= leading
    return y


def section_title(c, text, x, y):
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x, y, text.upper())
    c.setStrokeColor(TEAL)
    c.setLineWidth(1.4)
    c.line(x, y - 2.2 * mm, x + 28 * mm, y - 2.2 * mm)
    return y - 8 * mm


def bullet(c, text, x, y, max_w):
    c.setFillColor(TEAL)
    c.circle(x + 1.2 * mm, y + 1.2 * mm, 1.05 * mm, fill=1, stroke=0)
    return wrap_text(c, text, x + 5 * mm, y, max_w - 5 * mm, size=9, leading=4.8 * mm)


def draw_image_fit(c, abs_path: Path, x, y, max_w, max_h):
    if not abs_path.exists():
        return max_h
    img = ImageReader(str(abs_path))
    iw, ih = img.getSize()
    scale = min(max_w / iw, max_h / ih)
    w, h = iw * scale, ih * scale
    c.setFillColor(NAVY)
    c.roundRect(x, y - max_h, max_w, max_h, 3, fill=1, stroke=0)
    c.drawImage(img, x + (max_w - w) / 2, y - h - (max_h - h) / 2, width=w, height=h, mask="auto")
    return max_h


def public_path(rel: str) -> Path:
    return PUBLIC / rel.lstrip("/")


def page_resume(c, width, height, data):
    personal = data["personal"]
    resume = data["resume"]
    experience = data["experience"]
    education = data["education"]
    skills = data["skills"]
    margin = 16 * mm

    # Header band + teal divider (divider sits just under the navy band)
    header_h = 40 * mm
    divider_h = 2 * mm
    header_bottom = height - header_h
    divider_bottom = header_bottom - divider_h

    c.setFillColor(NAVY)
    c.rect(0, header_bottom, width, header_h, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.rect(0, divider_bottom, width, divider_h, fill=1, stroke=0)

    y = height - 15 * mm
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(margin, y, personal["name"])
    y -= 7 * mm
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(HexColor("#A5F3FC"))
    c.drawString(margin, y, personal["title"])
    y -= 5.5 * mm
    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#D1FAE5"))
    c.drawString(margin, y, personal["headline"])

    # Contact row: start clearly BELOW the teal divider (≈12–14px / ~4.5mm gap)
    gap_below_divider = 4.5 * mm
    label_y = divider_bottom - gap_below_divider - 2.2 * mm
    value_y = label_y - 4.2 * mm
    col_w = (width - 2 * margin) / 4

    contacts = [
        ("Email", personal["email"], f"mailto:{personal['email']}"),
        ("LinkedIn", personal["linkedin"]["label"], personal["linkedin"]["url"]),
        ("GitHub", personal["github"]["label"], personal["github"]["url"]),
        ("Location", personal["location"]["en"], None),
    ]
    for i, (label, value, link) in enumerate(contacts):
        x = margin + i * col_w
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(x, label_y, label.upper())
        c.setFillColor(NAVY)
        c.setFont("Helvetica", 7.5)
        # Keep long values inside their column
        max_val_w = col_w - 3 * mm
        display = value
        while c.stringWidth(display, "Helvetica", 7.5) > max_val_w and len(display) > 8:
            display = display[:-4] + "…"
        c.drawString(x, value_y, display)
        if link:
            c.linkURL(link, (x, value_y - 1 * mm, x + c.stringWidth(display, "Helvetica", 7.5), label_y + 3 * mm), relative=0)

    # Clear gap before Professional Summary
    y = value_y - 8 * mm
    y = section_title(c, "Professional Summary", margin, y)
    y = wrap_text(c, resume["summary"], margin, y, width - 2 * margin, size=9.2, leading=4.6 * mm)
    y -= 3 * mm

    y = section_title(c, "Technical Skills", margin, y)
    col_w = (width - 2 * margin - 6 * mm) / 2
    row_h = 7.6 * mm
    for i, skill in enumerate(skills):
        col = i % 2
        row = i // 2
        sx = margin + col * (col_w + 6 * mm)
        sy = y - row * row_h
        c.setFillColor(ACCENT_SOFT)
        c.roundRect(sx, sy - 2.2 * mm, col_w, 6.8 * mm, 2.2, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(sx + 2.5 * mm, sy + 1.6 * mm, skill["resumeLabel"])
        c.setFillColor(NAVY)
        c.setFont("Helvetica", 8)
        c.drawString(sx + 2.5 * mm, sy - 1.3 * mm, ", ".join(skill["items"]))
    y -= ((len(skills) + 1) // 2) * row_h + 3 * mm

    y = section_title(c, "Professional Experience", margin, y)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(margin, y, experience["role"])
    y -= 4.5 * mm
    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, experience["organization"])
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawRightString(width - margin, y, experience["status"]["en"])
    y -= 5.5 * mm
    y = wrap_text(c, experience["description"]["en"], margin, y, width - 2 * margin, size=9)
    y -= 1 * mm
    for item in experience["highlights"]["en"]:
        y = bullet(c, item, margin, y, width - 2 * margin)
    y -= 2 * mm

    academic = education["academic"]
    y = section_title(c, "Education", margin, y)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, academic["title"])
    badge = academic["status"]
    bw = c.stringWidth(badge, "Helvetica-Bold", 7.5) + 6 * mm
    c.setFillColor(ACCENT_SOFT)
    c.roundRect(width - margin - bw, y - 1.5 * mm, bw, 5.5 * mm, 2, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(width - margin - bw + 3 * mm, y, badge)
    y -= 4.5 * mm
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(margin, y, f"{academic['institution']}  ·  {academic['dates']}")
    y -= 5 * mm
    y = wrap_text(c, academic["description"]["en"], margin, y, width - 2 * margin)
    y -= 2 * mm

    y = section_title(c, "Technical Training", margin, y)
    for item in education["training"]:
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(margin, y, item["title"])
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        c.drawRightString(width - margin, y, item["dates"])
        y -= 3.8 * mm
        c.setFillColor(TEAL)
        c.setFont("Helvetica", 8)
        c.drawString(margin, y, item["institution"])
        y -= 3.6 * mm
        if item.get("skills"):
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 8)
            c.drawString(margin, y, ", ".join(item["skills"]))
            y -= 4.2 * mm
        else:
            y -= 1.2 * mm

    c.setFillColor(LINE)
    c.line(margin, 12 * mm, width - margin, 12 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(margin, 8 * mm, f"{personal['name']}  ·  {personal['title']}  ·  Resume")
    c.drawRightString(width - margin, 8 * mm, "Page 1 of 2")


def page_portfolio(c, width, height, data):
    personal = data["personal"]
    projects = [p for p in data["projects"] if p.get("featured")] or data["projects"]
    project = projects[0]
    margin = 16 * mm

    c.setFillColor(LIGHT_BG)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, height - 28 * mm, width, 28 * mm, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.rect(0, height - 29.5 * mm, width, 1.5 * mm, fill=1, stroke=0)

    c.setFillColor(HexColor("#A5F3FC"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, height - 11 * mm, "FEATURED PROJECT")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, height - 19 * mm, project["name"])
    c.setFont("Helvetica", 9.5)
    c.setFillColor(HexColor("#D1FAE5"))
    c.drawString(margin, height - 24.5 * mm, project["subtitle"])

    y = height - 36 * mm
    img_h = 58 * mm
    featured = next((i for i in project["images"] if i.get("role") == "featured"), project["images"][0])
    draw_image_fit(c, public_path(featured["src"]), margin, y, width - 2 * margin, img_h)
    y -= img_h + 7 * mm

    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, project["context"].upper())
    y -= 6 * mm

    y = wrap_text(
        c,
        project["description"]["en"],
        margin,
        y,
        width - 2 * margin,
        size=9.2,
        leading=4.5 * mm,
    )
    y -= 3 * mm

    left_x = margin
    right_x = width / 2 + 4 * mm
    col_top = y

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(left_x, col_top, "Key Features")
    c.setStrokeColor(TEAL)
    c.setLineWidth(1.2)
    c.line(left_x, col_top - 1.8 * mm, left_x + 22 * mm, col_top - 1.8 * mm)
    fy = col_top - 7 * mm
    for item in project["features"]:
        fy = bullet(c, item, left_x, fy, width / 2 - margin - 6 * mm)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(right_x, col_top, "Technologies")
    c.setStrokeColor(TEAL)
    c.line(right_x, col_top - 1.8 * mm, right_x + 24 * mm, col_top - 1.8 * mm)
    tx, ty = right_x, col_top - 9 * mm
    c.setFont("Helvetica-Bold", 8)
    for tech in project["technologies"]:
        tw = c.stringWidth(tech, "Helvetica-Bold", 8) + 6 * mm
        if tx + tw > width - margin:
            tx = right_x
            ty -= 7 * mm
        c.setFillColor(ACCENT_SOFT)
        c.roundRect(tx, ty - 1.5 * mm, tw, 5.8 * mm, 2.2, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.drawString(tx + 3 * mm, ty, tech)
        tx += tw + 2.5 * mm

    y = min(fy, ty) - 8 * mm
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "Application Interfaces")
    c.setStrokeColor(TEAL)
    c.line(margin, y - 1.8 * mm, margin + 32 * mm, y - 1.8 * mm)
    y -= 5 * mm

    shots = project.get("pdfScreenshots") or []
    shot_w = (width - 2 * margin - 5 * mm) / 2
    shot_h = 42 * mm
    for i, shot in enumerate(shots[:2]):
        draw_image_fit(c, public_path(shot), margin + i * (shot_w + 5 * mm), y, shot_w, shot_h)

    c.setStrokeColor(LINE)
    c.line(margin, 12 * mm, width - margin, 12 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(margin, 8 * mm, f"{personal['name']}  ·  {project['name']} Featured Portfolio Project")
    c.drawRightString(width - margin, 8 * mm, "Page 2 of 2")
    c.linkURL(personal["linkedin"]["url"], (margin, 7 * mm, margin + 90 * mm, 11 * mm), relative=0)


def main():
    data = load_data()
    out = PUBLIC / "resume" / data["resume"]["filename"]
    out.parent.mkdir(parents=True, exist_ok=True)

    width, height = A4
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle(f"{data['personal']['name']} — Resume & Portfolio")
    c.setAuthor(data["personal"]["name"])
    c.setSubject(f"{data['personal']['title']} Resume and Portfolio")

    page_resume(c, width, height, data)
    c.showPage()
    page_portfolio(c, width, height, data)
    c.save()
    print(f"Wrote {out} ({out.stat().st_size} bytes) from {DATA_PATH}")


if __name__ == "__main__":
    main()
