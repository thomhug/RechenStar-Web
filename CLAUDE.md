# RechenStar Web

## Überblick
Web-Version der RechenStar iOS-App (Mathe für Grundschüler 1.-3. Klasse).
iOS-Referenz: `../RechenStar`

## Tech-Stack
- Reines HTML/CSS/JS, kein Framework, kein Build-Step
- localStorage für Fortschritt

## Deployment
- Plattform: deploio (Nine.ch), language=static
- deploio App: `rechenstar-web` (Projekt: `tom`)
- URL: https://rechenstar-web.e1608f7.deploio.app
- Git: github.com/thomhug/RechenStar-Web.git
- Auto-Deploy ab main branch via nctl CLI
- Erstellt mit: `nctl create application rechenstar-web --git-url=https://github.com/thomhug/RechenStar-Web.git --language=static --size=micro --project=tom`

## Dateistruktur
- `index.html` — Landing Page (Marketing, Datenschutz, Support)
- `app/index.html` — Web-App Einstieg, lädt CSS + JS
- `app/css/style.css` — Alle Styles, Farben aus iOS-App (#4A90E2, #F5D547, #7ED321, #FF6B6B, #9B59B6)
- `app/js/storage.js` — localStorage Wrapper (Sterne, Streak, Sessions, Weak Exercises)
- `app/js/exercises.js` — Kategorien, Aufgaben-Generator, Levels-System
- `app/js/sounds.js` — Web Audio API, prozedurale Sounds
- `app/js/ui.js` — Screen-Rendering (Home, Exercise, Results)
- `app/js/app.js` — App Controller, Session-Logik, adaptive Schwierigkeit
- `img/` — Banner, QR-Code, Square-Bild für Landing Page

## Kategorien
addition_10, addition_100, subtraction_10, subtraction_100, multiplication_10, multiplication_100

## Regeln
- Kein ss — immer ss (kein Eszett)
- Standard-Benutzername: Noah
