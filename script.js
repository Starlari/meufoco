const $html = document.querySelector('html');
const $checkbox = document.querySelector('#switch');

$checkbox.addEventListener('change', function () {
  $html.classList.toggle('dark-mode')
})

/* em memória, já que não estamos trabalhando com banco de dados/back end */
let state = {
  profile: null,
  routine: [],
  chaos: [],
  sessions: [],
  pendingFailTaskId: null,
  selectedDifficulty: [],
  quoteIndex: null
};
let idCounter = 1;

const QUOTES = [
  "Você não precisa terminar hoje. Só precisa começar.",
  "5 minutos de foco valem mais que 1 hora de culpa.",
  "Rotina possível é melhor que rotina perfeita.",
  "Cada página lida é um degrau. Ninguém sobe escada de uma vez.",
  "Cansaço é sinal pra ajustar o ritmo, não pra desistir.",
  "Seu eu do futuro agradece o que você estuda hoje, mesmo pouco.",
  "Constância vence intensidade. Sempre.",
  "Errar a questão é parte de aprender a matéria.",
  "Você já chegou até aqui organizando sua rotina. Isso já é foco.",
  "Comece pequeno. O tamanho do primeiro passo não importa.",
  "Foco não é fazer tudo. É fazer o que importa agora.",
  "Descansar também faz parte do plano de estudos."
];

const RECS = {
  "Matemática": [
    {emoji:"🎥", tipo:"Videoaula", nome:"Aula em vídeo sobre o tema", desc:"Bom pra entender o passo a passo antes de praticar."},
    {emoji:"📘", tipo:"Apostila", nome:"Resumo teórico + exemplos resolvidos", desc:"Ótimo pra consultar fórmulas rapidamente."},
    {emoji:"📝", tipo:"Lista de exercícios", nome:"Questões nível básico ao avançado", desc:"Pratique do mais fácil ao mais difícil."},
    {emoji:"🧩", tipo:"Quiz", nome:"Perguntas rápidas de fixação", desc:"Ideal pra revisão de última hora."}
  ],
  "Português": [
    {emoji:"🎥", tipo:"Videoaula", nome:"Gramática aplicada com exemplos", desc:"Ajuda a fixar regras com contexto real."},
    {emoji:"🎧", tipo:"Podcast", nome:"Episódio sobre interpretação de texto", desc:"Bom pra estudar enquanto se desloca."},
    {emoji:"📝", tipo:"Lista de exercícios", nome:"Questões de interpretação e gramática", desc:"Pratique leitura crítica."}
  ],
  "Química": [
    {emoji:"🎥", tipo:"Videoaula", nome:"Explicação visual da reação/conceito", desc:"Química rende muito com visualização."},
    {emoji:"📘", tipo:"Apostila", nome:"Resumo com tabelas e exemplos", desc:"Ótima referência rápida de fórmulas."},
    {emoji:"🧩", tipo:"Quiz", nome:"Fixação rápida de conceitos", desc:"Ideal antes da prova."},
    {emoji:"📝", tipo:"Lista de exercícios", nome:"Exercícios comentados", desc:"Pratique e confira a resolução."}
  ],
  "Física": [
    {emoji:"🎥", tipo:"Videoaula", nome:"Demonstração do fenômeno físico", desc:"Facilita entender antes de calcular."},
    {emoji:"📘", tipo:"Apostila", nome:"Fórmulas e exemplos práticos", desc:"Bom pra consulta rápida."},
    {emoji:"📝", tipo:"Lista de exercícios", nome:"Questões com grau de dificuldade crescente", desc:"Treine o raciocínio aos poucos."}
  ],
  "Biologia": [
    {emoji:"🎥", tipo:"Videoaula", nome:"Aula ilustrada do processo biológico", desc:"Imagens ajudam muito na retenção."},
    {emoji:"🎧", tipo:"Podcast", nome:"Episódio sobre o tema", desc:"Reforça o conteúdo de forma leve."},
    {emoji:"🧩", tipo:"Quiz", nome:"Perguntas de fixação por sistema/tema", desc:"Ótimo pra revisão."}
  ],
  "História": [
    {emoji:"🎥", tipo:"Videoaula", nome:"Linha do tempo comentada", desc:"Ajuda a situar os fatos no contexto."},
    {emoji:"🎧", tipo:"Podcast", nome:"Discussão sobre o período histórico", desc:"Bom pra fixar narrativa e causas."},
    {emoji:"📝", tipo:"Lista de exercícios", nome:"Questões contextualizadas", desc:"Pratique interpretação histórica."}
  ],
  "Geografia": [
    {emoji:"🎥", tipo:"Videoaula", nome:"Aula com mapas e dados atuais", desc:"Visualizar o espaço ajuda a fixar."},
    {emoji:"📘", tipo:"Apostila", nome:"Resumo com gráficos e mapas", desc:"Boa referência de consulta."},
    {emoji:"🧩", tipo:"Quiz", nome:"Fixação de conceitos-chave", desc:"Rápido pra revisar."}
  ],
  "Inglês": [
    {emoji:"🎧", tipo:"Podcast", nome:"Áudio no seu nível atual", desc:"Treina escuta enquanto revisa vocabulário."},
    {emoji:"🧩", tipo:"Quiz", nome:"Vocabulário e gramática", desc:"Fixação rápida e repetida."},
    {emoji:"📝", tipo:"Lista de exercícios", nome:"Interpretação de texto em inglês", desc:"Pratique leitura direto."}
  ],
  "Redação": [
    {emoji:"📘", tipo:"Apostila", nome:"Guia de estrutura dissertativa", desc:"Bom pra organizar introdução, desenvolvimento e conclusão."},
    {emoji:"🎥", tipo:"Videoaula", nome:"Análise de redações nota alta", desc:"Mostra na prática o que funciona."},
    {emoji:"📝", tipo:"Lista de exercícios", nome:"Propostas de tema pra treinar", desc:"Escreva e depois releia com calma."}
  ]
};

const METHODS = {
  memorizar: {titulo:"Método sugerido: Flashcards", desc:"Como o objetivo é memorizar, crie cartões de pergunta/resposta e revise em ciclos curtos."},
  entender: {titulo:"Método sugerido: Resumo + exercícios", desc:"Primeiro resuma o conteúdo com suas palavras, depois pratique com exercícios simples."},
  revisar: {titulo:"Método sugerido: Questões + revisão dos erros", desc:"Resolva questões e, principalmente, volte nos erros pra entender onde travou."}
};

const DIAS = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

/* Tela principal */
document.querySelectorAll('#ob-materias-dificeis .chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    chip.classList.toggle('selected');
  });
});

document.getElementById('ob-nome').addEventListener('input', function(){
  this.classList.remove('input-error');
  document.getElementById('ob-nome-error').style.display = 'none';
});

/* Tela de "cadastro" */
function finishOnboarding(){
  const nomeInput = document.getElementById('ob-nome');
  const nome = nomeInput.value.trim();

  if(!nome){
    nomeInput.classList.add('input-error');
    document.getElementById('ob-nome-error').style.display = 'block';
    nomeInput.focus();
    return;
  }
  nomeInput.classList.remove('input-error');
  document.getElementById('ob-nome-error').style.display = 'none';

  const objetivo = document.getElementById('ob-objetivo').value;
  const escolaIni = document.getElementById('ob-escola-ini').value;
  const escolaFim = document.getElementById('ob-escola-fim').value;
  const dispIni = document.getElementById('ob-disp-ini').value;
  const dispFim = document.getElementById('ob-disp-fim').value;
  const campoOutra = document.getElementById('escrita-da-materia');
  const dificeis = Array.from(document.querySelectorAll('#ob-materias-dificeis .chip.selected'))
    .map(c=>c.dataset.v)
    .filter(v => v !== 'Outra');

    const textoOutra = campoOutra.value.trim();
        if (!campoOutra.hidden && textoOutra) dificeis.push(textoOutra);
        
  const provaMateria = document.getElementById('ob-prova-materia').value;
  const provaDia = document.getElementById('ob-prova-dia').value;

  state.profile = {
    nome, objetivo, escolaIni, escolaFim, dispIni, dispFim,
    materiasDificeis: dificeis,
    provas: provaMateria && provaDia ? [{materia:provaMateria, dia:parseInt(provaDia)}] : []
  };

  document.getElementById('screen-onboarding').classList.remove('active');
  document.getElementById('main-wrap').style.display = 'flex';
  document.getElementById('pf-nome').value = nome;
  document.getElementById('pf-objetivo').value = objetivo;

  goTo('home');
  newQuote();
  renderCalendar();
  renderRoutine();
}

function goTo(screen){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.remove('active'));
  const map = {home:'screen-home', recs:'screen-recs', caos:'screen-caos', report:'screen-report', perfil:'screen-perfil'};
  document.getElementById(map[screen]).classList.add('active');
  const navmap = {home:'nav-home', recs:'nav-recs', caos:'nav-caos', report:'nav-report'};
  if(navmap[screen]) document.getElementById(navmap[screen]).classList.add('active');
  if(screen==='caos') renderChaos();
  if(screen==='report') renderReport();
  const gated = ['recs','caos','report'];
  if(gated.includes(screen) && state.routine.length===0){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.querySelectorAll('.navbtn').forEach(b=>b.classList.remove('active'));
    document.getElementById('screen-home').classList.add('active');
    document.getElementById('nav-home').classList.add('active');
    document.getElementById('routine-card').classList.add('highlight');
    document.getElementById('routine-required-msg').style.display = 'block';
    document.getElementById('routine-card').scrollIntoView({behavior:'smooth', block:'center'});
    return;
  }
}

function closeModal(id){ document.getElementById(id).classList.remove('active'); }
function openModal(id){ document.getElementById(id).classList.add('active'); }

/* frase do dia */
function newQuote(seeded){
  let idx;
  if(seeded){
    const day = new Date().getDate();
    idx = day % QUOTES.length;
  } else {
    idx = Math.floor(Math.random()*QUOTES.length);
  }
  state.quoteIndex = idx;
  document.getElementById('quote-text').textContent = QUOTES[idx];
  renderPlant();
}

function renderPlant(){
  const total = state.chaos.length || 1;
  const done = state.chaos.filter(t=>t.done).length;
  const pct = state.chaos.length ? done/total : 0.3;
  const leaves = 1 + Math.round(pct*3);
  let svg = `<svg width="60" height="70" viewBox="0 0 60 70">
    <rect x="26" y="50" width="8" height="18" rx="2" fill="#40916C"/>`;
  const positions = [[30,45],[18,38],[42,38],[30,28]];
  for(let i=0;i<leaves;i++){
    const p = positions[i];
    svg += `<ellipse cx="${p[0]}" cy="${p[1]}" rx="12" ry="7" fill="#95D5B2" transform="rotate(${i%2===0?-20:20} ${p[0]} ${p[1]})"/>`;
  }
  svg += `</svg>`;
  document.getElementById('plant-svg').innerHTML = svg;
}

/* calendário */
function renderCalendar(){
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = now.getDate();
  const examDays = (state.profile.provas||[]).map(p=>p.dia);

  let html = `<div class="cal-grid">`;
  ["D","S","T","Q","Q","S","S"].forEach(d=>html+=`<div class="dow">${d}</div>`);
  for(let i=0;i<firstDay;i++) html += `<div class="day empty"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    let cls = "day";
    if(examDays.includes(d)) cls += " exam";
    if(d===today) cls += " today";
    html += `<div class="${cls}">${d}</div>`;
  }
  html += `</div>`;
  document.getElementById('calendar').innerHTML = html;
}

/* Cronograma */
function renderRoutine(){
  const list = document.getElementById('routine-list');
  if(state.routine.length===0){
    list.innerHTML = `<div class="empty-state">Nenhuma atividade ainda. Adicione seu primeiro horário de estudo abaixo.</div>`;
    return;
  }
  const order = ["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
  const sorted = [...state.routine].sort((a,b)=> order.indexOf(a.dia)-order.indexOf(b.dia) || a.horario.localeCompare(b.horario));
  list.innerHTML = sorted.map(item=>`
    <div class="routine-item">
      <div class="info">
        <b>${item.materia} • ${item.dia}</b>
        <span>${item.horario} · ${item.duracao} min ${item.done?'· ✅ feito':''}</span>
      </div>
      <div>
        <button class="iconlink" title="Marcar como não conseguido" onclick="markFail(${item.id})">❌</button>
        <button class="iconlink" title="Concluir" onclick="markDone(${item.id})">✅</button>
        <button class="iconlink" title="Remover" onclick="removeRoutineItem(${item.id})">🗑️</button>
      </div>
    </div>`).join('');
}

function addRoutineItem(){
  const dia = document.getElementById('rt-dia').value;
  const materia = document.getElementById('rt-materia').value;
  const horario = document.getElementById('rt-horario').value;
  const duracao = parseInt(document.getElementById('rt-duracao').value) || 30;
  state.routine.push({id:idCounter++, dia, materia, horario, duracao, done:false});
  document.getElementById('routine-card').classList.remove('highlight');
  document.getElementById('routine-required-msg').style.display = 'none';
  renderRoutine();
}
function removeRoutineItem(id){
  state.routine = state.routine.filter(r=>r.id!==id);
  renderRoutine();
}
function markDone(id){
  const item = state.routine.find(r=>r.id===id);
  if(item){
    item.done = true;
    state.sessions.push({id:idCounter++, materia:item.materia, duracao:item.duracao, como:'normal'});
  }
  renderRoutine();
}
function markFail(id){
  state.pendingFailTaskId = id;
  openModal('modal-fail');
}
function reorganizeTask(){
  const item = state.routine.find(r=>r.id===state.pendingFailTaskId);
  if(item){
    const order = ["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
    const idx = order.indexOf(item.dia);
    item.dia = order[(idx+1)%7];
  }
  closeModal('modal-fail');
  renderRoutine();
}

/* O que estudar agora? */
function openWhatToStudy(){
  const pendentes = state.routine.filter(r=>!r.done);
  let box = document.getElementById('study-suggestion');

  if(pendentes.length===0){
    box.innerHTML = `<div class="empty-state">Você não tem atividades pendentes no cronograma. Que tal adicionar uma na tela inicial? 🌱</div>`;
    openModal('modal-study');
    return;
  }

  // pontuação: prova próxima + matéria difícil + prazo
  const provas = state.profile.provas || [];
  const hoje = new Date().getDate();

  const pontuadas = pendentes.map(item=>{
    let score = 0;
    let motivos = [];
    if(state.profile.materiasDificeis.includes(item.materia)){
      score += 3; motivos.push("matéria que você marcou como difícil");
    }
    const prova = provas.find(p=>p.materia===item.materia);
    if(prova){
      const dias = prova.dia - hoje;
      if(dias>=0 && dias<=5){ score += (6-dias); motivos.push(`prova em ${dias<=0?'breve':dias+' dia(s)'}`); }
    }
    score += Math.min(item.duracao/60, 1);
    return {item, score, motivos};
  }).sort((a,b)=>b.score-a.score);

  const top = pontuadas[0];
  box.innerHTML = `
    <div class="step-goal" style="font-size:15px;">
      <b>${top.item.materia}</b><br>
      ⏱️ ${top.item.duracao} minutos · dia sugerido: ${top.item.dia}
    </div>
    <div class="tip-box">
      ${top.motivos.length ? "Prioridade alta porque é " + top.motivos.join(" e ") + "." : "Está no seu cronograma e ainda não foi feita — bom momento pra começar por ela."}
    </div>
    <button class="btn" onclick="markDone(${top.item.id}); closeModal('modal-study'); renderRoutine();">Marcar como feita agora</button>
    <button class="btn secondary" onclick="closeModal('modal-study'); openModal('modal-five');">Não estou com vontade — desafio dos 5 min</button>
  `;
  openModal('modal-study');
}

/* Desafio 5 min */
let fiveInterval = null;
function startFiveMin(){
  let seconds = 5*60;
  document.getElementById('five-start-btn').style.display='none';
  fiveInterval = setInterval(()=>{
    seconds--;
    const m = Math.floor(seconds/60), s = seconds%60;
    document.getElementById('five-timer').textContent = `${m}:${s.toString().padStart(2,'0')}`;
    if(seconds<=0){
      clearInterval(fiveInterval);
      document.getElementById('five-timer').textContent = "Foco iniciado";
      const box = document.getElementById('five-timer').parentElement;
      const btn = document.createElement('button');
      btn.className='btn'; btn.textContent='Quero continuar estudando';
      btn.onclick = ()=>{ closeModal('modal-five'); goTo('report'); };
      box.appendChild(btn);
      const btn2 = document.createElement('button');
      btn2.className='btn outline'; btn2.textContent='Só isso por hoje, tudo bem';
      btn2.onclick = ()=>closeModal('modal-five');
      box.appendChild(btn2);
    }
  },1000);
}

/* Recomendações */
function showRecommendations(){
  const materia = document.getElementById('rec-materia').value;
  const objetivo = document.getElementById('rec-metodo-objetivo').value;
  const dificuldade = document.getElementById('rec-dificuldade').value.trim();
  const method = METHODS[objetivo];

  document.getElementById('rec-method-box').innerHTML =
    `<b>${method.titulo}</b><br>${method.desc}` +
    (dificuldade ? `<br><br>Sobre "<i>${dificuldade}</i>": vale focar nesse ponto específico dentro do conteúdo antes de seguir pro resto da matéria.` : '');

  const lista = RECS[materia] || [];
  document.getElementById('rec-list').innerHTML = lista.map(r=>`
    <div class="rec-item">
      <div class="emoji">${r.emoji}</div>
      <div><b>${r.tipo}: ${r.nome}</b><span>${r.desc}</span></div>
    </div>`).join('');

  document.getElementById('rec-result').style.display='block';
}

function splitBigTask(){
  const materia = document.getElementById('split-materia').value;
  const horas = parseFloat(document.getElementById('split-horas').value) || 3;
  const totalMin = horas*60;
  const etapas = [
    {label:"Conteúdo", pct:0.35},
    {label:"Resumo", pct:0.15},
    {label:"Questões", pct:0.35},
    {label:"Revisão", pct:0.15}
  ];
  let html = '';
  etapas.forEach((e,i)=>{
    const min = Math.round(totalMin*e.pct);
    html += `<div class="step-goal"><b>Dia ${i+1} — ${e.label}:</b> ${min} min de ${materia}</div>`;
  });
  document.getElementById('split-result').innerHTML = html;
}

/*Organize o caos*/
function addChaosTask(){
  const texto = document.getElementById('caos-texto').value.trim();
  if(!texto) return;
  const prazo = parseInt(document.getElementById('caos-prazo').value);
  let prioridade = prazo<=0 ? 'urgente' : (prazo<=2 ? 'importante' : 'espera');
  state.chaos.push({id:idCounter++, texto, prioridade, done:false});
  document.getElementById('caos-texto').value='';
  renderChaos();
  renderPlant();
}

function renderChaos(){
  const groups = {urgente:[], importante:[], espera:[]};
  state.chaos.forEach(t=>groups[t.prioridade].push(t));

  function renderGroup(arr){
    if(arr.length===0) return `<div class="empty-state">Nada por aqui.</div>`;
    return arr.map(t=>`
      <div class="task-item ${t.done?'done':''}">
        <span class="txt">${t.texto}</span>
        <button class="iconlink" onclick="toggleChaosDone(${t.id})">${t.done?'↩️':'✅'}</button>
        <button class="iconlink" onclick="removeChaosTask(${t.id})">🗑️</button>
      </div>`).join('');
  }
  document.getElementById('caos-urgente').innerHTML = renderGroup(groups.urgente);
  document.getElementById('caos-importante').innerHTML = renderGroup(groups.importante);
  document.getElementById('caos-espera').innerHTML = renderGroup(groups.espera);
}
function toggleChaosDone(id){
  const t = state.chaos.find(x=>x.id===id);
  if(t) t.done = !t.done;
  renderChaos(); renderPlant();
}
function removeChaosTask(id){
  state.chaos = state.chaos.filter(x=>x.id!==id);
  renderChaos(); renderPlant();
}

/* Relatórios*/
function logSession(como, chipEl){
  const materia = document.getElementById('log-materia').value;
  const duracao = parseInt(document.getElementById('log-duracao').value) || 30;
  state.sessions.push({id:idCounter++, materia, duracao, como});
  document.querySelectorAll('#screen-report .badge-group .chip').forEach(c=>c.classList.remove('selected'));
  chipEl.classList.add('selected');
  renderReport();
}

function renderReport(){
  const totalMin = state.sessions.reduce((s,x)=>s+x.duracao,0);
  const h = Math.floor(totalMin/60), m = totalMin%60;
  document.getElementById('rp-tempo').textContent = `${h}h${m.toString().padStart(2,'0')}`;

  const concluidas = state.chaos.filter(t=>t.done).length + state.routine.filter(r=>r.done).length;
  const pendentes = state.chaos.filter(t=>!t.done).length + state.routine.filter(r=>!r.done).length;
  document.getElementById('rp-concluidas').textContent = concluidas;
  document.getElementById('rp-pendentes').textContent = pendentes;
  document.getElementById('rp-sessoes').textContent = state.sessions.length;

  const porMateria = {};
  state.sessions.forEach(s=>{ porMateria[s.materia] = (porMateria[s.materia]||0) + s.duracao; });
  const entradas = Object.entries(porMateria);
  if(entradas.length){
    entradas.sort((a,b)=>b[1]-a[1]);
    document.getElementById('rp-mais').textContent = `${entradas[0][0]} (${entradas[0][1]} min)`;
    document.getElementById('rp-menos').textContent = `${entradas[entradas.length-1][0]} (${entradas[entradas.length-1][1]} min)`;
  } else {
    document.getElementById('rp-mais').textContent = '—';
    document.getElementById('rp-menos').textContent = '—';
  }

  const dificeis = state.sessions.filter(s=>s.como==='difícil');
  let dica = "Comece a registrar suas sessões de estudo pra ver dicas por aqui.";
  if(state.sessions.length>=3){
    if(dificeis.length > state.sessions.length/2){
      dica = "Boa parte das suas sessões estão vindo como 'difícil'. Tente sessões mais curtas (20-25 min) pra reduzir o cansaço.";
    } else {
      const facil = state.sessions.filter(s=>s.como==='fácil').length;
      if(facil >= state.sessions.length/2){
        dica = "Você está mantendo um bom ritmo! Suas sessões estão rendendo bem — considere manter esse padrão de duração.";
      } else {
        dica = "Seu ritmo está equilibrado. Se notar dificuldade num dia específico, tente estudar a matéria difícil mais cedo.";
      }
    }
  }
  document.getElementById('rp-dica').textContent = dica;
}

/* Perfil */
function saveProfile(){
  state.profile.nome = document.getElementById('pf-nome').value.trim() || state.profile.nome;
  state.profile.objetivo = document.getElementById('pf-objetivo').value;
  alert('Perfil atualizado!');
}
function deleteAccount(){
  if(confirm('Tem certeza? Isso vai apagar tudo (rotina, tarefas e relatório) e voltar pro início.')){
    state = {profile:null, routine:[], chaos:[], sessions:[], pendingFailTaskId:null, selectedDifficulty:[], quoteIndex:null};
    document.getElementById('main-wrap').style.display = 'none';
    document.getElementById('screen-onboarding').classList.add('active');
    document.getElementById('ob-nome').value='';
    document.querySelectorAll('#ob-materias-dificeis .chip').forEach(c=>c.classList.remove('selected'));
  }
}

(() => {
  const CLASSE_MARCADO = 'selected';

  const grupoOutra = document.getElementById('ob-materias-dificeis');
  const campoOutra = document.getElementById('escrita-da-materia');
  if (!grupoOutra || !campoOutra) return;

  grupoOutra.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip || chip.dataset.v !== 'Outra') return;

    setTimeout(() => {
      const ativo = chip.classList.contains(CLASSE_MARCADO);
      campoOutra.hidden = !ativo;
      if (ativo) campoOutra.focus();
      else campoOutra.value = '';
    }, 0);
  });
})();