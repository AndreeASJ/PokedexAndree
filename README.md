# Pokédex Web App

A single-page Pokédex built with vanilla HTML, CSS, and JavaScript using the free [PokeAPI](https://pokeapi.co/).

## Features

- **Full Pokémon list** – Fetches all available Pokémon from the API (paginated).
- **Search by name** – Live client-side search in the header.
- **Multiple sprites** – Each card shows default and official-artwork sprites; the detail modal shows front/back, shiny, and official art.
- **Rich details** – Click any Pokémon to see:
  - National Dex number and generation
  - Height and weight
  - Types (with color pills)
  - Abilities
  - Sample of moves (attacks)
  - Base experience and stats
- **Responsive UI** – Dark theme, type-colored pills, and layout that works on mobile and desktop.

## How to run

No build step required.

```bash
npm start
# or
npx serve .
# or
python -m http.server 8080
```

Then open the URL shown (e.g. **http://localhost:3000**).  
**Note:** Some browsers restrict `fetch()` on `file://`; use a local server if the list doesn’t load.

## Tech

- **PokeAPI** – `GET /v2/pokemon` and `GET /v2/pokemon/{id}` for list and details.
- **Sprites** – GitHub-hosted sprites (default and official-artwork) for grid and modal.
- **Generation** – Derived from National Dex number ranges (e.g. 1–151 = Gen I).

## License

Data and sprites from [PokeAPI](https://pokeapi.co/) and [PokeAPI/sprites](https://github.com/PokeAPI/sprites). This app is for learning and non-commercial use.
