# Felipe Hub — Design System

Sistema de design híbrido **Apple no chrome, Linear no conteúdo**.

## Princípio fundamental

> Quanto mais o usuário vai **DECIDIR/AGIR**, mais denso (Linear).
> Quanto mais ele vai **LER/ENTENDER**, mais respiro (Apple).

## Identidade visual

- **Estética:** Apple/Things calma no chrome + Linear denso nos dados
- **Modo:** Claro padrão, escuro futuro (não implementar ainda)
- **Cor de marca:** Grafite (#1E293B) — premium sem cor de marca tradicional
- **Tipografia:** Inter (já no projeto)

## Paleta de cores

### Neutros (base do sistema)

| Token | Hex | Uso |
|-------|-----|-----|
| `bg-app` | #FAFAFA | Fundo da página |
| `bg-surface` | #FFFFFF | Cards, modais, tabelas |
| `bg-subtle` | #F4F4F5 | Hover sutil, seções |
| `bg-muted` | #E4E4E7 | Backgrounds secundários |
| `border-default` | #E4E4E7 | Bordas padrão |
| `border-strong` | #D4D4D8 | Bordas em foco/hover |
| `text-primary` | #18181B | Textos principais |
| `text-secondary` | #52525B | Subtítulos, labels |
| `text-tertiary` | #A1A1AA | Texto auxiliar, placeholders |
| `text-disabled` | #D4D4D8 | Estados desabilitados |

### Cor de marca (uso comedido)

| Token | Hex | Uso |
|-------|-----|-----|
| `brand` | #1E293B | Botão primário, links importantes, foco |
| `brand-hover` | #0F172A | Hover do brand |
| `brand-subtle` | #F1F5F9 | Background sutil quando algo é destacado |

### Cores semânticas (sutis, não berrantes)

| Token | Hex | Uso |
|-------|-----|-----|
| `success` | #059669 | Valores positivos, confirmações |
| `success-subtle` | #ECFDF5 | Background de sucesso |
| `warning` | #D97706 | Avisos, atenção |
| `warning-subtle` | #FFFBEB | Background de aviso |
| `danger` | #DC2626 | Erros, valores negativos críticos |
| `danger-subtle` | #FEF2F2 | Background de erro |
| `info` | #2563EB | Informativo (azul, raramente usar) |
| `info-subtle` | #EFF6FF | Background informativo |

**REGRA DE OURO:** valores monetários positivos usam `success`, negativos
usam `danger`. NÃO use cores semânticas pra outras coisas — o sistema é
quase monocromático de propósito.

## Tipografia

Família: `Inter`, fallback `system-ui, -apple-system, sans-serif`

### Escala (base 16px = 1rem)

| Token | Tamanho | Peso | Uso |
|-------|---------|------|-----|
| `text-display` | 32px / 2rem | 600 | Títulos de tela (H1) |
| `text-title` | 24px / 1.5rem | 600 | Títulos de seção (H2) |
| `text-subtitle` | 18px / 1.125rem | 500 | Subtítulos (H3) |
| `text-body` | 14px / 0.875rem | 400 | Corpo de texto padrão |
| `text-body-strong` | 14px / 0.875rem | 500 | Ênfase em corpo |
| `text-small` | 13px / 0.8125rem | 400 | Auxiliar, metadados |
| `text-tiny` | 12px / 0.75rem | 400 | Micro labels, badges |

### Number (valores monetários)

Sempre `font-feature-settings: 'tnum'` (tabular-nums) pra alinhamento
em colunas.

## Espaçamento

Sistema baseado em **4px** (tailwind padrão). Tokens semânticos:

| Token | Valor | Uso |
|-------|-------|-----|
| `space-tight` | 8px | Entre items densos (Linear) |
| `space-default` | 12px | Espaçamento padrão entre items |
| `space-comfortable` | 16px | Entre seções pequenas |
| `space-relaxed` | 24px | Entre seções (Apple) |
| `space-loose` | 32px | Headers, breathing room |
| `space-section` | 48px | Entre grandes blocos |

### Padding em containers

- **Apple chrome (header, modal, empty):** `p-6` (24px) ou `p-8` (32px)
- **Linear conteúdo (tabela, kanban card):** `p-3` (12px) ou `p-4` (16px)

## Border radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 6px | Badges, chips pequenos |
| `radius-default` | 8px | Botões, inputs |
| `radius-md` | 10px | Cards de conteúdo (Linear) |
| `radius-lg` | 12px | Cards principais, modais |
| `radius-xl` | 16px | Containers grandes (Apple chrome) |
| `radius-full` | 9999px | Avatares, pills |

## Sombras (sutis, quase imperceptíveis)

```css
shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.04);
shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04);
shadow-md:  0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04);
shadow-lg:  0 8px 16px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04);
```

`shadow-xs` em botões primários, `shadow-sm` em hover de cards Linear,
`shadow-md` em popovers/dropdowns, `shadow-lg` em modais.

## Botões

**Variantes:**

```
Primary:    bg-brand text-white hover:bg-brand-hover
            radius-default px-4 py-2 text-body-strong
            shadow-xs
Secondary:  bg-bg-surface text-text-primary border-default
            hover:bg-bg-subtle hover:border-strong
            radius-default px-4 py-2 text-body-strong
Ghost:      bg-transparent text-text-secondary
            hover:bg-bg-subtle hover:text-text-primary
            radius-default px-3 py-1.5 text-body
Destructive: bg-danger text-white hover:bg-red-700
            radius-default px-4 py-2 text-body-strong
            (USAR SÓ EM AÇÕES IRREVERSÍVEIS)
```

Tamanhos: `sm` (px-3 py-1.5 text-small), `default` (px-4 py-2 text-body),
`lg` (px-6 py-3 text-subtitle).

### Inputs

```
Default:  bg-bg-surface border-default radius-default
          px-3 py-2 text-body
          focus: border-brand ring-2 ring-brand/10
Error:    border-danger ring-2 ring-danger/10
          (mensagem de erro: text-small text-danger mt-1)
Disabled: bg-bg-subtle text-text-disabled cursor-not-allowed
```

Sempre tem `<label>` acima com `text-small text-text-secondary`.

### Cards

**Apple Card (chrome, conteúdo leve):**
```
bg-bg-surface border-default radius-xl p-6
hover: border-strong (sem shadow)
```

**Linear Card (kanban, denso):**
```
bg-bg-surface border-default radius-md p-4
hover: shadow-sm border-strong
```

### Tabelas (Linear, denso)

```
Container: bg-bg-surface border-default radius-lg overflow-hidden
Row:       border-b border-default last:border-0
           hover:bg-bg-subtle
           px-4 py-3 (denso) ou px-6 py-4 (confortável)
Cell:      text-body
Header:    text-small text-text-secondary uppercase tracking-wide
           bg-bg-subtle border-b border-strong
           px-4 py-2.5
```

Valor monetário: `text-body tabular-nums text-right`.
Valor positivo: `text-success`. Valor negativo: `text-danger`.

### Modais

```
Backdrop:   bg-black/40 (não black/50, sutil)
Container:  bg-bg-surface radius-xl shadow-lg
            max-w-2xl mx-auto p-8 (Apple chrome)
Animation:  fade + scale 0.95 → 1, 200ms ease-out
```

Header do modal: `text-title` + botão X no canto superior direito
(ghost variant, ícone X de 20px).

Rodapé: ações alinhadas à direita, secundário antes do primário.

### Sidebar

```
Container: bg-bg-app border-r border-default w-64
Item:      px-4 py-2.5 text-body radius-default
           hover:bg-bg-subtle
           active: bg-brand-subtle text-brand font-medium
Icon:      20px, text-text-secondary (active: text-brand)
Section:   text-tiny uppercase tracking-wider text-text-tertiary
           px-4 py-2 mt-6
```

### Empty states (Apple, generoso)

```
Container: flex flex-col items-center justify-center py-16 px-6
Icon:      64px, text-text-tertiary (CheckSquare, Inbox, etc.)
Title:     text-subtitle text-text-primary mt-4
Subtitle:  text-body text-text-secondary mt-2 max-w-md text-center
Action:    botão Primary mt-6
```

### Loading states

- **Skeleton:** `bg-bg-muted rounded animate-pulse` (não usar spinner
  grande no meio da página)
- **Spinner inline:** 16-20px, `text-text-tertiary`, animação suave
- **Botão loading:** spinner branco 14px à esquerda do texto

## Animações

Duração padrão: **200ms** (chrome) e **150ms** (conteúdo denso).
Easing padrão: `ease-out` (entrada) e `ease-in` (saída).

Transições nunca passam de **300ms** — passa disso, fica lento e datado.
```
hover de botões:        150ms ease-out
abrir/fechar modal:     200ms ease-out
fade de tooltips:       150ms
movimento de drag:      0ms (instantâneo durante drag)
```

## Ícones

- **Biblioteca única:** `lucide-react`
- **Tamanhos padrão:** 16px (small), 20px (default), 24px (large)
- **Stroke width:** 1.5 (mais elegante que 2)
- **NUNCA misturar com emoji** em UI funcional. Emojis só em conteúdo
  do usuário (notas, descrições) ou dashboards descontraídos.

## Mobile (responsividade)

Breakpoints (Tailwind padrão):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Regras:**
- Touch targets mínimos: 44x44px
- Modal em mobile: full-screen com slide-up
- Tabelas densas em mobile: viram cards empilhados
- Sidebar em mobile: drawer (slide da esquerda)
- Apple chrome em mobile: ainda mais espaçoso (não comprimir)
- Linear conteúdo em mobile: aceita densidade

## Atalhos de teclado (Linear-style)

Globais:
- `Cmd+K` / `Ctrl+K` — busca/comando rápido (futuro)
- `Esc` — fecha modal/popover/dropdown

Por tela:
- `N` — novo item da tela atual
- `/` — focar busca
- `?` — mostrar atalhos disponíveis
- Setas — navegar lista
- Enter — abrir/editar item selecionado

## Acessibilidade (não-negociável)

- Contraste mínimo 4.5:1 em texto normal, 3:1 em texto grande
- Focus ring visível em **todos** elementos interativos
  (`ring-2 ring-brand/30 ring-offset-2`)
- `aria-label` em botões só com ícone
- Modais: `role="dialog"`, foco no primeiro input ao abrir, Esc fecha
- Tabelas: `role="table"`, headers com `<th>`
- Forms: cada input tem `<label>` ou `aria-label`

## Onde aplicar Apple vs Linear (referência rápida)

| Elemento | Estilo |
|----------|--------|
| Header de página | Apple |
| Sidebar | Apple |
| Modal | Apple |
| Empty state | Apple |
| Cards de resumo (4 KPIs no topo) | Apple |
| Breadcrumbs | Apple |
| Botões grandes de CTA | Apple |
| Tabela de transações financeiras | Linear |
| Lista de tarefas | Linear |
| Kanban board | Linear |
| Lista de contatos | Linear |
| Lista de emails | Linear |
| Tabela de lançamentos | Linear |
| Inputs em formulário simples | Apple |
| Inputs em edição inline (tabela) | Linear |
| Cards de aba "Quem Sou Eu" | Apple |
| Cards de Kanban | Linear |
