/* Central das Questões — lógica do site (sem dependências externas) */

const state = {
  taxonomy: null,
  questions: [], // questões de todas as provas, com campo `exam`
  explorar: { exam: "enem", subjectId: "", topic: "" },
  exercicio: { exam: "enem", subjectId: "", topic: "", quantity: 5, current: [] , answers: {} , corrected: false }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Converte o texto do enunciado (com marcações leves tipo "## Título" e
   quebras de linha) em HTML simples, sem depender de biblioteca de markdown. */
function formatStatement(text) {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.replace(/^#{1,6}\s*/, "");
      if (/^#{1,6}\s/.test(line)) {
        return `<strong class="q-heading">${escapeHtml(trimmed)}</strong>`;
      }
      return escapeHtml(line);
    })
    .join("\n");
}

async function loadData() {
  const [taxonomy, enem, uerj] = await Promise.all([
    fetch("data/taxonomy.json").then((r) => r.json()),
    fetch("data/questions/enem.json").then((r) => r.json()),
    fetch("data/questions/uerj.json").then((r) => r.json())
  ]);
  state.taxonomy = taxonomy;
  state.questions = [...enem, ...uerj];
}

function subjectName(subjectId) {
  const s = state.taxonomy.subjects.find((s) => s.id === subjectId);
  return s ? s.name : subjectId;
}

function examName(examId) {
  const e = state.taxonomy.exams.find((e) => e.id === examId);
  return e ? e.name : examId;
}

function questionsFor({ exam, subjectId, topic }) {
  return state.questions.filter((q) => {
    if (exam && q.exam !== exam) return false;
    if (subjectId && q.subjectId !== subjectId) return false;
    if (topic && !(q.topics || []).includes(topic)) return false;
    return true;
  });
}

function subjectsWithCounts(examId) {
  const subjectIds = new Set(state.questions.filter((q) => !examId || q.exam === examId).map((q) => q.subjectId));
  return state.taxonomy.subjects.filter((s) => subjectIds.has(s.id));
}

function topicsWithCounts(examId, subjectId) {
  const qs = questionsFor({ exam: examId, subjectId });
  const counts = new Map();
  qs.forEach((q) => (q.topics || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
  return counts;
}

/* ---------------------------------------------------------------- */
/* Renderização de um card de questão                                */
/* ---------------------------------------------------------------- */

function renderQuestionCard(q, { mode = "static", index = null } = {}) {
  const card = document.createElement("article");
  card.className = "question-card";
  card.dataset.qid = q.id;

  const meta = document.createElement("div");
  meta.className = "q-meta";
  const examTag = q.exam === "enem" ? `ENEM ${q.year}` : `UERJ ${q.year}`;
  meta.innerHTML = `
    <span class="tag exam">${escapeHtml(examTag)}</span>
    <span class="tag">${escapeHtml(subjectName(q.subjectId))}</span>
    ${(q.topics || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
    ${q.annulled ? '<span class="tag">Questão anulada</span>' : ""}
  `;
  card.appendChild(meta);

  const statement = document.createElement("p");
  statement.className = "q-statement";
  statement.innerHTML = (index !== null ? `<strong>${index}.</strong> ` : "") + formatStatement(q.statement);
  card.appendChild(statement);

  const list = document.createElement("ul");
  list.className = "q-alternatives" + (mode === "quiz" ? " interactive" : "");
  q.alternatives.forEach((alt) => {
    const li = document.createElement("li");
    li.dataset.letter = alt.letter;
    li.innerHTML = `<span class="letter">${alt.letter})</span><span>${escapeHtml(alt.text)}</span>`;
    if (mode === "quiz") {
      li.addEventListener("click", () => {
        if (state.exercicio.corrected) return;
        list.querySelectorAll("li").forEach((el) => el.classList.remove("selected"));
        li.classList.add("selected");
        state.exercicio.answers[q.id] = alt.letter;
      });
    }
    list.appendChild(li);
  });
  card.appendChild(list);

  const actions = document.createElement("div");
  actions.className = "q-actions";
  const gabDiv = document.createElement("div");
  gabDiv.className = "gabarito";

  const answerLine = q.annulled
    ? `<div class="g-answer annulled-color">Questão anulada pela banca — sem alternativa correta oficial.</div>`
    : `<div class="g-answer correct-color">Resposta correta: ${q.correct}</div>`;
  gabDiv.innerHTML = `${answerLine}<div class="g-explanation">${escapeHtml(q.explanation)}</div>`;

  if (mode === "static") {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn small";
    toggleBtn.textContent = "Ver gabarito comentado";
    toggleBtn.addEventListener("click", () => {
      const open = gabDiv.classList.toggle("open");
      toggleBtn.textContent = open ? "Ocultar gabarito comentado" : "Ver gabarito comentado";
    });
    actions.appendChild(toggleBtn);
    card.appendChild(actions);
    card.appendChild(gabDiv);
  } else if (mode === "quiz") {
    gabDiv.dataset.role = "quiz-gabarito";
    card.appendChild(gabDiv);
  }

  return card;
}

/* ---------------------------------------------------------------- */
/* Populando selects de filtro                                       */
/* ---------------------------------------------------------------- */

function populateExamChips(container, selected, onChange) {
  container.innerHTML = "";
  state.taxonomy.exams.forEach((e) => {
    const btn = document.createElement("button");
    btn.className = "chip" + (e.id === selected ? " active" : "");
    btn.textContent = e.name;
    btn.addEventListener("click", () => onChange(e.id));
    container.appendChild(btn);
  });
}

function populateSubjectSelect(select, examId, selected, onChange) {
  const subjects = subjectsWithCounts(examId);
  select.innerHTML = '<option value="">Todas as matérias</option>' +
    subjects.map((s) => `<option value="${s.id}">${escapeHtml(s.name)} (${questionsFor({ exam: examId, subjectId: s.id }).length})</option>`).join("");
  select.value = selected || "";
  select.onchange = () => onChange(select.value);
}

function populateTopicSelect(select, examId, subjectId, selected, onChange) {
  const counts = topicsWithCounts(examId, subjectId);
  const topics = [...counts.keys()].sort();
  select.innerHTML = '<option value="">Todos os tópicos</option>' +
    topics.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)} (${counts.get(t)})</option>`).join("");
  select.value = selected || "";
  select.onchange = () => onChange(select.value);
}

/* ---------------------------------------------------------------- */
/* Vista: Explorar                                                    */
/* ---------------------------------------------------------------- */

function renderExplorar() {
  const { exam, subjectId, topic } = state.explorar;

  populateExamChips(document.getElementById("filter-exam"), exam, (val) => {
    state.explorar.exam = val;
    state.explorar.subjectId = "";
    state.explorar.topic = "";
    renderExplorar();
  });
  populateSubjectSelect(document.getElementById("filter-subject"), exam, subjectId, (val) => {
    state.explorar.subjectId = val;
    state.explorar.topic = "";
    renderExplorar();
  });
  populateTopicSelect(document.getElementById("filter-topic"), exam, subjectId, topic, (val) => {
    state.explorar.topic = val;
    renderExplorar();
  });

  const results = questionsFor({ exam, subjectId, topic });
  document.getElementById("explorar-count").textContent =
    `${results.length} questão(ões) encontrada(s).`;

  const list = document.getElementById("explorar-list");
  list.innerHTML = "";
  if (results.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = exam === "uerj"
      ? "Ainda não há questões da UERJ cadastradas nesta seleção — o banco da UERJ está em construção. Veja a aba \"Sobre o projeto\" para mais detalhes."
      : "Nenhuma questão encontrada para esse filtro.";
    list.appendChild(empty);
  } else {
    results.forEach((q) => list.appendChild(renderQuestionCard(q, { mode: "static" })));
  }
}

/* ---------------------------------------------------------------- */
/* Vista: Exercício / Impressão                                      */
/* ---------------------------------------------------------------- */

function renderExercicioFilters() {
  const { exam, subjectId, topic, quantity } = state.exercicio;

  populateExamChips(document.getElementById("ex-filter-exam"), exam, (val) => {
    state.exercicio.exam = val;
    state.exercicio.subjectId = "";
    state.exercicio.topic = "";
    renderExercicioFilters();
  });
  populateSubjectSelect(document.getElementById("ex-filter-subject"), exam, subjectId, (val) => {
    state.exercicio.subjectId = val;
    state.exercicio.topic = "";
    renderExercicioFilters();
  });
  populateTopicSelect(document.getElementById("ex-filter-topic"), exam, subjectId, topic, (val) => {
    state.exercicio.topic = val;
    renderExercicioFilters();
  });
  document.getElementById("ex-quantity").value = quantity;

  const available = questionsFor({ exam, subjectId, topic }).length;
  document.getElementById("ex-count").textContent =
    `${available} questão(ões) disponível(is) para esse filtro.`;
}

function pickExerciseQuestions() {
  const { exam, subjectId, topic } = state.exercicio;
  const quantity = Math.max(1, parseInt(document.getElementById("ex-quantity").value, 10) || 1);
  state.exercicio.quantity = quantity;
  const pool = questionsFor({ exam, subjectId, topic });
  return pool.slice(0, quantity);
}

function startOnlineQuiz() {
  const chosen = pickExerciseQuestions();
  state.exercicio.current = chosen;
  state.exercicio.answers = {};
  state.exercicio.corrected = false;

  const area = document.getElementById("exercise-area");
  area.innerHTML = "";

  if (chosen.length === 0) {
    area.innerHTML = '<p class="hint">Nenhuma questão disponível para esse filtro.</p>';
    return;
  }

  const summary = document.createElement("div");
  summary.className = "quiz-summary";
  summary.id = "quiz-summary";
  summary.textContent = `Responda as ${chosen.length} questões abaixo e clique em "Corrigir" ao final.`;
  area.appendChild(summary);

  chosen.forEach((q, i) => area.appendChild(renderQuestionCard(q, { mode: "quiz", index: i + 1 })));

  const correctBtn = document.createElement("button");
  correctBtn.className = "btn primary";
  correctBtn.textContent = "Corrigir";
  correctBtn.addEventListener("click", () => correctQuiz());
  area.appendChild(correctBtn);
}

function correctQuiz() {
  state.exercicio.corrected = true;
  let score = 0;
  let valid = 0;

  state.exercicio.current.forEach((q) => {
    const card = document.querySelector(`#exercise-area .question-card[data-qid="${q.id}"]`);
    if (!card) return;
    const chosenLetter = state.exercicio.answers[q.id];
    const items = card.querySelectorAll(".q-alternatives li");
    items.forEach((li) => {
      const letter = li.dataset.letter;
      if (!q.annulled && letter === q.correct) li.classList.add("correct");
      if (chosenLetter && letter === chosenLetter && letter !== q.correct) li.classList.add("wrong");
    });
    if (!q.annulled) {
      valid++;
      if (chosenLetter === q.correct) score++;
    }
    const gab = card.querySelector('[data-role="quiz-gabarito"]');
    if (gab) gab.classList.add("open");
  });

  const summary = document.getElementById("quiz-summary");
  if (summary) {
    summary.textContent = valid > 0
      ? `Resultado: ${score} de ${valid} questões corretas (questões anuladas não entram na pontuação).`
      : `Correção concluída.`;
  }
}

/* ---------------------------------------------------------------- */
/* Impressão / PDF                                                   */
/* ---------------------------------------------------------------- */

function buildPrintArea() {
  const chosen = pickExerciseQuestions();
  const printArea = document.getElementById("print-area");

  if (chosen.length === 0) {
    printArea.innerHTML = "";
    return false;
  }

  const { exam, subjectId, topic } = state.exercicio;
  const subjLabel = subjectId ? subjectName(subjectId) : "Todas as matérias";
  const topicLabel = topic || "Todos os tópicos";
  const examLabel = examName(exam);

  let html = `
    <div class="print-header">
      <h1>Central das Questões — Lista de exercícios</h1>
      <p>Prova: ${escapeHtml(examLabel)} · Matéria: ${escapeHtml(subjLabel)} · Tópico: ${escapeHtml(topicLabel)} · ${chosen.length} questões</p>
    </div>
  `;

  chosen.forEach((q, i) => {
    html += `
      <div class="print-q">
        <div class="p-num">${i + 1}. ${escapeHtml(examName(q.exam))} ${q.year} — ${escapeHtml(subjectName(q.subjectId))}</div>
        <div class="p-statement">${formatStatement(q.statement)}</div>
        <ul>
          ${q.alternatives.map((a) => `<li>${a.letter}) ${escapeHtml(a.text)}</li>`).join("")}
        </ul>
      </div>
    `;
  });

  html += `<div class="print-gabarito-page"><h1>Gabarito comentado</h1>`;
  chosen.forEach((q, i) => {
    const answerLine = q.annulled ? "Questão anulada pela banca." : `Resposta correta: ${q.correct}`;
    html += `
      <div class="print-gabarito-item">
        <div class="p-num">${i + 1}. ${answerLine}</div>
        <div class="p-explanation">${escapeHtml(q.explanation)}</div>
      </div>
    `;
  });
  html += `</div>`;

  printArea.innerHTML = html;
  return true;
}

function printExercise() {
  if (!buildPrintArea()) {
    alert("Nenhuma questão disponível para esse filtro. Ajuste a matéria/tópico antes de imprimir.");
    return;
  }
  document.body.classList.add("printing");
  window.print();
}

window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing");
});

/* ---------------------------------------------------------------- */
/* Navegação entre abas                                              */
/* ---------------------------------------------------------------- */

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.getElementById(`view-${btn.dataset.view}`).classList.add("active");
    });
  });
}

/* ---------------------------------------------------------------- */
/* Inicialização                                                     */
/* ---------------------------------------------------------------- */

async function init() {
  await loadData();
  setupTabs();
  renderExplorar();
  renderExercicioFilters();

  document.getElementById("btn-answer-online").addEventListener("click", startOnlineQuiz);
  document.getElementById("btn-print").addEventListener("click", printExercise);
  document.getElementById("ex-quantity").addEventListener("input", (e) => {
    state.exercicio.quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
  });
}

init().catch((err) => {
  console.error(err);
  document.querySelector("main").innerHTML =
    '<p style="padding:40px;">Não foi possível carregar o banco de questões. Verifique se o site está sendo servido por um servidor HTTP (não abra o index.html direto do disco).</p>';
});
