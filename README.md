# Central das Questões

Banco de questões aberto do **ENEM** (INEP) e da **UERJ**, organizado por prova, matéria e tópico, com **gabarito comentado** original. O site é estático (HTML/CSS/JS puro, sem build step) e roda direto no GitHub Pages.

## O que o site faz

- **Explorar questões**: filtra o banco por prova (ENEM/UERJ), matéria (Português, Matemática, Biologia, História, etc.) e tópico dentro da matéria (ex.: Análise Combinatória, Zoologia, Colonização da América). Cada questão pode ser expandida para mostrar o gabarito comentado.
- **Montar exercício / Imprimir**: escolha prova + matéria + tópico + quantidade de questões e:
  - **Responda no site**, com correção automática e feedback (certo/errado) por questão; ou
  - **Gere uma folha para impressão**, com as questões escolhidas seguidas de uma página de gabarito comentado — use o "Imprimir" do navegador (Ctrl/Cmd+P) e escolha "Salvar como PDF" para exportar em PDF.

## Estrutura de dados

```
data/
  taxonomy.json          # lista de provas, matérias e tópicos de cada matéria
  questions/
    enem.json             # questões do ENEM
    uerj.json             # questões da UERJ
```

Cada questão segue este formato:

```json
{
  "id": "enem-2024-q46",
  "exam": "enem",
  "year": 2024,
  "originalNumber": 46,
  "subjectId": "sociologia",
  "topics": ["Cidadania e Democracia"],
  "statement": "texto do enunciado...",
  "alternatives": [
    { "letter": "A", "text": "..." },
    { "letter": "B", "text": "..." }
  ],
  "correct": "A",
  "annulled": false,
  "explanation": "gabarito comentado, escrito para este projeto...",
  "source": { "institution": "INEP", "note": "..." }
}
```

`subjectId` deve corresponder a um `id` declarado em `data/taxonomy.json`, e cada item de `topics` deve ser um dos tópicos daquela matéria (a lista de tópicos pode ser estendida conforme necessário). Questões anuladas usam `"correct": null` e `"annulled": true`.

## Fontes e direitos autorais

As provas do ENEM (INEP/MEC) e da UERJ são exames de instituições públicas, reproduzidos aqui **apenas para fins educacionais e não comerciais**, com a fonte indicada em cada questão (`source`). Os **comentários e explicações de cada questão são conteúdo original**, escrito especificamente para este banco — não foram copiados de cursinhos, sites de gabarito comentado ou qualquer outra fonte de terceiros.

## Estado atual do banco

Este projeto começou com a infraestrutura completa do site e um primeiro lote real de **18 questões do ENEM 2024**, cobrindo as quatro áreas (Linguagens, Ciências Humanas, Ciências da Natureza e Matemática) em várias matérias e tópicos, para validar a estrutura de ponta a ponta (filtros, gabarito comentado, modo online e impressão em PDF).

**Ainda faltam:**
- Mais anos do ENEM (o objetivo é cobrir 2008 em diante).
- Todo o banco da UERJ (Exame de Qualificação e Exame Discursivo) — a estrutura de dados já está pronta em `data/questions/uerj.json`, mas está vazia.

A expansão é feita em lotes: novas questões podem ser adicionadas diretamente nos arquivos JSON acima, seguindo o formato descrito, sem precisar mexer no HTML/CSS/JS.

## Publicando no GitHub Pages

1. Faça o merge deste branch na branch padrão do repositório (`main`).
2. Em **Settings → Pages**, defina "Deploy from a branch", branch `main`, pasta `/ (root)`.
3. O site ficará disponível em `https://<usuário>.github.io/<repositório>/`.

Não é necessário nenhum passo de build — é só HTML/CSS/JS estático consumindo os arquivos JSON em `data/`.

## Rodando localmente

Como o site busca os arquivos JSON via `fetch`, é preciso servi-lo por um servidor HTTP local (abrir o `index.html` direto do disco não funciona por causa da política de CORS para `file://`):

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```
