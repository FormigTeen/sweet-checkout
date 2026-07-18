# Sweet Checkout · Le biscuit

Modelo **estático** de checkout multi-step para análise e substituição do
checkout VTEX atual da Le biscuit. Foco em UI simples e amigável (inclusive
para baixa alfabetização digital), redução extrema de toques na tela e
"açúcar" na interface (som, tátil, animações leves).

Identidade visual extraída da produção (`lebiscuit.com.br/checkout`):
vermelho `#ED1B2F`, verde `#27AE60`, fonte **Lato**, logo original.

## Rodando

```bash
npm install
npm run dev
```

## Query params (controle recuperável de etapas)

O estado do checkout vive na URL — recarregar ou usar voltar/avançar do
navegador retoma a etapa.

| Param  | Valores                     | Efeito |
|--------|-----------------------------|--------|
| `step` | `cart` `auth` `delivery` `payment` `done` | Etapa atual |
| `mode` | `simple` \| `complete`      | `simple` = 1ª compra (formulários vazios); `complete` = recorrente (dados salvos pré-preenchidos) |
| `auth` | `0` \| `1`                  | `1` pula a identificação (usuário logado); `0` exige login por celular + código |

Exemplos:
- `/?mode=complete&auth=1` → recorrente logado (caminho mais curto, **3 toques**)
- `/?mode=simple&auth=0` → primeira compra completa (**5 toques**)
- `/?step=payment&mode=complete&auth=1` → **fast checkout** (cai direto no pagamento)

Há um botão flutuante **demo** (canto inferior esquerdo) para alternar os
modos ao vivo e gerar/copiar os links de **fast checkout** (logado e deslogado).

## Fluxo não-linear

Não há indicador de etapas fixo — o checkout é flexível. Um link pode cair em
qualquer etapa (ex.: fast checkout no pagamento). No resumo do pagamento, cada
linha tem **Editar**: ao editar, o usuário vai àquela etapa e o próximo passo
**volta direto para o resumo** (não refaz o fluxo inteiro). Os rótulos dos
botões dizem para onde levam, já que não há trilha no topo.

O botão de avançar fica fixo no rodapé quando a tela cabe sem scroll; quando há
scroll, ele vai para o fim do conteúdo, para o usuário não ignorar nada.

## Estado inicial via orderForm da VTEX

O checkout é inicializado a partir de um objeto no **formato orderForm da
VTEX** (`src/checkout/lib/orderForm.ts`). Para demonstrar com um pedido real,
basta substituir `sampleOrderForm` pelo JSON retornado por
`POST /api/checkout/pub/orderForm` — o adaptador (`orderFormAdapter.ts`)
converte para o modelo interno, tolerando campos ausentes.

Campos específicos da loja (garantia estendida e cashback) ficam inline nos
itens (`warrantyOfferings`, `cashbackPercent`), documentados no arquivo. Em
produção chegam via `assemblyOptions` / `attachmentOfferings` ou apps de
`customData`.

## Dados de teste

- **Código de login (e-mail):** `123456` · ou entre com Google/Facebook/Apple (1 toque).
- **Cupons:** `LEBISCUIT10` (10%), `BEMVINDO15` (15%), `FRETEGRATIS` (5%).
- **Garantia estendida:** link "Detalhes" na Sacola abre os termos (exigência do CDC).
- **Resumo revisável:** no Pagamento, cada linha tem "Editar" para corrigir a etapa.
- **Cartão de crédito:** etapa própria (cartão salvo + adicionar novo + parcelas).
- **Retirar na loja:** rola suave até a lista (~40 lojas) com busca por bairro/cidade e loja favorita fixada no topo.
- **PIX:** ao pagar, simula o QR Code e conclui após ~3,4s.
- **Desktop:** layout horizontal com **resumo do pedido sempre visível** na lateral.
- **Benchmark:** aparece como painel lateral (desktop) / bottom-sheet (mobile) que abre sozinho ao concluir, sem competir com o checkout.

## Benchmark de toques

A tela final conta os **toques reais** da sessão e compara com todos os modos
e com o Mercado Livre (4 toques na 2ª compra). Toques = seleções e botões
(não conta digitação de teclado). O caminho recorrente+logado fecha em 3.

## Estrutura

```
src/
  App.tsx                       orquestra etapas, transições e recompensa
  App.css / index.css           design system (tokens da marca)
  checkout/
    CheckoutContext.tsx         estado do pedido + totais + contador de toques
    useCheckoutParams.ts        sincroniza etapa/modo/auth com a URL
    types.ts
    lib/
      orderForm.ts              estado inicial no formato VTEX (troque aqui)
      orderFormAdapter.ts       VTEX orderForm -> modelo interno
      mockData.ts               simulação de CEP e SLAs de frete
      benchmark.ts              toques mínimos por cenário
      feedback.ts               som (Web Audio) + vibração
      celebrate.ts              confete da conclusão
      format.ts / productArt.ts
    components/                 Header, Stepper, Selectable, BottomBar, ...
    steps/                      CartStep, AuthStep, DeliveryStep, PaymentStep, SuccessStep
```

## Princípios de UX aplicados

- **Multi-step recuperável**: cada etapa é uma tela; a URL guarda o progresso.
- **1 ação por etapa**: lista = toque seleciona na hora; CTA fixo embaixo avança.
- **Posições familiares**: mesmo layout a cada compra → pensamento rápido.
- **Pouco scroll**: cabeçalho, progresso e CTA fixos; conteúdo enxuto.
- **Açúcar**: som + vibração a cada seleção/etapa, confete na conclusão
  (tudo respeita `prefers-reduced-motion` e pode ser silenciado no header).
