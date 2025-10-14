# StrideSync Landing Page

A sleek, modern landing page for the StrideSync AI-powered gait analysis application, inspired by the design aesthetics of Strava, Garmin, and Nike.

## Features

### 🎨 Design Highlights
- **Modern Dark Theme**: Professional dark UI with vibrant accent colors
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Engaging micro-interactions and scroll animations
- **Athletic Branding**: Inspired by top sports technology brands

### 🚀 Interactive Elements
- **Hero Section**: Animated background with floating gradient orbs
- **Feature Showcase**: Six key features with hover effects and icons
- **How It Works**: Three-step process explanation with animated icons
- **File Upload**: Drag & drop video upload with real-time validation
- **Progress Simulation**: Realistic analysis progress with step-by-step feedback
- **Results Preview**: Mock gait analysis results with interactive charts

### 📱 User Experience
- **Intuitive Navigation**: Sticky header with smooth scroll navigation
- **Mobile-First**: Hamburger menu and responsive layouts
- **Form Validation**: Real-time file type and size validation
- **Performance Optimized**: Efficient CSS animations and lazy loading

## File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling and responsive design
├── script.js           # Interactive JavaScript functionality
└── README.md          # This documentation file
```

## Key Sections

### 1. Hero Section
- **Compelling headline** with gradient text effects
- **Key statistics** (10,000+ analyses, 95% accuracy, 30s analysis time)
- **Call-to-action buttons** with smooth hover animations
- **Phone mockup** with simulated gait analysis overlay

### 2. Features Section
- **Six core features** with modern card layouts
- **Icon-based design** using FontAwesome icons
- **Hover animations** with elevation and border effects
- **Feature highlights**: Video upload, AI detection, real-time metrics, professional reports

### 3. How It Works
- **Three-step process**:
  1. Record Your Gait (smartphone video)
  2. AI Analysis (real-time processing)
  3. Get Results (comprehensive report)
- **Animated icons** including spinning cog for processing
- **Clear, actionable descriptions** for each step

### 4. Upload Interface
- **Gait Type Selection**: Radio buttons for running vs walking
- **Camera Angle**: Side view vs back view options
- **Drag & Drop Upload**: Visual feedback and file validation
- **Progress Tracking**: Step-by-step analysis simulation
- **Results Display**: Mock metrics and ROM chart generation

### 5. Contact & Footer
- **Professional contact information**
- **QR code placeholder** for easy mobile access
- **Comprehensive footer** with organized links
- **Brand tagline**: "Stride into peak gait performance"

## Technical Implementation

### CSS Features
- **CSS Grid & Flexbox**: Modern layout systems
- **CSS Custom Properties**: Consistent design tokens
- **Advanced Animations**: Keyframes, transitions, and transforms
- **Responsive Breakpoints**: Mobile, tablet, and desktop optimized
- **CSS Gradients**: Modern color schemes and visual effects

### JavaScript Functionality
- **File Upload Handling**: Drag & drop with validation
- **Progress Simulation**: Realistic analysis workflow
- **Chart Generation**: Canvas-based ROM visualization
- **Smooth Scrolling**: Enhanced navigation experience
- **Intersection Observer**: Performance-optimized scroll animations

### Design System
```css
:root {
    --primary-color: #60C2E4;      /* StrideSync Blue */
    --secondary-color: #00FFAB;    /* Performance Green */
    --accent-color: #FF6B6B;       /* Warning Red */
    --dark-bg: #0A0A0B;           /* Deep Black */
    --dark-surface: #1A1A1B;      /* Surface Black */
    --dark-elevated: #2A2A2B;     /* Elevated Surface */
}
```

## Integration with Streamlit App

This landing page is designed to complement the existing Streamlit gait analysis application:

### Connection Points
1. **Upload Interface**: Matches Streamlit's video upload functionality
2. **Gait Types**: Supports same analysis types (running, walking, side/back views)
3. **Results Format**: Mirrors the PDF report structure and metrics
4. **Branding**: Consistent with StrideSync visual identity

### Implementation Options
1. **Standalone Landing**: Use as marketing site with links to Streamlit app
2. **Embedded Integration**: Include landing sections in Streamlit sidebar
3. **Progressive Enhancement**: Start with landing page, transition to full app

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Features Used**:
  - CSS Grid & Flexbox
  - CSS Custom Properties
  - IntersectionObserver API
  - File API for drag & drop
  - Canvas 2D for chart rendering

## Performance Considerations

- **Optimized Assets**: Efficient CSS with minimal JavaScript
- **Lazy Loading**: Intersection Observer for scroll animations
- **Mobile Performance**: Touch-optimized interactions
- **File Handling**: Client-side validation before upload
- **Progressive Enhancement**: Core functionality works without JavaScript

## Customization

### Brand Colors
Update the CSS custom properties in `:root` to match your brand:

```css
:root {
    --primary-color: #YourBrandColor;
    --secondary-color: #YourAccentColor;
    /* ... other custom properties */
}
```

### Content Updates
- Modify text content in `index.html`
- Update statistics in the hero section
- Customize feature descriptions
- Add real testimonials or case studies

### Integration
- Connect file upload to actual analysis backend
- Replace mock results with real API calls
- Add user authentication if needed
- Implement payment processing for premium features

## Future Enhancements

### Potential Additions
- **User Testimonials**: Real customer success stories
- **Pricing Tiers**: Different analysis packages
- **Sample Results**: Interactive demo with real data
- **Blog Integration**: Educational content about gait analysis
- **User Dashboard**: Account management and analysis history

### Technical Improvements
- **PWA Features**: Service worker, offline support
- **Real-time Updates**: WebSocket connection for live analysis
- **Advanced Animations**: GSAP or Framer Motion integration
- **A/B Testing**: Different layouts and messaging
- **Analytics Integration**: User behavior tracking

This landing page provides a professional, engaging entry point for users interested in gait analysis while maintaining the technical sophistication of the underlying Streamlit application.