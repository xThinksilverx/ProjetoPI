# PsiMatch — Plataforma de Psicólogos

Marketplace para conectar pacientes a psicólogos, desenvolvido em conformidade com as diretrizes do Conselho Federal de Psicologia (CFP).

---

## Funcionalidades

- **Catálogo de psicólogos** com busca por nome, CRP, abordagem, especialização e cidade
- **Filtros avançados** — modalidade, abordagem terapêutica, faixa de preço, disponibilidade, avaliação mínima e **busca por proximidade** (GPS ou CEP)
- **Perfil completo** do psicólogo com grade de horários disponíveis e contato via WhatsApp / e-mail
- **Sistema de avaliação por estrelas** (1–5), sem comentários — em conformidade com o CFP
- **Cadastro de psicólogos** com upload de foto, validação de formato de CRP e geocodificação automática
- **Painel administrativo** para aprovação/rejeição de cadastros e contato com o psicólogo
- **Autenticação JWT** com cookies HttpOnly (paciente, psicólogo e admin)

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend / Backend | Next.js 14 (App Router) |
| Banco de dados | MongoDB Atlas (Mongoose 8) |
| Autenticação | JWT + cookies HttpOnly |
| Geocodificação | ViaCEP + Nominatim (OpenStreetMap) |
| Estilização | CSS Modules |

---

## Pré-requisitos

- Node.js 18+
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas) com um cluster criado

---

## Instalação

```bash
# 1. Entre na pasta do projeto
cd psihelp

# 2. Instale as dependências
npm install
```

---

## Variáveis de ambiente

Crie o arquivo `.env.local` dentro da pasta `psihelp/`:

```env
# Conexão com o MongoDB Atlas
MONGODB_URI="mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/psihelp"

# Chave secreta para assinar os tokens JWT (use qualquer string longa e aleatória)
JWT_SECRET=troque_por_uma_chave_secreta_longa

# Tempo de expiração do token
JWT_EXPIRE=7d

# URL pública da aplicação (usada nos links enviados por WhatsApp/e-mail)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Nunca commite o `.env.local`** — ele já está no `.gitignore`.

---

## Rodando em desenvolvimento

```bash
cd psihelp
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Seed (dados de exemplo)

Para popular o banco com psicólogos fictícios:

```bash
cd psihelp
npm run seed
```

---

## Build de produção

```bash
cd psihelp
npm run build
npm run start
```

---

## Estrutura de pastas

```
psihelp/
├── app/
│   ├── page.tsx              # Home — catálogo com filtros
│   ├── psicologos/[id]/      # Perfil completo do psicólogo
│   ├── cadastro/             # Cadastro de pacientes e psicólogos
│   ├── admin/                # Painel administrativo
│   └── api/                  # Rotas de API (REST)
│       ├── auth/             # Login, registro, logout, perfil
│       ├── psicologos/       # CRUD + avaliação
│       ├── geocode/          # Proxy para Nominatim (geocodificação)
│       └── validar-crp/      # Validação de formato de CRP
├── components/               # Componentes React reutilizáveis
├── lib/
│   ├── models/               # Schemas do Mongoose (Psicologo, Usuario, Avaliacao)
│   ├── mongodb.js            # Conexão com o banco
│   └── auth.js               # Helpers de JWT
├── styles/
│   └── components.module.css # Estilos globais (CSS Modules)
└── public/                   # Arquivos estáticos (SVGs, ícones)
```

---

## Criando um admin

Não há tela de cadastro de admin — crie diretamente no MongoDB Atlas:

1. Acesse sua coleção `usuarios` no Atlas
2. Insira um documento:

```json
{
  "nome": "Admin",
  "email": "admin@psimatch.com",
  "senha": "<hash bcrypt da senha>",
  "tipo": "admin",
  "criadoEm": { "$date": "2024-01-01T00:00:00Z" }
}
```

Para gerar o hash bcrypt, rode no terminal dentro de `psihelp/`:

```bash
node -e "const b = require('bcryptjs'); b.hash('SUA_SENHA', 10).then(console.log)"
```

Cole o hash gerado no campo `senha` do documento acima.

---

## Observações

- A busca por proximidade usa o índice `2dsphere` do MongoDB — psicólogos cadastrados antes de junho de 2025 precisam atualizar o cadastro para aparecer nessa busca.
- A geocodificação usa o Nominatim (OpenStreetMap), que é gratuito e não requer chave de API.
- A validação de CRP é feita apenas por formato (`NN/XXXXX`) — a verificação manual no site do CFP é feita pelo administrador durante a aprovação do cadastro.
