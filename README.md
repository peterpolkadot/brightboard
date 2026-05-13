# brightboard# BRIGHTBOARD — MASTER PRODUCT INSTRUCTIONS

# PROJECT OVERVIEW

Build a web application called:

# Brightboard

Brightboard is an AI-powered curriculum-aware classroom content generation platform for Australian Foundation teachers.

The product helps teachers rapidly generate:

* beautiful slide decks
* infographic resources
* practical lesson plans

that are:

* curriculum aligned
* visually engaging
* Foundation appropriate
* classroom ready

Brightboard is NOT:

* a generic AI chatbot
* a Canva clone
* a complex LMS
* a giant editing platform

Brightboard should feel:

* magical
* simple
* modern
* visual
* teacher friendly

The system should prioritize:

* structured generation
* visual consistency
* curriculum alignment
* ease of use
* practical classroom outputs

---

# BRAND DIRECTION

# Brand Name

Brightboard

---

# Homepage Hero

> Beautiful classroom resources in minutes.

---

# Homepage Subheading

> Create curriculum-aligned slides, infographics, and lesson plans designed for Foundation classrooms.

---

# VISUAL IDENTITY

The product should visually feel:

* colorful
* warm
* modern
* premium
* approachable
* classroom friendly

Visual style:

* cartoon classroom illustrations
* soft gradients
* rounded UI
* playful but premium
* Australian-inspired classroom visuals

The UI should avoid:

* corporate edtech styling
* overly serious academic visuals
* clutter
* dark interfaces
* generic AI aesthetics

---

# MASCOT DIRECTION (FUTURE)

The platform should be architected with future mascot integration in mind.

Potential mascot directions:

* little classroom lightbulb character
* chalk creature
* rainbow bird
* smiling classroom “guide” assistant

Do NOT implement mascot systems yet.

Only ensure the visual identity could support this direction later.

---

# TARGET USERS

Australian Foundation teachers.

Student age group:

* approximately 5–6 years old.

The system must understand:

* Foundation pedagogy
* visual-first learning
* low reading complexity
* short attention spans
* engagement-based learning

---

# PRODUCT PHILOSOPHY

Brightboard should:

* reduce teacher workload
* simplify classroom preparation
* produce beautiful outputs quickly
* guide users through structured workflows

The product should rely on:

* guided clicks
* templates
* curriculum-aware generation
* structured JSON systems

The product should NOT rely on:

* freeform prompting
* blank canvases
* advanced editing workflows

Teachers should feel:

> “I can create beautiful classroom resources in minutes.”

---

# CORE MVP FEATURES

## 1. USER AUTHENTICATION

Use Supabase Auth.

Users can:

* create account
* login
* logout

---

# 2. DASHBOARD

Simple clean dashboard showing:

* recent projects
* saved resources
* folders
* thumbnails
* project timestamps

The dashboard should feel:

* lightweight
* visual
* organized

---

# 3. PROJECT CREATION FLOW

Teachers create a project through guided steps.

---

## STEP 1 — SELECT YEAR LEVEL

Initially:

* Foundation only

Architecture should support future expansion.

---

## STEP 2 — SELECT SUBJECT

Initial focus:

* Science
* English

Science should be the primary MVP subject.

---

## STEP 3 — SELECT CURRICULUM OUTCOME

Curriculum data should exist in structured JSON/database format.

Each curriculum item should contain:

* curriculum code
* title
* strand
* sub-strand
* description
* concepts
* keywords
* vocabulary
* learning goals

STRICT curriculum alignment is required.

Generated content must directly map to the selected curriculum outcome.

This is especially important for Science content.

---

## STEP 4 — SELECT RESOURCE TYPE

Initial resource types:

* Slide Deck
* Infographic
* Lesson Plan

---

## STEP 5 — SELECT VISUAL STYLE

Initially support ONE signature style only:

# Bright Cartoon Classroom

Style characteristics:

* colorful
* cartoon-inspired
* highly readable
* warm
* engaging
* Foundation friendly
* Australian-inspired
* educational premium feel

This style should become Brightboard’s visual identity.

---

# 4. SLIDE PLAN GENERATION

Before generating slides, the system should generate:

> a slide plan

Example:

1. Title slide
2. Topic overview
3. Lifecycle overview
4. Egg stage
5. Caterpillar stage
6. Chrysalis stage
7. Butterfly stage
8. Activity slide
9. Summary slide

Teachers should be able to:

* approve
* reorder
* remove
* regenerate

No advanced editing required.

---

# 5. SLIDE-BY-SLIDE GENERATION

Slides should generate individually.

Teacher workflow:

* preview slide
* approve slide
* regenerate slide
* continue to next slide

Avoid giant multi-slide generation dumps.

This step-by-step workflow is extremely important.

---

# 6. SLIDE OUTPUT FORMAT

Slides should generate as:

* high-resolution images
  OR
* PDF pages

DO NOT build editable slide canvases.

The focus is:

* visual consistency
* simplicity
* export quality
* fast generation

Teachers may:

* display slides
* print slides
* insert images into PowerPoint manually

---

# 7. INFOGRAPHIC GENERATION

Support generation of:

* single-page educational infographic resources

Examples:

* butterfly lifecycle
* seasons
* weather
* living things

Infographics should:

* use minimal text
* emphasize visuals
* be highly readable
* use large labels
* print cleanly

---

# 8. LESSON PLAN GENERATION

Lesson plans should:

* align with curriculum
* use practical classroom language
* avoid bureaucratic educational jargon

Lesson plans should include:

* learning intention
* success criteria
* materials needed
* classroom activities
* discussion prompts
* assessment ideas
* extension ideas

The tone should feel:

* useful
* teacher friendly
* classroom practical

---

# 9. STORAGE SYSTEM

Teachers should be able to save:

* projects
* slides
* infographics
* lesson plans

Projects should support:

* folders
* thumbnails
* timestamps
* organization

---

# 10. EXPORT SYSTEM

Initial exports:

* PDF
* image pack download

Stage 2 placeholder only:

# “Download Full Resource Pack”

This feature should appear:

* disabled
* greyed out
* future/premium

Do NOT implement yet.

---

# TECH STACK

Frontend:

* Next.js
* Tailwind CSS
* shadcn/ui

Backend:

* Supabase

Storage:

* Supabase Storage

Authentication:

* Supabase Auth

Hosting:

* Vercel

Version control:

* GitHub

Deployment:

* GitHub auto-deploy to Vercel

---

# AI GENERATION SYSTEM

The platform should use:

* structured prompts
* structured JSON
* reusable templates
* curriculum-aware generation logic

DO NOT rely on raw conversational generation alone.

The pipeline should:

1. generate structured JSON
2. validate structure
3. generate image prompts
4. generate final assets

---

# TEMPLATE SYSTEM

The system should use reusable templates for:

* hero slides
* lifecycle slides
* fact slides
* activity slides
* infographic layouts
* lesson plan layouts

Templates should define:

* layout zones
* typography
* placeholders
* image placement
* spacing rules
* visual rules

---

# FOUNDATION PEDAGOGY RULES

Generated content should:

* use simple vocabulary
* minimize text density
* maximize visual learning
* support sequencing
* encourage observation
* use large typography
* maintain high engagement

Avoid:

* long paragraphs
* cluttered layouts
* overly academic wording
* dense informational slides

---

# APPLICATION EXPERIENCE

Brightboard should feel:

* fast
* delightful
* visual
* low friction
* approachable for non-technical teachers

The product should feel:

> “beautiful classroom content generation”

rather than:

> “complex AI software”

---

# STAGE 1 PRIORITY

The absolute priority is:

# building a reliable curriculum-aware content production engine

Do NOT overbuild:

* editing systems
* admin systems
* collaboration systems
* marketplace systems

The MVP focus is:

* quality generation
* clean workflow
* beautiful outputs
* teacher usability

---

# FUTURE STAGE 2 IDEAS (DO NOT IMPLEMENT YET)

* full resource packs
* worksheets
* flashcards
* coloring sheets
* parent handouts
* school accounts
* collaborative libraries
* multiple visual styles
* mascot assistant
* classroom branding
* additional year levels

Architecture may anticipate these ideas, but they should NOT be built during MVP stage.

---

# MOST IMPORTANT PRODUCT GOAL

Brightboard must produce:

* beautiful
* curriculum-aligned
* Foundation-appropriate
* classroom-ready

resources with minimal teacher effort.
