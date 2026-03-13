import fs from 'fs';
import path from 'path';
import PokemonPageClient from './PokemonPageClient';

// Generate static params for all Pokemon at build time
export async function generateStaticParams() {
  // Base Pokemon: 1-1025
  const params: { id: string }[] = [];
  for (let i = 1; i <= 1025; i++) {
    params.push({ id: String(i) });
  }

  // Form Pokemon from the generated forms JSON
  try {
    const formsPath = path.join(process.cwd(), 'public', 'data', 'pokemon-forms.json');
    const formsData = JSON.parse(fs.readFileSync(formsPath, 'utf-8'));
    for (const speciesId of Object.keys(formsData)) {
      for (const form of formsData[speciesId]) {
        params.push({ id: String(form.id) });
      }
    }
  } catch {
    // Forms JSON may not exist yet during first build
    console.warn('pokemon-forms.json not found, skipping form params');
  }

  return params;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PokemonPage({ params }: PageProps) {
  const { id } = await params;
  const pokemonId = Number(id);

  return <PokemonPageClient pokemonId={pokemonId} />;
}
