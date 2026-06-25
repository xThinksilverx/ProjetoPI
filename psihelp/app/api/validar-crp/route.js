import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const crp = searchParams.get('crp');

  if (!crp || !/^\d{2}\/\d{5}$/.test(crp)) {
    return NextResponse.json({ success: false, error: 'Formato de CRP inválido' }, { status: 400 });
  }

  const registro = crp.split('/')[1];
  const linkCFP = `https://cadastro.cfp.org.br/`;

  return NextResponse.json({
    success: true,
    formatoValido: true,
    linkVerificacao: linkCFP,
    mensagem: 'Formato válido. Verificação manual necessária no site do CFP.',
  });
}
