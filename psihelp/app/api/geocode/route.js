import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q   = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  try {
    let url;
    if (lat && lng) {
      url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`;
    } else if (q) {
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=br&accept-language=pt-BR`;
    } else {
      return NextResponse.json([]);
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PsiMatch/1.0 plataforma-psicologo (contato: otavio.rige@gmail.com)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
