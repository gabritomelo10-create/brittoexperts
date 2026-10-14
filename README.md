# BRITTO* GROUP — site interativo

Site estático (HTML + CSS + JS puro, sem build e sem dependências), baseado no artefato da BRITTO* Experts.

## Abertura em 3D (scroll)

`js/stage.js` desenha em `<canvas>` uma cena em perspectiva controlada pelo scroll:

1. **Plateia cheia** vista do palco, com feixes de luz e celulares acesos.
2. A **câmera recua**, atravessa o palestrante e revela a **silhueta escrita VOCÊ** sob o foco de luz.
3. **Atrás dele**, pendurada sobre a plateia, surge a frase **NÃO DESPERDICE O POTENCIAL DA SUA PRÓXIMA APRESENTAÇÃO.** e a plateia se agita.

O mouse move levemente a câmera (parallax). Respeita `prefers-reduced-motion`.

## Animações no resto da página

- Revelação no scroll (títulos palavra por palavra, cards em cascata, contadores).
- Cards com inclinação 3D e luz que segue o mouse; botões magnéticos.
- Linhas de palestras com preenchimento verde no hover; iniciais que giram.
- Barra de progresso, header que se esconde ao rolar, menu que marca a seção atual.

## Rodar localmente

```bash
npx http-server -p 8080   # ou qualquer servidor estático
```

Abra `http://localhost:8080`. Para publicar, basta subir a pasta em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel).
