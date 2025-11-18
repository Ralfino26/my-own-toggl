# The Agency Uren

Een eenvoudige tijdregistratie applicatie voor projectbeheer. Maak projecten aan en registreer uren per project. Alle data wordt lokaal opgeslagen in een SQLite database.

## Installatie

1. Installeer dependencies (gebruik npm of bun):
```bash
npm install
# of
bun install
```

2. Start de development server:
```bash
npm run dev
# of
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) in je browser.

## Features

- ✅ Projecten aanmaken en beheren
- ✅ Uren registreren per project
- ✅ Overzichtelijke tabel weergave
- ✅ PDF export voor indiening
- ✅ Lokale SQLite database (geen backend nodig)

## Database

De database wordt automatisch aangemaakt als `toggl.db` in de project root bij eerste gebruik.
