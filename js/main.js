(function () {
  var WA = "5592991218255";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function waLink(m) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(m); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waLink(a.getAttribute("data-wa")); a.target = "_blank"; a.rel = "noopener"; });
  document.querySelectorAll("[data-scroll]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = document.getElementById(b.getAttribute("data-scroll"));
      if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- cidades ---------- */
  var cid = ["Manaus", "São Paulo", "Salvador", "Japão", "China"], ct = document.getElementById("cidades");
  for (var r = 0; r < 4; r++) cid.forEach(function (c) { var s = document.createElement("span"); s.textContent = c; ct.appendChild(s); });

  /* ---------- palestrantes ---------- */
  var spk = [
    ["Ícaro Gaspar", "CEO All In Consultoria · Mentor All In Club"],
    ["Djalma Neto", "Founder Sushi Ponta Negra, Joya Sushi e Mori Izakaya"],
    ["Luiz Eduardo Leal", "Co-founder RUMO MKT"],
    ["Jacqueline Guedes", "Founder ENPOWER Palestras de Sucesso e Clube das CEOs"],
    ["Rafael Amorim", "CSO Pará Cabos · Host Wow Cast"],
    ["Ricardo Feitoza", "Founder Mr. Feitoza Barbearia · Mentor GDV"],
    ["Marcus Evangelista", "CEO Exithus Consultoria"],
    ["Luis Cunha", "CSO All In Consultoria · Mentor All In Club"],
    ["Roberta Gaspar", "Mentora All In Club"],
    ["Marcelo Marcene", "Multiempresário · Kopenhagen, Hinode, MaisÓtica"],
    ["Rodrigo Omena", "Advogado · Redes sociais e tráfego para advogados"],
    ["Angel", "Barbeiro · Método PDV, Performance de Verdade"],
    ["Juan Campos", "Franqueado Medprev Manaus"]
  ];
  var sp = document.getElementById("speakers");
  spk.forEach(function (p, i) {
    var ini = p[0].split(" ").slice(0, 2).map(function (w) { return w[0]; }).join("");
    var d = document.createElement("div");
    d.className = "spk glow";
    d.setAttribute("data-reveal", "");
    d.style.setProperty("--d", (i % 4) * 0.06 + "s");
    d.innerHTML = '<span class="ini" aria-hidden="true"><span>' + esc(ini) + '</span></span><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span>';
    sp.appendChild(d);
  });

  /* ---------- títulos divididos em palavras ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + esc(w) + '</span></span>';
    }).join(" ");
  });

  /* ---------- revelação no scroll ---------- */
  // atraso escalonado para irmãos revelados juntos
  document.querySelectorAll(".dor,.ida,.cnv,.steps,.formatos,.talks,.cases,.nums").forEach(function (g) {
    Array.prototype.forEach.call(g.querySelectorAll("[data-reveal]"), function (el, i) { el.style.setProperty("--d", i * 0.09 + "s"); });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      var c = e.target.querySelector("[data-count]");
      if (c) countUp(c);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

  function countUp(el) {
    var to = +el.getAttribute("data-count"), pre = el.getAttribute("data-prefix") || "";
    if (reduce) { el.textContent = pre + to; return; }
    var t0 = performance.now(), dur = 1400;
    (function step(now) {
      var t = clamp((now - t0) / dur, 0, 1);
      var v = Math.round(to * (1 - Math.pow(1 - t, 4)));
      el.textContent = pre + v;
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- hover: inclinação 3D e luz que segue o mouse ---------- */
  if (fine && !reduce) {
    document.querySelectorAll(".glow").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var b = el.getBoundingClientRect();
        var x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
        el.style.setProperty("--mx", x * 100 + "%");
        el.style.setProperty("--my", y * 100 + "%");
        if (el.classList.contains("tilt")) {
          el.classList.add("hovering");
          el.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg");
          el.style.setProperty("--rx", ((0.5 - y) * 10).toFixed(2) + "deg");
        }
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("hovering");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });

    /* botões magnéticos */
    document.querySelectorAll(".magnet").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var b = el.getBoundingClientRect();
        var x = e.clientX - (b.left + b.width / 2), y = e.clientY - (b.top + b.height / 2);
        el.style.transform = "translate(" + (x * 0.25).toFixed(1) + "px," + (y * 0.35).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });

    /* luz ambiente que acompanha o cursor */
    var cur = document.getElementById("cursor");
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add("on"); }, { passive: true });
    document.addEventListener("pointerleave", function () { cur.classList.remove("on"); });
    (function loop() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      cur.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- cena de abertura: textos sincronizados com a câmera ---------- */
  var beats = Array.prototype.map.call(document.querySelectorAll(".beat"), function (el) {
    return { el: el, a: +el.getAttribute("data-in"), b: +el.getAttribute("data-out") };
  });
  var hint = document.querySelector(".scroll-hint"), hud = document.querySelector(".stage-hud");
  var hudAto = document.getElementById("hud-ato"), hudPct = document.getElementById("hud-pct");
  var atoAtual = "";
  if (window.BrittoStage) {
    window.BrittoStage.onProgress = function (p) {
      beats.forEach(function (bt) {
        var fade = 0.04;
        var o = Math.min(clamp((p - bt.a) / fade + (bt.a === 0 ? 1 : 0), 0, 1), clamp((bt.b - p) / fade, 0, 1));
        bt.el.style.opacity = o.toFixed(3);
        bt.el.classList.toggle("on", o > 0.01);
        var y = (1 - o) * (p < bt.a + fade ? 30 : -30);
        bt.el.firstElementChild.style.transform = "translateY(" + y.toFixed(1) + "px)";
      });
      hint.style.opacity = p < 0.04 ? 1 : 0;
      hud.style.opacity = p > 0.7 ? 0 : 1;
      var ato = p < 0.45 ? "Ato I · Impacto" : p < 0.72 ? "Ato II · Direção" : "Ato III · Apoteose";
      if (ato !== atoAtual) { hudAto.textContent = ato; atoAtual = ato; }
      hudPct.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
    };
  }

  /* ---------- scroll: progresso, header, parallax, asterisco ---------- */
  var bar = document.getElementById("progress");
  var header = document.querySelector("header.top");
  var stage = document.getElementById("stage");
  var parallax = document.querySelectorAll("[data-parallax]");
  var apoAst = document.getElementById("apo-ast");
  var lastY = scrollY, ticking = false;
  var navBtns = Array.prototype.map.call(document.querySelectorAll("nav.menu button[data-scroll]"), function (b) {
    return { b: b, s: document.getElementById(b.getAttribute("data-scroll")) };
  });

  function onScroll() {
    ticking = false;
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0).toFixed(4) + ")";
    var pastStage = y > stage.offsetHeight - innerHeight;
    header.classList.toggle("solid", pastStage);
    header.classList.toggle("hide", pastStage && y > lastY + 4 && y > stage.offsetHeight);
    if (y < lastY - 4) header.classList.remove("hide");
    lastY = y;
    if (!reduce) {
      parallax.forEach(function (el) {
        var b = el.parentElement.getBoundingClientRect();
        var c = b.top + b.height / 2 - innerHeight / 2;
        el.style.setProperty("--py", clamp(-c * +el.getAttribute("data-parallax"), -24, 24).toFixed(1) + "px");
      });
      if (apoAst) {
        var ab = apoAst.parentElement.getBoundingClientRect();
        apoAst.style.setProperty("--rot", (ab.top * 0.15).toFixed(1) + "deg");
      }
    }
    var cur = null;
    navBtns.forEach(function (n) { if (n.s && n.s.getBoundingClientRect().top < innerHeight * 0.4) cur = n; });
    navBtns.forEach(function (n) { n.b.classList.toggle("on", n === cur && !!cur && cur.s.getBoundingClientRect().bottom > 0); });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Matriz de Genialidade (demonstração) ---------- */
  var zonas = {
    E: { nome: "Estrategista", txt: "Você enxerga o todo e organiza caminhos. As pessoas te procuram para decidir.", sug: ["Mentoria", "Consultoria", "Palestra de liderança"] },
    C: { nome: "Comunicador", txt: "Você conecta pessoas pela fala e pelas histórias. Seu repertório nasce no palco.", sug: ["Palestra", "Imersão", "Treinamento"] },
    T: { nome: "Técnico", txt: "Você domina o como fazer. Seu conhecimento vira método passo a passo.", sug: ["Curso", "Workshop", "Mentoria técnica"] },
    H: { nome: "Inspirador", txt: "A sua história é o conteúdo. Sua trajetória mostra que é possível.", sug: ["Palestra de história", "Livro", "Evento autoral"] }
  };
  var perguntas = [
    { p: "Sobre o que as pessoas mais pedem a sua opinião?", o: [["Decisões de negócio e gestão", "E"], ["Como falar, vender e convencer", "C"], ["Detalhes da minha área técnica", "T"], ["Como eu cheguei até aqui", "H"]] },
    { p: "Em uma reunião, qual é o seu papel natural?", o: [["Definir a direção", "E"], ["Animar e engajar o grupo", "C"], ["Resolver o problema prático", "T"], ["Contar a experiência que já vivi", "H"]] },
    { p: "Qual elogio você mais escuta?", o: [["Você pensa lá na frente", "E"], ["Você fala muito bem", "C"], ["Você sabe tudo disso", "T"], ["Sua história me inspira", "H"]] },
    { p: "Se fosse ensinar amanhã, qual formato te atrai?", o: [["Mentoria com poucos empresários", "E"], ["Palestra para um auditório cheio", "C"], ["Curso com aulas práticas", "T"], ["Contar minha trajetória em um evento", "H"]] }
  ];
  var quiz = document.getElementById("quiz"), idx = 0, pts = { E: 0, C: 0, T: 0, H: 0 };
  function render() {
    if (idx < perguntas.length) {
      var q = perguntas[idx];
      var h = '<span class="q">Pergunta ' + (idx + 1) + ' de ' + perguntas.length + '</span><span class="pergunta">' + esc(q.p) + '</span><div class="opts">';
      q.o.forEach(function (o) { h += '<button type="button" data-z="' + o[1] + '">' + esc(o[0]) + '</button>'; });
      h += '</div><div class="bar"><i style="width:' + (idx / perguntas.length * 100) + '%"></i></div>';
      quiz.innerHTML = h;
      quiz.querySelectorAll("button[data-z]").forEach(function (b) { b.addEventListener("click", function () { pts[b.getAttribute("data-z")]++; idx++; render(); }); });
    } else {
      var top = "E"; Object.keys(pts).forEach(function (k) { if (pts[k] > pts[top]) top = k; });
      var z = zonas[top];
      var msg = "Olá! Fiz a demonstração da Matriz de Genialidade no site da BRITTO* GROUP e meu resultado foi " + z.nome + ". Quero fazer a Matriz completa.";
      quiz.innerHTML = '<span class="q">Sua zona de genialidade</span><span class="res-zona">' + esc(z.nome) + '</span><p class="res-txt">' + esc(z.txt) + '</p><div class="res-sug">' + z.sug.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join("") + '</div><div class="btns" style="margin-top:auto"><a class="btn" target="_blank" rel="noopener" href="' + waLink(msg) + '">Fazer a Matriz completa <span class="arr">→</span></a><button type="button" class="btn ghost" id="refazer">Refazer</button></div>';
      document.getElementById("refazer").addEventListener("click", function () { idx = 0; pts = { E: 0, C: 0, T: 0, H: 0 }; render(); });
    }
  }
  render();
})();
