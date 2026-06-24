# Contrato REST esperado para o backend

Este documento mapeia as telas atuais do app Expo em `ui/app` para APIs REST esperadas no backend. O conteúdo do app ainda é mockado, então os contratos abaixo formalizam os recursos necessários para substituir os mocks por dados reais.

## Convenções

- Base URL: `https://api.atrio.app/v1`
- Formato: JSON em todas as requisições e respostas.
- Autenticação: `Authorization: Bearer <accessToken>` em todos os endpoints logados.
- Datas: ISO 8601 em UTC para campos de sistema (`createdAt`, `scheduledAt`, `updatedAt`).
- Valores monetários: enviar número em centavos (`amountCents`) e moeda (`currency`). O app pode formatar localmente.
- IDs: strings estáveis (`stay_001`, `exp_sunset_dinner`, etc.).
- Erros: usar envelope consistente.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campos inválidos.",
    "details": [
      {
        "field": "roomNumber",
        "message": "Informe o número do quarto."
      }
    ]
  }
}
```

## Mapa de telas

| Tela | Rota Expo | APIs usadas |
| --- | --- | --- |
| Layout raiz | `app/_layout.tsx` | Sem API obrigatória |
| Entrada | `app/index.tsx` | `GET /me/session` |
| Modal padrão | `app/modal.tsx` | Sem API obrigatória |
| Boas-vindas | `(onboarding)/welcome` | Sem API obrigatória |
| Layout onboarding | `(onboarding)/_layout` | Sem API obrigatória |
| Identificar estadia | `(onboarding)/identify-stay` | `POST /stay-access/identify` |
| Confirmar SMS | `(onboarding)/verify-sms` | `POST /stay-access/verify`, `POST /stay-access/resend-code` |
| Layout logado | `(guest)/_layout` | `GET /me/session` ou dados retornados no login |
| Hoje | `(guest)/today` | `GET /stays/{stayId}/dashboard` |
| Descobrir | `(guest)/discover` | `GET /experiences/collections` |
| Coleção | `(guest)/discover/collection/[id]` | `GET /experiences/collections/{collectionId}` |
| Detalhe de experiência | `(guest)/discover/experience/[id]` | `GET /experiences/{experienceId}` |
| Agenda de experiência | `(guest)/discover/experience/[id]/schedule` | `GET /experiences/{experienceId}/availability`, `POST /stays/{stayId}/reservations` |
| Confirmação de reserva | `(guest)/discover/experience/[id]/confirmation` | `GET /stays/{stayId}/reservations/{reservationId}` |
| Serviços | `(guest)/services` | `GET /services` |
| Solicitar serviço | `(guest)/services/request/[type]` | `GET /services/{serviceId}`, `POST /stays/{stayId}/requests` |
| Confirmação de solicitação | `(guest)/services/request/[type]/confirmation` | `GET /stays/{stayId}/requests/{requestId}` |
| Estadia | `(guest)/stay` | `GET /stays/{stayId}` |
| Layout interno de Estadia | `(guest)/stay/_layout` | Sem API obrigatória |
| Wi-Fi | `(guest)/stay/wifi` | `GET /stays/{stayId}/wifi` |
| Minhas solicitações | `(guest)/stay/requests` | `GET /stays/{stayId}/requests` |
| Minhas reservas | `(guest)/stay/reservations` | `GET /stays/{stayId}/reservations` |
| Consumo | `(guest)/stay/consumption` | `GET /stays/{stayId}/consumption` |
| Concierge | `(guest)/concierge` | `GET /stays/{stayId}/concierge/messages`, `POST /stays/{stayId}/concierge/messages` |

## Autenticação e sessão

### POST /stay-access/identify

Identifica a estadia a partir do quarto e sobrenome e inicia o desafio por SMS.

```http
POST /v1/stay-access/identify HTTP/1.1
Content-Type: application/json

{
  "hotelId": "copacabana-palace",
  "roomNumber": "304",
  "lastName": "Rodrigues"
}
```

Resposta esperada `200 OK`:

```json
{
  "challengeId": "chl_8f4b2a",
  "deliveryChannel": "sms",
  "maskedPhone": "(31) *****-1234",
  "expiresAt": "2026-06-13T18:05:00.000Z",
  "resendAvailableAt": "2026-06-13T18:01:00.000Z"
}
```

### POST /stay-access/verify

Confirma o código SMS e cria a sessão autenticada.

```http
POST /v1/stay-access/verify HTTP/1.1
Content-Type: application/json

{
  "challengeId": "chl_8f4b2a",
  "code": "123456"
}
```

Resposta esperada `200 OK`:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "rft_01HZZ...",
  "session": {
    "guestId": "guest_001",
    "guestName": "Everton Rodrigues",
    "hotelId": "copacabana-palace",
    "stayId": "stay_001",
    "roomNumber": "304",
    "isAuthenticated": true
  },
  "stay": {
    "id": "stay_001",
    "hotelName": "Copacabana Palace",
    "roomNumber": "304",
    "checkOutTime": "12:00"
  }
}
```

### POST /stay-access/resend-code

Reenvia o código de confirmação.

```http
POST /v1/stay-access/resend-code HTTP/1.1
Content-Type: application/json

{
  "challengeId": "chl_8f4b2a"
}
```

Resposta esperada `200 OK`:

```json
{
  "challengeId": "chl_8f4b2a",
  "deliveryChannel": "sms",
  "maskedPhone": "(31) *****-1234",
  "expiresAt": "2026-06-13T18:08:00.000Z",
  "resendAvailableAt": "2026-06-13T18:04:00.000Z"
}
```

### GET /me/session

Restaura a sessão do usuário logado ao abrir o app.

```http
GET /v1/me/session HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "guestId": "guest_001",
  "guestName": "Everton Rodrigues",
  "hotelId": "copacabana-palace",
  "stayId": "stay_001",
  "roomNumber": "304",
  "isAuthenticated": true
}
```

## Hoje

### GET /stays/{stayId}/dashboard

Agrega os dados da tela inicial: saudação, contexto da estadia, ações rápidas, experiência em destaque, solicitações e reservas resumidas.

```http
GET /v1/stays/stay_001/dashboard HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "greeting": {
    "periodLabel": "Boa tarde",
    "guestFirstName": "Everton",
    "message": "Esperamos que sua estadia esteja sendo especial."
  },
  "stay": {
    "hotelName": "Copacabana Palace",
    "roomNumber": "304",
    "checkOutTime": "12:00"
  },
  "quickActions": [
    {
      "id": "request",
      "title": "Pedir algo",
      "icon": "bell",
      "target": "/services"
    },
    {
      "id": "room-service",
      "title": "Room service",
      "icon": "utensils",
      "target": "/services?type=room-service"
    },
    {
      "id": "wifi",
      "title": "Wi-Fi",
      "icon": "wifi",
      "target": "/stay/wifi"
    },
    {
      "id": "concierge",
      "title": "Concierge",
      "icon": "message-circle",
      "target": "/concierge"
    }
  ],
  "featuredExperience": {
    "id": "sunset-dinner",
    "title": "Jantar ao pôr do sol",
    "description": "Uma experiência à mesa para encerrar o dia com vista, cuidado e tranquilidade.",
    "badge": "Selecionado para hoje",
    "category": "Gastronomia",
    "timeLabel": "Hoje, a partir das 19h",
    "priceLabel": "Sob consulta",
    "imageUrl": "https://cdn.atrio.app/experiences/sunset-dinner.webp"
  },
  "requests": [
    {
      "id": "req_001",
      "title": "Toalhas extras",
      "status": "on_the_way",
      "statusLabel": "A caminho",
      "quantity": 2,
      "roomNumber": "304",
      "createdAt": "2026-06-13T17:20:00.000Z"
    }
  ],
  "reservations": [
    {
      "id": "res_001",
      "experienceId": "sunset-dinner",
      "title": "Jantar ao pôr do sol",
      "status": "requested",
      "statusLabel": "Solicitada",
      "scheduledAt": "2026-06-13T21:30:00.000Z",
      "dateLabel": "Hoje, 13 jun",
      "timeLabel": "18:30"
    }
  ],
  "usefulInfo": [
    {
      "id": "wifi",
      "title": "Wi-Fi",
      "description": "Rede e senha da internet"
    }
  ]
}
```

## Estadia

### GET /stays/{stayId}

Retorna o resumo completo da estadia usado na tela Estadia e no layout logado.

```http
GET /v1/stays/stay_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "id": "stay_001",
  "hotelId": "copacabana-palace",
  "hotelName": "Copacabana Palace",
  "guestId": "guest_001",
  "roomNumber": "304",
  "status": "active",
  "statusLabel": "Hospedagem ativa",
  "checkInDate": "2026-06-10",
  "checkOutDate": "2026-06-15",
  "checkInLabel": "10 jun",
  "checkOutLabel": "15 jun",
  "checkOutTime": "12:00",
  "summaries": {
    "requests": "1 em andamento",
    "reservations": "1 solicitada"
  },
  "usefulInfo": [
    {
      "id": "breakfast-hours",
      "title": "Horário do café",
      "description": "Servido das 6h30 às 10h30."
    },
    {
      "id": "check-out",
      "title": "Check-out",
      "description": "Até 12:00."
    }
  ]
}
```

### GET /stays/{stayId}/wifi

Retorna rede e senha Wi-Fi da estadia.

```http
GET /v1/stays/stay_001/wifi HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "network": "Copacabana Palace Guest",
  "password": "copacabana304",
  "updatedAt": "2026-06-13T12:00:00.000Z"
}
```

### GET /stays/{stayId}/consumption

Retorna lançamentos e total de consumo. A resposta deve suportar estados `ready`, `empty` e `unavailable`.

```http
GET /v1/stays/stay_001/consumption HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "enabled": true,
  "view": "ready",
  "currency": "BRL",
  "totalAmountCents": 34200,
  "updatedAt": "2026-06-13T18:40:00.000Z",
  "items": [
    {
      "id": "cons_room_service_001",
      "title": "Room service",
      "description": "Pedido no quarto",
      "category": "food_and_beverage",
      "icon": "utensils",
      "amountCents": 12800,
      "currency": "BRL",
      "occurredAt": "2026-06-13T17:20:00.000Z"
    },
    {
      "id": "cons_spa_001",
      "title": "Spa & bem-estar",
      "description": "Massagem relaxante",
      "category": "wellness",
      "icon": "sparkles",
      "amountCents": 18000,
      "currency": "BRL",
      "occurredAt": "2026-06-13T20:30:00.000Z"
    }
  ],
  "emptyState": {
    "title": "Nenhum consumo registrado.",
    "description": "Quando houver lançamentos vinculados à sua hospedagem, eles aparecerão aqui."
  },
  "unavailableState": {
    "title": "Consumo indisponível no momento.",
    "description": "Não foi possível carregar os lançamentos da estadia.",
    "actionLabel": "Falar com o concierge"
  }
}
```

## Experiências e reservas

### GET /experiences/collections

Lista as coleções editoriais da tela Descobrir, incluindo coleção em destaque.

```http
GET /v1/experiences/collections?hotelId=copacabana-palace&stayId=stay_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "collections": [
    {
      "id": "today",
      "title": "Selecionado para hoje",
      "description": "Uma sugestão especial para aproveitar este momento da estadia.",
      "featured": true,
      "items": [
        {
          "id": "sunset-dinner",
          "title": "Jantar ao pôr do sol",
          "description": "Uma experiência à mesa para encerrar o dia com vista, cuidado e tranquilidade.",
          "category": "Gastronomia",
          "timeLabel": "Hoje, a partir das 19h",
          "priceLabel": "Sob consulta",
          "badge": "Selecionado para hoje",
          "imageUrl": "https://cdn.atrio.app/experiences/sunset-dinner.webp"
        }
      ]
    },
    {
      "id": "relax",
      "title": "Para relaxar",
      "description": "Experiências selecionadas para desacelerar durante a estadia.",
      "featured": false,
      "items": []
    }
  ]
}
```

### GET /experiences/collections/{collectionId}

Retorna uma coleção com todos os itens, usada em `discover/collection/[id]`.

```http
GET /v1/experiences/collections/relax?hotelId=copacabana-palace&stayId=stay_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "id": "relax",
  "title": "Para relaxar",
  "description": "Experiências selecionadas para desacelerar durante a estadia.",
  "featured": false,
  "items": [
    {
      "id": "spa-wellness",
      "title": "Spa & bem-estar",
      "description": "Uma pausa para desacelerar com cuidado e tranquilidade.",
      "category": "Spa",
      "timeLabel": "60 min",
      "priceLabel": "Sob consulta",
      "badge": "Disponível hoje",
      "imageUrl": "https://cdn.atrio.app/experiences/spa.png"
    }
  ]
}
```

### GET /experiences/{experienceId}

Retorna detalhes da experiência.

```http
GET /v1/experiences/sunset-dinner?hotelId=copacabana-palace&stayId=stay_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "id": "sunset-dinner",
  "title": "Jantar ao pôr do sol",
  "description": "Uma experiência à mesa para encerrar o dia com vista, cuidado e tranquilidade.",
  "category": "Gastronomia",
  "timeLabel": "Hoje, a partir das 19h",
  "priceLabel": "Sob consulta",
  "badge": "Selecionado para hoje",
  "imageUrl": "https://cdn.atrio.app/experiences/sunset-dinner.webp",
  "durationLabel": "2h",
  "availabilityLabel": "Hoje, a partir das 19h",
  "locationLabel": "Restaurante do hotel",
  "locationDescription": "Restaurante do hotel, com orientação da equipe no momento da confirmação.",
  "included": [
    "Mesa preparada para a experiência",
    "Atendimento do hotel",
    "Seleção gastronômica definida conforme disponibilidade"
  ],
  "policy": "A confirmação está sujeita à disponibilidade de horário."
}
```

### GET /experiences/{experienceId}/availability

Retorna dias e horários disponíveis para agendamento.

```http
GET /v1/experiences/sunset-dinner/availability?stayId=stay_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "experienceId": "sunset-dinner",
  "days": [
    {
      "id": "2026-06-13",
      "label": "Hoje",
      "date": "2026-06-13",
      "dateLabel": "13 jun",
      "slots": [
        {
          "id": "slot_1830",
          "time": "18:30",
          "startsAt": "2026-06-13T21:30:00.000Z",
          "available": true
        },
        {
          "id": "slot_2030",
          "time": "20:30",
          "startsAt": "2026-06-13T23:30:00.000Z",
          "available": false
        }
      ]
    }
  ]
}
```

### POST /stays/{stayId}/reservations

Solicita uma reserva para uma experiência.

```http
POST /v1/stays/stay_001/reservations HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "experienceId": "sunset-dinner",
  "slotId": "slot_1830",
  "scheduledAt": "2026-06-13T21:30:00.000Z",
  "partySize": 2,
  "note": "Mesa com vista, se possível."
}
```

Resposta esperada `201 Created`:

```json
{
  "id": "res_001",
  "stayId": "stay_001",
  "experienceId": "sunset-dinner",
  "title": "Jantar ao pôr do sol",
  "status": "requested",
  "statusLabel": "Solicitada",
  "dateLabel": "Hoje, 13 jun",
  "timeLabel": "18:30",
  "scheduledAt": "2026-06-13T21:30:00.000Z",
  "locationLabel": "Restaurante do hotel",
  "priceLabel": "Sob consulta",
  "note": "A equipe do hotel irá confirmar os detalhes.",
  "createdAt": "2026-06-13T18:00:00.000Z"
}
```

### GET /stays/{stayId}/reservations

Lista reservas da estadia.

```http
GET /v1/stays/stay_001/reservations?status=active HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "items": [
    {
      "id": "res_001",
      "experienceId": "sunset-dinner",
      "title": "Jantar ao pôr do sol",
      "status": "requested",
      "statusLabel": "Solicitada",
      "dateLabel": "Hoje, 13 jun",
      "timeLabel": "18:30",
      "scheduledAt": "2026-06-13T21:30:00.000Z",
      "locationLabel": "Restaurante do hotel",
      "priceLabel": "Sob consulta",
      "note": "A equipe do hotel irá confirmar os detalhes."
    }
  ]
}
```

### GET /stays/{stayId}/reservations/{reservationId}

Retorna detalhe de uma reserva para tela de confirmação ou detalhe futuro.

```http
GET /v1/stays/stay_001/reservations/res_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "id": "res_001",
  "stayId": "stay_001",
  "experienceId": "sunset-dinner",
  "title": "Jantar ao pôr do sol",
  "status": "requested",
  "statusLabel": "Solicitada",
  "dateLabel": "Hoje, 13 jun",
  "timeLabel": "18:30",
  "scheduledAt": "2026-06-13T21:30:00.000Z",
  "locationLabel": "Restaurante do hotel",
  "priceLabel": "Sob consulta",
  "note": "A equipe do hotel irá confirmar os detalhes."
}
```

## Serviços e solicitações

### GET /services

Lista serviços disponíveis para a estadia.

```http
GET /v1/services?hotelId=copacabana-palace&stayId=stay_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "items": [
    {
      "id": "towels",
      "title": "Toalhas",
      "description": "Solicite toalhas extras para o quarto.",
      "icon": "Bath",
      "requestSchema": {
        "fields": [
          {
            "name": "quantity",
            "type": "number",
            "min": 1,
            "max": 10,
            "required": true
          },
          {
            "name": "note",
            "type": "string",
            "required": false,
            "maxLength": 500
          }
        ]
      }
    }
  ]
}
```

### GET /services/{serviceId}

Retorna detalhe de serviço para montar tela de solicitação.

```http
GET /v1/services/towels?hotelId=copacabana-palace&stayId=stay_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "id": "towels",
  "title": "Toalhas extras",
  "description": "Quantas unidades deseja receber no quarto?",
  "icon": "Bath",
  "fulfillmentType": "hotel_staff",
  "requestSchema": {
    "fields": [
      {
        "name": "quantity",
        "type": "number",
        "label": "Quantidade",
        "min": 1,
        "max": 10,
        "defaultValue": 2,
        "required": true
      },
      {
        "name": "note",
        "type": "string",
        "label": "Observação opcional",
        "required": false,
        "maxLength": 500
      }
    ]
  }
}
```

### POST /stays/{stayId}/requests

Cria uma solicitação para o hotel.

```http
POST /v1/stays/stay_001/requests HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "serviceId": "towels",
  "quantity": 2,
  "note": "Deixar na porta, se possível."
}
```

Resposta esperada `201 Created`:

```json
{
  "id": "req_001",
  "stayId": "stay_001",
  "serviceId": "towels",
  "type": "towels",
  "title": "Toalhas extras",
  "status": "received",
  "statusLabel": "Recebido",
  "quantity": 2,
  "note": "Deixar na porta, se possível.",
  "roomNumber": "304",
  "createdAt": "2026-06-13T18:10:00.000Z",
  "timeLabel": "Solicitado às 15:10"
}
```

### GET /stays/{stayId}/requests

Lista solicitações da estadia.

```http
GET /v1/stays/stay_001/requests HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "items": [
    {
      "id": "req_001",
      "stayId": "stay_001",
      "serviceId": "towels",
      "type": "towels",
      "title": "Toalhas extras",
      "status": "on_the_way",
      "statusLabel": "A caminho",
      "quantity": 2,
      "note": "",
      "roomNumber": "304",
      "createdAt": "2026-06-13T17:20:00.000Z",
      "timeLabel": "Solicitado às 14:20"
    }
  ]
}
```

### GET /stays/{stayId}/requests/{requestId}

Retorna a solicitação recém-criada para tela de confirmação.

```http
GET /v1/stays/stay_001/requests/req_001 HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "id": "req_001",
  "stayId": "stay_001",
  "serviceId": "towels",
  "type": "towels",
  "title": "Toalhas extras",
  "status": "received",
  "statusLabel": "Recebido",
  "quantity": 2,
  "note": "Deixar na porta, se possível.",
  "roomNumber": "304",
  "createdAt": "2026-06-13T18:10:00.000Z",
  "timeLabel": "Solicitado às 15:10"
}
```

## Concierge

### GET /stays/{stayId}/concierge/messages

Lista a conversa do concierge e sugestões rápidas.

```http
GET /v1/stays/stay_001/concierge/messages HTTP/1.1
Authorization: Bearer <accessToken>
```

Resposta esperada `200 OK`:

```json
{
  "quickSuggestions": [
    {
      "id": "help",
      "label": "Preciso de ajuda",
      "icon": "CircleHelp"
    },
    {
      "id": "recommendation",
      "label": "Quero uma recomendação",
      "icon": "Sparkles"
    }
  ],
  "messages": [
    {
      "id": "msg_welcome",
      "sender": "hotel",
      "text": "Boa tarde, Everton. Sou o concierge do Copacabana Palace. Posso ajudar com recomendações, reservas, solicitações ou qualquer detalhe da sua estadia.",
      "createdAt": "2026-06-13T18:00:00.000Z"
    }
  ]
}
```

### POST /stays/{stayId}/concierge/messages

Envia uma mensagem do hóspede ao concierge.

```http
POST /v1/stays/stay_001/concierge/messages HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "text": "Gostaria de uma recomendação de jantar para hoje.",
  "source": "typed_message"
}
```

Resposta esperada `201 Created`:

```json
{
  "message": {
    "id": "msg_002",
    "sender": "guest",
    "text": "Gostaria de uma recomendação de jantar para hoje.",
    "createdAt": "2026-06-13T18:15:00.000Z"
  },
  "reply": {
    "id": "msg_003",
    "sender": "hotel",
    "text": "Recebemos sua mensagem. A equipe do hotel irá acompanhar e responder em breve.",
    "createdAt": "2026-06-13T18:15:01.000Z"
  }
}
```

## Paginação e filtros recomendados

- `GET /stays/{stayId}/requests?status=active&limit=20&cursor=<cursor>`
- `GET /stays/{stayId}/reservations?status=active&limit=20&cursor=<cursor>`
- `GET /stays/{stayId}/concierge/messages?limit=50&before=<messageId>`
- Respostas paginadas devem incluir:

```json
{
  "items": [],
  "pagination": {
    "nextCursor": "cur_next",
    "hasNextPage": true
  }
}
```

## Códigos de status esperados

- `200 OK`: leitura ou ação concluída sem criação de recurso.
- `201 Created`: criação de solicitação, reserva ou mensagem.
- `400 Bad Request`: payload inválido.
- `401 Unauthorized`: token ausente ou inválido.
- `403 Forbidden`: estadia não pertence ao hóspede autenticado.
- `404 Not Found`: recurso inexistente ou indisponível para o hotel/estadia.
- `409 Conflict`: horário indisponível, reserva duplicada, desafio expirado ou código já usado.
- `422 Unprocessable Entity`: payload válido em JSON, mas regras de negócio não atendidas.
- `429 Too Many Requests`: excesso de tentativas de código SMS ou envio de mensagens.
