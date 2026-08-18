Enhance my existing S3. portfolio with TWO new features:

1. A unique scroll-linked animated journey trail
2. A complete English / Persian language switcher

IMPORTANT:
Do NOT redesign the website.
Do NOT change the current navy + green + turquoise visual identity.
Do NOT change the current light/dark themes.
Do NOT change existing section backgrounds, cards, typography scale, layout,
content structure, spacing, buttons, or navigation style.

These features must feel like native parts of the current portfolio.

==================================================
FEATURE 1 — S3 SCROLL JOURNEY
==================================================

Create a slim animated vertical journey trail along the outer edge of the website.

The trail represents the visitor's journey through the portfolio while scrolling.

It must NOT look like:
- a normal scrollbar
- a generic progress bar
- a corporate timeline
- a road
- a gaming HUD

It should feel like a subtle futuristic:

digital circuit
+
data flow
+
professional journey

that matches the existing S3. portfolio.

==================================================
TRAIL POSITION
==================================================

For English / LTR mode:

Place the trail on the RIGHT side of the viewport.

Approximately:
28–45px from the outer edge.

For Persian / RTL mode:

Move the entire trail to the LEFT side of the viewport.

Do this automatically when language changes.

The trail should remain visible while scrolling.

It must never overlap important text or project cards.

Maximum visual width:
approximately 45px.

==================================================
THE PATH
==================================================

Create the path using SVG.

Do NOT use a perfectly straight vertical line.

Create very subtle:

- curves
- circuit-like bends
- small horizontal branches
- rounded line endings

Keep it minimal and elegant.

The shape should approximately feel like:

        ○ Home
        │
        ╰─╮
          │
        ● About
          │
      ╭───╯
      │
      ● Projects ──·
      │
      ╰──╮
         ● Skills
         │
      ╭──╯
      ● Experience
      │
      ◎ Contact

Do not make it visually busy.

==================================================
TRAIL COLORS
==================================================

Preserve the existing portfolio colors.

Dark mode inactive path:

rgba(94, 234, 212, 0.12)

Active path:

#10B981
→ #14B8A6
→ #06B6D4

Use a very subtle green → turquoise → cyan gradient.

Do NOT add strong neon.

Light mode:

Use darker turquoise strokes with much softer glow.

The path must remain clearly visible but elegant.

==================================================
SCROLL PROGRESS
==================================================

The active part of the SVG trail must be directly connected to actual scroll progress.

Top of website:
0%

Bottom of website:
100%

As the visitor scrolls down,
the colored section of the path should progressively grow.

Implement using a performant solution such as:

- SVG stroke-dasharray / stroke-dashoffset
- Framer Motion useScroll
- requestAnimationFrame
- IntersectionObserver

Do NOT fake the animation with a timer.

The animation must correspond to the actual position on the page.

==================================================
MOVING ENERGY POINT
==================================================

Add a small glowing point that moves along the SVG trail.

It represents the visitor's current position.

Approximately:

7–9px

Appearance:

- turquoise core
- green/turquoise glow
- very soft halo

The point must follow the actual SVG curve.

It must NOT simply move vertically in a straight line.

Keep the glow subtle.

==================================================
SECTION NODES
==================================================

Create one node for each existing major section:

Home
About
Projects
Skills
Experience
Contact

If another real major section exists in the website,
add a node automatically.

Each node should represent its corresponding section.

Default node:
small outlined circle

Visited node:
filled green/turquoise

Active node:
slightly larger with subtle glow

Upcoming node:
muted outline

==================================================
ACTIVE NODE ANIMATION
==================================================

Only the current section node may pulse.

Use something subtle:

scale:
1 → 1.15 → 1

Duration:
approximately 1.5–2 seconds.

Do NOT continuously animate every node.

==================================================
TRAIL MICRO-INTERACTIONS
==================================================

Add small unique moments.

Projects node:

When Projects becomes active,
briefly create 2–3 tiny circuit branches from the node.

Use a very subtle pink spark if desired:

#FF5CA8

Skills node:

Show 2–3 tiny particles moving outward and fading.

Experience node:

Briefly brighten a small vertical section of the trail.

Contact node:

Create one very soft circular ripple when reached.

Optional tiny orange accent:

#FF8A4C

IMPORTANT:

Pink and orange must remain tiny accent details.

The portfolio identity must still be dominated by:

navy
green
turquoise

Do NOT introduce a pink/orange visual theme.

==================================================
NODE TOOLTIP
==================================================

On desktop:

When hovering over a node,
display a small tooltip with the section name.

English:

Home
About
Projects
Skills
Experience
Contact

Persian:

خانه
درباره من
پروژه‌ها
مهارت‌ها
سوابق
ارتباط با من

Use the same visual style as the existing cards.

Dark mode:

translucent navy

Light mode:

translucent white

Tooltips should only appear on:

hover
or
keyboard focus.

==================================================
CLICKABLE TRAIL
==================================================

Each node must also work as navigation.

Clicking:

Projects
→ scroll smoothly to Projects

Skills
→ scroll smoothly to Skills

Experience
→ scroll smoothly to Experience

etc.

Use accessible links or buttons.

==================================================
TRAIL ENDPOINT
==================================================

The Contact node should be the final destination.

Make it slightly more prominent than the other nodes.

When the visitor reaches approximately:

98–100% scroll

briefly brighten the completed trail for about 500–700ms.

Then return it to normal.

NO:

confetti
large particles
dramatic effects

==================================================
MOBILE TRAIL
==================================================

Below approximately 768px:

Simplify the trail significantly.

Keep only:

- thin progress rail
- current position dot
- basic section nodes

Remove:

- labels
- complex circuit branches
- decorative particles
- large glow

Maximum width:

10–14px

It must never create horizontal scrolling.

==================================================
REDUCED MOTION
==================================================

Respect:

prefers-reduced-motion

When enabled:

Disable:

- particles
- pulsing
- traveling glow animation
- ripple animations

Keep:

- static progress indicator
- current section indicator
- clickable navigation nodes

==================================================
FEATURE 2 — ENGLISH / PERSIAN LANGUAGE SWITCHER
==================================================

Add a professional bilingual language switcher to the header.

Place it near:

- Dark / Light Mode toggle
- Download CV button

Do not redesign the navigation.

==================================================
LANGUAGE BUTTON DESIGN
==================================================

Create a small pill-shaped language control consistent with the existing theme.

Example:

EN | فارسی

or:

🌐 EN

When English is currently active,
the control should clearly allow switching to Persian.

When Persian is currently active,
it should clearly allow switching to English.

Do NOT use country flags.

This is a language switcher,
not a country selector.

Use:

- existing border radius
- subtle turquoise border
- transparent/semi-transparent background
- green/turquoise active state
- subtle hover effect

The language switcher should visually match the existing theme toggle.

==================================================
LANGUAGE MODES
==================================================

English:

lang="en"
dir="ltr"

Persian:

lang="fa"
dir="rtl"

Switching language must update the entire website.

Do not require a page refresh if avoidable.

==================================================
LANGUAGE PERSISTENCE
==================================================

Remember the user's selected language.

Navigation between pages must NOT reset it.

Dark/light theme preference and language preference must be independent.

Example:

Persian + Dark Mode

must remain:

Persian + Dark Mode

after navigating to Projects.

Changing language must never change dark/light mode.

==================================================
TRUE RTL SUPPORT
==================================================

Persian must be implemented as a real RTL interface.

Do NOT simply:

translate text
+
text-align:right

When Persian is selected:

Set the document to:

lang="fa"
dir="rtl"

Apply correct RTL behavior to:

- navigation
- headings
- paragraphs
- buttons
- cards
- About
- Projects
- Skills
- Experience
- Education
- Certificates
- Contact
- forms
- footer
- project details
- mobile navigation

==================================================
DO NOT MIRROR THESE ELEMENTS
==================================================

Never mirror:

- S3. logo
- GitHub logo
- LinkedIn logo
- programming language logos
- technology icons
- project screenshots
- certificate images
- brand logos

Only layout/directional elements should respond to RTL.

==================================================
DIRECTIONAL ARROWS
==================================================

Directional arrows must respond to language direction.

English:

View Project →

Persian:

← مشاهده پروژه

English:

Read More →

Persian:

← بیشتر بخوانید

English:

View All Projects →

Persian:

← مشاهده همه پروژه‌ها

==================================================
FONT — ENGLISH
==================================================

Use:

Inter

for English body text.

For English headings use:

Manrope
or
the existing current heading font.

Maintain the existing typography scale.

Recommended body:

16–18px

line-height approximately:

1.6

==================================================
FONT — PERSIAN
==================================================

Use:

Vazirmatn

for Persian.

Use Vazirmatn consistently for:

- navigation
- headings
- body
- buttons
- cards
- forms
- timeline
- footer
- tooltips
- trail labels

Weights:

Body:
400

Medium interface text:
500

Subheadings:
600

Headings:
700

Do not use extremely heavy Persian font weights.

==================================================
PERSIAN READABILITY
==================================================

Persian typography needs more breathing room.

Use approximately:

Body line-height:
1.85–1.95

Headings:
1.4–1.55

Do not compress Persian paragraphs.

Increase vertical spacing where necessary.

Persian text must remain readable in:

Dark Mode
and
Light Mode.

==================================================
TRANSLATION QUALITY
==================================================

Translations must be:

natural
professional
readable
appropriate for an Iranian professional software portfolio

Do NOT use literal word-for-word machine translation.

Do NOT add information.

Do NOT exaggerate achievements.

English and Persian versions must communicate exactly the same factual content.

==================================================
TECHNICAL TERMS
==================================================

Do NOT translate programming technologies.

Keep these in English even inside Persian content:

Python
Django
JavaScript
React
Next.js
Node.js
MongoDB
MySQL
Git
GitHub
LinkedIn
WordPress
Figma
SafeHands

Example:

Correct Persian:

این پروژه با Python و Django توسعه داده شده است.

Do NOT write technology names using Persian letters.

==================================================
MIXED PERSIAN + ENGLISH TEXT
==================================================

Handle bidirectional text correctly.

Technology tags should remain:

dir="ltr"

when needed.

Examples:

Python
Django
React
Next.js

must not become visually reordered inside Persian content.

Emails and URLs must also remain LTR.

For example:

direction: ltr;
unicode-bidi: isolate;

Use proper bidi isolation without changing the surrounding Persian paragraph direction.

==================================================
NAVIGATION TRANSLATION
==================================================

Use:

Home
→ خانه

About
→ درباره من

Projects
→ پروژه‌ها

Skills
→ مهارت‌ها

Experience
→ سوابق

Certificates
→ مدارک

Contact
→ ارتباط با من

Download CV
→ دانلود رزومه

Only display menu items that already exist in the website.

Do not create new sections just because they appear in this translation list.

==================================================
HERO
==================================================

Translate the ACTUAL current Hero content.

Do not create new professional claims.

Example structure:

English:

Hello, I'm
Sepideh Estiri

Persian:

سلام، من
سپیده استیری هستم

Keep the professional title based on the actual existing website content.

Buttons:

View My Projects
→ مشاهده پروژه‌ها

Contact Me
→ ارتباط با من

Download CV
→ دانلود رزومه

==================================================
PROJECTS
==================================================

Project names such as:

SafeHands

must remain unchanged.

Do NOT translate product names.

Each project should support:

titleEn
titleFa

descriptionEn
descriptionFa

longDescriptionEn
longDescriptionFa

Technology tags remain English.

Project screenshots must remain unchanged.

Do NOT translate or modify text inside screenshots.

==================================================
SKILLS
==================================================

Technology names remain English.

Examples:

Python
Django
JavaScript
React
Next.js
Node.js
MongoDB
MySQL

Translate only category/interface labels.

Example:

Programming Languages
→ زبان‌های برنامه‌نویسی

Frontend Development
→ توسعه Frontend

Backend Development
→ توسعه Backend

Databases
→ پایگاه‌های داده

Development Tools
→ ابزارهای توسعه

==================================================
EXPERIENCE & EDUCATION
==================================================

Translate descriptions naturally.

Do not modify factual:

- job titles
- organizations
- dates
- degree information
- experience details

Official English organization names can remain English when appropriate.

Do not automatically convert Gregorian dates into Jalali.

If no reliable date conversion is implemented,
keep the original Gregorian dates.

==================================================
CONTACT
==================================================

Translations:

Let's Connect
→ در ارتباط باشیم

Name
→ نام

Email
→ ایمیل

Subject
→ موضوع

Message
→ پیام

Send Message
→ ارسال پیام

Persian form input text should align naturally RTL.

Emails and URLs themselves must remain LTR.

==================================================
LANGUAGE SWITCH + SCROLL TRAIL INTEGRATION
==================================================

This is important.

When switching:

English → Persian

Do ALL of the following simultaneously:

1. Translate the interface.
2. Set document direction to RTL.
3. Switch Persian typography to Vazirmatn.
4. Move the Scroll Journey trail from RIGHT to LEFT.
5. Translate the trail tooltips.
6. Reverse directional arrows.
7. Preserve the user's exact scroll position.
8. Preserve dark/light mode.
9. Preserve the active section.
10. Do not restart scroll animations from the beginning.

When switching:

Persian → English

reverse these changes accordingly.

The transition should feel smooth.

==================================================
MOBILE LANGUAGE SWITCH
==================================================

The language selector must also be available in the mobile navigation.

The Persian mobile menu must be fully RTL.

Buttons must resize naturally for longer Persian text.

Do not use fixed widths that cause:

- text clipping
- overflow
- broken labels

==================================================
ACCESSIBILITY
==================================================

Language switcher must be keyboard accessible.

Accessible English label:

Switch language to Persian

Accessible Persian label:

تغییر زبان به انگلیسی

Trail nodes must also be keyboard accessible.

Examples:

Go to Projects section

رفتن به بخش پروژه‌ها

==================================================
PERFORMANCE
==================================================

Keep both features lightweight.

Prefer:

SVG
CSS
Framer Motion if already installed
IntersectionObserver
requestAnimationFrame

Avoid:

Three.js
WebGL
large particle libraries
complex canvas animations
unnecessary external dependencies

==================================================
FINAL RESULT
==================================================

The website should remain visually the same portfolio I already designed.

Do NOT redesign it.

The final experience should add:

1. A memorable scroll-linked digital journey
2. Professional English / Persian bilingual support

The visitor should feel like they are moving through Sepideh Estiri's
professional journey while scrolling.

The moving trail should subtly communicate:

Technology
Progress
Data Flow
Professional Journey

The language system must feel equally polished in English and Persian.

The result should remain:

professional
modern
clean
interactive
premium
technical
memorable

without becoming:

gaming-style
overly neon
crowded
or visually distracting.