# Build an Image Carousel / Slider

## Requirements
- Display images one at a time with prev/next buttons
- Auto-play with configurable interval
- Dots/indicators showing current position
- Touch/swipe support, smooth transitions

## Implementation
```javascript
function Carousel({ images, autoPlay = true, interval = 3000 }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef();

  const goTo = (idx) => setCurrent((idx + images.length) % images.length);
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [current, autoPlay, interval]);

  // Pause on hover
  const pause = () => clearInterval(timerRef.current);
  const resume = () => { if (autoPlay) timerRef.current = setInterval(next, interval); };

  return (
    <div className="carousel" onMouseEnter={pause} onMouseLeave={resume}>
      <div className="slides" style={{ transform: `translateX(-${current * 100}%)`, transition: 'transform 0.5s' }}>
        {images.map((img, i) => <img key={i} src={img} alt={`Slide ${i}`} style={{ width: '100%', flexShrink: 0 }} />)}
      </div>
      <button className="prev" onClick={prev}>‹</button>
      <button className="next" onClick={next}>›</button>
      <div className="dots">
        {images.map((_, i) => <span key={i} className={i === current ? 'active' : ''} onClick={() => goTo(i)} />)}
      </div>
    </div>
  );
}
```

## Key Patterns
- **CSS transform** (`translateX`) for smooth sliding
- **Modular arithmetic** for infinite loop: `(idx + length) % length`
- **Auto-play**: setInterval with cleanup, pause on hover
- **Touch/swipe**: listen to `touchstart`/`touchend`, detect direction from deltaX
