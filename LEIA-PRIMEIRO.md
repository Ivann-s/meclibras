# MecLibras — comece aqui

## Baixar o projeto

Baixe o arquivo `meclibras-vscode.zip` entregue junto com este projeto e extraia em uma pasta, por exemplo:

```text
Documentos/meclibras-vscode/maquina-acessivel
```

## Instalar o necessário

Instale:

1. **Node.js LTS:** https://nodejs.org
2. **VS Code:** https://code.visualstudio.com
3. **Git:** https://git-scm.com/downloads

Depois, abra o terminal e confirme:

```bash
node --version
npm --version
git --version
```

## Abrir no VS Code

1. Abra o VS Code.
2. Clique em **File → Open Folder**.
3. Selecione a pasta `maquina-acessivel` extraída.
4. Abra **Terminal → New Terminal**.

## Instalar dependências

No terminal do VS Code, dentro da pasta do projeto:

```bash
npm install
```

Se você usa pnpm:

```bash
pnpm install
```

## Rodar o site

```bash
npm run dev
```

ou:

```bash
pnpm dev
```

Abra o endereço exibido, normalmente:

```text
http://localhost:3000
```

## Extensões recomendadas

No VS Code, abra o menu de extensões ou use:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension usernamehw.errorlens
code --install-extension eamodio.gitlens
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension mikestead.dotenv
```

As quatro mais importantes são **ESLint**, **Prettier**, **Tailwind CSS IntelliSense** e **Error Lens**.

## Onde modificar o design

Abra estes arquivos:

```text
client/src/pages/Home.tsx
```

Modifique textos, cards, botões, telas, navegação e componentes.

```text
client/src/index.css
```

Modifique cores, fontes, espaçamento, bordas, sombras, responsividade e animações.

```text
client/index.html
```

Modifique título da aba, idioma e fontes externas.

## Comandos depois de modificar

```bash
npm run check
npm run build
```

Se usar pnpm:

```bash
pnpm check
pnpm build
```

## Supabase

Para ativar login online e cadastro persistente:

1. Crie um projeto em https://supabase.com.
2. Siga o arquivo `SUPABASE-SETUP.md`.
3. Crie `.env.local` na raiz do projeto.
4. Coloque nele:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```

5. Reinicie o servidor depois de salvar:

```bash
Ctrl + C
npm run dev
```

Nunca publique `.env.local` no GitHub.

## Documentos completos

- `COMO-RODAR-VSCODE.md`: guia completo de VS Code, comandos, extensões e testes.
- `SUPABASE-SETUP.md`: banco, login, Storage, políticas de segurança e QR.
- `TUTORIAL-COMPLETO-MVP.md`: tutorial técnico do projeto do zero ao MVP.

## Fluxo para alterar o design

1. Rode o projeto.
2. Abra `client/src/index.css`.
3. Altere uma cor ou espaçamento.
4. Salve.
5. Veja a atualização no navegador.
6. Teste também no modo mobile do DevTools.
7. Rode `npm run check` antes de continuar.
