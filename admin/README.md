# Atrio Admin

Painel administrativo React + TypeScript do Atrio.

## Comandos

- `npm run dev`: servidor local.
- `npm run check`: lint, testes, TypeScript e build de produção.
- `npm run test`: testes Vitest.
- `npm run typecheck`: validação TypeScript isolada.

## Organização

```text
src/
├── app/                 # configuração, providers e roteamento
├── features/            # API pública, telas, componentes e regras por domínio
│   ├── stays/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── schemas/
│   └── reservations/
└── shared/              # transporte HTTP, contratos e UI realmente reutilizável
    ├── api/
    ├── components/
    └── lib/
```

Cada feature consome sua fronteira local em `feature/api`; a implementação compartilhada centraliza transporte e contratos sem espalhar detalhes HTTP pela interface. O cliente HTTP é responsável por timeout, normalização de erros, identificador de correlação e expiração da sessão; todos os retornos JSON são verificados por contratos Zod antes de chegar à interface.

O estado remoto usa TanStack Query, com chaves isoladas pelo hotel e invalidação a partir da raiz do domínio. Formulários de domínio usam React Hook Form e schemas Zod. Rotas são declaradas com React Router e carregadas sob demanda.

## Convenções

- Dados externos devem ser tratados como `unknown` e validados em `shared/api/contracts.ts`.
- Regras puras de domínio ou apresentação devem ficar em módulos testáveis, fora dos componentes.
- Estado de interface permanece local; chamadas remotas não devem ser espalhadas em componentes visuais reutilizáveis.
- Novas telas devem ser criadas dentro da feature correspondente e expostas por uma API pública, sem importar detalhes internos de outra feature.
- Execute `npm run check` antes de integrar uma alteração.

## Segurança da sessão

O token atual é mantido apenas durante a sessão da aba (`sessionStorage`), validado antes do uso e removido em expiração, `401`, `403` ou logout. Para eliminar acesso ao token por JavaScript, a evolução recomendada exige suporte do backend para cookie `HttpOnly`, `Secure`, `SameSite` e proteção CSRF.

## Testes

Vitest e Testing Library cobrem regras e comportamento dos componentes. A integração do cliente HTTP usa MSW para simular o servidor no nível da rede, incluindo respostas inválidas e expiração de sessão.
