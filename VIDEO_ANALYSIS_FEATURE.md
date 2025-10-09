# Video Analysis Feature 🎬🔍

## Overview

The **Video Analysis** feature is the core differentiator for Mimio. It allows users to upload viral organic videos and automatically generate detailed, frame-by-frame Sora prompts to recreate them for their own brands, products, and use cases.

## 🎯 Value Proposition

**Problem**: Brands see viral videos on TikTok/Instagram and want to recreate that style for their products, but don't know how to describe the exact camera movements, lighting, pacing, etc.

**Solution**: Upload the viral video → Get a detailed Sora prompt → Customize for your brand → Generate AI video

## 🚀 How It Works

### 1. Video Upload

- **File Upload**: Users can upload video files directly (MP4, MOV, etc.)
- **URL Support** (coming soon): Paste TikTok, Instagram, YouTube links

### 2. AI Analysis Pipeline

```
Video Upload
     ↓
Frame Extraction (12 key frames)
     ↓
GPT-4 Vision Analysis (each frame)
     ↓
Scene Grouping & Summarization
     ↓
Detailed Sora Prompt Generation
```

### 3. Analysis Output

For each scene, we extract:

- **Description**: What's happening
- **Camera**: Angles, movements, shot types
- **Lighting**: Setup, direction, quality, color temp
- **Action**: Specific movements and actions
- **Composition**: Framing, visual balance
- **Colors**: Dominant colors, grading style
- **Mood**: Emotional tone

### 4. Customization

Users can:

- Replace product names
- Add brand identity
- Modify specific instructions
- Edit the raw prompt directly

### 5. Recreation

One-click button to:

- Pre-fill the Sora creation form
- Generate the video
- Download and use

## 📁 File Structure

### Frontend

```
/app/(dashboard)/analyze/page.tsx
```

- Main analysis interface
- Upload/URL input
- Progress tracking
- Results display
- Customization interface

### Backend

```
/sora-ad-generator/video_analysis_service.py
```

- Frame extraction (OpenCV)
- GPT-4 Vision integration
- Scene analysis
- Prompt generation

```
/sora-ad-generator/api_main.py
```

- `/api/analyze-video` endpoint
- File handling
- Error management

### Configuration

```
/mimio/lib/api-config.ts
```

- Added `ANALYZE_VIDEO` endpoint

## 🔧 Technical Implementation

### Frame Extraction

```python
# Extract 12 key frames evenly spaced throughout the video
frames = extract_key_frames(video_path, max_frames=12)
```

### GPT-4 Vision Analysis

```python
# Analyze each frame with detailed prompts
analysis = analyze_frame(
    frame_path=frame.path,
    timestamp=frame.timestamp,
    context="Describe for Sora recreation"
)
```

### Scene Grouping

```python
# Group nearby frames into coherent scenes
scenes = group_frames_into_scenes(
    frame_analyses,
    scene_threshold=3.0  # seconds
)
```

### Prompt Generation

```python
# Generate detailed second-by-second Sora prompt
sora_prompt = generate_sora_prompt(
    scene_summaries,
    overall_style="Professional commercial quality"
)
```

## 📝 Example Output

### Input Video

```
8-second viral product unboxing video
```

### Generated Prompt

```
A professional product showcase video, 8 seconds total.

SCENE 1 (0-3s): Close-up shot of a sleek modern product centered on a pure white background. Camera slowly dollies in while rotating 360 degrees around the product. Soft key light from top-right creates gentle shadows, rim light adds definition to edges. Product rotates clockwise, its surface gleaming with highlights. Cinematography style: commercial product photography, shallow depth of field, pristine and premium feel.

SCENE 2 (3-6s): Cut to medium overhead shot of hands carefully unboxing the product. Natural daylight streams from a nearby window creating warm, inviting tones. Hands move deliberately, revealing the product with care. Camera maintains steady overhead angle. Lighting: soft natural light, golden hour quality, authentic and relatable atmosphere.

SCENE 3 (6-8s): Rapid montage of extreme macro shots highlighting product features. Camera quickly cuts between close-ups of buttons, texture, materials. High contrast lighting creates dramatic shadows. Each detail is sharp and prominent. Cinematography: commercial macro photography, crisp focus, dynamic and energetic pacing.

Overall aesthetic: Premium commercial quality, modern and aspirational, fast-paced energy, vibrant yet sophisticated color grading.
```

### Customized for Brand

```
Replace "product" with "EcoBottle Pro"
Add "Brand: GreenTech. Emphasize sustainability and eco-friendly messaging"
```

## 🎨 UI/UX Features

### Upload Interface

- Drag & drop support
- File/URL toggle
- Progress indicators
- Real-time updates

### Analysis Display

- Scene-by-scene breakdown
- Visual timeline
- Metadata badges
- Expandable details

### Customization Panel

- Product name input
- Brand name input
- Additional instructions
- Live prompt preview

### Export Options

- Copy prompt to clipboard
- Create directly with Sora
- Save to templates
- Analyze another video

## 🔮 Future Enhancements

### Phase 2

- [ ] URL download support (TikTok, Instagram, YouTube)
- [ ] Audio analysis (music, voiceover, sound effects)
- [ ] Motion tracking (specific object/person movements)
- [ ] Color palette extraction
- [ ] Text/caption detection

### Phase 3

- [ ] Side-by-side original vs generated comparison
- [ ] A/B testing multiple variations
- [ ] Community template library
- [ ] Advanced style transfer
- [ ] Brand voice customization

### Phase 4

- [ ] Real-time preview
- [ ] Interactive timeline editing
- [ ] Multi-video analysis (compare styles)
- [ ] Trend detection (what's viral right now)
- [ ] Auto-scheduling and posting

## 💰 Business Value

### For Users

- **Save Time**: No manual prompt writing
- **Better Results**: Professional-quality prompts
- **Repeatability**: Consistent style recreation
- **Scalability**: Batch analyze multiple videos

### For Mimio

- **Unique Differentiator**: No other tool does this
- **Higher Pricing**: Premium feature = premium pricing
- **Network Effects**: Best prompts → best results → more users
- **Data Moat**: Learn from successful recreations

## 🚀 Getting Started

### Prerequisites

```bash
# Python dependencies (in sora-ad-generator)
pip install opencv-python openai

# Environment variables
OPENAI_API_KEY=your-key-here
```

### Running the Feature

```bash
# Start the Python API server
cd sora-ad-generator
python api_main.py

# Navigate to the analyze page in your browser
http://localhost:3000/analyze
```

### Testing

1. Upload a short video (5-15 seconds recommended)
2. Wait for analysis (30-60 seconds)
3. Review the scene breakdown
4. Customize for your brand
5. Click "Create with Sora"

## 📊 Analytics to Track

- Videos analyzed per user
- Analysis success rate
- Customization usage
- Creation conversion rate
- Most popular viral video sources
- Average prompt length
- Scene detection accuracy

## 🎯 Success Metrics

- **Time to Prompt**: < 60 seconds
- **Prompt Quality**: Users rate 4+ stars
- **Conversion Rate**: 70%+ analyze → create
- **Recreate Accuracy**: Side-by-side comparison score
- **User Satisfaction**: NPS > 50

## 📝 Notes

- Analysis uses GPT-4 Vision (costs ~$0.01-0.05 per video)
- Frame extraction is fast (~2 seconds)
- Scene analysis is the bottleneck (~30-45 seconds)
- Consider caching common viral videos
- Add rate limiting for API costs

## 🔗 Navigation

Located in sidebar as **"ANALYZE VIDEO"** with magic wand icon 🪄

---

**This is the killer feature that makes Mimio essential for every brand doing video marketing.**
