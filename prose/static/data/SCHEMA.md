# Point Cloud Data Schema

## Directory structure

```
static/data/samples/
├── 0/                      # Sample index (matches button 1-5)
│   ├── ref.json            # Reference scan (shared across all 4 panels)
│   ├── src_teaser.json     # Source scan registered by TEASER++
│   ├── src_sgreg.json      # Source scan registered by SG-Reg
│   ├── src_ours.json       # Source scan registered by PROSE (ours)
│   └── src_gt.json         # Source scan with ground-truth registration
├── 1/
│   ├── ref.json
│   ├── src_teaser.json
│   ├── src_sgreg.json
│   ├── src_ours.json
│   └── src_gt.json
├── 2/ ...
├── 3/ ...
└── 4/ ...
```

## File format

Each `.json` file is a flat array of `[x, y, z]` points in **world coordinates** (meters). No headers, no colors — just geometry.

```json
[
  [1.23, 0.45, -0.67],
  [1.25, 0.44, -0.65],
  ...
]
```

## Notes

- **Coordinate system**: The viewer normalizes both ref and src jointly into a ~2.4-unit bounding box centered at the origin. Export in whatever world frame you have — no need to pre-normalize.
- **Point count**: Each point becomes an instanced sphere, so aim for **2,000–8,000 points** per file for good performance. Downsample if needed.
- **ref.json** is the same reference scan shown in all 4 panels. Each `src_*.json` is the source scan after that method's estimated registration transform has been applied.
- **src_gt.json** is the source scan transformed by the ground-truth pose — this is what perfect registration looks like.
- **Fallback**: If `ref.json` is missing for a sample, the viewer falls back to synthetic placeholder data automatically.

## Python export example

```python
import json
import numpy as np

def export_cloud(points: np.ndarray, path: str, max_points: int = 5000):
    """Export an (N, 3) point cloud to the viewer JSON format."""
    if len(points) > max_points:
        idx = np.random.choice(len(points), max_points, replace=False)
        points = points[idx]
    with open(path, 'w') as f:
        json.dump(points.tolist(), f)

# Example usage:
# export_cloud(ref_pcd, "static/data/samples/0/ref.json")
# export_cloud(src_registered_by_ours, "static/data/samples/0/src_ours.json")
```
