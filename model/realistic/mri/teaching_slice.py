"""Teaching MRI for "Reading your MRI report" (3D roadmap step 5, Nov 5): one healthy volunteer's side-view (sagittal)
T2 scan at the midline, with numbered markers on structures that can be placed reliably.

Data (public domain, CC0; the researchers removed the face before release):
  Bédard S, Cohen-Adad J. Spinal Cord Head Positions. OpenNeuro ds004507, doi:10.18112/openneuro.ds004507.v1.1.2
  sub-002, ses-headNormal, T2w (0.6 mm), and the researchers' own manual labels (spinal cord outline, disc points).
  https://s3.amazonaws.com/openneuro.org/ds004507/sub-002/ses-headNormal/anat/sub-002_ses-headNormal_T2w.nii.gz
  (MD5 2c4ba936bb9ea5bee4dab01cc2922439)

Run (needs nibabel, numpy, pillow):
  python -I model/realistic/mri/teaching_slice.py <T2w.nii.gz> <seg-manual.nii.gz> public/mri/sagittal-t2.png src/lib/mri-markers.json

Markers are placed only where a structure is unambiguous on this scan. The cerebellar tonsils and the edges of the skull
opening are left out on purpose: placing them precisely on a healthy scan is a radiologist's call (docs/drafts).
"""
import json, sys
import numpy as np
import nibabel as nib
from PIL import Image

t2_file, seg_file, png_out, json_out = sys.argv[1:5]
X = 32  # the midline slice (of 64): the one showing the fourth ventricle, the vermis and the whole cord
vol = nib.load(t2_file)
# Display orientation: rows top (superior) to bottom, columns front (anterior, face on the left) to back.
sl = vol.get_fdata()[X].T[::-1, ::-1]
seg = nib.load(seg_file).get_fdata()[X].T[::-1, ::-1]

# Crop: the back of the brain, the cerebellum, the skull opening and the neck down to about C4 (leaves out most of
# the blank area where the face was removed).
R0, R1, C0, C1 = 0, 320, 90, 350
crop = sl[R0:R1, C0:C1]
lo, hi = np.percentile(sl, [1, 99.7])
img = Image.fromarray(np.clip((crop - lo) / (hi - lo) * 255, 0, 255).astype(np.uint8))
SCALE = 2
img = img.resize((crop.shape[1] * SCALE, crop.shape[0] * SCALE), Image.BICUBIC)
img.save(png_out, optimize=True)

# The spinal cord marker sits on the researchers' own cord outline (its middle, between the C2-C3 and C3-C4 discs).
rows = np.nonzero(seg[:, :].any(axis=1))[0]
r_cord = 200
cols = np.nonzero(seg[r_cord])[0]
cord = (float(cols.mean()), float(r_cord))

# (column, row) in the displayed slice. Checked by eye and by an independent check (docs/audits).
MARKERS = [
    ('cerebrum', '01', (300, 22)),       # occipital lobe, above the tentorium
    ('cerebellum', '03', (262, 80)),     # the folia ("tree" pattern)
    ('ventricle', '04', (222, 75)),      # the fourth ventricle: bright fluid between brainstem and cerebellum
    ('brainstem', '05', (209, 92)),      # just behind the researchers' pontomedullary-junction point (col 200, row 102)
    ('cord', '08', cord),                # from the manual cord outline
    ('csf', '09', (258, 118)),           # the bright fluid space behind and below the cerebellum (cisterna magna)
    ('c2', '10', (174, 181)),            # C2 body, between the researchers' C1-C2 and C2-C3 disc points (rows 169, 193)
]
w, h = C1 - C0, R1 - R0
out = {
    'width': img.width,
    'height': img.height,
    'markers': [{'part': p, 'num': n, 'x': round((c - C0) / w * 100, 2), 'y': round((r - R0) / h * 100, 2)} for p, n, (c, r) in MARKERS],
}
json.dump(out, open(json_out, 'w'), indent=2)
print('wrote', png_out, img.size, 'and', json_out)
