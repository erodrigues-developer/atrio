# Padrão premium da tela de Estadias

## Objetivo

Este documento registra, em nível de detalhe suficiente para reprodução, o padrão visual, estrutural e comportamental estabelecido pela tela administrativa de Estadias.

O objetivo não é copiar classes específicas da feature, mas identificar os contratos de interface que devem ser normalizados e adotados pelas demais telas do sistema.

O padrão pode ser resumido como **premium operacional**: visual sóbrio, hierarquia forte, superfícies claras, densidade controlada, ações contextuais e revelação progressiva da complexidade. A percepção de qualidade vem da consistência, não de efeitos decorativos.

## Fontes de referência

- Página principal: `src/features/stays/pages/StaysView.tsx`
- Tabela, paginação e estado vazio: `src/features/stays/components/StaysTable.tsx`
- Detalhe operacional: `src/features/stays/components/StayDetailPanel.tsx`
- Formulário de estadia: `src/features/stays/components/StayForm.tsx`
- Seletor de período: `src/features/stays/components/StayDateRangePicker.tsx`
- Sistema compartilhado de modais: `src/shared/components/Modal.tsx`
- Feedback global: `src/shared/components/Toast.tsx`
- Formatação e semântica de status: `src/shared/lib/presentation.ts`
- Tema do Ant Design: `src/app/providers/AppProviders.tsx`
- Estilos: `src/styles.css`, especialmente o bloco de alta fidelidade iniciado próximo à linha 2259

## 1. Princípios do padrão

### 1.1 Hierarquia por composição

A interface diferencia os níveis de informação por:

- tamanho e peso tipográfico;
- agrupamento em superfícies;
- bordas discretas;
- espaçamento consistente;
- contraste moderado;
- posição e prioridade das ações.

Não são usados gradientes, glassmorphism ou sombras intensas em painéis comuns. A sombra mais forte é reservada aos modais.

### 1.2 Uma ação primária por contexto

Cada contexto apresenta, sempre que possível, apenas uma ação primária evidente:

- página: `Nova estadia`;
- filtros: `Aplicar filtros`;
- detalhe de estadia agendada: `Realizar check-in`;
- detalhe de estadia ativa: `Realizar check-out`;
- formulário: salvar ou cadastrar;
- confirmação: concluir a ação confirmada.

As ações secundárias permanecem contornadas, textuais ou agrupadas em um menu de reticências.

### 1.3 Complexidade progressiva

A listagem mostra somente o necessário para operação rápida. Informações e ações avançadas aparecem em camadas:

1. listagem;
2. detalhe em modal;
3. menu de ações contextuais;
4. formulário ou confirmação em modal secundário.

Esse fluxo preserva o contexto original e reduz a carga visual da página.

### 1.4 Densidade controlada

A listagem é confortável, enquanto detalhes e formulários são deliberadamente mais compactos. A densidade muda conforme o tipo de tarefa:

- página e empty state: mais espaço e leitura orientada;
- tabela principal: densidade intermediária;
- tabelas internas e formulários operacionais: alta densidade;
- confirmações: conteúdo curto e direto.

## 2. Tokens visuais

### 2.1 Cores

| Papel | Valor atual | Aplicação |
|---|---:|---|
| Fundo da aplicação | `#f6f8fc` | Canvas geral e workspace |
| Superfície principal | `#ffffff` | Painéis, tabelas, cards e modais |
| Texto principal A | `#14203a` | Título da página e empty state |
| Texto principal B | `#15213a` | Títulos e valores dentro de modais |
| Texto principal C | `#17233b` | Texto-base do tema e títulos internos |
| Texto intermediário A | `#273550` | Contagem, paginação e ações |
| Texto intermediário B | `#53617a` | Labels e metadados de maior relevância |
| Texto discreto A | `#71809d` | Subtítulos e descrições |
| Texto discreto B | `#738099` | Metadados dos cards |
| Ação primária | `#0b63f6` | CTA, seleção e ícones acionáveis |
| Hover primário | `#0755d9` | Hover de botão primário |
| Perigo | `#ef3340` | Exclusão e cancelamento |
| Borda de modal/card | `#dce3ed` | Cards do detalhe e modais |
| Borda de painel | `#dde5f0` | Filtros e resultados |
| Divisor | `#e2e8f1` | Cabeçalhos, rodapés e linhas estruturais |
| Fundo auxiliar | `#f3f6fd` | Totalizadores |
| Fundo de cabeçalho compacto | `#f7f8fb` | Tabela interna |
| Hover de linha | `#f7faff` | Linha clicável da tabela principal |

Os valores próximos de navy e slate cumprem papéis diferentes, mas atualmente aparecem como valores literais. Antes da adoção geral, devem ser consolidados em tokens semânticos.

### 2.2 Tipografia

A fonte global é:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Escala observada:

| Elemento | Tamanho | Peso |
|---|---:|---:|
| Título da página de Estadias | `30px` | `700` |
| Título de modal de detalhe | `18px` | `700` |
| Título de modal operacional | `16px` | padrão forte |
| Título do empty state | `20px` | padrão do `Typography.Title` |
| Identidade do quarto | `17px` | `600` |
| Total monetário interno | `16px` a `18px` | forte |
| Contagem de resultados | `14px` | normal |
| Cabeçalho da tabela principal | `13px` | `700` |
| Célula da tabela principal | herdado do sistema, aproximadamente `13px` | normal |
| Subtítulo da página | `12px` | normal |
| Label dos filtros | `11px` | `700` |
| Texto dos controles de filtro | `12px` | normal |
| Label de card-resumo | `12px` | `600` |
| Valor de card-resumo | `13px` | forte |
| Metadado de card-resumo | `11px` | normal |
| Tabela interna de consumos | `11px` | normal/forte conforme coluna |
| Labels de formulário operacional | `11px` | normal |

### 2.3 Raios

| Uso | Raio |
|---|---:|
| Grandes painéis | `10px` |
| Botões, inputs e modal | `8px` |
| Cards internos, chips e totalizadores | `6px` |
| Avatar | `50%` |

A regra é reservar raios maiores para containers principais e raios menores para elementos internos de alta densidade.

### 2.4 Bordas e elevação

Painéis principais:

```css
border: 1px solid #dde5f0;
box-shadow: 0 5px 16px rgba(34, 60, 98, 0.06);
```

Modais:

```css
border: 1px solid #dce3ed;
box-shadow: 0 24px 70px rgba(19, 31, 51, 0.24);
```

Cards internos usam borda, mas não sombra. Isso impede a criação de múltiplos níveis de elevação concorrentes.

### 2.5 Espaçamento

Escala recorrente identificada:

- `6px` a `10px`: relações internas muito próximas;
- `12px` a `14px`: gaps de grids e padding de cards compactos;
- `16px` a `18px`: separação entre blocos internos;
- `22px`: gap principal da página e padding estrutural de painéis;
- `28px`: padding horizontal da página em desktop;
- `32px`: padding generoso do empty state;
- `37px` a `48px`: respiro inferior ou vertical de grandes superfícies.

## 3. Estrutura da página

A página é composta por quatro regiões:

```text
Cabeçalho contextual
        ↓ 22px
Painel de filtros
        ↓ 22px
Painel de resultados
        ├── contagem
        ├── feedback
        ├── tabela ou estado vazio
        └── paginação
```

O container de Estadias usa:

```css
display: grid;
gap: 22px;
padding: 22px 28px 37px;
```

## 4. Cabeçalho contextual

### 4.1 Composição

- título e descrição alinhados à esquerda;
- CTA principal alinhado à direita;
- alinhamento vertical central;
- altura mínima de `66px`.

### 4.2 Título e descrição

- título `Estadias`: `30px`, peso `700`, line-height próximo de `1.15`;
- margem inferior do título: `6px`;
- descrição: `12px`, cor muted;
- descrição curta, orientada à tarefa e não apenas à entidade.

### 4.3 CTA da página

- label verbal e específica: `Nova estadia`;
- ícone de adição antes do texto;
- botão primário;
- altura `46px`;
- padding horizontal `19px` em desktop;
- texto `12px`.

Contrato recomendado:

```ts
type PageHeaderProps = {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
};
```

## 5. Painel de filtros

### 5.1 Superfície

```css
background: #ffffff;
border: 1px solid #dde5f0;
border-radius: 8px;
box-shadow: 0 5px 16px rgba(34, 60, 98, 0.06);
padding: 22px 18px;
```

### 5.2 Grade desktop

```css
grid-template-columns:
  minmax(240px, 1.25fr)
  minmax(170px, .8fr)
  minmax(260px, 1fr)
  104px
  112px;
gap: 14px;
align-items: end;
```

Ordem:

1. busca;
2. status;
3. período;
4. limpar;
5. aplicar.

### 5.3 Campos

- label acima do controle;
- label `11px`, peso `700`, cor `#1d2b46`;
- gap entre label e controle: `8px`;
- inputs, selects, date picker e botões: `38px`;
- conteúdo dos controles: `12px`;
- ícone da busca: `14px`, `#71809d`, margem direita `6px`;
- raio dos controles: `8px`;
- hover de borda: `#8eb7ff`.

### 5.4 Hierarquia de ações

`Limpar filtros`:

- botão secundário;
- borda azul;
- texto azul;
- peso `600`.

`Aplicar filtros`:

- botão primário azul;
- texto branco;
- sombra sutil de CTA.

### 5.5 Comportamento

- alterações permanecem locais até o submit;
- o formulário pode ser aplicado por Enter;
- aplicar filtros volta à página 1;
- estado inicial: status ativo e mês corrente;
- limpar filtros restaura o estado inicial e volta à página 1;
- o período não pode ser limpo pelo `RangePicker`;
- formatos exibidos usam `DD/MM/YYYY`;
- valores enviados usam `YYYY-MM-DD`.

Esse modelo deve ser usado em telas nas quais filtros disparam consultas remotas ou alteram conjuntos grandes de dados.

## 6. Painel de resultados

### 6.1 Container

```css
border: 1px solid #dde5f0;
border-radius: 10px;
box-shadow: 0 5px 16px rgba(34, 60, 98, 0.06);
display: flex;
flex-direction: column;
height: calc(100vh - 418px);
min-height: 480px;
overflow: hidden;
```

A altura vinculada ao viewport mantém a paginação visualmente ancorada e faz a tabela ocupar a área operacional restante.

### 6.2 Cabeçalho de resultados

- altura fixa: `62px`;
- padding horizontal: `22px`;
- borda inferior: `#e2e8f1`;
- texto: `14px`, `#273550`;
- copy: `Total de X registro(s)`;
- pluralização correta.

### 6.3 Organização interna

```text
ResultsPanel
├── ResultsHeader
├── Feedback opcional
├── DataTable ou EmptyState
└── PaginationBar
```

## 7. Tabela principal

### 7.1 Estrutura de colunas

O padrão semântico da tabela é:

```text
Identificador | Entidade principal | Início | Fim | Status | Métrica | Ações
```

Em Estadias:

1. quarto;
2. hóspede;
3. check-in;
4. check-out;
5. status;
6. número de acessos ao app;
7. ações.

### 7.2 Cabeçalho

- altura `47px`;
- padding horizontal `22px`;
- fundo `#fbfcfe`;
- texto `13px`;
- peso `700`;
- cor `#263652`;
- capitalização natural, sem uppercase forçado.

### 7.3 Linhas

- altura `62px`;
- padding `10px 22px`;
- texto navy/slate;
- divisores discretos;
- linha inteira clicável;
- cursor pointer;
- hover `#f7faff`;
- transição de fundo de aproximadamente `140ms`.

Clicar na linha abre o detalhe. Ações internas interrompem a propagação do clique.

### 7.4 Ações de linha

- agrupadas horizontalmente;
- gap `8px`;
- botões textuais somente com ícone;
- ícones `18px`;
- ações normais em azul;
- destrutivas em vermelho;
- `aria-label` descreve cada botão;
- ações incompatíveis com o estado permanecem visíveis e desabilitadas.

Mapeamento atual:

| Ação | Ícone | Disponibilidade | Confirmação |
|---|---|---|---|
| Ver detalhes | olho | sempre | não |
| Reenviar acesso | envio | agendada ou ativa | sim |
| Cancelar estadia | lixeira | somente agendada | sim |

### 7.5 Status

| Valor | Label | Tom visual |
|---|---|---|
| `active` | Ativa | `success`, verde |
| `scheduled` | Agendada | `processing`, azul |
| `checked_out` | Encerrada | `default`, neutro |
| `cancelled` | Cancelada | `error`, vermelho |

O badge usa raio `6px`, peso `600` e padding horizontal de `9px`.

### 7.6 Datas

- formato curto em português;
- mês abreviado;
- ano omitido quando a data pertence ao ano corrente;
- ano exibido para datas de outros anos;
- ponto da abreviação do mês removido.

Exemplos:

- ano corrente: `23 ago`;
- outro ano: `23 ago 2027`;
- período: `23 ago → 27 ago`.

## 8. Paginação

### 8.1 Container

- altura fixa `76px`;
- padding horizontal `22px`;
- borda superior;
- seletor à esquerda;
- páginas à direita;
- alinhamento vertical central.

### 8.2 Seletor de quantidade

- label `Itens por página` em `13px`;
- gap `14px`;
- select com largura `82px`;
- altura mínima `40px`.

Atualmente, apenas a opção `10` está disponível. O contrato visual permite múltiplas opções, mas a implementação funcional ainda é fixa.

### 8.3 Estados

- paginação desabilitada quando não existem registros;
- total técnico mínimo de 1 é enviado ao componente para manter sua estrutura;
- a página atual é limitada ao total de páginas disponível.

## 9. Estado vazio

### 9.1 Objetivo

O vazio é apresentado como orientação operacional, não como falha técnica.

### 9.2 Composição

```text
Ilustração específica do domínio
Título explicativo
Orientação curta
Ação de recuperação + ação primária
```

### 9.3 Especificação visual

- ocupa a área útil do painel;
- fundo branco e sem borda interna;
- conteúdo centralizado;
- padding `32px 18px`;
- gap `8px`;
- ilustração com largura máxima de `280px`;
- margem de `8px` após a ilustração;
- título `20px`, navy;
- descrição `14px`, muted;
- ações com gap `14px` e margem superior `18px`;
- botões com altura `50px` e largura mínima `148px`.

### 9.4 Conteúdo atual

- ilustração: porta de hotel, quarto 101, mala e planta, em traço azul-claro;
- título: `Nenhuma estadia encontrada`;
- orientação: `Tente ajustar os filtros ou crie uma nova estadia para começar.`;
- recuperação: `Limpar filtros`;
- CTA: `Nova estadia`.

### 9.5 Contrato recomendado

Cada domínio deve fornecer:

- ilustração coerente com a entidade;
- título específico;
- diagnóstico ou orientação em uma frase;
- ação de recuperação, quando aplicável;
- CTA principal de criação, quando permitido.

## 10. Detalhe operacional

O detalhe abre em modal grande, mantendo a listagem e seus filtros no plano de fundo.

### 10.1 Estrutura

```text
Título do modal
Identidade + status + ações
Feedback opcional
Cards-resumo
Submódulo operacional
```

### 10.2 Hero do detalhe

- layout horizontal;
- identidade e status à esquerda;
- ação primária e menu secundário à direita;
- gap geral `18px`;
- gap interno `10px`.

### 10.3 Chip de identidade

```css
height: 44px;
padding: 0 15px;
border: 1px solid #dce3ed;
border-radius: 6px;
font-size: 17px;
font-weight: 600;
gap: 9px;
```

O chip combina ícone de domínio e identificador humano, por exemplo `Quarto 101`.

### 10.4 Ação primária por estado

| Estado | Ação primária |
|---|---|
| Agendada | Realizar check-in |
| Ativa | Realizar check-out |
| Encerrada | Nenhuma |
| Cancelada | Nenhuma |

O botão primário possui `42px` de altura e largura mínima de `142px`.

### 10.5 Menu de ações contextuais

| Ação | Agendada | Ativa | Encerrada | Cancelada |
|---|---:|---:|---:|---:|
| Editar | sim | sim | sim | sim |
| Reenviar acesso | sim | sim | não | não |
| Cancelar | sim | não | não | não |

O menu reduz ruído e mantém apenas a ação mais relevante exposta.

## 11. Cards-resumo

### 11.1 Grade

- quatro colunas em desktop;
- duas colunas até `900px`;
- uma coluna até `760px`;
- gap `12px`.

### 11.2 Card

```css
border: 1px solid #dce3ed;
border-radius: 6px;
min-height: 118px;
padding: 14px;
display: grid;
gap: 8px;
```

### 11.3 Hierarquia interna

1. label;
2. valor principal;
3. contexto ou metadado.

| Nível | Especificação |
|---|---|
| Label | `12px`, peso `600`, `#53617a` |
| Valor | `13px`, `#15213a`, ícone opcional |
| Metadado | `11px`, `#738099`, line-height `1.35` |
| Ícones | slate, gaps de `7px` a `8px` |

Cards atuais:

- nome do hóspede + telefone mascarado;
- data do check-in + contexto operacional;
- data do check-out + horário;
- acessos ao app + período da estadia.

## 12. Painel interno de consumos

O histórico de consumos demonstra o padrão para submódulos operacionais dentro do detalhe.

### 12.1 Container

- borda `#dce3ed`;
- raio `6px`;
- conteúdo recortado;
- sem sombra.

### 12.2 Cabeçalho

- título à esquerda;
- ação local à direita;
- padding `13px 14px 8px`;
- título `14px`;
- ação pequena com ícone de adição.

### 12.3 Tabela compacta

- cabeçalho em fundo `#f7f8fb`;
- cabeçalho `11px`, padding `9px 12px`;
- células `11px`, padding `9px 12px`;
- valor e ações alinhados à direita;
- ações internas com alvos de `26px`;
- scroll horizontal a partir de `620px`;
- mensagem textual quando não há itens.

### 12.4 Rodapé totalizador

- altura mínima `44px`;
- borda superior;
- padding horizontal `14px`;
- label à esquerda;
- valor à direita em `16px` e peso forte.

### 12.5 Princípio reutilizável

Funcionalidades subordinadas devem viver em painéis internos completos, com:

- título;
- ação local;
- conteúdo estruturado;
- estado vazio próprio;
- total ou resumo, quando aplicável.

## 13. Sistema de modais

### 13.1 Tamanhos

| Contexto | Largura |
|---|---:|
| Confirmação compacta | `480px` |
| Formulário operacional | `600px` |
| Modal padrão | `620px` |
| Detalhe de entidade | `820px` |

### 13.2 Container

- centralizado;
- largura máxima `calc(100vw - 32px)`;
- altura máxima `calc(100vh - 48px)`;
- borda `1px solid #dce3ed`;
- raio `8px`;
- sombra `0 24px 70px rgba(19,31,51,.24)`;
- padding externo removido;
- scroll confinado ao corpo.

### 13.3 Máscaras e camadas

| Camada | Máscara | `z-index` |
|---|---|---:|
| Primária | `rgba(20,29,45,.42)` | `1000` |
| Secundária | `rgba(20,29,45,.30)` | `1200` |

Um modal de detalhe pode abrir um formulário ou uma confirmação secundária sem fechar o contexto principal.

### 13.4 Cabeçalho padrão

- fundo branco;
- sem divisor visível no detalhe;
- padding `20px 22px 10px`;
- título `18px`, peso `700`;
- botão fechar com alvo `38px`.

### 13.5 Cabeçalho operacional compacto

- padding `18px 18px 10px`;
- título `16px`, line-height `22px`;
- botão fechar `28px`;
- hover do fechar em `#f5f7fb`.

### 13.6 Corpo

Modal padrão:

```css
padding: 8px 22px 22px;
overflow: auto;
```

Modal operacional:

```css
padding: 6px 18px 22px;
```

### 13.7 Footer

- alinhado à direita;
- cancelar primeiro;
- confirmar por último;
- gap `8px` a `10px`;
- botão comum com largura mínima `90px`;
- botão primário com largura mínima `128px`;
- ações destrutivas usam `danger`.

## 14. Formulário de estadia

### 14.1 Grade

```css
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 18px;
```

Em telas estreitas, passa para uma coluna.

### 14.2 Campos

- labels `11px`, `#29364e`;
- gap label/controle `7px`;
- controles ocupam toda a coluna;
- altura operacional `32px`;
- fonte dos controles `11px`;
- campos amplos ocupam as duas colunas.

### 14.3 Estrutura funcional

- opção de cadastrar novo hóspede;
- seleção de hóspede existente ou dados do novo hóspede;
- quarto;
- horário de saída;
- check-in;
- check-out;
- configuração de consumos;
- status operacional somente informativo;
- footer de ações.

### 14.4 Validação

- React Hook Form controla o estado;
- Zod valida o domínio;
- erro de campo aparece próximo ao respectivo controle;
- erro da requisição ocupa largura total;
- `aria-invalid` é aplicado aos campos suportados;
- mensagens de campo usam `role="alert"`;
- erro geral usa `aria-live="polite"`;
- botão de submit mostra loading durante o envio.

### 14.5 Status informativo

- texto `11px`, `#68758d`;
- valor em `#29364e`, peso `600`;
- não é apresentado como campo editável;
- para nova estadia, o status informado é `Agendada`.

## 15. Formulário de consumo

### 15.1 Organização desktop

A grade usa proporções diferentes conforme a natureza do dado:

```css
grid-template-columns: 1.45fr 1.6fr .95fr 1fr;
gap: 18px;
```

Primeira linha:

1. categoria;
2. item;
3. quantidade;
4. valor unitário.

Segunda linha:

- data/hora na primeira coluna;
- observação ocupando as demais.

### 15.2 Controles

- controles comuns: `32px`;
- data e observação: `42px`;
- labels: `11px`;
- prefixo monetário `R$` em `10px`;
- quantidade controlada por stepper integrado.

### 15.3 Stepper

```text
−  | quantidade |  +
30px | flexível | 30px
```

- altura `32px`;
- botões centrais sem raio interno;
- bordas sobrepostas em `-1px`;
- campo central alinhado ao centro;
- quantidade mínima `1`.

### 15.4 Total calculado

- recalculado a partir de quantidade × valor unitário;
- apresentado antes do footer de ações;
- label `10px`;
- valor dentro de superfície `#f3f6fd`;
- borda `#dce4f3`;
- raio `6px`;
- caixa de `210px × 48px`;
- valor `17px`.

O total visível antes do submit reduz erro operacional.

## 16. Confirmações e segurança operacional

Ações com impacto operacional são confirmadas em modal compacto.

### 16.1 Fluxos confirmados

- reenviar acesso;
- cancelar estadia;
- realizar check-in;
- realizar check-out;
- excluir consumo.

### 16.2 Estrutura de confirmação

```text
Título verbal
Resumo da entidade, quando relevante
Descrição objetiva do efeito
Cancelar | Confirmar
```

### 16.3 Copy

- título descreve a ação, frequentemente como pergunta;
- mensagem informa a consequência;
- confirmação repete o verbo da ação;
- cancelamento da estadia e exclusão de consumo usam tom destrutivo;
- check-out informa explicitamente a perda de acesso aos recursos.

### 16.4 Resumo de confirmação

Quando necessário, o modal exibe:

- hóspede em `16px` e peso forte;
- quarto em `14px` muted;
- período em `14px` muted.

## 17. Feedback de estado

### 17.1 Loading

- tabela principal usa loading do Ant Design;
- tabela interna usa loading independente;
- consultas de estadias, hóspedes e consumos mantêm estados separados;
- o conteúdo não é substituído por mensagens técnicas cruas.

### 17.2 Sucesso

- ações da listagem geram alerta de sucesso;
- ações dentro do detalhe podem gerar feedback local;
- mensagens são específicas, incluindo quarto, telefone mascarado ou acessos revogados quando disponível.

### 17.3 Erro

- erro global usa alerta semântico;
- erro de formulário aparece no próprio modal;
- erro do submódulo aparece no detalhe quando não existe modal secundário aberto;
- mensagem técnica é normalizada antes de chegar à interface.

### 17.4 Toast/alerta

- componente `Alert` do Ant Design;
- ícone semântico;
- botão de fechar;
- tons `success` e `error`;
- fechamento automático após `4.200ms`;
- fechamento manual permitido;
- em erro de consulta, fechar também dispara tentativa de atualização.

## 18. Formatação e linguagem

### 18.1 Locale

- locale global: português do Brasil;
- datas e moedas usam `Intl` ou Day.js;
- moeda usa `Intl.NumberFormat` com `pt-BR`;
- valores monetários são armazenados em centavos;
- formulários exibem separador decimal brasileiro.

### 18.2 Copy operacional

- títulos usam substantivos ou verbos claros;
- CTAs usam verbo + objeto: `Nova estadia`, `Aplicar filtros`, `Salvar consumo`;
- mensagens explicam consequências;
- singular e plural são tratados quando o número é conhecido;
- labels de status são curtas;
- termos técnicos internos não aparecem para o usuário.

### 18.3 Mascaramento

Dados sensíveis, como telefone, são apresentados mascarados quando usados apenas como contexto.

## 19. Responsividade

### 19.1 Até 1250px

- filtros passam de cinco para três colunas;
- colunas: busca flexível, status `180px`, data flexível;
- botões fluem para a linha seguinte;
- botões ocupam a largura disponível de suas células.

### 19.2 Até 900px

- botões de ícone da topbar são ocultados;
- filtros passam para duas colunas;
- busca ocupa a linha completa;
- período ocupa a linha completa;
- cards-resumo passam de quatro para duas colunas;
- grade genérica do consumo é reorganizada.

### 19.3 Até 760px

- shell passa para uma coluna;
- sidebar é ocultada;
- padding da página muda para `22px 14px 30px`;
- cabeçalho da página alinha no topo e reduz o padding do CTA;
- filtros passam para uma coluna;
- hero do detalhe passa para coluna;
- ações do detalhe ocupam melhor a largura disponível;
- cards-resumo passam para uma coluna;
- formulários passam para uma coluna;
- footer do formulário e totalizador empilham;
- seletor de itens por página é ocultado;
- modal preserva margem horizontal mínima de `16px`.

## 20. Acessibilidade observada

Boas práticas já presentes:

- botões apenas com ícone possuem `aria-label`;
- imagem do empty state possui texto alternativo;
- erros de campo usam `role="alert"`;
- erro geral de formulário usa `aria-live`;
- campos recebem `aria-invalid` quando aplicável;
- formulários podem ser submetidos semanticamente;
- botões destrutivos são diferenciados por semântica, não apenas pela posição;
- ações incompatíveis são desabilitadas;
- modais usam o componente acessível do Ant Design.

Pontos que precisam ser corrigidos antes da padronização:

- o foco visível do botão de fechar do modal operacional é removido;
- alguns alvos compactos de `26px` e `28px` são pequenos para toque;
- a linha clicável da tabela depende do mouse e não possui, no código atual, interação equivalente explícita por teclado;
- o menu lateral desaparece no mobile sem substituição evidente;
- contraste dos textos de `10px` e `11px` deve ser validado formalmente.

## 21. Motion e microinterações

O padrão é deliberadamente contido:

- hover de linha com transição aproximada de `140ms`;
- hover de botão primário escurece o azul;
- hover de input destaca a borda;
- hover do botão fechar usa fundo quase branco azulado;
- abertura e fechamento de modal ficam a cargo do Ant Design;
- não existem animações decorativas próprias.

Diretriz para adoção: preservar transições curtas, funcionais e entre `120ms` e `180ms`, evitando movimentos que atrasem a operação.

## 22. Contratos reutilizáveis recomendados

Os seguintes componentes devem ser extraídos ou normalizados para levar o padrão às outras telas:

### 22.1 Estrutura de página

- `PageHeader`
- `FilterPanel`
- `FilterField`
- `ResultsPanel`
- `ResultsHeader`
- `PaginationBar`

### 22.2 Dados

- `DataTable`
- `RowActions`
- `StatusBadge`
- `DomainEmptyState`
- formatadores compartilhados de data, moeda e quantidade

### 22.3 Detalhes

- `EntityDetailModal`
- `EntityIdentityChip`
- `SummaryCard`
- `SummaryCardGrid`
- `EmbeddedDataPanel`
- `DetailActionMenu`

### 22.4 Formulários e fluxos

- `OperationalFormModal`
- `FormGrid`
- `ModalFooter`
- `ConfirmationModal`
- `CalculatedTotal`
- `QuantityStepper`

### 22.5 Feedback

- `Toast`
- `InlineFeedback`
- `TableLoadingState`
- `FormError`

## 23. O que é padrão e o que é específico de Estadias

### 23.1 Deve ser padronizado

- anatomia de página;
- hierarquia tipográfica;
- superfícies, bordas, sombras e raios;
- painel de filtros;
- painel de resultados;
- densidade e interação de tabela;
- localização das ações;
- estado vazio orientado;
- modal de detalhe;
- cards-resumo;
- subpainéis operacionais;
- modais secundários;
- confirmação de ações de impacto;
- feedback e formatação.

### 23.2 Permanece específico do domínio

- labels e campos de estadia;
- regras de check-in e check-out;
- acesso ao app;
- semântica exata dos status;
- consumo e suas categorias;
- ilustração da porta/quarto;
- textos de confirmação;
- permissões de cada ação por status.

## 24. Dívidas técnicas e riscos de reprodução literal

### 24.1 Tokens não centralizados

As cores, medidas e sombras aparecem como valores literais. Copiar as classes multiplicaria divergências. É necessário criar tokens semânticos antes da adoção geral.

### 24.2 CSS acumulado

`src/styles.css` contém passagens históricas e regras sobrescritas pela cascata. A aparência final depende da ordem das declarações. Não se deve mover ou copiar apenas uma regra sem considerar as posteriores.

### 24.3 Componentes específicos da feature

Grande parte dos padrões de alto nível ainda usa nomes como `stays-*` e `stay-*`. O comportamento compartilhável ainda não está formalizado como componente.

### 24.4 Responsividade da tabela principal

A tabela interna de consumo define scroll horizontal, mas a tabela principal não possui a mesma proteção explícita. Isso deve ser normalizado.

### 24.5 Navegação mobile

A sidebar é ocultada abaixo de `760px`, mas não há substituição evidente por drawer ou menu mobile.

### 24.6 Alvos de toque

Controles de `26px`, `28px` e `32px` funcionam em desktop operacional, mas não atendem confortavelmente a uma interface prioritariamente touch.

### 24.7 Focus ring

O estilo atual remove outline do botão de fechar em modais operacionais. O padrão compartilhado deve manter foco visível consistente.

## 25. Checklist de reprodução

Uma tela só deve ser considerada aderente ao padrão de Estadias quando atender aos itens aplicáveis abaixo.

### Página

- [ ] Possui título, descrição orientada à tarefa e no máximo um CTA primário.
- [ ] Usa canvas `#f6f8fc` e superfícies brancas.
- [ ] Mantém padding e gaps equivalentes à escala documentada.
- [ ] Não cria sombras ou raios fora da hierarquia estabelecida.

### Filtros

- [ ] Os filtros vivem em painel próprio.
- [ ] Labels aparecem acima dos controles.
- [ ] Limpar e aplicar possuem hierarquia visual distinta.
- [ ] Aplicar filtros volta à página 1.
- [ ] Limpar restaura um estado inicial definido.
- [ ] A grade responde nos breakpoints previstos.

### Resultados

- [ ] O painel mostra contagem total.
- [ ] Tabela, feedback, vazio e paginação pertencem à mesma superfície.
- [ ] A tabela possui cabeçalho, densidade e hover consistentes.
- [ ] A linha abre o detalhe quando isso for semanticamente adequado.
- [ ] Ações de linha não disparam o clique da linha.
- [ ] Status possuem label e tom semântico centralizados.
- [ ] Datas e moedas usam formatação `pt-BR`.

### Estado vazio

- [ ] Possui ilustração ou ícone específico do domínio.
- [ ] Explica por que não há conteúdo ou qual é o próximo passo.
- [ ] Oferece recuperação e/ou criação.
- [ ] Não parece uma mensagem de erro técnico.

### Detalhe

- [ ] Abre sem perder o contexto da listagem, quando apropriado.
- [ ] Identidade, status e ação primária ficam no topo.
- [ ] A ação principal é derivada do estado atual.
- [ ] Ações secundárias ficam em menu contextual.
- [ ] Dados principais usam cards-resumo consistentes.
- [ ] Submódulos usam painéis internos completos.

### Formulários

- [ ] Campos relacionados são agrupados.
- [ ] Labels, alturas e gaps seguem a densidade operacional.
- [ ] Erros aparecem próximos aos campos.
- [ ] O submit apresenta loading.
- [ ] Cancelar aparece antes da ação principal.
- [ ] Totais calculados são exibidos antes da confirmação.

### Segurança e feedback

- [ ] Ações destrutivas exigem confirmação.
- [ ] A confirmação explica a consequência.
- [ ] Sucesso e erro possuem feedback semântico.
- [ ] Ações indisponíveis são ocultadas ou desabilitadas com regra consistente.
- [ ] Dados sensíveis são mascarados quando não precisam ser exibidos integralmente.

### Acessibilidade

- [ ] Botões somente com ícone possuem nome acessível.
- [ ] Todos os controles podem ser usados por teclado.
- [ ] O foco permanece visível.
- [ ] Mensagens de erro são anunciadas.
- [ ] Imagens informativas possuem texto alternativo.
- [ ] Contraste e tamanho de alvo foram validados.

## 26. Direção recomendada para adoção

A adoção nas demais telas deve acontecer nesta ordem:

1. consolidar tokens semânticos;
2. criar primitives compartilhadas de página, painel, tabela, modal e formulário;
3. migrar a própria tela de Estadias para essas primitives sem mudança visual;
4. validar regressão visual e responsividade;
5. mapear cada outra tela contra o checklist;
6. migrar uma tela por vez;
7. remover estilos legados somente depois que não houver consumidores.

Essa sequência transforma Estadias em referência real do design system e evita apenas replicar CSS específico de uma feature.
