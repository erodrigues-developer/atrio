# Plano de implementacao do ambiente administrativo do hotel

## Objetivo

Criar um ambiente administrativo logado para que a equipe do hotel configure previamente tudo que aparece no app do hospede e cadastre estadias ativas, permitindo que o hospede acesse o app por identificacao de quarto, sobrenome e validacao por SMS.

O admin deve cobrir:

- configuracao do hotel;
- cadastro de usuarios administrativos e permissoes;
- cadastro de hospedes e estadias;
- dados da estadia exibidos no app;
- servicos solicitaveis pelo hospede;
- experiencias, colecoes e disponibilidade;
- reservas feitas pelo hospede ou pela equipe;
- solicitacoes de servico;
- consumo da estadia;
- mensagens de concierge;
- imagens e arquivos anexados diretamente nos cadastros que precisam deles;
- auditoria operacional.

## Recomendacao de arquitetura

Recomendo usar o projeto `api` existente e criar um novo projeto frontend para o admin, por exemplo `admin/` ou `hotel-admin/`.

Nao recomendo colocar o admin dentro do `ui` atual como primeira opcao. O `ui` existente e um app Expo/React Native com foco no hospede, navegacao mobile e rotas de onboarding/guest. O admin sera uma aplicacao web logada, mais densa, orientada a tabela, formularios, filtros, permissoes e operacao diaria. Misturar os dois tende a acoplar fluxos, dependencias e decisoes de UX que tem naturezas diferentes.

Tambem nao recomendo criar uma segunda API. O backend ja possui os dominios principais: `hotels`, `guests`, `stays`, `service_definitions`, `stay_requests`, `experiences`, `experience_collections`, `experience_availability_slots`, `reservations`, `concierge_messages`, `consumption_items` e sessoes de hospede. O correto e evoluir o `api` com modulos administrativos, reaproveitando entidades, repositorios e regras do app do hospede.

Arquitetura proposta:

- `api/`: backend unico NestJS, com endpoints publicos do app e endpoints administrativos em `/v1/admin`.
- `ui/`: app do hospede, mantido como esta.
- `admin/`: novo frontend web administrativo.
- Opcional futuro: `packages/shared/` para tipos, validadores e tokens de design caso o projeto vire workspace.

Stack sugerida para `admin/`:

- React web com Vite ou Next.js.
- TypeScript.
- TanStack Query para cache e sincronizacao com API.
- React Hook Form + Zod para formularios.
- TanStack Table para tabelas com filtros, ordenacao e paginacao.
- Design system simples e denso, priorizando operacao: sidebar, topbar, tabelas, drawers e formularios.

## Principios do admin

- O hotel configura o catalogo antes da chegada do hospede.
- A equipe cadastra ou importa estadias para habilitar acesso ao app.
- Tudo que o hospede ve no app deve ter origem administravel ou claramente derivada de dados administraveis.
- Alteracoes relevantes precisam de auditoria: quem alterou, quando, antes/depois quando aplicavel.
- A operacao do hotel precisa ser multiusuario e com permissao por papel.
- O admin deve evitar exclusao fisica de dados sensiveis; usar status, arquivamento ou despublicacao.

## Perfis de acesso

Perfis iniciais:

- `owner`: configura hotel, usuarios, permissoes e integracoes.
- `manager`: administra catalogos, estadias, reservas, servicos, experiencias e relatorios.
- `front_desk`: cadastra hospedes, estadias, check-in/check-out e ajuda no acesso.
- `concierge`: responde mensagens, cria reservas e acompanha solicitacoes.
- `operations`: atende solicitacoes de servico e atualiza status.
- `read_only`: visualiza dados sem alterar.

Permissoes devem ser granulares por recurso:

- `hotel.settings.read/write`
- `staff.read/write`
- `stays.read/write`
- `guests.read/write`
- `services.read/write`
- `requests.read/write`
- `experiences.read/write`
- `experiences.media.write`
- `reservations.read/write`
- `consumption.read/write`
- `concierge.read/write`
- `hotel.media.write`
- `reports.read`

## Extensoes necessarias no backend

Criar um modulo administrativo dentro de `api/src/modules/admin` ou submodulos por dominio:

- `admin-auth`
- `admin-users`
- `admin-hotels`
- `admin-stays`
- `admin-services`
- `admin-experiences`
- `admin-reservations`
- `admin-requests`
- `admin-consumption`
- `admin-concierge`
- `admin-audit`

Novas tabelas recomendadas:

- `admin_users`: usuarios administrativos.
- `admin_roles`: papeis de acesso.
- `admin_user_roles`: vinculo usuario/papel/hotel.
- `admin_sessions`: sessoes administrativas.
- `admin_password_resets`: recuperacao de senha ou convite.
- `audit_logs`: trilha de auditoria.
- `hotel_settings`: configuracoes gerais por hotel.
- `hotel_content_blocks`: textos e cards institucionais reutilizaveis, se necessario.
- `stay_access_challenges`: se ainda nao estiver separado do fluxo de sessao do hospede.

Midias nao devem ser tratadas como um modulo administrativo separado. O upload deve ficar no modulo que consome o arquivo:

- imagem e logo do hotel dentro de configuracoes do hotel;
- imagem principal da experiencia dentro do cadastro da experiencia;
- imagem opcional da colecao dentro do cadastro da colecao;
- anexos futuros de concierge dentro da conversa;
- documentos futuros da estadia dentro do detalhe da estadia.

A infraestrutura de storage continua compartilhada no backend, usando a abstracao existente em `api/src/modules/storage`, mas os endpoints devem ser orientados ao recurso de negocio. Exemplos:

- `POST /v1/admin/hotels/current/logo`
- `POST /v1/admin/hotels/current/hero-image`
- `POST /v1/admin/experiences/:experienceId/image`
- `POST /v1/admin/experience-collections/:collectionId/image`

Campos que provavelmente precisam ser adicionados a entidades atuais:

- `hotel_id` em servicos, experiencias e colecoes para isolar dados por hotel.
- `status`, `published`, `starts_at`, `ends_at`, `position` e `archived_at` em catalogos publicaveis.
- `capacity`, `reserved_count`, `cutoff_minutes`, `cancellation_policy` em slots de experiencia.
- `source` em reservas e solicitacoes: `guest_app`, `admin`, `integration`.
- `assigned_to`, `internal_note` e `updated_at` em solicitacoes e reservas.
- `created_by_admin_id` e `updated_by_admin_id` em dados administraveis importantes.

Padrao de rotas:

- `POST /v1/admin/auth/login`
- `POST /v1/admin/auth/logout`
- `GET /v1/admin/me`
- `GET /v1/admin/hotels/current`
- `PATCH /v1/admin/hotels/current`
- `GET /v1/admin/stays`
- `POST /v1/admin/stays`
- `GET /v1/admin/stays/:stayId`
- `PATCH /v1/admin/stays/:stayId`
- `POST /v1/admin/stays/:stayId/access/resend`
- `GET /v1/admin/services`
- `POST /v1/admin/services`
- `PATCH /v1/admin/services/:serviceId`
- `GET /v1/admin/experiences`
- `POST /v1/admin/experiences`
- `PATCH /v1/admin/experiences/:experienceId`
- `POST /v1/admin/experiences/:experienceId/image`
- `POST /v1/admin/experience-collections/:collectionId/image`
- `GET /v1/admin/reservations`
- `POST /v1/admin/reservations`
- `PATCH /v1/admin/reservations/:reservationId/status`
- `GET /v1/admin/requests`
- `PATCH /v1/admin/requests/:requestId/status`
- `GET /v1/admin/concierge/conversations`
- `POST /v1/admin/concierge/conversations/:stayId/messages`

## Mapa de telas

### 1. Login

Finalidade: autenticar funcionario do hotel.

Componentes:

- email;
- senha;
- acao de entrar;
- recuperacao de senha;
- estado de convite pendente, se aplicavel.

Regras:

- login gera sessao administrativa, separada da sessao do hospede;
- bloquear acesso por hotel quando usuario nao tiver permissao;
- registrar tentativas falhas e ultimo login.

### 2. Selecionar hotel

Necessaria se o usuario tiver acesso a mais de um hotel.

Componentes:

- lista de hoteis autorizados;
- busca por nome;
- indicador de ambiente ativo no topo.

Regras:

- todas as telas seguintes devem operar no contexto de um hotel selecionado;
- a API deve validar `hotelId` a partir da sessao/permissao, nao confiar apenas no parametro do cliente.

### 3. Dashboard operacional

Finalidade: visao diaria da operacao.

Cards e secoes:

- estadias ativas hoje;
- check-ins previstos;
- check-outs previstos;
- solicitacoes abertas por status;
- reservas pendentes de confirmacao;
- mensagens nao respondidas;
- experiencias com baixa disponibilidade;
- alertas de configuracao incompleta.

Acoes rapidas:

- nova estadia;
- nova reserva;
- nova experiencia;
- novo servico;
- abrir fila de solicitacoes;
- abrir concierge.

### 4. Configuracoes do hotel

Finalidade: manter dados base do hotel.

Campos:

- nome;
- slug/public id;
- endereco;
- timezone;
- idioma padrao;
- moeda;
- horario padrao de check-in;
- horario padrao de check-out;
- telefone;
- email;
- canais de atendimento;
- politicas gerais;
- logo;
- imagem principal;
- status de publicacao.

Subtelas:

- dados gerais;
- horarios e politicas;
- contato;
- integracoes futuras.

Uploads neste formulario:

- logo do hotel;
- imagem principal do hotel.

Impacto no app do hospede:

- nome do hotel;
- horario de check-out;
- dados de contato;
- politicas exibidas na estadia;
- assets publicos.

### 5. Usuarios e permissoes

Finalidade: controlar quem acessa o admin.

Tela de lista:

- nome;
- email;
- papel;
- hotel;
- status;
- ultimo acesso.

Formulario:

- nome;
- email;
- telefone opcional;
- papel;
- permissoes;
- hoteis autorizados;
- convite por email;
- ativar/desativar.

Regras:

- apenas `owner` ou perfil autorizado gerencia usuarios;
- desativar usuario encerra sessoes ativas;
- toda mudanca de permissao entra em auditoria.

### 6. Hospedes

Finalidade: manter cadastro de pessoas hospedadas.

Lista:

- nome;
- sobrenome;
- telefone;
- email opcional;
- documento opcional;
- estadias vinculadas;
- ultima estadia.

Formulario:

- primeiro nome;
- sobrenome;
- telefone para SMS;
- telefone mascarado gerado pelo backend;
- email;
- documento;
- observacoes internas.

Regras:

- telefone deve ser normalizado;
- sobrenome sera usado no fluxo de identificacao do app;
- evitar duplicidade por telefone/documento quando disponivel.

### 7. Estadias

Finalidade: cadastrar a estadia para liberar acesso ao app do hospede.

Lista:

- quarto;
- hospede principal;
- status: `scheduled`, `active`, `checked_out`, `cancelled`;
- check-in;
- check-out;
- telefone;
- acesso ao app: `not_invited`, `challenge_sent`, `active_session`, `expired`;
- solicitacoes abertas;
- reservas futuras.

Filtros:

- hoje;
- ativas;
- proximos check-ins;
- check-outs;
- quarto;
- nome/sobrenome;
- status.

Formulario de nova estadia:

- hotel;
- hospede existente ou novo hospede;
- quarto;
- data de check-in;
- data de check-out;
- horario de check-out;
- status inicial;
- rede Wi-Fi;
- senha Wi-Fi;
- consumo habilitado;
- visao de consumo: `ready`, `empty`, `unavailable`;
- observacoes internas;
- enviar convite/acesso por SMS.

Detalhe da estadia:

- resumo da estadia;
- dados do hospede;
- acesso ao app e sessoes;
- dados uteis;
- Wi-Fi;
- consumo;
- solicitacoes;
- reservas;
- mensagens;
- auditoria.

Acoes:

- reenviar codigo de acesso;
- encerrar sessoes do hospede;
- alterar quarto;
- antecipar check-out;
- cancelar estadia;
- criar reserva para o hospede;
- criar solicitacao manual;

Regras:

- o app do hospede so deve autenticar estadias `active` ou em janela permitida;
- quarto + sobrenome + hotel precisam localizar uma estadia valida;
- check-out pode expirar acesso automaticamente;
- alteracoes em quarto, datas e telefone precisam invalidar ou revisar desafios pendentes.

### 8. Dados uteis da estadia

Finalidade: configurar cards de informacao exibidos em `Hoje` e `Estadia`.

Lista por estadia:

- titulo;
- descricao;
- escopo: `dashboard` ou `stay`;
- posicao;
- status.

Formulario:

- titulo;
- descricao;
- escopo;
- ordenacao;
- visivel.

Opcao futura:

- modelos globais por hotel para preencher automaticamente novas estadias.

### 9. Wi-Fi

Pode ficar dentro de estadia e tambem ter defaults por hotel.

Configuracao por hotel:

- rede padrao;
- senha padrao;
- instrucoes.

Configuracao por estadia:

- rede;
- senha;
- observacao interna.

Regras:

- nova estadia herda defaults do hotel;
- alteracao por estadia sobrescreve o default.

### 10. Consumo

Finalidade: administrar itens de consumo exibidos ao hospede.

Lista por estadia:

- item;
- categoria;
- data/hora;
- valor;
- moeda;
- status;
- origem.

Formulario:

- titulo;
- descricao;
- categoria;
- icone;
- valor em centavos;
- moeda;
- data de ocorrencia;
- visivel ao hospede.

Estados da tela do app:

- `ready`: exibe itens;
- `empty`: informa que nao ha consumo;
- `unavailable`: informa indisponibilidade.

Regras:

- permitir lancamento manual no MVP;
- preparar importacao futura de PMS/POS;
- itens financeiros devem ter auditoria.

### 11. Servicos

Finalidade: configurar servicos solicitaveis pelo hospede.

Lista:

- titulo;
- descricao;
- icone;
- tipo de atendimento;
- categoria;
- status de publicacao;
- quantidade de solicitacoes abertas.

Formulario:

- titulo;
- descricao;
- icone;
- categoria;
- tipo de atendimento;
- SLA esperado;
- instrucoes internas;
- schema do formulario do hospede;
- publicado.

Construtor de formulario:

- campo de texto;
- area de texto;
- quantidade;
- seletor;
- data;
- horario;
- obrigatoriedade;
- placeholder;
- validacoes.

Exemplos de servicos:

- toalhas extras;
- limpeza;
- room service;
- manutencao;
- amenities;
- transporte.

Regras:

- servico despublicado nao aparece no app;
- solicitacoes antigas continuam acessiveis;
- alterar schema nao deve quebrar solicitacoes ja criadas.

### 12. Solicitacoes de servico

Finalidade: acompanhar e atender pedidos feitos pelo hospede.

Lista operacional:

- status;
- quarto;
- hospede;
- servico;
- quantidade;
- criado em;
- responsavel;
- SLA;
- prioridade.

Status sugeridos:

- `requested`;
- `accepted`;
- `in_progress`;
- `on_the_way`;
- `completed`;
- `cancelled`;
- `rejected`.

Detalhe:

- dados da solicitacao;
- respostas do formulario;
- notas internas;
- historico de status;
- responsavel;
- comunicacao com concierge se necessario.

Acoes:

- assumir;
- mudar status;
- adicionar nota interna;
- cancelar;
- concluir.

Impacto no app:

- atualiza `Minhas solicitacoes`;
- alimenta resumo do dashboard `Hoje`.

### 13. Experiencias

Finalidade: cadastrar experiencias ofertadas ao hospede.

Lista:

- titulo;
- categoria;
- publicado;
- destaque;
- preco;
- disponibilidade;
- local;
- reservas futuras.

Formulario:

- titulo;
- descricao curta;
- descricao detalhada;
- categoria;
- badge;
- upload/substituicao da imagem principal;
- duracao;
- disponibilidade textual;
- local;
- descricao do local;
- preco/label de preco;
- politica;
- itens incluidos;
- tags internas;
- publicado.

Regras:

- experiencias publicadas aparecem em `Descobrir`;
- imagem e textos principais devem ser obrigatorios para publicacao;
- o upload da imagem deve acontecer dentro do cadastro da experiencia, usando endpoint administrativo da propria experiencia;
- experiencia pode existir em rascunho.

### 14. Colecoes de experiencias

Finalidade: organizar experiencias em grupos editoriais.

Lista:

- titulo;
- descricao;
- destaque;
- quantidade de itens;
- posicao.

Formulario:

- titulo;
- descricao;
- destaque;
- upload/substituicao de imagem opcional;
- experiencias vinculadas;
- ordenacao dos itens;
- publicado.

Regras:

- uma experiencia pode estar em varias colecoes;
- colecoes controlam a tela `Descobrir`;
- o upload da imagem deve acontecer dentro do cadastro da colecao, usando endpoint administrativo da propria colecao;
- colecao destacada pode alimentar blocos principais do app.

### 15. Disponibilidade de experiencias

Finalidade: configurar horarios reservaveis.

Visualizacoes:

- calendario;
- lista por experiencia;
- lista por dia.

Formulario de slot:

- experiencia;
- data;
- horario;
- capacidade;
- vagas disponiveis;
- cutoff de reserva;
- status disponivel/indisponivel;
- observacao interna.

Acoes:

- criar slot unico;
- criar recorrencia;
- bloquear horario;
- reabrir horario;
- ajustar capacidade.

Regras:

- reserva do hospede consome capacidade;
- bloquear slot nao deve apagar reservas existentes;
- alteracao de horario com reservas deve exigir confirmacao e registrar auditoria.

### 16. Reservas

Finalidade: acompanhar reservas de experiencias e criar reservas manualmente.

Lista:

- status;
- experiencia;
- quarto;
- hospede;
- data/hora;
- origem;
- criado em.

Status sugeridos:

- `requested`;
- `confirmed`;
- `waitlisted`;
- `cancelled`;
- `completed`;
- `no_show`;
- `rejected`.

Formulario de nova reserva:

- estadia/hospede;
- experiencia;
- data;
- horario;
- quantidade de pessoas, se aplicavel;
- observacao do hospede;
- nota interna;
- status inicial.

Detalhe:

- dados da experiencia;
- dados da estadia;
- slot;
- historico;
- notas.

Acoes:

- confirmar;
- recusar;
- reagendar;
- cancelar;
- marcar como concluida;
- criar em nome do hospede.

Impacto no app:

- aparece em `Minhas reservas`;
- aparece no dashboard `Hoje`;
- detalhe de confirmacao usa o mesmo registro.

### 17. Concierge

Finalidade: responder mensagens dos hospedes.

Tela:

- lista de conversas por estadia;
- indicador de nao lida;
- quarto;
- hospede;
- ultima mensagem;
- responsavel;
- painel de mensagens;
- sugestoes rapidas.

Acoes:

- responder;
- atribuir conversa;
- marcar como resolvida;
- criar solicitacao a partir da conversa;
- criar reserva a partir da conversa;
- adicionar nota interna.

Regras:

- mensagens do admin devem aparecer no historico do hospede;
- notas internas nao aparecem no app;
- auto acknowledgement atual deve ser substituido ou parametrizado quando houver atendimento real.

### 18. Auditoria

Finalidade: rastrear alteracoes administrativas.

Lista:

- data;
- usuario;
- recurso;
- acao;
- hotel;
- resumo.

Detalhe:

- payload antes/depois quando seguro;
- IP/user agent;
- correlacao com request id.

Eventos obrigatorios:

- login e logout;
- falhas de login;
- alteracao de permissao;
- criacao/edicao/cancelamento de estadia;
- reenvio de acesso;
- alteracao de consumo;
- mudanca de status de reserva ou solicitacao;
- publicacao/despublicacao de experiencia/servico.

### 20. Relatorios iniciais

Finalidade: dar leitura operacional basica.

Relatorios MVP:

- estadias por periodo;
- solicitacoes por tipo/status;
- reservas por experiencia/status;
- consumo por estadia;
- tempo medio de atendimento;
- mensagens por periodo.

Exportacao:

- CSV no MVP;
- filtros por data, status e origem.

## Fluxos principais

### Cadastro de estadia para liberar o app

1. Funcionario abre `Estadias`.
2. Clica em `Nova estadia`.
3. Busca hospede existente ou cadastra novo.
4. Informa quarto, check-in, check-out e telefone.
5. Confere Wi-Fi e configuracoes herdadas do hotel.
6. Salva estadia como `active` ou `scheduled`.
7. Opcionalmente envia SMS de acesso.
8. Hospede abre o app, informa hotel/quarto/sobrenome.
9. API localiza estadia valida e envia desafio.
10. Hospede valida SMS e recebe sessao.

### Configuracao de uma nova experiencia

1. Funcionario cria experiencia em rascunho.
2. Preenche texto, categoria, preco, local, politica, itens incluidos e imagem.
3. Cria slots de disponibilidade ou recorrencia.
4. Vincula a uma ou mais colecoes.
5. Publica.
6. App passa a exibir a experiencia em `Descobrir`.
7. Hospede reserva um slot.
8. Admin acompanha em `Reservas`.

### Configuracao de um novo servico

1. Funcionario cria servico.
2. Define titulo, descricao, icone, categoria e tipo de atendimento.
3. Monta formulario que o hospede deve preencher.
4. Publica.
5. App passa a exibir o servico.
6. Hospede cria solicitacao.
7. Operacao acompanha e atualiza status no admin.

## Contratos entre admin e app do hospede

O admin nao deve escrever dados em formato "de tela" quando houver regra de dominio melhor. Exemplo:

- status interno deve ser enum estavel;
- label pode ser derivada por mapper;
- datas devem ser armazenadas como data/hora real;
- ordenacao deve ser campo explicito;
- publicacao deve ser controlada por `published` e nao por exclusao.

Entretanto, alguns campos editoriais hoje existentes no app fazem sentido serem administraveis:

- `title`;
- `description`;
- `badge`;
- `category`;
- `timeLabel`;
- `priceLabel`;
- `imageUrl`;
- `durationLabel`;
- `availabilityLabel`;
- `locationLabel`;
- `policy`;
- `included`;
- textos de informacao util.

## Implementacao por fases

### Fase 1 - Fundacao administrativa

- Criar projeto `admin/`.
- Criar login administrativo.
- Criar sessao, roles e guard admin no `api`.
- Criar layout base: sidebar, topbar, contexto do hotel.
- Criar dashboard operacional inicial.
- Criar auditoria basica.

Entrega valida:

- funcionario loga;
- acessa hotel autorizado;
- ve dashboard com dados reais da API.

### Fase 2 - Estadias e hospedes

- CRUD de hospedes.
- CRUD de estadias.
- detalhe da estadia.
- envio/reenvio de acesso.
- encerrar sessoes do hospede.
- dados uteis, Wi-Fi e consumo manual.

Entrega valida:

- hotel cadastra uma estadia real;
- hospede consegue acessar o app usando a estadia cadastrada no admin.

### Fase 3 - Servicos e solicitacoes

- CRUD de servicos.
- construtor simples de formulario.
- publicacao/despublicacao.
- fila de solicitacoes.
- mudanca de status e notas internas.

Entrega valida:

- servico criado no admin aparece no app;
- solicitacao criada no app aparece no admin;
- status alterado no admin aparece no app.

### Fase 4 - Experiencias e reservas

- CRUD de experiencias.
- CRUD de colecoes.
- agenda de disponibilidade.
- reservas manuais e reservas do app.
- status de reserva e capacidade de slots.

Entrega valida:

- experiencia criada no admin aparece no app;
- hospede cria reserva;
- hotel confirma ou altera reserva pelo admin.

### Fase 5 - Concierge, uploads integrados e relatorios

Status: implementada no MVP administrativo.

- inbox de concierge.
- resposta manual do hotel.
- uploads integrados aos cadastros de hotel, experiencias e colecoes.
- relatorios CSV.
- filtros avancados.

Entrega valida:

- equipe atende mensagens reais;
- imagens sao gerenciadas dentro do cadastro do recurso que as utiliza;
- gestor exporta relatorios operacionais.

## Testes e qualidade

Backend:

- testes unitarios dos services admin;
- testes de guards e permissoes;
- testes de autorizacao por hotel;
- testes de fluxos criticos: criar estadia, identificar estadia, criar servico, criar experiencia, criar reserva;
- e2e para endpoints admin principais.

Frontend admin:

- testes de renderizacao dos formularios principais;
- testes de fluxos com mocks de API;
- validacao de formularios;
- estados de erro, carregamento e vazio;
- teste manual responsivo em desktop e tablet.

Seguranca:

- senhas com hash forte;
- tokens separados para admin e hospede;
- protecao por papel e hotel;
- rate limit em login;
- auditoria de acoes sensiveis;
- nunca expor dados de outro hotel.

## Ordem recomendada de desenvolvimento

1. Modelar entidades administrativas e migracoes.
2. Implementar auth admin e permissoes.
3. Criar o projeto `admin/` e o layout autenticado.
4. Implementar dashboard.
5. Implementar hospedes e estadias.
6. Integrar cadastro de estadia com fluxo de acesso do app.
7. Implementar servicos e solicitacoes.
8. Implementar experiencias, colecoes, slots e reservas.
9. Implementar concierge.
10. Implementar uploads integrados, auditoria detalhada e relatorios.

## Decisoes em aberto

- O admin sera usado por um unico hotel inicialmente ou por varios hoteis desde o MVP?
- O envio de SMS sera real no MVP ou simulado/local?
- O hotel possui PMS/POS para importar estadias e consumo ou o MVP sera manual?
- Reservas de experiencias precisam de capacidade por pessoa ou apenas um slot por estadia?
- Concierge tera atendimento humano desde o inicio ou respostas automaticas ate a fase 5?
- O admin precisa funcionar bem em tablet operacional ou apenas desktop?

## Recomendacao final

Usar `api` e `ui` existentes, mas com papeis diferentes:

- evoluir `api` como backend unico e fonte de verdade;
- manter `ui` como app do hospede;
- criar um novo frontend `admin/` para o painel web do hotel.

Essa divisao preserva o investimento ja feito no backend e no app, evita duplicar regras de negocio e deixa a interface administrativa livre para ser construida com componentes e fluxos adequados a operacao do hotel.
