# Máquina Acessível — guia técnico de desenvolvimento do zero

## 1. O produto em uma frase

O administrador cadastra uma máquina ou componente, associa um vídeo em Libras e o sistema gera um **QR Code com uma URL pública estável**. O usuário escaneia o QR e abre diretamente a página daquele item, sem precisar fazer login.

O fluxo principal é:

```text
Administrador autenticado
  → cadastra máquina/componente
  → envia vídeo em Libras
  → sistema cria slug e URL pública
  → sistema gera QR Code dessa URL
  → administrador baixa/imprime o QR

Usuário
  → escaneia o QR físico
  → abre /m/:slug
  → assiste ao vídeo específico
  → consulta instruções e pode continuar depois
```

A regra mais importante é: **o QR aponta para a URL da máquina, não diretamente para o arquivo de vídeo**. Assim, o administrador pode trocar o vídeo sem precisar trocar a etiqueta já colada na máquina.

---

## 2. O que o protótipo já demonstra

O protótipo atual é uma demonstração frontend. Ele contém:

- catálogo público;
- busca e filtros;
- simulação de leitura de QR;
- página específica de uma máquina;
- URL pública demonstrativa no formato `/m/:id`;
- player visual de vídeo em Libras;
- histórico salvo no navegador;
- tela de login de administrador em modo demo;
- painel para cadastrar uma máquina;
- QR visual de demonstração;
- fluxo visual `cadastro → URL pública + QR → usuário abre vídeo`;
- layout responsivo para desktop e mobile.

Importante: o QR desenhado no protótipo é visual e não deve ser usado em produção. Na versão real, o QR deve ser gerado por uma biblioteca própria para QR Code e precisa ser validado com a câmera de um celular.

---

## 3. Stack recomendada

### Opção recomendada para um MVP solo

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend | React + TypeScript + Vite | Rápido, popular e fácil de manter |
| Estilo | Tailwind CSS | Permite construir a interface responsiva rapidamente |
| Rotas | React Router ou Wouter | Rota pública `/m/:slug` e rotas administrativas |
| Backend | Node.js + TypeScript + Express ou tRPC | API simples para máquinas, vídeos e usuários |
| Banco | PostgreSQL | Bom para relacionamentos e produção |
| ORM | Drizzle ORM ou Prisma | Tipagem, migrations e consultas organizadas |
| Login | Auth.js, Clerk, Supabase Auth ou OAuth existente | Não implementar senha manualmente no primeiro MVP |
| Arquivos | S3, Cloudflare R2, Supabase Storage ou similar | Vídeos não devem ficar no repositório |
| QR Code | Biblioteca `qrcode` no backend | Gera PNG/SVG a partir da URL pública |
| Vídeo | Storage + player HTML5 ou serviço HLS | Suporta MP4 no começo e streaming depois |
| Deploy | Vercel/Netlify para frontend + Render/Railway/Fly para API, ou uma plataforma full-stack | Simples para começar |

### Stack alternativa mais simples

Para fazer tudo em um só projeto, use **Next.js + TypeScript + PostgreSQL + Prisma + Auth.js + S3/R2**. Essa opção reduz a quantidade de repositórios e já tem rotas de frontend e backend no mesmo projeto.

Uma combinação prática seria:

```text
Next.js
TypeScript
Tailwind CSS
PostgreSQL
Prisma
Auth.js
Cloudflare R2
qrcode
Zod
Vitest
Playwright
```

A escolha entre React separado ou Next.js não muda o conceito do produto. Para um projeto solo, Next.js costuma diminuir trabalho de configuração.

---

## 4. Criar o projeto do zero

Exemplo usando Next.js:

```bash
npx create-next-app@latest maquina-acessivel
cd maquina-acessivel

npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install qrcode zod
npm install lucide-react
npm install -D prisma tsx vitest @playwright/test

npx prisma init
```

Durante o `create-next-app`, escolha:

```text
TypeScript: sim
ESLint: sim
Tailwind CSS: sim
App Router: sim
src/: sim
Import alias: sim, usando @/*
```

Estrutura inicial recomendada:

```text
src/
  app/
    page.tsx                  # página pública inicial
    m/[slug]/page.tsx         # página pública específica da máquina
    admin/login/page.tsx      # login do administrador
    admin/page.tsx            # painel administrativo
    admin/machines/new/page.tsx
    api/
      machines/route.ts
      machines/[id]/route.ts
      machines/[id]/qr/route.ts
      uploads/route.ts
  components/
    PublicMachinePage.tsx
    MachineCard.tsx
    VideoPlayer.tsx
    QrPreview.tsx
    AdminSidebar.tsx
  lib/
    db.ts
    auth.ts
    qr.ts
    storage.ts
    validations.ts
  server/
    machine-service.ts
    video-service.ts
prisma/
  schema.prisma
public/
```

Não coloque vídeos dentro de `public/` ou do repositório. O repositório deve conter apenas código e arquivos pequenos.

---

## 5. Modelagem do banco

Comece com quatro entidades: usuário, máquina/componente, vídeo e histórico.

Exemplo de schema Prisma simplificado:

```prisma
enum UserRole {
  ADMIN
  USER
}

enum MachineStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  machines  Machine[]
}

model Machine {
  id          String        @id @default(cuid())
  slug        String        @unique
  name        String
  type        String        // máquina, componente ou equipamento
  sector      String?
  description String?
  status      MachineStatus @default(DRAFT)
  createdById String
  createdBy   User          @relation(fields: [createdById], references: [id])
  videos      Video[]
  scans       QrScan[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Video {
  id              String   @id @default(cuid())
  machineId       String
  machine         Machine  @relation(fields: [machineId], references: [id], onDelete: Cascade)
  videoUrl        String
  thumbnailUrl    String?
  captionsUrl     String?
  transcript      String?
  durationSeconds Int?
  language        String   @default("pt-BR-Libras")
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
}

model QrScan {
  id        String   @id @default(cuid())
  machineId String
  machine   Machine  @relation(fields: [machineId], references: [id], onDelete: Cascade)
  scannedAt DateTime @default(now())
  userAgent String?
}
```

Depois de criar o schema:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

No produto real, a URL pública deve usar o `slug`, não o `id` interno:

```text
https://seudominio.com/m/prensa-hidraulica-h-400
```

O `slug` é legível e pode continuar o mesmo mesmo se o nome exibido mudar.

---

## 6. Login e permissão de administrador

O usuário público **não precisa de login** para abrir um QR. O login só protege o painel que cria e altera conteúdo.

O fluxo correto é:

```text
GET /m/prensa-hidraulica-h-400
→ público, sem autenticação

GET /admin
→ verifica sessão
→ se não estiver logado, redireciona para /admin/login

POST /api/machines
→ verifica sessão
→ verifica user.role === ADMIN
→ cria a máquina
```

Não confie apenas em esconder o botão no frontend. A API também deve bloquear qualquer requisição sem sessão de administrador.

Pseudo-regra de autorização:

```ts
async function requireAdmin(session: Session | null) {
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }
  return session.user;
}
```

Para o primeiro MVP, prefira login por OAuth ou magic link. Evite criar armazenamento de senha manual, recuperação de senha e confirmação de e-mail antes de validar o produto.

---

## 7. Cadastro de máquina no painel

O formulário do admin deve coletar:

```text
Nome: Prensa hidráulica H-400
Tipo: Máquina
Setor: Produção
Descrição curta: Operação segura e manutenção básica
Vídeo em Libras: arquivo MP4
Legenda: arquivo VTT opcional
Transcrição: texto opcional
```

Ao clicar em **Cadastrar e gerar QR**, o backend deve:

1. validar os campos com Zod;
2. gerar um slug único;
3. criar o registro da máquina com status `DRAFT`;
4. enviar ou confirmar o upload do vídeo;
5. criar o registro do vídeo;
6. montar a URL pública;
7. gerar o QR a partir dessa URL;
8. devolver ao painel a URL, o PNG/SVG do QR e o status;
9. permitir que o admin publique o conteúdo.

Validação simples:

```ts
import { z } from "zod";

export const createMachineSchema = z.object({
  name: z.string().min(3).max(120),
  type: z.enum(["machine", "component", "equipment"]),
  sector: z.string().max(80).optional(),
  description: z.string().min(10).max(500),
});
```

---

## 8. Como criar o QR Code de verdade

### 8.1 Instalar a biblioteca

```bash
npm install qrcode
npm install -D @types/qrcode
```

### 8.2 Criar um helper no backend

```ts
// src/lib/qr.ts
import QRCode from "qrcode";

export function getMachineUrl(slug: string) {
  const baseUrl = process.env.PUBLIC_APP_URL!;
  return `${baseUrl}/m/${slug}`;
}

export async function generateMachineQr(slug: string) {
  const url = getMachineUrl(slug);

  const pngDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 1200,
    color: {
      dark: "#193b34",
      light: "#ffffff",
    },
  });

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: {
      dark: "#193b34",
      light: "#ffffff",
    },
  });

  return { url, pngDataUrl, svg };
}
```

O QR não contém a máquina inteira nem o vídeo. Ele contém somente algo semelhante a:

```text
https://seudominio.com/m/prensa-hidraulica-h-400
```

### 8.3 Gerar e baixar no painel

No frontend, o painel chama o endpoint autenticado:

```ts
const response = await fetch(`/api/machines/${machineId}/qr`);
const { url, svg } = await response.json();

const blob = new Blob([svg], { type: "image/svg+xml" });
const downloadUrl = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = downloadUrl;
link.download = `${machineSlug}-qr.svg`;
link.click();
URL.revokeObjectURL(downloadUrl);
```

Para impressão, SVG é melhor que um screenshot porque mantém qualidade em tamanhos diferentes. Também ofereça PNG para uso rápido.

### 8.4 Testar o QR

Todo QR gerado precisa ser testado:

1. abra a câmera de um celular;
2. escaneie o QR impresso ou exibido na tela;
3. confirme que a URL abre a máquina correta;
4. teste com pouca luz;
5. teste a etiqueta em tamanho real;
6. confira se o QR não está deformado, cortado ou coberto por logo;
7. teste o QR depois de trocar o vídeo para confirmar que a URL continuou estável.

---

## 9. Rotas da aplicação

### Rotas públicas

| Rota | Acesso | Função |
|---|---|---|
| `/` | público | catálogo e explicação do produto |
| `/m/:slug` | público | perfil específico da máquina/componente |
| `/m/:slug/video/:videoId` | público opcional | versão específica do vídeo |

### Rotas administrativas

| Rota | Acesso | Função |
|---|---|---|
| `/admin/login` | público | entrada do administrador |
| `/admin` | admin | resumo do painel |
| `/admin/machines` | admin | lista de máquinas |
| `/admin/machines/new` | admin | cadastro |
| `/admin/machines/:id` | admin | edição e publicação |
| `/admin/machines/:id/qr` | admin | visualizar/baixar QR |

A rota pública `/m/:slug` é a parte que o QR abre. Ela deve buscar a máquina no banco pelo `slug`, carregar apenas o vídeo publicado e mostrar uma página que funcione bem em celular.

---

## 10. Upload e vídeo em Libras

No começo, aceite MP4 com limite de tamanho. O melhor fluxo é upload direto para storage:

```text
Frontend pede URL assinada ao backend
→ backend confere se é admin
→ frontend envia o arquivo diretamente ao storage
→ frontend avisa o backend que terminou
→ backend salva a URL do vídeo
```

Não faça o upload passando o arquivo inteiro pelo servidor se não for necessário.

Para o vídeo, entregue:

- vídeo principal em Libras;
- legenda sincronizada em `.vtt`;
- transcrição em português;
- thumbnail;
- duração;
- aviso visual para riscos críticos;
- botão grande de play/pause;
- controle de legenda e velocidade.

O conteúdo deve ser revisado por pessoa fluente em Libras e por alguém que conheça a operação e segurança da máquina.

---

## 11. Como implementar o histórico

Para o MVP sem conta, guarde apenas o slug e o progresso no navegador:

```ts
localStorage.setItem(
  "machine-history",
  JSON.stringify([
    { slug: "prensa-hidraulica-h-400", progress: 148, updatedAt: Date.now() },
  ]),
);
```

Depois, com conta opcional, sincronize em uma tabela `WatchHistory`. O acesso público deve continuar funcionando sem login.

Se houver analytics, registre dados agregados como abertura do QR, início do vídeo e conclusão. Evite coletar informações pessoais que não sejam necessárias.

---

## 12. Testes indispensáveis

### Testes unitários

- slug não pode duplicar;
- somente admin pode criar máquina;
- URL gerada usa o domínio correto;
- QR codifica a URL correta;
- máquina arquivada não aparece publicamente;
- vídeo não publicado não aparece na página pública.

### Testes de integração

- admin faz login;
- admin cria máquina;
- máquina recebe slug;
- QR é gerado;
- URL do QR abre a máquina correta;
- usuário público acessa sem login;
- usuário não consegue chamar endpoint de cadastro.

### Teste manual de aceitação

```text
[ ] Criar uma máquina de teste
[ ] Enviar vídeo de teste
[ ] Publicar
[ ] Gerar SVG e PNG
[ ] Imprimir em tamanho real
[ ] Escanear com Android e iPhone
[ ] Confirmar máquina correta
[ ] Trocar o vídeo
[ ] Escanear o mesmo QR novamente
[ ] Confirmar que o QR antigo continua funcionando
```

---

## 13. Deploy

Configure pelo menos estas variáveis:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="uma-chave-secreta-forte"
PUBLIC_APP_URL="https://seudominio.com"
STORAGE_ENDPOINT="..."
STORAGE_BUCKET="..."
STORAGE_ACCESS_KEY="..."
STORAGE_SECRET_KEY="..."
```

Nunca coloque credenciais de banco ou storage no código frontend.

Pipeline recomendado:

```text
git push
→ CI instala dependências
→ roda lint e testes
→ roda migration em ambiente controlado
→ faz build
→ publica frontend/API
→ verifica health check
```

No primeiro deploy, use um domínio real. O domínio precisa ser estável porque a URL dele será impressa nos QRs.

---

## 14. Cronograma realista

As estimativas abaixo consideram uma pessoa com conhecimento básico/intermediário de desenvolvimento web, trabalhando algumas horas por dia. Elas não incluem a gravação e revisão profissional dos vídeos em Libras.

### Fazendo sozinho, aprendendo durante o projeto

| Fase | Tempo estimado |
|---|---:|
| Aprender base de React/TypeScript e Git | 1–2 semanas |
| Criar interface pública e responsiva | 1–2 semanas |
| Criar backend, banco e migrations | 1–2 semanas |
| Criar login e autorização admin | 3–7 dias |
| Criar cadastro de máquinas | 4–7 dias |
| Upload e armazenamento de vídeos | 1–2 semanas |
| Gerar, baixar e validar QR | 2–4 dias |
| Histórico e analytics básico | 3–7 dias |
| Testes, correções e deploy | 1–2 semanas |
| **Total para MVP utilizável** | **7–12 semanas** |

Se você já for programador full-stack e trabalhar em tempo integral, o mesmo MVP pode cair para aproximadamente **3–6 semanas**.

### Fazendo sozinho com ajuda de IA

| Fase | Tempo estimado |
|---|---:|
| Planejamento e setup | 1–2 dias |
| Interface pública e responsiva | 3–6 dias |
| Backend, schema e migrations | 3–6 dias |
| Login e autorização | 2–4 dias |
| Cadastro e geração de QR | 2–4 dias |
| Upload real de vídeo | 3–6 dias |
| Histórico e analytics | 2–4 dias |
| Testes, segurança e deploy | 5–10 dias |
| **Total para MVP utilizável** | **3–6 semanas** |

A IA acelera escrever código, criar componentes, explicar erros e gerar testes. Ela não elimina o tempo de decidir arquitetura, configurar credenciais, revisar segurança, testar o QR no celular e validar o conteúdo em Libras.

### O que a IA consegue fazer bem

- criar estrutura de projeto;
- gerar componentes React;
- escrever schema inicial;
- criar endpoints CRUD;
- explicar erros de TypeScript;
- criar testes;
- montar a função de geração de QR;
- revisar responsividade;
- produzir documentação.

### O que você ainda precisa validar pessoalmente

- permissões e segurança do painel;
- configuração de banco e storage;
- custo e limites das plataformas;
- comportamento do upload real;
- teste em celulares e rede ruim;
- qualidade e correção dos vídeos em Libras;
- procedimentos de segurança industrial;
- política de privacidade e LGPD.

---

## 15. Ordem prática de implementação

Para não tentar construir tudo de uma vez, siga esta ordem:

### Sprint 1 — fluxo público falso

1. Criar projeto.
2. Fazer catálogo com dados mockados.
3. Criar rota `/m/:slug`.
4. Fazer um QR real apontando para uma URL de teste.
5. Confirmar que o QR abre a página certa.

### Sprint 2 — banco e admin

1. Criar banco PostgreSQL.
2. Criar tabelas de usuário e máquina.
3. Implementar login.
4. Proteger `/admin` no backend.
5. Criar cadastro sem vídeo real.
6. Gerar slug e URL pública.

### Sprint 3 — vídeos

1. Configurar storage.
2. Fazer upload de um MP4.
3. Salvar a URL do vídeo.
4. Criar player real.
5. Adicionar legenda e thumbnail.
6. Publicar somente após revisão.

### Sprint 4 — QR e piloto

1. Gerar SVG e PNG.
2. Criar etiqueta com nome e instrução curta.
3. Imprimir três QRs.
4. Colar em três máquinas.
5. Testar com usuários reais.
6. Corrigir o que impedir o acesso ou o entendimento.

---

## 16. Decisão final recomendada

Para começar agora, eu usaria:

```text
Next.js + TypeScript + Tailwind
PostgreSQL + Prisma
Auth.js
Cloudflare R2 ou Supabase Storage
qrcode
Zod
Vitest + Playwright
```

Construa primeiro o caminho de maior risco: **QR físico → URL pública correta → vídeo específico da máquina**. Depois adicione histórico, analytics e recursos secundários. Se esse caminho funcionar com uma máquina real e usuários reais, o restante do produto fica incremental.
