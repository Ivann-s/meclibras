# MecLibras — como rodar no VS Code

## 1. O que você precisa instalar

Instale antes de abrir o projeto:

| Programa | Para que serve |
|---|---|
| Node.js LTS | Executar o projeto React/Vite |
| VS Code | Editar os arquivos |
| Git | Versionar o código |
| Google Chrome | Testar o protótipo |

Depois de instalar, abra o terminal e confirme:

```bash
node --version
npm --version
git --version
```

Se os três comandos mostrarem versões, o computador está pronto.

## 2. Abrir o projeto

No VS Code:

1. Abra **File → Open Folder**.
2. Selecione a pasta `maquina-acessivel`.
3. Abra o terminal integrado em **Terminal → New Terminal**.
4. Confirme que o terminal está dentro da pasta do projeto.

Pelo terminal, você também pode abrir diretamente:

```bash
cd /caminho/para/maquina-acessivel
code .
```

No ambiente deste protótipo, o projeto está em:

```text
/home/ubuntu/maquina-acessivel
```

## 3. Instalar dependências

Dentro da pasta do projeto, execute:

```bash
pnpm install
```

Se você não tiver pnpm, instale ou use npm:

```bash
npm install
```

O projeto já possui `package.json` e `pnpm-lock.yaml`. Não apague esses arquivos.

## 4. Rodar em desenvolvimento

Com pnpm:

```bash
pnpm dev
```

Com npm:

```bash
npm run dev
```

O terminal mostrará um endereço semelhante a:

```text
http://localhost:3000
```

Abra esse endereço no navegador.

Para parar o servidor:

```text
Ctrl + C
```

## 5. Extensões recomendadas do VS Code

Instale estas extensões pelo menu de extensões do VS Code:

| Extensão | Identificador | Motivo |
|---|---|---|
| ESLint | `dbaeumer.vscode-eslint` | Mostra problemas de JavaScript/TypeScript |
| Prettier | `esbenp.prettier-vscode` | Formata o código automaticamente |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Autocomplete das classes Tailwind |
| Error Lens | `usernamehw.errorlens` | Mostra erros diretamente na linha |
| GitLens | `eamodio.gitlens` | Ajuda a entender histórico do Git |
| Auto Rename Tag | `formulahendry.auto-rename-tag` | Renomeia tags JSX correspondentes |
| Path Intellisense | `christian-kohler.path-intellisense` | Completa caminhos de arquivos |
| Thunder Client | `rangav.vscode-thunder-client` | Testar APIs sem sair do VS Code |

Você também pode instalar pelo terminal:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension usernamehw.errorlens
code --install-extension eamodio.gitlens
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension rangav.vscode-thunder-client
```

## 6. Configuração recomendada do VS Code

Crie a pasta `.vscode` na raiz e dentro dela crie `settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true
  }
}
```

Crie também `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens",
    "eamodio.gitlens",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

Assim, outra pessoa que abrir o projeto receberá automaticamente a recomendação das extensões.

## 7. Arquivos mais importantes

```text
client/src/pages/Home.tsx
```

É a tela principal e contém o protótipo navegável.

```text
client/src/index.css
```

É o tema visual, responsividade, tipografia, logo e componentes de interface.

```text
client/index.html
```

É o HTML base e contém o título da página.

```text
GUIA-PROJETO.md
```

É o guia inicial da ideia e da arquitetura.

```text
TUTORIAL-COMPLETO-MVP.md
```

É o tutorial técnico detalhado para construir a aplicação real com Next.js, Supabase, login, banco, upload e QR.

## 8. Comandos úteis

Verificar TypeScript:

```bash
pnpm check
```

Criar build de produção:

```bash
pnpm build
```

Formatar arquivos:

```bash
pnpm format
```

Ver o status do Git:

```bash
git status
```

Criar um commit:

```bash
git add .
git commit -m "feat: update meclibras visual identity"
```

## 9. Como testar o fluxo do protótipo

1. Abra a home.
2. Clique em **Simular leitura do QR**.
3. Confira se aparece a página da Prensa hidráulica H-400.
4. Volte para a home.
5. Clique em **Área do admin**.
6. Preencha qualquer e-mail e senha no modo demo.
7. Entre no painel.
8. Cadastre uma máquina preenchendo nome e descrição.
9. Confira o cartão de QR demonstrativo.
10. Abra o projeto também em uma largura mobile usando o DevTools.

## 10. Como abrir no celular na mesma rede

Para testar no celular, o computador e o celular precisam estar na mesma rede Wi-Fi.

Execute:

```bash
pnpm dev --host 0.0.0.0
```

Descubra o IP local do computador:

Linux:

```bash
hostname -I
```

macOS:

```bash
ipconfig getifaddr en0
```

Windows PowerShell:

```powershell
ipconfig
```

No celular, abra:

```text
http://SEU_IP_LOCAL:3000
```

Exemplo:

```text
http://192.168.0.15:3000
```

Para o projeto real com QR, não use esse endereço. Use o domínio publicado, porque um QR impresso precisa continuar funcionando fora da sua rede.

## 11. Erros comuns

### `pnpm: command not found`

Use npm:

```bash
npm install
npm run dev
```

Ou instale pnpm:

```bash
npm install --global pnpm
```

### A porta 3000 já está ocupada

Execute:

```bash
pnpm dev --port 3001
```

Depois abra `http://localhost:3001`.

### O navegador mostra uma tela antiga

Faça recarregamento forçado:

```text
Ctrl + Shift + R
```

Se continuar, pare e reinicie o dev server.

### Erro de TypeScript

Execute:

```bash
pnpm check
```

Leia primeiro a primeira mensagem de erro. Muitas mensagens seguintes são consequência do primeiro problema.

### O QR não funciona no celular

No protótipo, o QR é demonstrativo. Na aplicação real, o QR deve usar o domínio publicado, por exemplo:

```text
https://meclibras.vercel.app/m/prensa-hidraulica-h400
```

Não gere QR com `localhost`.

## 12. Diferença entre o protótipo e o produto real

O protótipo atual é frontend e usa dados locais. Ele serve para apresentar a experiência e testar a navegação.

O produto real precisará de:

```text
Next.js
Supabase Auth
PostgreSQL
Supabase Storage
qrcode
Vercel
```

O tutorial `TUTORIAL-COMPLETO-MVP.md` explica essa transformação passo a passo.

## 13. Ativar Supabase no projeto atual

O frontend funciona em dois modos:

```text
Sem .env.local → modo demo, dados locais no navegador
Com .env.local → login e cadastro conectados ao Supabase
```

Crie, na raiz do projeto, um arquivo chamado `.env.local`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```

Pegue esses valores em **Supabase → Project Settings → API**.

Depois de criar o arquivo, reinicie o servidor:

```bash
Ctrl + C
pnpm dev
```

Nunca publique `.env.local` no GitHub. O arquivo já deve ser ignorado pelo Git; confirme com:

```bash
git status
```

O passo a passo SQL, as tabelas, o Storage e as políticas de segurança estão em:

```text
SUPABASE-SETUP.md
```

## 14. QR real no painel

Com ou sem Supabase configurado, o painel gera um QR real a partir do nome/slug digitado.

Depois de cadastrar uma máquina:

1. confira a URL pública;
2. clique em **SVG impressão** para baixar o arquivo recomendado para etiqueta;
3. clique em **PNG** para baixar uma versão de imagem;
4. abra o arquivo no navegador para conferir;
5. teste com o celular antes de colar na máquina.

No modo demo, a URL usa o endereço atual do navegador. Em produção, ela deve usar o domínio da Vercel.

## 15. Como modificar o design

Os arquivos principais são:

```text
client/src/pages/Home.tsx  → textos, componentes e interações
client/src/index.css       → cores, fontes, espaçamento, responsividade
client/index.html          → título, idioma e fontes externas
```

Para alterar a cor principal, procure no início de `client/src/index.css`:

```css
:root {
  --primary: #176b59;
  --accent: #d5ef4b;
}
```

Para alterar o nome da marca, procure em `Home.tsx` por:

```tsx
Mec<span className="brand-accent">Libras</span>
```

Para alterar o texto da home, procure por:

```tsx
<h1>Aprenda a operar.<br /><em>Do seu jeito.</em></h1>
```

Depois de cada alteração:

```bash
pnpm check
pnpm build
```

Faça pequenas alterações, salve, veja no navegador e só depois siga para a próxima. Isso facilita identificar qual mudança causou um problema.

## 16. Extensões úteis para Supabase e frontend

Além das extensões já listadas, estas podem ajudar:

| Extensão | Identificador | Uso |
|---|---|---|
| SQLTools | `mtxr.sqltools` | Editar consultas SQL no VS Code |
| SQLTools Driver PostgreSQL | `mtxr.sqltools-driver-pg` | Conectar em PostgreSQL quando necessário |
| REST Client | `humao.rest-client` | Testar requisições HTTP em arquivos `.http` |
| DotENV | `mikestead.dotenv` | Destacar arquivos de variáveis locais |
| Prettier ESLint | `rvest.vs-code-prettier-eslint` | Integrar formatação e lint |

Você não precisa instalar todas. A instalação mínima continua sendo ESLint, Prettier, Tailwind CSS IntelliSense e Error Lens.
