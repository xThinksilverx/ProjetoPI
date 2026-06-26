import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarEmailResetSenha(email, nome, token) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/resetar-senha?token=${token}`;

  await transporter.sendMail({
    from: `"PsiHelp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Redefinir senha - PsiHelp',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Olá, ${nome}!</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo:</p>
        <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Redefinir Senha
        </a>
        <p style="color:#666;font-size:13px;">O link expira em 1 hora. Se você não solicitou isso, ignore este email — sua senha não será alterada.</p>
        <p style="color:#999;font-size:12px;">Ou copie e cole o link: ${url}</p>
      </div>
    `,
  });
}

export async function enviarEmailVerificacao(email, nome, token) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-email?token=${token}`;

  await transporter.sendMail({
    from: `"PsiHelp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Confirme seu email - PsiHelp',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Olá, ${nome}!</h2>
        <p>Obrigado por se cadastrar no PsiHelp. Clique no botão abaixo para confirmar seu email:</p>
        <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Confirmar Email
        </a>
        <p style="color:#666;font-size:13px;">O link expira em 24 horas. Se você não criou uma conta, ignore este email.</p>
        <p style="color:#999;font-size:12px;">Ou copie e cole o link: ${url}</p>
      </div>
    `,
  });
}
