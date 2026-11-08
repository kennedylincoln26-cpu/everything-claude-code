---
name: futuristic-luxury-design
description: Direção visual futurista e de luxo para interfaces web (sites, landing pages, dashboards, apps e componentes). Fundo escuro profundo, acentos dourado champanhe, vidro fosco, tipografia refinada, brilhos sutis e animações elegantes. Use quando o pedido falar em visual premium, luxuoso, sofisticado, futurista, high-end, tech de luxo, ou quando uma UI precisar parecer cara e moderna.
metadata:
  origin: local
---

# Design Futurista de Luxo

Faz a interface parecer **cara, calma e do futuro**. O luxo vem de contenção:
muito espaço, poucas cores, detalhes precisos e movimento lento. O futurismo vem
de luz, vidro, linhas finas e profundidade.

## When to Use

- O usuário pede um visual "de luxo", "premium", "sofisticado", "futurista",
  "high-end", "elegante" ou "tech".
- Landing pages de produtos caros, portfólios, marcas pessoais, fintech, joias,
  carros, imóveis, cosméticos, SaaS premium e dashboards executivos.
- Uma UI já funciona, mas parece genérica ou "template".

Não use quando o produto pede outro tom (infantil, divertido, utilitário denso),
ou quando o projeto já tem um design system que deve ser respeitado. Nesse caso,
aplique só os princípios, não a paleta.

## How It Works

### 1. Princípios (siga sempre)

1. **Contenção**: no máximo 1 cor de acento. Dourado OU ciano, nunca vários neons.
2. **Espaço é luxo**: seções com `padding` vertical grande (96–160px no desktop).
   Nunca encha a tela.
3. **Escuro profundo, não preto puro**: use `#07080B` a `#0E1015`, nunca `#000`.
4. **Contraste tipográfico**: títulos grandes e finos com tracking negativo;
   rótulos pequenos em caixa alta com tracking largo.
5. **Linhas de 1px** com baixa opacidade no lugar de bordas grossas e sombras pesadas.
6. **Luz como material**: brilhos radiais suaves atrás do conteúdo e reflexos em
   bordas. Nada de sombras pretas duras.
7. **Movimento lento**: 400–900ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Nada de quique.
8. **Um detalhe memorável** por página: um número gigante, uma linha dourada
   animada, um cartão de vidro com reflexo. Só um.

### 2. Tokens de design

Coloque em `:root` e use sempre as variáveis, nunca cores soltas.

```css
:root {
  /* Superfícies */
  --lx-bg: #07080b;
  --lx-bg-elevated: #0e1015;
  --lx-surface-glass: rgba(255, 255, 255, 0.04);
  --lx-line: rgba(255, 255, 255, 0.08);
  --lx-line-strong: rgba(255, 255, 255, 0.16);

  /* Texto */
  --lx-text: #f4f1ea;          /* branco quente, não #fff */
  --lx-text-muted: #a19d94;
  --lx-text-faint: #6b6860;

  /* Acento: dourado champanhe (padrão) */
  --lx-accent: #d4b37a;
  --lx-accent-soft: rgba(212, 179, 122, 0.14);
  --lx-accent-gradient: linear-gradient(135deg, #f3e2b8 0%, #d4b37a 45%, #8f6f3e 100%);

  /* Acento alternativo futurista (troque se a marca for mais "tech") */
  /* --lx-accent: #7fe3ff; --lx-accent-soft: rgba(127, 227, 255, 0.12); */

  /* Raio, blur, movimento */
  --lx-radius: 20px;
  --lx-radius-sm: 12px;
  --lx-blur: 24px;
  --lx-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --lx-dur: 700ms;
}
```

Modo claro (se o projeto precisar): fundo marfim `#F6F3EC`, texto `#14130F`,
mesmo acento dourado escurecido para `#9A7A45` para manter contraste.

### 3. Tipografia

Escolha **um par** e mantenha:

| Estilo | Títulos | Texto |
|---|---|---|
| Luxo clássico + futuro | `Cormorant Garamond` 300–500 | `Inter` 400 |
| Futurista limpo | `Sora` ou `Space Grotesk` 300 | `Inter` 400 |
| Editorial premium | `Playfair Display` 400 | `Manrope` 400 |

```css
.lx-display {
  font-size: clamp(2.75rem, 6vw, 5.5rem);
  font-weight: 300;
  line-height: 1.02;
  letter-spacing: -0.03em;
}
.lx-eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--lx-accent);
}
.lx-body { font-size: 1.0625rem; line-height: 1.7; color: var(--lx-text-muted); max-width: 60ch; }
```

### 4. Componentes base

```css
/* Fundo com luz ambiente */
.lx-page {
  background:
    radial-gradient(60rem 40rem at 80% -10%, var(--lx-accent-soft), transparent 60%),
    radial-gradient(50rem 30rem at -10% 110%, rgba(120, 140, 255, 0.06), transparent 60%),
    var(--lx-bg);
  color: var(--lx-text);
}

/* Cartão de vidro com borda reflexiva */
.lx-card {
  position: relative;
  background: var(--lx-surface-glass);
  backdrop-filter: blur(var(--lx-blur)) saturate(140%);
  border: 1px solid var(--lx-line);
  border-radius: var(--lx-radius);
  padding: 2rem;
  transition: border-color var(--lx-dur) var(--lx-ease), transform var(--lx-dur) var(--lx-ease);
}
.lx-card:hover { border-color: var(--lx-line-strong); transform: translateY(-4px); }

/* Botão principal: dourado com brilho que passa */
.lx-button {
  position: relative;
  overflow: hidden;
  padding: 0.95rem 1.75rem;
  border-radius: 999px;
  background: var(--lx-accent-gradient);
  color: #14110b;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.lx-button::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.45) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 900ms var(--lx-ease);
}
.lx-button:hover::after { transform: translateX(120%); }

/* Botão secundário: contorno fino */
.lx-button-ghost {
  padding: 0.95rem 1.75rem;
  border-radius: 999px;
  border: 1px solid var(--lx-line-strong);
  color: var(--lx-text);
  background: transparent;
}

/* Linha divisória dourada que some nas pontas */
.lx-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--lx-accent), transparent);
  opacity: 0.5;
}

/* Grão sutil para tirar o aspecto "digital chapado" */
.lx-grain::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

### 5. Animação de entrada

```css
.lx-reveal {
  opacity: 0;
  transform: translateY(24px);
  filter: blur(6px);
  transition: opacity 900ms var(--lx-ease), transform 900ms var(--lx-ease), filter 900ms var(--lx-ease);
}
.lx-reveal.is-visible { opacity: 1; transform: none; filter: none; }

@media (prefers-reduced-motion: reduce) {
  .lx-reveal { opacity: 1; transform: none; filter: none; transition: none; }
  .lx-button::after { display: none; }
}
```

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.lx-reveal').forEach((el) => observer.observe(el));
```

Em React, prefira `framer-motion` / `motion` com a mesma curva e duração.

### 6. Tailwind (se o projeto usar)

```js
// tailwind.config.js -> theme.extend
colors: {
  lx: {
    bg: '#07080b', elevated: '#0e1015', text: '#f4f1ea',
    muted: '#a19d94', accent: '#d4b37a',
  },
},
fontFamily: {
  display: ['"Cormorant Garamond"', 'serif'],
  sans: ['Inter', 'sans-serif'],
},
transitionTimingFunction: { lx: 'cubic-bezier(0.22, 1, 0.36, 1)' },
letterSpacing: { eyebrow: '0.28em' },
```

## Examples

### Hero de landing page

```html
<section class="lx-page lx-grain" style="padding: 160px 24px;">
  <div style="max-width: 1120px; margin: 0 auto;">
    <p class="lx-eyebrow lx-reveal">Coleção 2027</p>
    <h1 class="lx-display lx-reveal">O futuro,<br>feito à mão.</h1>
    <p class="lx-body lx-reveal">Tecnologia invisível, acabamento impecável.</p>
    <div class="lx-reveal" style="display:flex; gap:12px; margin-top:40px;">
      <a class="lx-button" href="#reservar">Reservar</a>
      <a class="lx-button-ghost" href="#conhecer">Conhecer</a>
    </div>
  </div>
</section>
```

### Cartão de métrica (dashboard executivo)

```html
<article class="lx-card">
  <p class="lx-eyebrow">Receita do trimestre</p>
  <p class="lx-display" style="font-size: 3rem;">R$ 4,2 mi</p>
  <div class="lx-divider" style="margin: 20px 0;"></div>
  <p class="lx-body">+18% em relação ao trimestre anterior</p>
</article>
```

## Evite (deixa com cara de barato)

- Vários neons ao mesmo tempo, gradientes arco-íris, roxo + rosa + ciano juntos.
- Sombras pretas fortes, bordas grossas, cantos totalmente retos misturados com redondos.
- Texto branco puro `#fff` em fundo preto puro `#000`.
- Animações rápidas, com quique ou girando.
- Ícones coloridos e cheios; use ícones de linha fina (Lucide, Phosphor "light").
- Fotos de banco de imagem genéricas; prefira fotos escuras, com luz lateral.
- Excesso de vidro: no máximo 1–2 camadas de `backdrop-filter` por tela (pesa no celular).

## Checklist antes de entregar

- [ ] Só uma cor de acento, aplicada com moderação.
- [ ] Contraste do texto ≥ 4.5:1 (dourado sobre escuro passa; texto `--lx-text-faint` só para detalhes).
- [ ] Tipografia com um único par de fontes.
- [ ] Espaçamento vertical generoso entre seções.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] Testado em largura de celular (360px) sem rolagem horizontal.
- [ ] Um detalhe memorável identificável, e não cinco.
