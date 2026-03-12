# 🔍 SEO Specialist Agent — Cursor IDE

> Agente especializado em SEO para o Cursor IDE com regras automáticas, ferramentas CLI e templates prontos.

---

## 📁 Estrutura do Projeto

```
seo-agent/
├── .cursor/
│   └── rules/
│       ├── seo-agent.mdc          # Agente principal (todas as páginas SEO)
│       ├── technical-seo.mdc      # Regras técnicas (robots, sitemap, redirects)
│       └── content-seo.mdc        # Regras de conteúdo (blog, landing pages)
├── tools/
│   ├── seo_audit.py              # Auditoria SEO de arquivos HTML
│   ├── keyword_analyzer.py       # Análise e classificação de keywords
│   └── schema_generator.py       # Gerador de Schema Markup (JSON-LD)
├── examples/                     # Exemplos de uso (ver abaixo)
└── README.md                     # Este arquivo
```

---

## 🚀 Instalação no Cursor

### 1. Copie a pasta `.cursor/rules/` para o seu projeto

```bash
# Opção A: Copiar para um projeto específico
cp -r .cursor/rules/ /seu-projeto/.cursor/rules/

# Opção B: Regras globais (valem para todos os projetos)
cp -r .cursor/rules/ ~/.cursor/rules/
```

### 2. Reinicie o Cursor IDE

As regras são carregadas automaticamente ao abrir o projeto.

### 3. Verifique a ativação

No Cursor, abra qualquer arquivo `.html`, `.md` ou `.tsx` e pergunte algo sobre SEO — o agente será ativado automaticamente.

---

## 💬 Como Usar no Cursor

### Auditoria de Página

```
Você: Analise o SEO desta página e me dê um relatório completo
[cole o HTML ou abra o arquivo]
```

### Otimização de Conteúdo

```
Você: Otimize este artigo para a keyword "pilates para iniciantes"
[cole ou abra o arquivo markdown/mdx]
```

### Meta Tags

```
Você: Gere meta tags otimizadas para esta página sobre pilates clínico
```

### Schema Markup

```
Você: Crie um schema markup FAQ para esta seção de perguntas frequentes
```

### Análise de Keywords

```
Você: Quais keywords devo usar para um artigo sobre "pilates gestante"?
Quais são as principais intenções de busca?
```

### Auditoria Técnica

```
Você: Revise meu robots.txt e sitemap.xml
Você: Como devo configurar o next.config.js para SEO?
Você: Meu Core Web Vitals está ruim, o que devo otimizar?
```

---

## 🛠️ Ferramentas CLI

### SEO Audit (`seo_audit.py`)

Analisa arquivos HTML em busca de problemas de SEO:

```bash
# Auditar um arquivo
python tools/seo_audit.py --file index.html

# Auditar todos os HTMLs de um diretório
python tools/seo_audit.py --dir ./public/

# Saída em JSON
python tools/seo_audit.py --file index.html --json > audit-report.json
```

**Verifica:**
- Title tag (presença e tamanho)
- Meta description (presença e tamanho)
- Estrutura de headings (H1, H2, H3)
- Imagens (alt text, dimensões, loading)
- Canonical tag
- Open Graph tags
- Meta robots

---

### Keyword Analyzer (`keyword_analyzer.py`)

Classifica e prioriza keywords:

```bash
# Analisar lista de keywords
python tools/keyword_analyzer.py --keywords "pilates, pilates para iniciantes, como fazer pilates, pilates para dor nas costas"

# Analisar arquivo com keywords
python tools/keyword_analyzer.py --file keywords.txt
```

**Analisa:**
- Intenção de busca (Informational, Commercial, Transactional, Navigational)
- Dificuldade estimada (Easy/Medium/Hard/Very Hard)
- Volume estimado (High/Medium/Low)
- Tipo de conteúdo recomendado
- Sugestões de title tags

---

### Schema Generator (`schema_generator.py`)

Gera JSON-LD estruturado:

```bash
# Ver todos os tipos disponíveis
python tools/schema_generator.py --list

# Gerar schema em HTML
python tools/schema_generator.py --type article
python tools/schema_generator.py --type faq
python tools/schema_generator.py --type local-business
python tools/schema_generator.py --type product
python tools/schema_generator.py --type how-to
python tools/schema_generator.py --type breadcrumb
python tools/schema_generator.py --type event

# Gerar apenas JSON (sem a tag <script>)
python tools/schema_generator.py --type faq --format json
```

---

## 📋 Exemplos de Prompts para o Cursor

### Criar um Content Brief

```
Crie um content brief completo para um artigo sobre "pilates para dor nas costas".
Inclua:
- Keyword principal e secundárias
- Intenção de busca
- Estrutura de headings (H1→H2→H3)
- Word count recomendado
- Schema markup sugerido
- Links internos e externos recomendados
```

### Otimizar uma Landing Page

```
Esta é minha landing page de pilates gestante. Faça uma análise SEO completa
e sugira melhorias para ranquear na primeira página do Google para
"pilates gestante SP". Priorize quick wins.
```

### Gerar Meta Tags

```
Gere meta tags otimizadas (title, description, OG, Twitter Card) para:
- Página sobre: Planos de pilates aparelho
- URL: /planos/pilates-aparelho/
- Keyword alvo: pilates aparelho preço
- Público: Adultos 25-45 anos em São Paulo
```

### Revisar Estrutura de URLs

```
Tenho essas URLs no meu site. Analise se estão otimizadas para SEO
e sugira melhorias:

/page?id=1234
/pilates-studio/aulas/pilates-para-iniciantes-completo-guia-2024/
/PILATES_APARELHO/
/blog/post-23-03-2024/
```

### Plano de Link Building

```
Crie uma estratégia de link building para um estúdio de pilates em São Paulo.
Foco em links locais e de autoridade no nicho fitness/saúde.
```

---

## ⚡ Quick Reference — Checklists

### Antes de Publicar Qualquer Página

- [ ] Title tag: 50–60 chars, keyword no início
- [ ] Meta description: 120–155 chars, inclui CTA
- [ ] H1 único com keyword principal
- [ ] Canonical tag com URL absoluta
- [ ] Open Graph tags (og:title, og:description, og:image, og:type)
- [ ] Imagens com alt text descritivo
- [ ] URL limpa (hífens, minúsculas, sem stopwords)
- [ ] Schema markup relevante
- [ ] Pelo menos 2 links internos
- [ ] Pelo menos 1 link externo para fonte autoritativa
- [ ] Mobile-friendly testado
- [ ] PageSpeed Insights passando (LCP < 2.5s, CLS < 0.1)

### Core Web Vitals Thresholds

| Métrica | Bom      | Precisa Melhorar | Ruim     |
|---------|----------|------------------|---------|
| LCP     | < 2.5s   | 2.5s – 4.0s      | > 4.0s  |
| INP     | < 200ms  | 200ms – 500ms    | > 500ms |
| CLS     | < 0.1    | 0.1 – 0.25       | > 0.25  |

### Ferramentas Gratuitas Essenciais

| Ferramenta | URL | Para que serve |
|------------|-----|----------------|
| Google Search Console | search.google.com/search-console | Indexação, rankings, erros |
| Google Analytics 4 | analytics.google.com | Tráfego, comportamento |
| PageSpeed Insights | pagespeed.web.dev | Core Web Vitals |
| Rich Results Test | search.google.com/test/rich-results | Schema markup |
| Screaming Frog (free) | screamingfrog.co.uk | Crawl até 500 URLs |
| Ahrefs Webmaster Tools | ahrefs.com/webmaster-tools | Backlinks, erros técnicos |
| Google Trends | trends.google.com | Volume e sazonalidade |

---

## 📚 Recursos Adicionais

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Core Web Vitals](https://web.dev/articles/vitals)
- [Schema.org Reference](https://schema.org/docs/full.html)
- [Google Rich Results Reference](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)

---

## 🔄 Atualizações

O agente é atualizado conforme os algoritmos do Google evoluem. Versão atual otimizada para:
- Google Helpful Content System
- Google E-E-A-T guidelines (2024)
- Core Web Vitals (INP substituiu FID em março 2024)
- Search Generative Experience (SGE) / AI Overviews

---

*Desenvolvido para uso com Cursor IDE — Claude Sonnet*
