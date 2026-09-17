# Máquina Acessível — tutorial completo do zero ao MVP publicado

## Objetivo deste tutorial

Este tutorial ensina a construir uma primeira versão funcional da **Máquina Acessível** em **7 a 14 dias**, trabalhando sozinho e usando IA como copiloto.

O MVP terá exatamente este fluxo:

```text
Administrador faz login
→ cadastra uma máquina ou componente
→ envia um vídeo em Libras
→ sistema cria um slug único
→ sistema gera a URL pública
→ sistema gera um QR Code dessa URL
→ administrador baixa o QR e imprime

Usuário lê o QR com a câmera
→ abre a URL pública da máquina
→ vê o vídeo específico daquela máquina
→ consulta legenda, descrição e instruções
```

O projeto será feito com:

```text
Next.js + TypeScript + Tailwind CSS
Supabase Auth + PostgreSQL + Storage
qrcode
Vercel
```

Essa combinação é recomendada para um prazo curto porque o Supabase já fornece autenticação, banco PostgreSQL e armazenamento de arquivos. Você evita criar três serviços separados.

> **Escopo obrigatório do MVP:** um painel de administrador, cadastro de máquinas, upload de vídeo, URL pública por máquina, QR Code baixável e página pública mobile-first.
>
> **Escopo que deve ficar para depois:** múltiplos níveis de permissão, analytics avançado, app nativo, streaming HLS, favoritos, comentários, feed social, tradução automática e integração com sistemas industriais.

---

## 1. Resultado final esperado

Ao terminar, você terá:

| Parte | Resultado |
|---|---|
| Site público | Catálogo opcional e páginas públicas das máquinas |
| URL pública | `https://seusite.com/m/prensa-hidraulica-h400` |
| QR Code | Imagem PNG/SVG que codifica essa URL |
| Login | Somente administradores acessam `/admin` |
| Banco | Máquinas, vídeos e usuários administradores |
| Storage | Vídeos e thumbnails no Supabase Storage |
| Página da máquina | Vídeo em Libras, legenda, descrição e passos de segurança |
| Deploy | Aplicação publicada em domínio da Vercel |

O QR da prensa e o QR da cortadora são diferentes porque contêm URLs diferentes:

```text
QR 1 → https://seusite.com/m/prensa-hidraulica-h400
QR 2 → https://seusite.com/m/cortadora-laser-l20
```

O QR não guarda o vídeo. Ele guarda apenas a URL. Essa decisão permite trocar o vídeo no painel sem trocar a etiqueta física.

---

## 2. Cronograma acelerado de 14 dias

Use o plano de 14 dias se você ainda precisa aprender parte das tecnologias. Se já conhece React e JavaScript, comprima os dias indicados entre parênteses.

| Dia | Entrega | Tempo aproximado |
|---:|---|---:|
| 1 | Setup, Git, Next.js, Supabase e deploy inicial | 4–6 h |
| 2 | Banco, schema e usuário admin | 4–6 h |
| 3 | Login e proteção da área admin | 4–6 h |
| 4 | Layout do painel e formulário de cadastro | 5–7 h |
| 5 | CRUD de máquinas e slug único | 5–7 h |
| 6 | Storage e upload do vídeo | 5–8 h |
| 7 | Página pública `/m/[slug]` | 4–6 h |
| 8 | Geração e download de QR | 3–5 h |
| 9 | Legendas, thumbnail e estados de erro | 4–6 h |
| 10 | Testes de autorização e fluxo completo | 5–7 h |
| 11 | Responsividade e acessibilidade | 4–6 h |
| 12 | Deploy, domínio e variáveis de ambiente | 4–6 h |
| 13 | Teste com celular e QR impresso | 3–5 h |
| 14 | Correções, documentação e demonstração | 3–5 h |

### Se você só tem 7 dias

Reduza o escopo para:

1. login de admin;
2. cadastro de máquina;
3. upload de um vídeo;
4. criação de slug;
5. página `/m/[slug]`;
6. QR em PNG;
7. deploy.

Deixe para depois catálogo, histórico, analytics, thumbnails customizadas e múltiplas versões de vídeo.

### Estimativa com e sem IA

| Perfil | Tempo para MVP funcional |
|---|---:|
| Aprendendo sozinho sem IA | 8–14 semanas |
| Programador com experiência sem IA | 4–8 semanas |
| Aprendendo com IA e dedicação diária | 2–4 semanas |
| Programador com experiência usando IA | 7–14 dias |

A IA acelera a escrita e a explicação do código. Ela não elimina o tempo de configuração, testes, correções de permissão, deploy, upload e validação com celular.

---

## 3. Pré-requisitos

Instale:

- Node.js LTS;
- Git;
- VS Code ou outro editor;
- uma conta no GitHub;
- uma conta no Supabase;
- uma conta na Vercel;
- um celular para testar QR Codes.

Confirme as instalações:

```bash
node --version
npm --version
git --version
```

O resultado do Node deve ser uma versão LTS recente. Se o comando não existir, instale o Node pelo site oficial antes de iniciar.

Crie uma pasta de trabalho:

```bash
mkdir projetos
cd projetos
```

---

## 4. Criar o projeto Next.js

Execute:

```bash
npx create-next-app@latest maquina-acessivel
cd maquina-acessivel
```

Escolha as opções:

```text
Would you like to use TypeScript? Yes
Would you like to use ESLint? Yes
Would you like to use Tailwind CSS? Yes
Would you like your code inside a src/ directory? Yes
Would you like to use App Router? Yes
Would you like to use Turbopack? Yes
Would you like to customize the import alias? Yes
Import alias: @/*
```

Instale as dependências do MVP:

```bash
npm install @supabase/ssr @supabase/supabase-js
npm install qrcode slugify zod lucide-react
npm install clsx tailwind-merge
npm install -D @types/qrcode
```

Inicialize o Git:

```bash
git init
git add .
git commit -m "chore: create next app"
```

Inicie localmente:

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

Faça o primeiro commit antes de seguir. Isso permite retornar a um estado funcional se uma alteração quebrar o projeto.

---

## 5. Estrutura de pastas

Crie esta estrutura:

```text
src/
├── app/
│   ├── page.tsx
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx
│   ├── m/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── machines/
│   │       ├── page.tsx
│   │       └── new/
│   │           └── page.tsx
│   └── auth/
│       └── callback/
│           └── route.ts
├── components/
│   ├── MachineForm.tsx
│   ├── MachineQr.tsx
│   ├── PublicMachine.tsx
│   └── SubmitButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── browser.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── machine.ts
│   ├── qr.ts
│   ├── slug.ts
│   └── validations.ts
└── middleware.ts
```

Não crie ainda telas de histórico ou analytics. O objetivo é terminar o caminho QR → vídeo primeiro.

---

## 6. Criar o projeto no Supabase

Acesse o painel do Supabase e crie um projeto novo.

Escolha:

```text
Nome: maquina-acessivel
Senha do banco: crie uma senha forte
Região: escolha a mais próxima do público
```

No painel, abra **Project Settings → API** e copie:

```text
Project URL
anon public key
```

Crie `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Não coloque a `service_role key` no frontend. Para este MVP, você consegue trabalhar com a chave pública e Row Level Security.

Adicione `.env.local` ao `.gitignore` se o create-next-app ainda não fez isso.

---

## 7. Criar o banco de dados

No Supabase, abra **SQL Editor → New query** e execute o SQL abaixo.

```sql
create extension if not exists "uuid-ossp";

create type public.machine_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table public.machines (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  item_type text not null default 'machine',
  sector text,
  description text,
  status public.machine_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default uuid_generate_v4(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  video_path text not null,
  video_url text not null,
  thumbnail_url text,
  captions_url text,
  transcript text,
  duration_seconds integer,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index machines_slug_idx on public.machines(slug);
create index videos_machine_idx on public.videos(machine_id);
```

### Criar o perfil quando um usuário se cadastra

Execute também:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

### Criar seu usuário administrador

1. No Supabase, abra **Authentication → Users**.
2. Clique em **Add user**.
3. Crie seu e-mail e senha.
4. Copie o UUID do usuário.
5. Execute, trocando o UUID:

```sql
update public.profiles
set role = 'admin', full_name = 'Administrador'
where id = 'COLE-O-UUID-AQUI';
```

Não coloque `role = admin` vindo do formulário do frontend. A promoção para admin deve ser feita manualmente ou por um fluxo administrativo protegido.

---

## 8. Criar o Storage dos vídeos

No Supabase, abra **Storage → New bucket**.

Crie:

```text
Nome: machine-videos
Public bucket: ativado para o MVP
```

Usar bucket público deixa o primeiro MVP mais rápido. Os vídeos precisam ser acessíveis na página pública. Em uma versão mais sensível, use bucket privado e URLs assinadas.

Crie um segundo bucket opcional:

```text
Nome: machine-assets
Public bucket: ativado
```

Ele pode guardar thumbnails e legendas.

### Limites recomendados para o MVP

- vídeo MP4;
- até 500 MB;
- duração de até 15 minutos;
- resolução 1080p ou menor;
- nome de arquivo sem acentos e sem espaços.

Não implemente conversão de vídeo agora. Grave e exporte os arquivos corretamente antes do upload.

---

## 9. Configurar o Supabase no código

Crie `src/lib/supabase/browser.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

Crie `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components não podem sempre escrever cookies.
          }
        },
      },
    },
  );
}
```

Crie `src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}
```

Crie `src/middleware.ts`:

```ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

O middleware atualiza a sessão. A proteção de verdade continua sendo feita na página admin e nas operações de banco.

---

## 10. Implementar login

No Supabase, abra **Authentication → Providers → Email** e habilite Email.

Para ganhar tempo no desenvolvimento, você pode desabilitar a confirmação de e-mail no ambiente local. Em produção, mantenha a confirmação habilitada.

Crie `src/app/login/page.tsx`:

```tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form onSubmit={handleSubmit} className="w-full space-y-5 rounded-2xl border p-8">
        <div>
          <p className="text-sm font-semibold text-emerald-700">ÁREA ADMINISTRATIVA</p>
          <h1 className="mt-2 text-3xl font-bold">Entrar no painel</h1>
        </div>

        <label className="block text-sm font-medium">
          E-mail
          <input
            className="mt-2 w-full rounded-lg border px-3 py-3"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-medium">
          Senha
          <input
            className="mt-2 w-full rounded-lg border px-3 py-3"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-emerald-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
```

---

## 11. Proteger `/admin`

Crie `src/app/admin/layout.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  return <>{children}</>;
}
```

Essa proteção impede que o usuário comum veja o painel. Mesmo assim, as políticas do banco também precisam impedir inserções não autorizadas.

---

## 12. Configurar Row Level Security

No SQL Editor do Supabase, execute:

```sql
alter table public.profiles enable row level security;
alter table public.machines enable row level security;
alter table public.videos enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "public can read published machines"
on public.machines for select
using (status = 'published' or public.is_admin());

create policy "admins can create machines"
on public.machines for insert
with check (public.is_admin() and created_by = auth.uid());

create policy "admins can update machines"
on public.machines for update
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published videos"
on public.videos for select
using (
  is_published = true
  or public.is_admin()
);

create policy "admins can create videos"
on public.videos for insert
with check (public.is_admin());

create policy "admins can update videos"
on public.videos for update
using (public.is_admin())
with check (public.is_admin());
```

Faça um teste negativo: saia do login e tente inserir uma máquina. A operação deve falhar.

---

## 13. Criar validações e slug

Crie `src/lib/slug.ts`:

```ts
import slugify from 'slugify';

export function makeBaseSlug(name: string) {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'pt',
  });
}
```

Crie `src/lib/validations.ts`:

```ts
import { z } from 'zod';

export const machineSchema = z.object({
  name: z.string().trim().min(3).max(120),
  itemType: z.enum(['machine', 'component', 'equipment']),
  sector: z.string().trim().max(80).optional(),
  description: z.string().trim().min(10).max(500),
});
```

Crie `src/lib/machine.ts`:

```ts
import { createClient } from '@/lib/supabase/server';
import { makeBaseSlug } from '@/lib/slug';

export async function uniqueSlug(name: string) {
  const supabase = await createClient();
  const base = makeBaseSlug(name) || 'item';
  let slug = base;
  let counter = 2;

  while (true) {
    const { data } = await supabase
      .from('machines')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}
```

Exemplo:

```text
Prensa hidráulica H-400
→ prensa-hidraulica-h-400

Prensa hidráulica H-400 novamente
→ prensa-hidraulica-h-400-2
```

---

## 14. Criar o formulário de cadastro

Crie `src/app/admin/machines/new/page.tsx` como Client Component ou use uma Server Action. Para terminar mais rápido, use um formulário client-side que chama o Supabase.

O formulário deve ter:

```text
Nome da máquina ou componente
Tipo: máquina, componente ou equipamento
Setor
Descrição
Arquivo de vídeo MP4
Arquivo de legenda VTT opcional
Botão Cadastrar e gerar QR
```

A validação client-side ajuda a experiência. A validação server-side ou no banco continua obrigatória.

Fluxo de submit:

```ts
const parsed = machineSchema.safeParse(values);

if (!parsed.success) {
  setError('Revise os campos.');
  return;
}

const slug = await uniqueSlug(values.name);

const { data: machine, error } = await supabase
  .from('machines')
  .insert({
    slug,
    name: values.name,
    item_type: values.itemType,
    sector: values.sector,
    description: values.description,
    created_by: user.id,
    status: 'draft',
  })
  .select()
  .single();
```

Não permita publicar a máquina antes de existir um vídeo válido.

---

## 15. Fazer upload do vídeo

Use um nome de arquivo previsível e único:

```ts
const extension = file.name.split('.').pop()?.toLowerCase();
if (extension !== 'mp4') throw new Error('Envie um arquivo MP4.');
if (file.size > 500 * 1024 * 1024) throw new Error('Arquivo acima de 500 MB.');

const path = `${user.id}/${machine.id}/${crypto.randomUUID()}.mp4`;

const { error: uploadError } = await supabase.storage
  .from('machine-videos')
  .upload(path, file, {
    contentType: 'video/mp4',
    upsert: false,
  });
```

Obtenha a URL pública:

```ts
const { data } = supabase.storage
  .from('machine-videos')
  .getPublicUrl(path);

const videoUrl = data.publicUrl;
```

Salve o vídeo no banco:

```ts
await supabase.from('videos').insert({
  machine_id: machine.id,
  video_path: path,
  video_url: videoUrl,
  is_published: false,
});
```

Depois do upload, mostre uma prévia simples:

```tsx
<video controls className="w-full rounded-xl">
  <source src={videoUrl} type="video/mp4" />
</video>
```

Se o upload falhar, não deixe uma máquina publicada sem vídeo. Mostre o erro e permita tentar novamente.

---

## 16. Criar a URL pública

A URL pública não precisa ser salva no banco porque pode ser calculada a partir do slug.

Crie `src/lib/qr.ts`:

```ts
import QRCode from 'qrcode';

export function getPublicMachineUrl(slug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  return `${base}/m/${slug}`;
}

export async function createQrSvg(slug: string) {
  return QRCode.toString(getPublicMachineUrl(slug), {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#193b34',
      light: '#ffffff',
    },
  });
}
```

Em Server Component, essa função pode gerar o SVG. Em Client Component, você pode gerar o QR usando a biblioteca no navegador. Para o MVP, gerar no navegador depois do cadastro é suficiente.

No ambiente local:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Na Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
```

Antes de imprimir QRs, altere a variável para o domínio final. QR gerado com `localhost` não funciona no celular.

---

## 17. Implementar o QR no frontend

Crie `src/components/MachineQr.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function MachineQr({ slug }: { slug: string }) {
  const [svg, setSvg] = useState('');
  const url = `${window.location.origin}/m/${slug}`;

  useEffect(() => {
    QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#193b34',
        light: '#ffffff',
      },
    }).then(setSvg);
  }, [url]);

  function downloadSvg() {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${slug}-qr.svg`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div>
      <p className="break-all text-sm">{url}</p>
      <div
        className="mt-4 max-w-xs"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <button onClick={downloadSvg}>Baixar QR em SVG</button>
    </div>
  );
}
```

Para o MVP, SVG é suficiente. Se você também quiser PNG:

```ts
const png = await QRCode.toDataURL(url, {
  width: 1200,
  margin: 2,
});
```

Crie um botão que converta o Data URL em download.

> Nunca coloque logo grande no centro do QR no primeiro teste. O QR precisa continuar sendo lido em condições reais.

---

## 18. Criar a página pública da máquina

Crie `src/app/m/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function MachinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: machine } = await supabase
    .from('machines')
    .select(`
      id,
      slug,
      name,
      item_type,
      sector,
      description,
      videos (
        video_url,
        thumbnail_url,
        captions_url,
        transcript,
        duration_seconds
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('videos.is_published', true)
    .single();

  if (!machine || !machine.videos?.length) notFound();

  const video = machine.videos[0];

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <p className="text-sm font-semibold text-emerald-700">
        CONTEÚDO EM LIBRAS
      </p>
      <h1 className="mt-3 text-4xl font-bold">{machine.name}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{machine.description}</p>

      <div className="mt-8 overflow-hidden rounded-2xl bg-black">
        <video
          controls
          preload="metadata"
          poster={video.thumbnail_url ?? undefined}
          className="aspect-video w-full"
        >
          <source src={video.video_url} type="video/mp4" />
          {video.captions_url && (
            <track
              kind="captions"
              src={video.captions_url}
              srcLang="pt-BR"
              label="Português"
              default
            />
          )}
        </video>
      </div>

      {video.transcript && (
        <details className="mt-6 rounded-xl border p-5">
          <summary className="cursor-pointer font-semibold">
            Ver transcrição
          </summary>
          <p className="mt-4 whitespace-pre-wrap text-slate-700">
            {video.transcript}
          </p>
        </details>
      )}
    </main>
  );
}
```

### Atenção à versão do Next.js

Dependendo da versão do Next.js, `params` pode ser objeto ou Promise. Confira o erro do TypeScript. Se sua versão usar objeto, troque por:

```ts
params: { slug: string }
```

A regra funcional é sempre a mesma: buscar por `slug`, filtrar `status = published` e mostrar somente vídeo publicado.

---

## 19. Publicar uma máquina

No painel, crie um botão de publicação. Antes de publicar, valide:

```text
nome preenchido
slug preenchido
vídeo existente
vídeo publicado
descrição preenchida
```

Atualização:

```ts
await supabase
  .from('machines')
  .update({ status: 'published' })
  .eq('id', machineId);

await supabase
  .from('videos')
  .update({ is_published: true })
  .eq('machine_id', machineId);
```

Em um produto mais completo, use uma transação ou uma Server Action para evitar publicar apenas metade do conteúdo. No MVP, faça duas operações e trate cada erro.

Depois de publicar, teste:

```text
http://localhost:3000/m/prensa-hidraulica-h-400
```

---

## 20. Página do painel admin

O painel mínimo deve conter:

```text
Cabeçalho: nome do usuário + sair
Lista de máquinas
Status: rascunho/publicada/arquivada
Botão Nova máquina
Botão Ver página pública
Botão Gerar/baixar QR
Botão Editar
Botão Publicar
```

Consulta das máquinas:

```ts
const { data: machines } = await supabase
  .from('machines')
  .select('id, slug, name, item_type, sector, status, created_at')
  .order('created_at', { ascending: false });
```

Não crie uma interface de YouTube completa. Para o prazo curto, uma tabela ou lista de cards é suficiente.

---

## 21. Página inicial pública

A home pode ser simples:

```text
Logo
Texto explicando o serviço
Botão “Ler um QR” opcional
Lista de máquinas publicadas
Link discreto “Área do administrador”
```

A experiência principal não depende da home. O usuário chega pela URL do QR. Portanto, não gaste dias criando um feed elaborado antes de testar `/m/[slug]`.

---

## 22. Implementar logout

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return <button onClick={logout}>Sair</button>;
}
```

---

## 23. Testes mínimos

### Teste 1 — QR correto

1. Cadastre a prensa.
2. Gere o QR.
3. Leia o QR com o celular.
4. Confirme que abriu a prensa.
5. Cadastre a cortadora.
6. Gere o segundo QR.
7. Confirme que os dois QRs levam para páginas diferentes.

### Teste 2 — URL estável

1. Publique a prensa.
2. Gere o QR.
3. Troque o vídeo da prensa.
4. Leia o mesmo QR.
5. Confirme que o vídeo novo aparece.

### Teste 3 — Segurança

1. Saia do admin.
2. Acesse `/admin` diretamente.
3. Confirme redirecionamento para `/login`.
4. Acesse `/m/prensa-hidraulica-h400` sem login.
5. Confirme que a página pública abre.
6. Tente inserir máquina sem admin.
7. Confirme que o banco bloqueia.

### Teste 4 — Estados de erro

Implemente páginas ou mensagens para:

```text
404 — máquina não encontrada
403 — acesso não autorizado
upload inválido
vídeo acima do limite
slug duplicado
falha de rede
máquina ainda em rascunho
```

---

## 24. Responsividade e acessibilidade

Teste pelo menos:

```text
390 × 844 — celular
768 × 1024 — tablet
1440 × 900 — desktop
```

A página pública precisa:

- abrir sem zoom horizontal;
- ter botão de play acessível;
- mostrar legenda quando disponível;
- ter contraste suficiente;
- usar textos de botão claros;
- permitir navegação por teclado;
- mostrar o nome da máquina antes do vídeo;
- informar se o vídeo está em Libras;
- não depender somente de áudio.

Para o piloto, o conteúdo em Libras é mais importante que efeitos visuais.

---

## 25. Deploy na Vercel

Suba o projeto ao GitHub:

```bash
git add .
git commit -m "feat: first machine qr mvp"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/maquina-acessivel.git
git push -u origin main
```

Na Vercel:

1. Clique em **Add New Project**.
2. Importe o repositório.
3. Confirme o framework Next.js.
4. Adicione as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
NEXT_PUBLIC_SITE_URL=https://seu-projeto.vercel.app
```

5. Faça deploy.
6. Copie o domínio gerado.
7. Atualize `NEXT_PUBLIC_SITE_URL` com esse domínio.
8. Faça redeploy.

No Supabase, abra **Authentication → URL Configuration** e adicione:

```text
Site URL: https://seu-projeto.vercel.app
Redirect URLs: https://seu-projeto.vercel.app/**
```

Se usar domínio próprio:

```text
https://maquinaacessivel.com
```

Atualize a variável e as URLs do Supabase antes de imprimir qualquer QR.

---

## 26. Checklist de entrega

### Funcional

- [ ] Login de administrador funciona.
- [ ] Usuário comum não abre o painel.
- [ ] Admin cria uma máquina.
- [ ] Slug é único.
- [ ] Upload de vídeo funciona.
- [ ] Máquina pode ser publicada.
- [ ] Página `/m/[slug]` abre sem login.
- [ ] QR contém a URL correta.
- [ ] QR é baixável.
- [ ] Dois QRs abrem duas máquinas diferentes.
- [ ] Trocar vídeo não exige trocar o QR.

### Técnico

- [ ] `.env.local` não está no Git.
- [ ] Row Level Security está ativado.
- [ ] Chave `service_role` não aparece no frontend.
- [ ] Storage tem limite de arquivo.
- [ ] Erros aparecem para o usuário.
- [ ] Site funciona em celular.
- [ ] Deploy usa domínio final.

### Conteúdo

- [ ] Vídeo foi gravado em Libras.
- [ ] Legenda foi revisada.
- [ ] Instruções de segurança foram conferidas.
- [ ] Etiqueta física tem nome da máquina.
- [ ] QR foi testado antes de imprimir em volume.

---

## 27. O que não fazer neste prazo

Não implemente agora:

- app Android e iOS separado;
- sistema social estilo YouTube;
- comentários;
- recomendações por IA;
- tradução automática de Libras;
- edição de vídeo no navegador;
- streaming adaptativo complexo;
- microserviços;
- Kubernetes;
- múltiplas organizações;
- permissões com dez níveis;
- aplicativo offline completo;
- analytics detalhado de cada usuário.

Esses itens aumentam o risco sem provar o fluxo principal.

---

## 28. Como usar IA sem perder controle

Peça para a IA trabalhar em partes pequenas. Um bom prompt é:

```text
Estou criando uma aplicação Next.js com TypeScript, Supabase e Tailwind.
Preciso implementar apenas a criação de uma máquina no painel admin.
Use esta tabela: machines(id, slug, name, item_type, sector, description, status, created_by).
O usuário precisa ser admin.
Gere os arquivos necessários, explique onde cada arquivo fica,
mostre os comandos para testar e inclua tratamento de erros.
Não altere autenticação nem outras telas.
```

Depois peça revisão:

```text
Revise este código procurando:
1. falhas de autorização;
2. exposição de chave secreta;
3. slug duplicado;
4. erros de TypeScript;
5. problemas de mobile;
6. problemas de upload.
Explique cada problema antes de corrigir.
```

Não cole credenciais, tokens ou dados de usuários nos prompts. Sempre leia o código gerado antes de executar migration, deletar dados ou publicar.

---

## 29. Ordem de prioridade se o prazo apertar

Se chegar ao dia 10 e ainda faltar coisa, entregue nesta ordem:

1. login admin;
2. cadastro de uma máquina;
3. slug e URL pública;
4. página pública da máquina;
5. upload ou URL de vídeo;
6. QR baixável;
7. teste com celular;
8. deploy.

O MVP pode começar aceitando uma URL de vídeo em vez de upload. Isso permite validar a ideia em horas. Depois, implemente o upload do Supabase.

A versão mínima demonstrável é:

```text
admin cadastra uma máquina
→ sistema cria /m/slug
→ sistema gera QR
→ celular lê QR
→ usuário vê o vídeo correto
```

Se esse fluxo funciona, você já tem o núcleo do produto.

---

## 30. Próximo passo imediato

Hoje, faça somente isto:

```bash
npx create-next-app@latest maquina-acessivel
cd maquina-acessivel
npm install @supabase/ssr @supabase/supabase-js qrcode slugify zod
npm run dev
```

Depois crie o projeto Supabase, execute o SQL das tabelas e faça o primeiro login de administrador. Não comece pelo design final. Primeiro faça um cadastro simples criar uma linha em `machines`.

A sequência de validação deve ser:

```text
1. Banco funcionando
2. Login funcionando
3. Máquina sendo salva
4. Slug sendo criado
5. URL pública abrindo
6. Vídeo aparecendo
7. QR sendo lido pelo celular
```

Essa é a forma mais segura de terminar uma primeira versão em uma ou duas semanas.

---

## Referências

[1]: https://nextjs.org/docs "Next.js Documentation"

[2]: https://supabase.com/docs "Supabase Documentation"

[3]: https://supabase.com/docs/guides/auth "Supabase Auth Documentation"

[4]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security"

[5]: https://supabase.com/docs/guides/storage "Supabase Storage Documentation"

[6]: https://www.npmjs.com/package/qrcode "qrcode npm package"

[7]: https://vercel.com/docs "Vercel Documentation"

[8]: https://nextjs.org/docs/app/building-your-application/deploying "Next.js Deployment Documentation"
