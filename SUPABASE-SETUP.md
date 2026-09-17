# MecLibras — configuração do Supabase no projeto atual

## O que já foi adicionado ao frontend

O projeto Vite/React agora contém:

- dependência `@supabase/supabase-js`;
- dependência `qrcode` para QR real;
- helper opcional em `client/src/lib/supabase.ts`;
- helper de slug, URL pública, SVG e PNG em `client/src/lib/qr.ts`;
- login com modo administrador/usuário;
- persistência de cadastro no Supabase quando as variáveis existem;
- fallback demo quando o Supabase ainda não foi configurado;
- preview de QR real no painel;
- botões para baixar SVG para impressão e PNG.

O modo demo continua funcionando sem Supabase. Isso permite editar o design antes de criar o backend online.

## 1. Criar o projeto Supabase

1. Acesse `https://supabase.com`.
2. Crie uma conta.
3. Clique em **New project**.
4. Use o nome `meclibras`.
5. Escolha uma senha forte para o banco.
6. Escolha uma região próxima dos usuários.
7. Aguarde a criação.

No projeto, abra **Project Settings → API**. Copie:

- Project URL;
- anon public key.

A `anon public key` pode ser usada no frontend quando o Row Level Security estiver configurado. Nunca use a `service_role key` no React.

## 2. Criar o banco

No Supabase, abra **SQL Editor → New query** e execute:

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

create table public.watch_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  machine_id uuid not null references public.machines(id) on delete cascade,
  progress_seconds integer not null default 0,
  watched_at timestamptz not null default now(),
  unique(user_id, machine_id)
);

create index machines_slug_idx on public.machines(slug);
create index videos_machine_idx on public.videos(machine_id);
create index watch_history_user_idx on public.watch_history(user_id);
```

## 3. Criar o perfil automaticamente

No mesmo SQL Editor:

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

## 4. Criar o primeiro administrador

1. Abra **Authentication → Users**.
2. Clique em **Add user**.
3. Cadastre seu e-mail e sua senha.
4. Copie o UUID do usuário.
5. Execute:

```sql
update public.profiles
set role = 'admin', full_name = 'Administrador MecLibras'
where id = 'COLE-O-UUID-DO-USUARIO';
```

O usuário comum pode ser criado normalmente e permanece com `role = user`.

## 5. Ativar Row Level Security

Execute:

```sql
alter table public.profiles enable row level security;
alter table public.machines enable row level security;
alter table public.videos enable row level security;
alter table public.watch_history enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "public reads published machines"
on public.machines for select
using (status = 'published' or public.is_admin());

create policy "admins insert machines"
on public.machines for insert
with check (public.is_admin() and created_by = auth.uid());

create policy "admins update machines"
on public.machines for update
using (public.is_admin())
with check (public.is_admin());

create policy "public reads published videos"
on public.videos for select
using (is_published = true or public.is_admin());

create policy "admins insert videos"
on public.videos for insert
with check (public.is_admin());

create policy "admins update videos"
on public.videos for update
using (public.is_admin())
with check (public.is_admin());

create policy "users read own history"
on public.watch_history for select
using (user_id = auth.uid() or public.is_admin());

create policy "users insert own history"
on public.watch_history for insert
with check (user_id = auth.uid());

create policy "users update own history"
on public.watch_history for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

## 6. Criar Storage

Abra **Storage → New bucket** e crie:

```text
machine-videos
```

Para o primeiro MVP, marque como público. Depois crie:

```text
machine-assets
```

Use `machine-videos` para MP4 e `machine-assets` para thumbnails e arquivos VTT de legenda.

O caminho recomendado para os arquivos é:

```text
{user_id}/{machine_id}/{uuid}.mp4
```

Nunca salve vídeos dentro do GitHub ou na pasta `client/public`.

## 7. Configurar as variáveis no computador

Não crie um arquivo `.env` público. Crie localmente um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```

O arquivo `.env.local` não deve ser commitado no GitHub.

Reinicie o Vite depois de criar ou alterar as variáveis:

```bash
pnpm dev
```

O helper `client/src/lib/supabase.ts` detecta se essas variáveis existem. Sem elas, o app usa o modo demo. Com elas, o login e a inserção de máquinas usam o Supabase.

## 8. Testar o login

1. Confirme que o usuário admin foi criado.
2. Confirme que o `profiles.role` está como `admin`.
3. Crie `.env.local`.
4. Reinicie o servidor.
5. Abra **Área do admin**.
6. Use o e-mail e senha do Supabase.
7. Se a conta não for admin, o app rejeita o acesso.
8. Na aba **Usuário**, use uma conta comum para testar o acesso de usuário.

## 9. Testar cadastro

O cadastro atual já tenta inserir em `public.machines` quando o Supabase está configurado.

Preencha:

```text
Nome da máquina
Descrição curta
Categoria
Duração
```

Clique em **Cadastrar e gerar QR**.

O sistema cria um slug, por exemplo:

```text
Prensa Hidráulica H-400
→ prensa-hidraulica-h-400
```

A URL do QR será:

```text
http://localhost:3000/m/prensa-hidraulica-h-400
```

Quando publicar na Vercel, ela será:

```text
https://meclibras.vercel.app/m/prensa-hidraulica-h-400
```

## 10. QR real e impressão

O painel gera QR a partir do slug e mostra dois botões:

- **SVG impressão:** recomendado para imprimir;
- **PNG:** útil para compartilhar ou inserir em uma etiqueta digital.

O SVG pode ser aberto no navegador, Illustrator, Figma ou Inkscape. Imprima com:

- fundo branco;
- margem livre ao redor;
- sem deformar a proporção;
- lado mínimo de aproximadamente 3 cm para o primeiro teste;
- nome da máquina escrito ao lado;
- instrução curta, como `Aponte a câmera para assistir em Libras`.

Antes de colar em produção:

1. baixe o SVG;
2. imprima em tamanho real;
3. teste com Android;
4. teste com iPhone;
5. teste com luz forte e luz baixa;
6. confirme que a página correta abre;
7. só depois faça várias cópias.

Cada cadastro gera outro slug e outro QR. O QR da máquina e o QR de um componente da máquina são diferentes porque apontam para URLs diferentes.

## 11. GitHub sem expor credenciais

O GitHub armazena o código. Ele não deve armazenar:

```text
.env.local
service_role key
senha do banco
tokens privados
arquivos MP4
```

Antes do primeiro push, confira:

```bash
git status
```

Se aparecer `.env.local`, remova do controle de versão:

```bash
git rm --cached .env.local
```

Depois faça commit:

```bash
git add .
git commit -m "feat: add supabase and real qr foundation"
git push
```

## 12. O que ainda precisa ser implementado para o produto 100%

A base de login, tabela, slug e QR já está preparada no frontend. Ainda falta ligar completamente:

- upload do MP4 para `machine-videos`;
- gravação do registro na tabela `videos`;
- publicação de máquina e vídeo;
- rota pública `/m/:slug` com busca no Supabase;
- upload de VTT e thumbnail;
- gravação do histórico em `watch_history`;
- tela de edição e arquivamento no admin.

A ordem correta é implementar esses itens um por vez. Não tente colocar senha, vídeos e todas as tabelas em uma única alteração.
