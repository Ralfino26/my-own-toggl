# The Agency Uren

Een online tijdregistratie applicatie voor projectbeheer. Maak projecten aan en registreer uren per project. Elke gebruiker heeft zijn eigen account en data.

## Installatie

1. Installeer dependencies (gebruik npm of bun):
```bash
npm install
# of
bun install
```

2. Maak een `.env.local` bestand aan met je MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
AUTH_SECRET=je-secret-key-hier
NEXTAUTH_URL=http://localhost:3000
```

3. Genereer een AUTH_SECRET (optioneel):
```bash
openssl rand -base64 32
```

4. Start de development server:
```bash
npm run dev
# of
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in je browser.

## Features

- ✅ User accounts met authenticatie
- ✅ Projecten aanmaken en beheren
- ✅ Uren registreren per project
- ✅ Overzichtelijke tabel weergave
- ✅ PDF export voor indiening
- ✅ MongoDB database (online, multi-user)

## Database Setup

1. Maak een MongoDB Atlas account op [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Maak een gratis cluster aan
3. Kopieer je connection string naar `.env.local` als `MONGODB_URI`
4. De database wordt automatisch aangemaakt bij eerste gebruik

## Vercel Deployment

Voor deployment op Vercel:

1. **Environment Variables instellen in Vercel:**
   - Ga naar je project settings → Environment Variables
   - Voeg toe:
     - `MONGODB_URI`: Je MongoDB connection string
     - `AUTH_SECRET`: Genereer met `openssl rand -base64 32`
     - `NEXTAUTH_URL`: Je production URL (bijv. `https://toggl.byralf.com`)

2. **MongoDB Atlas IP Whitelist:**
   - Ga naar MongoDB Atlas → Network Access
   - Voeg `0.0.0.0/0` toe om alle IPs toe te staan (voor Vercel serverless functions)
   - Of voeg specifieke Vercel IP ranges toe (check Vercel docs voor actuele IPs)

3. **Deploy:**
   - Push naar GitHub
   - Vercel detecteert automatisch Next.js en deployt
