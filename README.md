# BRITTO* GROUP — site interativo

Site estático (HTML + CSS + JS puro, sem build e sem dependências), baseado no artefato da BRITTO* Experts.

## Abertura em 3D (scroll)

`js/stage.js` desenha em `<canvas>` uma cena em perspectiva controlada pelo scroll:

1. **Plateia cheia** vista do palco, com feixes de luz e celulares acesos.
2. A **câmera recua**, atravessa o palestrante e revela a **silhueta escrita VOCÊ** sob o foco de luz.
3. **Atrás dele**, pendurada sobre a plateia, surge a frase **NÃO DESPERDICE O POTENCIAL DA SUA PRÓXIMA APRESENTAÇÃO.** e a plateia se agita.

O mouse move levemente a câmera (parallax). Respeita `prefers-reduced-motion`.

## Palestrantes (logo após a abertura)

Trilho horizontal que anda com o scroll no desktop (no celular, deslize para o lado). Os cards giram de leve e endireitam no centro; no hover a foto ganha cor.

**Fotos:** salve cada foto em `img/palestrantes/<nome>.jpg` (retrato, ~800×1000). Os nomes dos arquivos estão em `js/data.js` (ex.: `icaro-gaspar.jpg`). Enquanto a foto não existir, o card mostra as iniciais.

## Apresentações (MacBook 3D)

Ao rolar, um MacBook entra girando e abre a tampa com um brilho verde atrás, liga com a logo BRITTO* e passa as apresentações. Os slides atuais são maquetes em HTML dos projetos reais. Para usar os slides de verdade, exporte cada um como imagem 16:9 em `img/slides/` e preencha o campo `img` em `js/data.js`.

## Quem é Gabriel Brito

Retrato que acende com um foco de luz conforme a seção entra na tela, com o nome correndo em letras gigantes ao fundo. Retrato em `img/gabriel-brito.jpg` (800×1000) e faixa de fotos "Em cena" em `img/gabriel/`, que desliza com o scroll. O texto fica em `index.html`, na seção `id="gabriel"`.

## Método C.N.V. (scroll)

`js/flow.js`: uma ideia feita de partículas viaja pela tela, absorve palavras do repertório (Conteúdo), vira um roteiro (Narrativa), depois um slide (Visual) e por fim a silhueta de quem apresenta, brilhando. O texto ao lado acompanha a mentoria ativa.

## Para cada tipo de palco

Quatro painéis com cenas animadas em CSS (palestra, pitch, abertura/convenção, espetáculo). O painel em foco se abre no hover, no clique ou no teclado.

## Animações no resto da página

- Revelação no scroll (títulos palavra por palavra, cards em cascata, contadores).
- Cards com inclinação 3D e luz que segue o mouse; botões magnéticos.
- Linhas de palestras com preenchimento verde no hover; iniciais que giram.
- Barra de progresso, header que se esconde ao rolar, menu que marca a seção atual.

## Propostas

`proposta/otorhinus/` é a proposta interativa do rebranding do ecossistema Otorhinus (Dr. Jandrio Campos, Dra. Mônica Pinheiro e Otorhinus Manaus). A página é independente, com CSS e JS no próprio `index.html`, e o PDF original fica ao lado para download. Abra em `/proposta/otorhinus/`. Ela não aparece em buscadores (`noindex`).

## Rodar localmente

```bash
npx http-server -p 8080   # ou qualquer servidor estático
```

Abra `http://localhost:8080`. Para publicar, basta subir a pasta em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel).
