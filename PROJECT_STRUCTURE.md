# Portfolio Website - Project Structure

## 📁 Directory Organization

```
Portfolio-Website/
│
├── index.html                 # Main HTML file
├── CNAME                      # Custom domain configuration
├── README.md                  # Project documentation
├── PROJECT_STRUCTURE.md       # This file
├── .gitignore                 # Git ignore rules
│
├── Assets/                    # Document assets
│   └── Navneet _CV.pdf       # Resume/CV file
│
├── css/                       # Stylesheets
│   └── style.css             # Main stylesheet (all styles organized)
│
├── js/                        # JavaScript modules
│   ├── config.js             # EmailJS configuration
│   ├── main.js               # Main application entry point
│   ├── theme.js              # Dark/Light theme management
│   ├── navigation.js         # Navbar and menu functionality
│   ├── typing.js             # Typing animation effect
│   ├── animations.js         # Scroll animations & effects
│   └── contact.js            # Contact form handling
│
├── images/                    # Project images
│   └── developer.jpg         # Project thumbnail
│
├── logo.png                   # Website logo
├── pp.jpg                     # Profile picture
├── weather.png                # Project thumbnails
├── rock.png
└── quiz.png
```

## 🎯 File Purposes

### HTML
- **index.html**: Single-page portfolio with all sections

### CSS
- **css/style.css**: Complete stylesheet with:
  - Theme variables (dark/light mode)
  - Responsive design
  - Animations and transitions
  - Component styles

### JavaScript Modules

#### **js/config.js**
- EmailJS API configuration
- Service IDs and template IDs

#### **js/main.js**
- Application initialization
- Smooth scroll setup
- Performance logging

#### **js/theme.js**
- Theme toggle functionality
- LocalStorage persistence
- Icon updates

#### **js/navigation.js**
- Navbar scroll effects
- Dropdown menu
- Active link highlighting

#### **js/typing.js**
- Animated typing effect
- Multiple phrase rotation
- Character-by-character animation

#### **js/animations.js**
- Floating particles background
- Scroll reveal animations
- Project card staggered reveal
- Skill bar animations
- Parallax effects

#### **js/contact.js**
- Contact form submission
- EmailJS integration
- CV download status
- Form validation

## 🔄 Load Order

Scripts are loaded in this specific order for proper functionality:

1. **EmailJS CDN** - External library
2. **config.js** - Configuration constants
3. **main.js** - Core initialization
4. **theme.js** - Theme management
5. **navigation.js** - Navigation features
6. **typing.js** - Typing animations
7. **animations.js** - Visual effects
8. **contact.js** - Form handling

## 🎨 CSS Organization

The stylesheet is organized into logical sections:

1. **Theme Variables** - Color schemes and constants
2. **Reset & Base Styles** - Global resets
3. **Animated Backgrounds** - Particle and gradient effects
4. **Navigation** - Navbar and menu styles
5. **Hero Section** - Landing page styles
6. **Sections & Titles** - Common section styles
7. **Projects** - Project card grid
8. **Experience & Education** - Timeline styles
9. **Skills** - Skill bars and categories
10. **Contact & Footer** - Form and footer styles
11. **Responsive Design** - Media queries

## 📱 Responsive Breakpoints

- **Desktop**: > 900px
- **Tablet**: 600px - 900px
- **Mobile**: < 600px

## 🚀 Performance Optimizations

- Modular JavaScript for better caching
- CSS in external file for reusability
- Lazy loading for animations
- Optimized particle count
- Efficient event listeners

## 🔧 Maintenance

### Adding New Features
1. Create new JS module in `js/` folder
2. Add script tag to `index.html` in proper order
3. Follow existing module pattern

### Updating Styles
1. Edit `css/style.css`
2. Keep sections organized
3. Use CSS variables for consistency

### Adding Projects
1. Add project card HTML in projects section
2. Include image in root or `images/` folder
3. Update overlay content

## 📝 Notes

- All inline styles have been removed for maintainability
- JavaScript is modular for better organization
- CSS uses custom properties for theming
- Project follows modern web development practices
