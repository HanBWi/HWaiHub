"""
Face-Swap: Hannas Gesicht in das AI-Bild einfügen.
"""
import cv2
import numpy as np
from pathlib import Path

BASE     = Path("/Users/hannawinkelmann/Documents/Claude/Projects/Internetseite/assets/images")
SRC_PATH = BASE / "hanna_laptop.jpg"
DST_PATH = BASE / "ai_foto.png"
OUT_PATH = BASE / "ai_foto_hanna.jpg"

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt.xml")
eye_cascade  = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye_tree_eyeglasses.xml")

# ── Gesicht + Augen erkennen ───────────────────────────────────────────────────

def detect(img):
    gray = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    h, w = img.shape[:2]
    faces = face_cascade.detectMultiScale(gray, 1.05, 3, minSize=(40, 40))
    if len(faces) == 0:
        return None, []
    # Größtes Gesicht
    faces = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)
    fx, fy, fw, fh = faces[0]

    # Augen nur in oberer Gesichtshälfte suchen
    face_gray = gray[fy:fy+fh//2, fx:fx+fw]
    eyes_raw = eye_cascade.detectMultiScale(face_gray, 1.05, 3, minSize=(15, 15))

    # Mittelpunkte (absolut), oberstes Augenpaar filtern: 2 Augen in oberer Hälfte
    eye_pts = []
    for (ex, ey, ew, eh) in eyes_raw:
        cx = fx + ex + ew // 2
        cy = fy + ey + eh // 2
        eye_pts.append((cx, cy))

    # Nur zwei Augen nehmen (links/rechts sortiert, größte/am weitesten oben)
    eye_pts.sort(key=lambda p: p[0])
    if len(eye_pts) > 2:
        eye_pts = eye_pts[:2]

    return (fx, fy, fw, fh), eye_pts

# ── Alignment via Augenposition ────────────────────────────────────────────────

def align_src_to_dst(src, src_eyes, dst_eyes, out_shape):
    src_l, src_r = np.float32(sorted(src_eyes, key=lambda p: p[0]))
    dst_l, dst_r = np.float32(sorted(dst_eyes, key=lambda p: p[0]))

    src_mid = (src_l + src_r) / 2
    dst_mid = (dst_l + dst_r) / 2

    scale = (np.linalg.norm(dst_r - dst_l) /
             max(np.linalg.norm(src_r - src_l), 1e-3))
    angle = (np.degrees(np.arctan2(*(dst_r - dst_l)[::-1])) -
             np.degrees(np.arctan2(*(src_r - src_l)[::-1])))

    M = cv2.getRotationMatrix2D(tuple(src_mid), angle, scale)
    M[:, 2] += dst_mid - src_mid

    h, w = out_shape[:2]
    return cv2.warpAffine(src, M, (w, h),
                          flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_REFLECT_101)

# ── Farbton angleichen ─────────────────────────────────────────────────────────

def color_match(src_img, dst_img, mask):
    result = src_img.astype(np.float32)
    for c in range(3):
        sm = cv2.meanStdDev(src_img[:,:,c], mask=mask)
        dm = cv2.meanStdDev(dst_img[:,:,c], mask=mask)
        s_mean, s_std = sm[0][0,0], sm[1][0,0]
        d_mean, d_std = dm[0][0,0], dm[1][0,0]
        if s_std > 1:
            result[:,:,c] = (result[:,:,c] - s_mean) * (d_std / s_std) + d_mean
    return np.clip(result, 0, 255).astype(np.uint8)

# ── Hauptprogramm ──────────────────────────────────────────────────────────────

src = cv2.imread(str(SRC_PATH))
dst = cv2.imread(str(DST_PATH))
assert src is not None, str(SRC_PATH)
assert dst is not None, str(DST_PATH)

src_face, src_eyes = detect(src)
dst_face, dst_eyes = detect(dst)

print(f"SRC Gesicht={src_face}  Augen={src_eyes}")
print(f"DST Gesicht={dst_face}  Augen={dst_eyes}")

if src_face is None or dst_face is None:
    raise RuntimeError("Gesichtserkennung fehlgeschlagen.")

# Alignment (mit Augen falls verfügbar, sonst nur Größenanpassung)
if len(src_eyes) == 2 and len(dst_eyes) == 2:
    aligned = align_src_to_dst(src, src_eyes, dst_eyes, dst.shape)
    print("Alignment: Augen-basiert")
else:
    # Fallback: Gesichtsmittelpunkte + Größenverhältnis
    sx, sy, sw, sh = src_face
    dx, dy, dw, dh = dst_face
    scale = dw / sw
    M = np.float32([[scale, 0, dx - sx*scale],
                    [0, scale, dy - sy*scale]])
    aligned = cv2.warpAffine(src, M, (dst.shape[1], dst.shape[0]),
                              flags=cv2.INTER_LINEAR,
                              borderMode=cv2.BORDER_REFLECT_101)
    print("Alignment: Fallback (Gesichtsgröße)")

# Elliptische Maske um Ziel-Gesicht
fx, fy, fw, fh = dst_face
cx, cy = fx + fw//2, fy + fh//2
mask = np.zeros(dst.shape[:2], dtype=np.uint8)
cv2.ellipse(mask, (cx, cy), (int(fw*0.52), int(fh*0.60)), 0, 0, 360, 255, -1)

# Farbanpassung
aligned_cc = color_match(aligned, dst, mask)

# Seamless Clone
output = cv2.seamlessClone(aligned_cc, dst, mask, (cx, cy), cv2.NORMAL_CLONE)

cv2.imwrite(str(OUT_PATH), output)
print(f"\nFertig → {OUT_PATH}")
