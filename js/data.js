/* Conteúdo editável do site.
   FOTOS: salve a foto de cada palestrante em img/palestrantes/ (retrato, de preferência 800×1000)
   e preencha "foto" com o nome do arquivo, como sugerido no comentário de cada linha (ex.: foto: "icaro-gaspar.jpg").
   Enquanto "foto" estiver vazio, o card mostra as iniciais e nenhuma imagem é buscada.
   SLIDES: para trocar uma maquete por um slide real, exporte o slide como imagem 16:9
   (ex.: 1920×1080) em img/slides/ e preencha "img" no item correspondente. */
window.BRITTO = {
  palestrantes: [
    { nome: "Ícaro Gaspar", papel: "CEO All In Consultoria · Mentor All In Club", palestra: "All In Faixa Preta", foto: "" /* icaro-gaspar.jpg */ },
    { nome: "Djalma Neto", papel: "Founder Sushi Ponta Negra, Joya Sushi e Mori Izakaya", palestra: "História e bastidores do Sushi Ponta Negra", foto: "" /* djalma-neto.jpg */ },
    { nome: "Luiz Eduardo Leal", papel: "Co-founder RUMO MKT", palestra: "IA gera vendas e eu posso provar", foto: "" /* luiz-eduardo-leal.jpg */ },
    { nome: "Jacqueline Guedes", papel: "Founder ENPOWER Palestras de Sucesso e Clube das CEOs", foto: "" /* jacqueline-guedes.jpg */ },
    { nome: "Rafael Amorim", papel: "CSO Pará Cabos · Host Wow Cast", foto: "" /* rafael-amorim.jpg */ },
    { nome: "Ricardo Feitoza", papel: "Founder Mr. Feitoza Barbearia · Mentor GDV", foto: "" /* ricardo-feitoza.jpg */ },
    { nome: "Marcus Evangelista", papel: "CEO Exithus Consultoria", palestra: "Domine as redes sociais e venda mais", foto: "" /* marcus-evangelista.jpg */ },
    { nome: "Luis Cunha", papel: "CSO All In Consultoria · Mentor All In Club", foto: "" /* luis-cunha.jpg */ },
    { nome: "Roberta Gaspar", papel: "Mentora All In Club", foto: "" /* roberta-gaspar.jpg */ },
    { nome: "Marcelo Marcene", papel: "Multiempresário · Kopenhagen, Hinode, MaisÓtica", foto: "" /* marcelo-marcene.jpg */ },
    { nome: "Rodrigo Omena", papel: "Advogado · Redes sociais e tráfego para advogados", palestra: "O advogado que não vende está desaparecido", foto: "" /* rodrigo-omena.jpg */ },
    { nome: "Angel", papel: "Barbeiro · Método PDV, Performance de Verdade", foto: "" /* angel.jpg */ },
    { nome: "Juan Campos", papel: "Franqueado Medprev Manaus", palestra: "Pitch Medprev Manaus", foto: "" /* juan-campos.jpg */ }
  ],

  /* "tema" escolhe a maquete desenhada em css/style.css (.sl-<tema>) */
  slides: [
    { cliente: "Rodrigo Omena", titulo: "O advogado que não vende está desaparecido", tema: "crime", img: "" },
    { cliente: "Grupo Gerber · 25 anos", titulo: "Abertura De Volta para o Futuro", tema: "futuro", img: "" },
    { cliente: "Luiz Eduardo Leal", titulo: "IA gera vendas e eu posso provar", tema: "ia", img: "" },
    { cliente: "Ícaro Gaspar", titulo: "All In Faixa Preta", tema: "faixa", img: "" },
    { cliente: "Djalma Neto", titulo: "História e bastidores do Sushi Ponta Negra", tema: "sushi", img: "" },
    { cliente: "Marcus Evangelista", titulo: "Domine as redes sociais e venda mais", tema: "redes", img: "" },
    { cliente: "Juan Campos · Medprev Manaus", titulo: "Pitch para franqueado", tema: "pitch", img: "" }
  ]
};
