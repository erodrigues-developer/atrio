# Design System — Hospitality Concierge App

## 1. Propósito do documento

Este documento define as diretrizes de design system para o aplicativo mobile de hospitalidade do hotel.

O produto é um **concierge digital premium** para hóspedes durante a estadia, funcionando como hub para solicitações, serviços, experiências, reservas, informações e atendimento.

O escopo inicial do MVP cobre apenas o período:

```txt
Após o check-in → Durante a estadia → Até o check-out
```

Não fazem parte do MVP inicial:

- pré-check-in;
- pós-estadia;
- aquisição de hóspedes;
- programa de fidelidade;
- campanhas externas;
- login tradicional com email e senha.

Este design system deve orientar todas as telas, componentes, microinterações, textos e decisões visuais do app.

---

## 2. Posicionamento do produto

O app não deve parecer um sistema administrativo, um marketplace genérico ou um cardápio digital.

Ele deve parecer:

> Uma recepção de hotel premium dentro do celular.

A experiência central é:

```txt
Concierge Premium com curadoria de experiências
```

Isso significa:

- hospitalidade antes de venda;
- curadoria antes de catálogo;
- cuidado antes de funcionalidade;
- experiência antes de transação;
- operação invisível para o hóspede.

O app deve transmitir que o hotel está presente, atento e disponível durante toda a estadia.

---

## 3. Princípios de experiência

### 3.1 Hospitalidade primeiro

Toda decisão de interface deve reforçar a sensação de cuidado.

Evitar linguagem fria, técnica ou transacional.

Ruim:

```txt
Ticket aberto.
Produto adicionado.
Erro na requisição.
Usuário autenticado.
```

Bom:

```txt
Sua solicitação foi recebida.
Item adicionado ao seu pedido.
Não conseguimos carregar essa informação agora.
Sua estadia está pronta por aqui.
```

---

### 3.2 Curadoria, não catálogo

O app não deve começar exibindo tudo que o hotel vende.

A Home deve selecionar o que importa para aquele momento.

O catálogo completo pode existir em **Descobrir** e **Serviços**, mas a tela **Hoje** deve funcionar como uma curadoria contextual.

---

### 3.3 Poucos toques para necessidades simples

Solicitações operacionais devem ser feitas rapidamente.

Exemplo:

```txt
Serviços → Toalhas → Quantidade → Enviar solicitação
```

Solicitações simples não devem exigir formulários longos.

---

### 3.4 Venda discreta

Experiências, spa, jantar, passeios e transfer podem gerar receita, mas a UI não deve parecer agressiva.

Evitar:

```txt
Comprar agora
Promoção imperdível
Oferta exclusiva
Última chance
```

Preferir:

```txt
Reservar
Ver horários
Conhecer experiência
Selecionado para hoje
Recomendado para esta tarde
```

---

### 3.5 O app deve parecer vivo

A tela **Hoje** deve mudar de acordo com o contexto:

- horário do dia;
- clima;
- reservas feitas;
- solicitações em andamento;
- momento da estadia;
- check-out próximo;
- eventos do hotel;
- experiências disponíveis.

Mesmo no MVP mockado, os dados devem simular essa inteligência.

---

## 4. Arquitetura de navegação

### 4.1 Fluxo inicial

Antes da navegação principal, o hóspede passa por um fluxo leve de identificação da estadia.

```txt
Boas-vindas
→ Identificação da estadia
→ Confirmação por SMS
→ Home Hoje
```

Não haverá login com email e senha no MVP.

A identificação será feita com:

- número do quarto;
- sobrenome;
- código de confirmação por SMS.

No MVP mockado, o código poderá ser fixo.

Exemplo:

```txt
123456
```

## Comportamento de teclado em telas com formulário

Toda tela mobile com campos de texto deve permitir que o usuário recolha o teclado ao tocar fora do input.

Esse comportamento é obrigatório em telas com:

- inputs de texto;
- inputs numéricos;
- OTP Input;
- campos de busca;
- campos de observação;
- formulários com CTA no rodapé.

### Regra principal

```txt
Ao tocar fora de qualquer campo, o teclado deve ser recolhido.
```

O teclado não pode bloquear ou dificultar o acesso ao CTA principal da tela.

### Aplicação obrigatória

Essa regra deve ser aplicada em telas como:

```txt
Identificação da estadia
Confirmação por SMS
Solicitação rápida
Room service
Carrinho
Concierge
Check-out
Qualquer formulário futuro
```

### Implementação recomendada

Criar um comportamento reutilizável no componente base de tela.

Exemplo de propriedade no componente `Screen`:

```tsx
<Screen dismissKeyboardOnPressOutside>
  ...
</Screen>
```

Quando `dismissKeyboardOnPressOutside` estiver ativo, tocar em áreas vazias da tela deve executar:

```tsx
Keyboard.dismiss()
```

### Requisitos de implementação

A solução deve:

- funcionar em iOS e Android;
- não impedir clique em inputs;
- não impedir clique em botões;
- não quebrar links e CTAs;
- não prejudicar o foco automático do OTP Input;
- não gerar comportamento estranho em telas com scroll;
- respeitar Safe Area;
- funcionar com teclado aberto.

### Comportamento esperado por campo

#### Input comum

Ao tocar fora do input:

```txt
teclado fecha
input perde foco
CTA fica acessível
```

#### Campo numérico

Ao tocar fora do campo:

```txt
teclado numérico fecha
CTA fica acessível
```

#### OTP Input

Ao tocar fora do OTP:

```txt
teclado fecha
código digitado permanece
foco visual pode ser removido
```

### Return key

Sempre que fizer sentido, configurar os inputs com comportamento adequado:

```tsx
returnKeyType="next"
```

para avançar entre campos, e:

```tsx
returnKeyType="done"
```

no último campo.

No último campo do formulário, `onSubmitEditing` pode executar:

```tsx
Keyboard.dismiss()
```

ou acionar a ação principal, se isso fizer sentido para a tela.

### Critério de qualidade

Uma tela com formulário só pode ser considerada aprovada quando:

```txt
1. O teclado fecha ao tocar fora do input.
2. O CTA principal continua acessível com o teclado aberto ou após recolhê-lo.
3. O usuário não fica preso no teclado.
4. O comportamento funciona no dispositivo físico, não apenas no simulador.
```

### Regra final

Em mobile, o teclado faz parte da experiência da tela.
Se ele bloqueia a ação principal, a tela está incompleta.

## Tela de Identificação da Estadia — Diretriz validada

A Tela de Identificação da Estadia deve ser funcional, discreta e segura, sem parecer login tradicional.

Ela deve servir como ponte entre a Tela de Boas-vindas, que apresenta o hotel, e a Tela de Confirmação por SMS, que valida o acesso.

### Objetivo

Identificar o hóspede usando apenas:

- número do quarto;
- sobrenome usado na reserva.

Não usar:

- email;
- senha;
- usuário;
- login;
- cadastro;
- autenticação como linguagem principal.

### Estrutura aprovada

```txt
Botão voltar

Identifique sua estadia

Informe o número do quarto e o sobrenome usado na reserva.

Número do quarto
Ex: 304

Sobrenome
Ex: Silva

Enviaremos um código de confirmação para o telefone vinculado à reserva.

Preciso de ajuda

Continuar
```

### Copy aprovada

Título:

```txt
Identifique sua estadia
```

Subtítulo:

```txt
Informe o número do quarto e o sobrenome usado na reserva.
```

Campo 1:

```txt
Número do quarto
Ex: 304
```

Campo 2:

```txt
Sobrenome
Ex: Silva
```

Bloco informativo:

```txt
Enviaremos um código de confirmação para o telefone vinculado à reserva.
```

CTA principal:

```txt
Continuar
```

Ação secundária:

```txt
Preciso de ajuda
```

Loading:

```txt
Localizando estadia...
```

### Diretrizes visuais

A tela deve ser mais funcional que a Tela de Boas-vindas, mas ainda precisa manter a percepção premium.

Usar:

- fundo quente do app;
- margem lateral padrão;
- título forte alinhado à esquerda;
- inputs grandes e confortáveis;
- bordas suaves;
- radius alto;
- botão principal no rodapé;
- link de ajuda próximo ao botão;
- bloco informativo discreto sobre SMS.

Evitar:

- hero;
- logo grande;
- imagem;
- card promocional;
- excesso de texto;
- linguagem técnica;
- aparência de formulário corporativo.

### Inputs

Os inputs devem ter:

```txt
Altura aproximada: 56
Radius: 16
Fundo: surface
Borda: border
Placeholder: textMuted
Label: textSecondary
Foco: borda accent ou destaque sutil
```

### Bloco informativo

O bloco de SMS deve parecer uma informação de confiança, não um alerta.

Usar:

```txt
Fundo: accentSoft ou variação muito suave
Radius: 16 ou 18
Padding: 14 a 16
Ícone pequeno e discreto
Texto em textSecondary ou accent escurecido
```

Evitar:

- aparência de warning;
- aparência de erro;
- cor muito forte;
- card pesado.

### Comportamento mockado

No MVP mockado:

```txt
1. Usuário informa número do quarto.
2. Usuário informa sobrenome.
3. Usuário toca em Continuar.
4. App valida campos não vazios.
5. App exibe loading curto.
6. App navega para a tela de confirmação por SMS.
```

Não chamar API real.
Não validar reserva real.
Não enviar SMS real nesta etapa.

### Validações

Se o quarto estiver vazio:

```txt
Informe o número do quarto.
```

Se o sobrenome estiver vazio:

```txt
Informe o sobrenome usado na reserva.
```

### Regra final

Esta tela não deve vender nem promover o hotel.
A função dela é localizar a estadia com clareza, segurança e baixa fricção.

---

### 4.2 Navegação principal

Após identificação, o app terá cinco áreas principais:

```txt
Hoje
Descobrir
Serviços
Estadia
Concierge
```

#### Hoje

Recepção digital do hotel.

Objetivo: mostrar o que importa agora.

#### Descobrir

Curadoria de experiências, gastronomia, spa, passeios e momentos especiais.

Objetivo: estimular desejo sem parecer marketplace comum.

#### Serviços

Solicitações práticas para o quarto e para a estadia.

Objetivo: resolver necessidades em poucos toques.

#### Estadia

Informações e controle da hospedagem.

Objetivo: dar clareza sobre reserva, Wi-Fi, solicitações, reservas e check-out.

#### Concierge

Canal conversacional com o hotel.

Objetivo: atendimento, recomendações e suporte.

---

## 5. Biblioteca de componentes e stack visual

### 5.1 Decisão

A biblioteca principal será:

```txt
Tamagui
```

Tamagui será usado como infraestrutura de design system, temas, tokens e componentes base.

A identidade visual será própria.

### 5.2 Stack recomendada

```txt
Expo
Expo Router
Tamagui
React Hook Form
Zod
TanStack Query
Zustand
Reanimated
Expo Image
lucide-react-native
```

### 5.3 Regra principal

A biblioteca não deve ditar a aparência do produto.

```txt
Tamagui por baixo.
Design system próprio por cima.
```

O app não deve parecer:

- Material Design;
- template de SaaS;
- marketplace genérico;
- app corporativo;
- dashboard mobile.

---

## 6. Personalidade visual

O app deve transmitir:

```txt
Calma
Cuidado
Sofisticação
Clareza
Curadoria
Confiança
Hospitalidade
```

O app não deve transmitir:

```txt
Pressa
Ruído visual
Excesso de oferta
Sistema administrativo
Cardápio digital comum
Marketplace genérico
Startup colorida
```

A direção estética é:

```txt
Premium editorial
Mobile-first
Apple-like
Warm minimalism
Hospitality luxury
```

---

## 7. Cores

A paleta deve ser quente, elegante e discreta.

Evitar branco puro em excesso. Preferir uma base levemente quente.

### 7.1 Tokens de cor

```ts
export const colors = {
  background: '#FAF8F4',
  backgroundElevated: '#FFFFFF',

  surface: '#FFFFFF',
  surfaceMuted: '#F1EDE6',
  surfaceSoft: '#F7F3EC',

  textPrimary: '#1C1C1E',
  textSecondary: '#6E6A64',
  textMuted: '#9A948B',
  textInverse: '#FFFFFF',

  border: '#E5DED4',
  borderSoft: '#EFE7DD',

  accent: '#0F3D3E',
  accentHover: '#0B3132',
  accentSoft: '#E7F0ED',

  gold: '#B89B5E',
  goldSoft: '#F3EBD7',

  success: '#2F6F4E',
  successSoft: '#E7F3EC',

  warning: '#B7791F',
  warningSoft: '#FFF4DD',

  danger: '#B42318',
  dangerSoft: '#FDECEC'
}
```

### 7.2 Uso das cores

#### `background`

Fundo geral das telas.

Uso:

- telas principais;
- áreas de scroll;
- fundo por trás dos cards.

#### `surface`

Superfícies elevadas.

Uso:

- cards;
- inputs;
- listas;
- seções;
- bottom sheets.

#### `accent`

Cor principal de ação.

Uso:

- botões primários;
- aba ativa;
- links importantes;
- ícones principais;
- estados selecionados.

#### `gold`

Cor de detalhe premium.

Uso:

- selo de experiência exclusiva;
- pequenos highlights;
- rating;
- detalhes editoriais.

Não usar dourado como cor dominante.

Dourado em excesso reduz sofisticação e pode deixar a interface visualmente brega.

---

## 8. Tipografia

### 8.1 Direção

No MVP, usar fonte nativa do sistema.

Motivos:

- melhor performance;
- aparência nativa;
- bom resultado no iOS;
- menor risco visual;
- aderência à proposta Apple-like.

No iOS, a fonte do sistema se aproxima da experiência nativa. No Android, mantém familiaridade com o dispositivo.

### 8.2 Tokens tipográficos

```ts
export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700'
  },

  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700'
  },

  title2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600'
  },

  title3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600'
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400'
  },

  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500'
  },

  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400'
  },

  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500'
  }
}
```

### 8.3 Regras de uso

```txt
Display: telas de boas-vindas e momentos especiais
Title1: título principal da tela
Title2: título de seção importante
Title3: título de card destacado
Body: texto principal
BodyMedium: texto principal com ênfase
BodySmall: descrições e textos auxiliares
Caption: labels, badges e metadados
```

### 8.4 Peso visual

Evitar excesso de bold.

A interface premium usa hierarquia com:

- espaço;
- tamanho;
- contraste;
- composição;
- não apenas peso de fonte.

---

## 9. Espaçamento

O app deve respirar.

### 9.1 Tokens de espaçamento

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40
}
```

### 9.2 Regras

```txt
Margem lateral padrão: 24
Espaço entre seções: 32
Espaço entre título de seção e conteúdo: 12 ou 16
Espaço interno de card comum: 16 ou 20
Espaço interno de tela: 24
```

Em telas muito densas, reduzir com cuidado para 20 de margem lateral.

Não usar margens menores que 16 em telas principais.

---

## 10. Border radius

### 10.1 Tokens

```ts
export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999
}
```

### 10.2 Regras

```txt
Botões: pill ou lg
Cards normais: lg
Cards hero: xl
Inputs: md
Badges: pill
Bottom sheets: xl no topo
```

Cantos arredondados devem transmitir suavidade, sem parecer infantil.

---

## 11. Sombras e elevação

Sombras devem ser discretas.

Preferir:

```txt
Borda suave + contraste de superfície
```

em vez de sombras pesadas.

### 11.1 Tokens

```ts
export const shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },

  medium: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  }
}
```

### 11.2 Regra

Usar sombra apenas quando houver necessidade real de hierarquia.

Não transformar todos os cards em elementos flutuantes.

---

## 12. Iconografia

### 12.1 Biblioteca

Usar:

```txt
lucide-react-native
```

### 12.2 Direção

Ícones devem ser:

- lineares;
- discretos;
- consistentes;
- leves;
- modernos.

Evitar ícones muito preenchidos, infantis ou excessivamente decorativos.

### 12.3 Tamanhos

```txt
Ícone padrão: 22
Ações rápidas: 24
Tabs: 22
Ícones pequenos: 16
Ícones hero: 28 ou 32
Stroke padrão: 1.8 ou 2
```

---

## 13. Imagens

Imagens são centrais na área **Descobrir**.

### 13.1 Regra por contexto

```txt
Experiências: imagem grande, editorial, emocional
Serviços: ícone ou card simples
Home: máximo 1 imagem hero por vez
Estadia: quase sem imagem
Concierge: sem excesso visual
```

### 13.2 Tratamento

- cantos arredondados;
- overlay sutil quando houver texto sobre imagem;
- evitar filtros pesados;
- priorizar fotos reais e premium;
- evitar banco de imagem genérico;
- evitar imagens com aparência artificial;
- evitar excesso de pessoas posando.

### 13.3 Uso na Home

A Home pode ter uma experiência hero, mas não deve parecer vitrine publicitária.

A imagem deve apoiar uma recomendação contextual.

### 13.4 Uso de marca

Quando houver logo oficial do hotel, ele deve ter preferência sobre assinatura textual ou ícones genéricos.

Regras:

- priorizar monograma ou símbolo oficial;
- usar fundo transparente;
- evitar borda, sombra, card ou badge ao redor da marca;
- manter tamanho suficiente para presença premium, sem competir com o título;
- usar assinatura textual apenas quando não houver asset oficial adequado.

Em telas editoriais, o monograma pode ser centralizado mesmo quando o restante do conteúdo estiver alinhado à esquerda.

Evitar:

- assinatura textual solta no topo;
- ícones genéricos substituindo o logo;
- logo grande demais;
- molduras decorativas;
- imagem promocional para simular marca.

---

## 14. Componentes base

Os componentes base devem ser criados em cima dos tokens.

### 14.1 Lista inicial

```txt
Screen
Section
Header
Text
Button
IconButton
Card
Badge
Divider
Input
OtpInput
BottomSheet
Toast
EmptyState
LoadingState
ErrorState
```

---

## 15. Componentes de produto

Componentes específicos do domínio de hospitalidade.

```txt
QuickActionCard
ExperienceCard
FeaturedExperienceCard
ServiceCard
StayInfoCard
RequestStatusCard
ReservationCard
TimeSlot
ConciergeSuggestion
RoomServiceItemCard
```

---

## 16. Botões

### 16.1 PrimaryButton

Uso:

- continuar;
- confirmar;
- reservar;
- enviar solicitação;
- acessar estadia.

Visual:

```txt
Fundo: accent
Texto: textInverse
Altura: 52
Radius: pill
Fonte: 16 / 600
```

Texto recomendado:

```txt
Continuar
Confirmar acesso
Reservar
Enviar solicitação
Acessar minha estadia
```

---

### 16.2 SecondaryButton

Uso:

- ações importantes, mas secundárias.

Visual:

```txt
Fundo: accentSoft
Texto: accent
Altura: 52
Radius: pill
Fonte: 16 / 600
```

---

### 16.3 GhostButton

Uso:

- voltar;
- reenviar código;
- ver detalhes;
- ações discretas;
- links internos.

Visual:

```txt
Fundo: transparente
Texto: accent ou textSecondary
Altura: variável
```

---

## 17. Inputs

Inputs devem parecer elegantes, não corporativos.

### 17.1 Visual padrão

```txt
Altura: 56
Radius: 16
Fundo: surface
Borda: border
Texto: textPrimary
Label: textSecondary
Placeholder: textMuted
```

### 17.2 Campos da identificação da estadia

Usar:

```txt
Número do quarto
Sobrenome
```

Não usar:

```txt
Email
Senha
Usuário
Login
```

### 17.3 OTP / SMS

A tela de SMS usa input de 6 dígitos.

Regras:

- foco automático no próximo dígito;
- permitir colar código;
- feedback claro em caso de código inválido;
- botão para reenviar;
- opção “Preciso de ajuda”.

---

## 18. Cards

### 18.1 Card padrão

```txt
Background: surface
Radius: 22
Padding: 20
Border: borderSoft
Shadow: nenhuma ou soft
```

### 18.2 ExperienceCard

Uso:

- listas em Descobrir;
- coleções;
- recomendações.

Estrutura:

```txt
Imagem
Badge opcional
Título
Descrição curta
Metadados: duração, disponibilidade, preço
CTA discreto ou chevron
```

### 18.3 FeaturedExperienceCard

Uso:

- destaque da Home;
- destaque de coleção.

Estrutura:

```txt
Imagem grande
Overlay sutil
Badge contextual
Título aspiracional
Descrição curta
CTA: Ver horários / Conhecer experiência
```

### 18.4 ServiceCard

Uso:

- tela Serviços.

Estrutura:

```txt
Ícone
Título
Descrição curta
Chevron discreto
```

### 18.5 RequestStatusCard

Uso:

- Home;
- Minhas solicitações;
- Estadia.

Estrutura:

```txt
Título da solicitação
Status badge
Horário
Próximo passo
```

### 18.6 ReservationCard

Uso:

- Home;
- Minhas reservas;
- Estadia.

Estrutura:

```txt
Nome da experiência
Data e horário
Status
Local
CTA discreto
```

---

## 19. Bottom tabs

### 19.1 Abas

```txt
Hoje
Descobrir
Serviços
Estadia
Concierge
```

### 19.2 Visual

```txt
Fundo: surface
Ícone ativo: accent
Texto ativo: accent
Ícone inativo: textMuted
Texto inativo: textMuted
Altura confortável
Borda superior suave
Sem cores excessivas
```

### 19.3 Regra

A tab bar não deve competir com o conteúdo.

Ela deve ser clara, discreta e nativa.

---

## 20. Estados de interface

### 20.1 Loading

Preferir skeleton discreto.

Evitar spinner grande em excesso.

### 20.2 Empty state

Deve ser humano e útil.

Exemplo:

```txt
Você ainda não tem solicitações em andamento.
```

CTA:

```txt
Fazer uma solicitação
```

### 20.3 Error state

Não usar linguagem técnica.

Ruim:

```txt
Erro 500.
Falha na requisição.
Unauthorized.
```

Bom:

```txt
Não conseguimos carregar essa informação agora.
Tente novamente em instantes.
```

### 20.4 Success state

Deve transmitir cuidado e conclusão.

Exemplo:

```txt
Sua solicitação foi recebida.
Nossa equipe já foi notificada.
```

---

## 21. Motion design

Animações devem ser discretas.

O app premium não deve parecer agitado.

### 21.1 Uso recomendado

Usar Reanimated para:

- entrada suave de cards;
- feedback de botão;
- transição de bottom sheet;
- confirmação de sucesso;
- mudança de status;
- skeletons sutis.

### 21.2 Duração

```txt
Microinterações: 120ms a 180ms
Transições leves: 180ms a 240ms
Bottom sheets/modais: 240ms a 320ms
```

### 21.3 Regra

Nada deve “pular” ou chamar atenção demais.

O movimento deve parecer calmo, natural e refinado.

---

## 22. Microcopy

### 22.1 Linguagem geral

A linguagem deve parecer concierge, não sistema.

Evitar:

```txt
Login
Usuário
Autenticação
Erro
Comprar
Carrinho
Produto
Submit
Ticket
Chamado
```

Preferir:

```txt
Acessar estadia
Confirmar acesso
Solicitação
Reservar
Experiência
Concierge
Selecionado para você
Recebido
A caminho
Preparando
```

---

### 22.2 Exemplos

#### Identificação

```txt
Bem-vindo ao seu concierge digital.
Informe seu quarto e sobrenome para acessar os serviços e experiências da sua estadia.
```

CTA:

```txt
Continuar
```

---

#### SMS

```txt
Enviamos um código para o telefone vinculado à sua reserva.
```

CTA:

```txt
Confirmar acesso
```

Ações secundárias:

```txt
Reenviar código
Preciso de ajuda
```

---

#### Solicitação recebida

```txt
Sua solicitação foi recebida.
Nossa equipe já foi notificada e acompanhará seu pedido.
```

---

#### Reserva de experiência

```txt
Sua reserva foi recebida.
Preparamos os detalhes e avisaremos caso haja alguma atualização.
```

---

#### Empty state

```txt
Você ainda não tem reservas para esta estadia.
```

CTA:

```txt
Descobrir experiências
```

---

## 23. Telas do MVP

### 23.1 Ordem recomendada de desenvolvimento

```txt
01. Boas-vindas
02. Identificação da estadia
03. Confirmação por SMS
04. Shell com bottom tabs
05. Hoje
06. Serviços
07. Solicitação rápida
08. Confirmação da solicitação
09. Minhas solicitações
10. Descobrir
11. Coleção de experiências
12. Detalhe da experiência
13. Seleção de horário
14. Confirmação de reserva
15. Minhas reservas
16. Estadia
17. Wi-Fi
18. Check-out
19. Concierge
20. Room service
21. Detalhe do item
22. Carrinho
23. Confirmação do room service
24. Consumo
```

### 23.2 MVP essencial

```txt
01. Boas-vindas
02. Identificação da estadia
03. Confirmação por SMS
04. Hoje
05. Serviços
06. Solicitação rápida
07. Confirmação da solicitação
08. Minhas solicitações
09. Descobrir
10. Detalhe da experiência
11. Seleção de horário
12. Confirmação de reserva
13. Minhas reservas
14. Estadia
15. Wi-Fi
16. Check-out
17. Concierge
```

### 23.3 MVP expandido

```txt
18. Coleções de experiências
19. Room service
20. Detalhe do item
21. Carrinho
22. Confirmação do room service
23. Consumo
```

---

## 24. Diretrizes por tela

### 24.1 Boas-vindas

Objetivo:

```txt
Funcionar como entrada institucional premium do hotel e conduzir o hóspede para acessar sua estadia.
```

Soft promotion institucional é permitida nesta tela, desde que seja discreta, editorial e sem aparência de propaganda agressiva.

Ela não deve parecer:

- login;
- onboarding genérico;
- marketplace;
- vitrine promocional;
- propaganda agressiva.

Ela deve oferecer dois caminhos claros:

```txt
1. acessar uma estadia existente;
2. conhecer o hotel caso o usuário ainda não tenha reserva.
```

Estrutura aprovada:

```txt
[Logo ou monograma oficial centralizado]

Bem-vindo ao Copacabana Palace

Uma experiência lendária no Rio de Janeiro, agora também no seu concierge digital.

Gastronomia
Restaurantes premiados e experiências à mesa.

Spa & lazer
Momentos de descanso, piscina, bem-estar e cuidado.

Experiências
Passeios, atividades e sugestões selecionadas pelo hotel.

[Acessar minha estadia]

Ainda não tem uma reserva?
Conhecer o hotel
```

Uso do logo:

- preferir logo, monograma ou símbolo oficial do hotel;
- centralizar o monograma acima do título quando isso der mais presença premium;
- usar fundo transparente;
- não aplicar card, borda, sombra ou badge ao redor do logo;
- manter o título como principal elemento textual da tela.

Quando não houver asset oficial adequado, é preferível não usar assinatura textual solta.

Evitar:

- badge institucional;
- hero visual;
- card decorativo;
- assinatura textual fraca no topo;
- ícone genérico no lugar da marca;
- imagem genérica de hotel;
- explicação de formulário, quarto ou sobrenome nesta tela.

Destaques editoriais:

- devem apresentar o hotel de forma discreta;
- usar títulos curtos;
- usar descrições leves;
- manter divisórias finas quando ajudarem na leitura;
- evitar claims não validados, excesso de prêmios e linguagem promocional agressiva.

Exemplo:

- `Gastronomia`: Restaurantes premiados e experiências à mesa.
- `Spa & lazer`: Momentos de descanso, piscina, bem-estar e cuidado.
- `Experiências`: Passeios, atividades e sugestões selecionadas pelo hotel.

CTAs:

- principal: `Acessar minha estadia`
- secundário: `Conhecer o hotel`
- apoio ao CTA secundário: `Ainda não tem uma reserva?`

Comportamento:

- `Acessar minha estadia` leva o usuário para a tela de identificação da estadia;
- `Conhecer o hotel` abre o site oficial do hotel ou uma URL configurável.

Hierarquia:

```txt
Marca visual
Título de boas-vindas
Promessa institucional
Destaques editoriais
CTA principal
CTA secundário
```

Tom:

```txt
Elegante, institucional, discreto e acolhedor.
```

---

### 24.2 Identificação da estadia

Objetivo:

```txt
Identificar o hóspede sem email e senha.
```

Campos:

```txt
Número do quarto
Sobrenome
```

Ações:

```txt
Continuar
Preciso de ajuda
```

---

### 24.3 Confirmação por SMS

Objetivo:

```txt
Confirmar o acesso com código.
```

Conteúdo:

- telefone mascarado;
- input de 6 dígitos;
- reenviar código;
- confirmar acesso.

---

### 24.4 Hoje

Objetivo:

```txt
Ser a recepção digital do hotel.
```

Blocos:

```txt
Saudação contextual
Informações da estadia
Ações rápidas
Selecionado para hoje
Solicitações em andamento
Próximas reservas
Informações úteis
```

Regra:

```txt
A Home não mostra tudo. Ela escolhe o que importa agora.
```

---

### 24.5 Serviços

Objetivo:

```txt
Resolver necessidades práticas em poucos toques.
```

Categorias iniciais:

```txt
Toalhas
Limpeza
Amenities
Manutenção
Lavanderia
Bagagem
Room service
Solicitações especiais
```

---

### 24.6 Solicitação rápida

Objetivo:

```txt
Permitir uma solicitação simples em poucos toques.
```

Primeiro caso de uso:

```txt
Pedir toalhas
```

Fluxo:

```txt
Selecionar serviço
→ Ajustar quantidade
→ Observação opcional
→ Enviar solicitação
```

---

### 24.7 Descobrir

Objetivo:

```txt
Apresentar experiências com curadoria premium.
```

Blocos:

```txt
Selecionado para hoje
Para relaxar
Gastronomia
Experiências românticas
Para famílias
Passeios
Mais reservadas
```

Regra:

```txt
Não parecer marketplace comum.
```

---

### 24.8 Detalhe da experiência

Objetivo:

```txt
Vender desejo e explicar a experiência.
```

Conteúdo:

```txt
Imagem hero
Título aspiracional
Descrição editorial
Duração
O que está incluso
Local
Política curta
Preço
CTA: Ver horários / Reservar
```

---

### 24.9 Estadia

Objetivo:

```txt
Centralizar informações da hospedagem.
```

Blocos:

```txt
Hotel e quarto
Período da estadia
Check-out
Wi-Fi
Minhas solicitações
Minhas reservas
Consumo, se habilitado
Regras e informações úteis
```

---

### 24.10 Concierge

Objetivo:

```txt
Canal direto com o hotel.
```

Conteúdo inicial mockado:

```txt
Saudação do concierge
Sugestões rápidas
Campo de mensagem
Histórico visual simples
```

Sugestões rápidas:

```txt
Preciso de ajuda
Quero uma recomendação
Quero reservar algo
Tenho uma solicitação
Falar com a equipe
```

---

## 25. Dados mockados

No MVP, os dados devem ser mockados, mas já modelados de forma próxima da integração real.

### 25.1 Estrutura sugerida

```txt
src/
├── mocks/
│   ├── guest.mock.ts
│   ├── stay.mock.ts
│   ├── hotel.mock.ts
│   ├── experiences.mock.ts
│   ├── services.mock.ts
│   ├── requests.mock.ts
│   ├── reservations.mock.ts
│   ├── room-service.mock.ts
│   └── concierge.mock.ts
```

### 25.2 Guest

```ts
export const guest = {
  firstName: 'Everton',
  lastName: 'Rodrigues',
  phoneMasked: '(31) *****-1234'
}
```

### 25.3 Stay

```ts
export const stay = {
  hotelName: 'Aurora Collection Resort',
  roomNumber: '304',
  checkInDate: '2026-06-08',
  checkOutDate: '2026-06-12',
  checkOutTime: '12:00',
  wifiName: 'Aurora Guest',
  wifiPassword: 'aurora304'
}
```

### 25.4 Experience

```ts
export const experiences = [
  {
    id: 'sunset-dinner',
    title: 'Jantar ao pôr do sol',
    subtitle: 'Uma experiência reservada para o fim de tarde',
    category: 'Gastronomia',
    price: 380,
    duration: '2h',
    availableToday: true,
    badge: 'Selecionado para hoje'
  }
]
```

### 25.5 Services

```ts
export const services = [
  {
    id: 'towels',
    title: 'Toalhas',
    description: 'Solicite toalhas extras para o quarto',
    type: 'quick-request'
  },
  {
    id: 'cleaning',
    title: 'Limpeza',
    description: 'Peça arrumação ou limpeza adicional',
    type: 'quick-request'
  }
]
```

### 25.6 Requests

```ts
export const requests = [
  {
    id: 'req-001',
    title: 'Toalhas extras',
    status: 'A caminho',
    createdAt: 'Hoje, 14:20'
  }
]
```

---

## 26. Estrutura de pastas do design system

```txt
src/
├── design-system/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── radius.ts
│   │   ├── typography.ts
│   │   └── shadows.ts
│   │
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Screen.tsx
│   │   ├── Section.tsx
│   │   ├── Header.tsx
│   │   └── EmptyState.tsx
│   │
│   └── product/
│       ├── QuickActionCard.tsx
│       ├── ExperienceCard.tsx
│       ├── FeaturedExperienceCard.tsx
│       ├── ServiceCard.tsx
│       ├── RequestStatusCard.tsx
│       └── ReservationCard.tsx
```

---

## 27. Estrutura de rotas recomendada

```txt
app/
├── _layout.tsx
│
├── (onboarding)/
│   ├── welcome.tsx
│   ├── identify-stay.tsx
│   └── verify-sms.tsx
│
├── (guest)/
│   ├── _layout.tsx
│   │
│   ├── today/
│   │   └── index.tsx
│   │
│   ├── discover/
│   │   ├── index.tsx
│   │   ├── collection/[id].tsx
│   │   ├── experience/[id].tsx
│   │   ├── experience/[id]/schedule.tsx
│   │   └── experience/[id]/confirmation.tsx
│   │
│   ├── services/
│   │   ├── index.tsx
│   │   ├── request/[type].tsx
│   │   ├── request/[type]/confirmation.tsx
│   │   ├── room-service/index.tsx
│   │   ├── room-service/item/[id].tsx
│   │   ├── room-service/cart.tsx
│   │   └── room-service/confirmation.tsx
│   │
│   ├── stay/
│   │   ├── index.tsx
│   │   ├── wifi.tsx
│   │   ├── requests.tsx
│   │   ├── reservations.tsx
│   │   ├── consumption.tsx
│   │   └── checkout.tsx
│   │
│   └── concierge/
│       └── index.tsx
```

---

## 28. Regras de implementação

### 28.1 Não hardcodar estilo fora dos tokens

Toda cor, espaçamento, radius e tipografia deve vir dos tokens.

Evitar:

```tsx
<View style={{ margin: 17, backgroundColor: '#fff' }} />
```

Preferir:

```tsx
<Card padding="$xl" backgroundColor="$surface" />
```

---

### 28.2 Componentes de tela devem usar componentes base

Telas não devem recriar botões, cards e inputs manualmente.

Toda tela deve usar:

```txt
Screen
Section
Button
Card
Input
Badge
```

ou componentes de produto derivados.

---

### 28.3 Separar componente base de componente de produto

Exemplo:

```txt
Card = componente genérico
ExperienceCard = componente de produto
```

---

### 28.4 Design system primeiro

Antes de criar telas complexas, criar:

```txt
Screen
Button
Card
Input
Text
Badge
Section
```

---

### 28.5 Mock primeiro, integração depois

A primeira versão deve funcionar com mocks.

A integração real deve substituir os mocks sem alterar a estrutura visual das telas.

---

## 29. Critérios de qualidade visual

Antes de aprovar qualquer tela, verificar:

```txt
A tela parece premium?
A tela respira?
A hierarquia está clara?
Existe excesso de informação?
Os CTAs estão óbvios?
A linguagem parece concierge?
A tela parece app de hotel ou sistema administrativo?
A ação principal está visível?
A navegação está previsível?
O visual está consistente com os tokens?
```

Se a tela parecer um marketplace, cardápio digital ou dashboard, ela deve ser revisada.

---

## 30. Regra de ouro

A regra de ouro do produto é:

> A Home não mostra tudo. Ela escolhe o que importa agora.

A regra de ouro do design system é:

> O app deve parecer cuidado, não operação.

A regra de ouro da implementação é:

> Componentes próprios, tokens próprios, Tamagui como infraestrutura.
