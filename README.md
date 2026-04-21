# Navneet Mallick — Portfolio

> Personal portfolio website for Navneet Mallick, Computer Engineering student at IOE Purwanchal Campus, Dharan. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

🌐 **Live:** [navneetmallick.com.np](https://navneetmallick.com.np)

---

## Features

### Boot & Welcome Experience
- **Animated loading screen** — terminal-style typewriter boot sequence with a progress bar, NM logo, and animated particles. Auto-dismisses after all messages complete or immediately on tap/click/keypress.
- **Welcome card** — after the loading screen exits, a glassmorphism card slides up from the bottom with a particle burst from the screen centre. Displays name, role, and animated bouncing dots. Auto-dismisses after ~3 seconds.

---

### Theme System
Three themes, cycled with the navbar button or the `T` keyboard shortcut:

| Theme | Description |
|-------|-------------|
| **Dark** | Deep navy background with cyan (`#00e5ff`) and purple accents — the default |
| **Light** | Clean white/blue gradient with blue (`#2563eb`) accents |
| **Neon** | OLED black with vivid magenta (`#e040fb`) and hot-pink neon glows |

Theme preference is saved to `localStorage` and restored on next visit. Switching uses a smooth full-screen ripple transition.

---

### Navigation
- **Fixed navbar** with logo, section links, and a dropdown menu for additional pages (Experience, Certifications, GitHub Stats, CV download, socials).
- **Mobile bottom navigation bar** — persistent tab bar on small screens for Home, Projects, Skills, Experience, and Contact.
- **Scroll progress bar** — thin gradient line at the very top of the viewport showing reading progress.
- **Back-to-top button** — appears after scrolling down, smooth-scrolls back to the hero.

---

### Hero Section
- Animated profile photo with a floating effect, glowing border, and a rotating conic-gradient aura ring.
- Typewriter text cycling through roles (Web Developer, ML Engineer, etc.).
- Availability badge, CTA buttons (Hire Me, Download CV).
- Animated hero canvas background.

---

### About Section
- Two-column layout: bio text with status tags (Open to Work, Freelance, Collaboration, Internships) and a "Currently Learning" strip.
- Info card with location, institution, and current roles — animated top-border sweep on hover.

---

### Terminal Intro
- Interactive terminal card with a 3D floating/tilt animation.
- Typewriter output showing `cat about.txt` with key/value pairs about skills, location, and role.

---

### Stats Counter
Four animated counters that count up when scrolled into view:
- Projects Built · Roles Held · GitHub Commits · Certifications

---

### Projects Section
- Filterable grid (All / Web / ML·DS / C·C++) with animated tab switching.
- Each card reveals an overlay on hover with project title, tech stack, and Live Demo / Repo buttons.
- Featured badge on highlighted projects.
- Projects: Movie Recommender, Car Price Predictor, Retail ETL Pipeline, GrooveBox Music Player, PokeDex, VoteSecure Online, Hackathon Project (XENOM), Quiz Master Game, Library Management System.

---

### GitHub Stats
- GitHub stats card and top languages card (via `github-readme-stats`).
- GitHub activity contribution graph.
- Contribution snake animation.
- All cards have hover lift + glow effects.

---

### Education Timeline
Vertical animated timeline with three entries:

| Period | Qualification | Institution |
|--------|--------------|-------------|
| 2024 – Present | B.E. Computer Engineering | IOE Purwanchal Campus, Dharan |
| 2021 – 2023 | +2 Science (NEB) | DAV College, Lalitpur |
| 2009 – 2021 | SEE | MIT English Boarding School, Janakpur |

Each entry has an animated icon, date badge, description, and subject tags. The timeline line grows from top to bottom on scroll.

---

### Experience Section
Two experience cards with animated left-accent bar and diagonal shimmer on hover:
- **Intern Supervisor** — CODE IT, Dharan (Feb 2026 – Present)
- **Graphics Designer** — ACES ERC, Dharan (Feb 2026 – Present)

---

### Certifications
Four certification cards in a responsive grid, each with a rotating icon on hover and an animated bottom glow bar:
- CS50x AI Nepal — EXCESS, IOE ERC
- ACES TechFest 7.0 & X-Hack 3.0 — ACES, IOE Purwanchal Campus
- Node.js Training — ACES × Digital Pathshala
- IoT & Raspberry Pi — Taranga @ ERC

---

### Skills Table
Tabular layout with four categories (Frontend, Backend, ML & Data, Tools), each showing tech tags with icons and an animated proficiency bar. On hover, the bar switches to a rainbow gradient animation.

---

### Testimonials Carousel
Circular card carousel with five colleague testimonials:
- **Prashant** — Hackathon Collaborator
- **Praful** — C++ Project Partner
- **Rijan** — Project Collaborator
- **Nirmal** — Project Collaborator
- **Aashish** — C Language Mentor

Features: real colleague photos, auto-scroll every 5 seconds, left/right navigation arrows, dot indicators, swipe support on mobile, keyboard arrow navigation, pause on hover. Each card has a rotating gradient border and floating animation.

> Colleague photos are stored locally in `/Testimonials/` and excluded from version control via `.gitignore` to protect privacy.

---

### Location Map
Embedded Google Maps iframe showing Dharan, Nepal with a hover lift effect.

---

### Contact Form
EmailJS-powered contact form with name, email, and message fields. Includes:
- Honeypot anti-spam field
- Input validation
- Toast notification on success/failure
- Submit button with loading state

---

### Music Player
Floating mini-player (bottom-right) with:
- Three tracks: Lo-Fi Beats (Eagles), Phonk mode, Interstellar
- Play/pause, animated equaliser bars, track name, progress bar, volume slider
- Mode switcher (moon/sun/flame icon)
- External link to the full [GrooveBox Music Player](https://groove-box-three.vercel.app/) with a "NEW" notification badge
- Auto-plays after boot screen dismisses

---

### Games
In-page game modal (accessible from the navbar Play button or `G` shortcut) with three games:
- 🏃 **Runner** — endless runner, Space/tap to jump, double jump enabled
- 🐦 **Flappy Bird** — Space/tap to flap, avoid pipes
- 💣 **Minesweeper** — Easy (9×9), Medium (16×16), Hard (16×30); left-click reveal, right-click/long-press flag

A banner inside the modal links to the full [Game Center](https://game-center-nm.vercel.app/) with a "7+ GAMES" notification badge.

---

### Keyboard Shortcuts
Press `?` or tap the keyboard icon to open the shortcuts panel (bottom-sheet on mobile, centred modal on desktop):

| Key | Action |
|-----|--------|
| `?` | Toggle shortcuts panel |
| `T` | Cycle theme (Dark → Light → Neon) |
| `G` | Open games |
| `M` | Toggle music |
| `1–5` | Navigate to Home / About / Projects / Skills / Contact |
| `Esc` | Close any overlay |

Swipe down to dismiss on mobile.

---

### Visual Effects
- **Matrix rain canvas** — subtle falling characters in the background (desktop only)
- **Scanlines overlay** — CRT-style horizontal lines
- **Custom cursor** — glowing dot + ring that enlarges on interactive elements (desktop only)
- **Floating particles** — ambient background particles
- **Explosion particles** — burst on certain interactions
- **Magnetic buttons** — buttons subtly follow the cursor
- **Scroll-triggered reveal animations** — sections fade/slide in as they enter the viewport
- **Achievement system** — unlockable badges stored in `localStorage` (First Boot, Deep Diver)
- **Easter egg modal** — hidden interactions trigger surprise messages

---

### Performance & Accessibility
- Lazy-loaded images throughout
- Service worker (`sw.js`) for offline caching
- `robots.txt` and `sitemap.xml` for SEO
- JSON-LD structured data (Person schema)
- Open Graph and Twitter Card meta tags
- `preconnect` and font preloading for faster render
- Mobile-specific CSS: reduced animation travel distance, disabled heavy effects (matrix, scanlines, cursor), hardware-accelerated transforms, touch-optimised tap targets
- `prefers-reduced-motion` support — all animations disabled for users who prefer it
- ARIA labels on interactive elements, semantic HTML throughout
- Safe-area inset support for notched devices (iPhone X+)

---

### Footer
Social links (GitHub, LinkedIn, Instagram), copyright year (auto-updated), audio visualiser bars, and an achievements counter showing how many easter eggs have been unlocked.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox, animations) |
| Scripting | Vanilla JavaScript (ES6+) |
| Email | EmailJS |
| 3D | Three.js (hero canvas) |
| Fonts | Google Fonts — Poppins |
| Icons | Font Awesome 6 |
| Hosting | GitHub Pages (custom domain via CNAME) |

---

## File Structure

```
├── index.html              # Main entry point
├── 404.html                # Custom 404 page
├── sw.js                   # Service worker
├── robots.txt / sitemap.xml
├── CNAME                   # navneetmallick.com.np
│
├── CSS/
│   ├── style.css           # Core styles + all themes
│   ├── mobile.css          # Responsive breakpoints
│   ├── mobile-performance.css  # Mobile GPU/animation optimisations
│   ├── loading-screen.css  # Boot overlay styles
│   ├── advanced-effects.css
│   ├── welcome.css         # Post-boot welcome card
│   └── shortcuts.css       # Keyboard shortcuts modal
│
├── js/
│   ├── audio.js            # Boot sequence + Web Audio sounds
│   ├── theme.js            # 3-way theme cycle
│   ├── navigation.js       # Navbar, dropdown, mobile nav
│   ├── typing.js           # Typewriter effect
│   ├── terminal.js         # Terminal intro animation
│   ├── animations.js       # Scroll reveals, counters, timeline
│   ├── hero-animation.js   # Three.js hero canvas
│   ├── music.js            # Music player logic
│   ├── game.js             # In-page games (Runner, Flappy, Minesweeper)
│   ├── contact.js          # EmailJS form handler
│   ├── testimonials.js     # Carousel logic
│   ├── welcome.js          # Post-boot particle burst + card
│   ├── shortcuts.js        # Keyboard shortcuts modal
│   ├── interactions.js     # Cursor, magnetic buttons, particles
│   ├── extras.js           # Achievements, easter eggs, toasts
│   ├── crazy.js            # Easter egg interactions
│   ├── cherry.js           # Section breadcrumb trail
│   ├── performance.js      # Runtime performance optimisations
│   ├── main.js             # Init + scroll progress
│   └── config.js           # Global configuration
│
├── Assets/
│   ├── images/             # Profile photo, project thumbnails, logo
│   ├── *.mp3               # Music tracks (Eagles, Phonk, Interstellar)
│   └── Navneet _CV.pdf     # Downloadable CV
│
└── Testimonials/           # Colleague photos (gitignored — private)
```

---

*Built with passion and code by Navneet Mallick ❤️*
