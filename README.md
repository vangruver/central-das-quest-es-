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

O banco já tem **1.058 questões reais do ENEM** (15 anos: 2009 e 2011 a 2024) e **380 questões reais da UERJ** (2016 a 2023), cobrindo as quatro áreas do ENEM (Linguagens, Ciências Humanas, Ciências da Natureza e Matemática) e as principais matérias da UERJ, num total de mais de 20 tópicos diferentes.

Cobertura por ano:

| Prova | Anos | Questões |
| --- | --- | --- |
| ENEM | 2009 (78), 2011 (82), 2012 (74), 2013 (77), 2014 (73), 2015 (80), 2016 (75), 2017 (72), 2018 (86), 2019 (79), 2020 (78), 2021 (85), 2022 (18), 2023 (83), 2024 (18) | 1.058 |
| UERJ | 2016 (50), 2017 (50), 2018 (53), 2019 (53), 2020 (38), 2021 (52), 2022 (48), 2023 (36) | 380 |

Nos anos de ENEM entre 2009 e 2023, o 1º dia está processado quase por completo (72 a 86 de 90 questões, dependendo do ano); 2022 e 2024, que usam uma numeração diferente (até 176) vinda de outra fonte, ainda têm apenas parte do caderno extraída. Da UERJ, cada ano cobre um Exame de Qualificação completo (50 a 53 de 60 questões), exceto 2020, 2022 e 2023, processados a partir de provas parciais.

**Ainda faltam:**
- **ENEM 2010**: o PDF disponível perde as letras das alternativas na extração de texto e não traz gabarito legível por máquina — processá-lo exigiria adivinhar respostas, o que não é aceitável para este banco. Fica pendente até que surja uma fonte melhor.
- **ENEM 2008 e 2025**, e as aplicações PPL / 2ª aplicação de vários anos.
- **O 2º dia do ENEM** (Linguagens e Códigos + Matemática, questões 91 a 180) da maioria dos anos.
- **Completar 2022 e 2024**, hoje com apenas 18 questões cada.
- **UERJ**: o segundo Exame de Qualificação de 2016 a 2019, o primeiro de 2020, 2022 e 2023, os anos anteriores a 2016 e todo o Exame Discursivo.
- Em todos os anos, algumas questões são deliberadamente deixadas de fora porque dependem de mapas, gráficos, imagens, charges, circuitos ou fórmulas estruturais que não sobrevivem à extração de texto do PDF. Cada commit lista quais foram puladas e por quê.

### Sobre as fontes

O ambiente usado para montar este banco tem acesso à internet bastante restrito (política de rede da sessão): domínios como `gov.br`, `inep.gov.br` e `vestibular.uerj.br` estão bloqueados, então não foi possível baixar as provas oficiais diretamente do INEP ou da UERJ. O banco foi construído a partir de duas fontes alternativas, sempre com o texto conferido antes de publicar:

- Parte das questões do ENEM (2022 e 2024) vieram de um dataset aberto hospedado no GitHub, que reproduz fielmente o texto oficial dos cadernos do INEP.
- A maior parte (2009, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2023) veio de PDFs originais das provas e dos gabaritos oficiais (caderno de questões + gabarito), compartilhados diretamente pelo usuário do projeto via Google Drive — extraídos, checados questão a questão contra o gabarito oficial (e, quando possível, por cálculo direto nas questões de exatas), e só então incluídos no banco. Vale notar que em alguns anos mais antigos (2013 a 2016) o Caderno 1 Azul reúne Ciências Humanas e Ciências da Natureza, em vez do padrão mais recente de Linguagens + Ciências Humanas.
- A UERJ (2016 a 2023) veio da mesma forma: provas e gabaritos oficiais compartilhados via Google Drive. Se você tiver acesso às provas de outros anos da UERJ, elas podem ser processadas do mesmo jeito.

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
