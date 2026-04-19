import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const prompts = [
  {
    category: "Marketing",
    title: "Cold Email para B2B",
    description: "Escreve cold emails personalizados e diretos para prospecção B2B",
    tags: ["email", "vendas", "b2b"],
    content: `Você é um especialista em copywriting B2B. Escreva um cold email de prospecção seguindo estas regras:

- Assunto: máximo 6 palavras, cria curiosidade sem clickbait
- Linha 1: referência específica à empresa/pessoa (pesquisa real)
- Problema: 1 frase sobre a dor que você resolve
- Prova: 1 dado ou cliente relevante
- CTA: uma única pergunta simples, sem pressão
- Tamanho total: máximo 100 palavras

Empresa alvo: [EMPRESA]
Cargo do destinatário: [CARGO]
Problema que você resolve: [PROBLEMA]
Seu diferencial: [DIFERENCIAL]`,
  },
  {
    category: "Marketing",
    title: "Copy para Instagram (Produto)",
    description: "Gera captions de alta conversão para posts de produto no Instagram",
    tags: ["instagram", "social", "copy"],
    content: `Crie uma caption para Instagram que venda [PRODUTO] sem parecer propaganda.

Estrutura:
1. Gancho (linha 1): frase que para o scroll — use uma verdade incômoda, pergunta provocadora ou dado surpreendente
2. Desenvolvimento (2-3 linhas): problema → consequência → solução implícita
3. Prova social ou resultado (1 linha)
4. CTA conversacional: não use "clique no link da bio", crie algo original
5. Hashtags: 5-8 relevantes ao nicho

Produto: [PRODUTO]
Público-alvo: [PÚBLICO]
Benefício principal: [BENEFÍCIO]
Tom de voz: [casual/sério/inspiracional]`,
  },
  {
    category: "Marketing",
    title: "Análise de Concorrente",
    description: "Framework completo para análise competitiva de qualquer empresa",
    tags: ["estratégia", "concorrência", "análise"],
    content: `Faça uma análise competitiva detalhada de [CONCORRENTE] em relação a [MINHA EMPRESA].

Analise e estruture em:

1. **Posicionamento**: como eles se apresentam ao mercado, proposta de valor central
2. **Produto/Serviço**: principais features, diferenciais percebidos
3. **Preço**: estratégia de precificação, planos, modelo de receita
4. **Marketing**: canais usados, tom de voz, frequência de conteúdo
5. **Pontos fortes**: onde eles ganham
6. **Pontos fracos**: onde há abertura para competir
7. **Oportunidades**: o que eles não fazem que poderíamos fazer
8. **Ameaças**: movimentos deles que nos afetam

Conclua com 3 ações práticas que devemos tomar nos próximos 30 dias.`,
  },
  {
    category: "Marketing",
    title: "Roteiro de Vídeo Curto (Reels/TikTok)",
    description: "Estrutura roteiros virais de 30-60 segundos para qualquer nicho",
    tags: ["video", "reels", "tiktok"],
    content: `Crie um roteiro para vídeo curto (30-60 segundos) sobre [TEMA].

Formato:
**[0-3s] GANCHO VISUAL**: descrição da cena de abertura que prende atenção (texto na tela se necessário)
**[3-10s] PROBLEMA**: declare o problema ou situação que o público reconhece
**[10-40s] CONTEÚDO**: entregue o valor prometido — seja direto, use cortes rápidos
**[40-55s] VIRADA**: o insight ou resultado surpreendente
**[55-60s] CTA**: próximo passo claro e simples

Fala em off: [escreva o script completo palavra por palavra]
Textos na tela: [indique os textos em cada momento]
Legenda do post: [primeira frase gancho para não silenciar]

Tema: [TEMA]
Produto/Serviço: [PRODUTO]
Público: [PÚBLICO]`,
  },
  {
    category: "Vendas",
    title: "Proposta Comercial Executiva",
    description: "Estrutura uma proposta comercial clara, objetiva e persuasiva",
    tags: ["proposta", "vendas", "b2b"],
    content: `Crie uma proposta comercial profissional para [CLIENTE] considerando:

**Estrutura:**

1. **Sumário Executivo** (máx. 3 parágrafos): situação atual do cliente → problema identificado → resultado que entregaremos

2. **O Problema** (específico): descreva a dor com dados e linguagem do cliente, não jargões técnicos

3. **Nossa Solução**: o que fazemos, como funciona, por que é diferente

4. **Entregáveis**: lista clara do que está incluído, prazos, responsabilidades

5. **Investimento**: apresente o preço como investimento com ROI esperado. Use âncora se necessário.

6. **Próximos Passos**: 3 ações claras com datas

7. **Sobre Nós**: 3 bullets de credibilidade + 1 case relevante

Evite: jargões, promessas vagas, texto longo demais.

Cliente: [CLIENTE]
Serviço/Produto: [SERVIÇO]
Problema principal: [PROBLEMA]
Investimento: [VALOR]`,
  },
  {
    category: "Vendas",
    title: "Follow-up Pós-Reunião",
    description: "Email de follow-up que mantém o momentum e acelera o fechamento",
    tags: ["email", "follow-up", "vendas"],
    content: `Escreva um email de follow-up para após reunião de vendas.

Regras:
- Assunto: "Re: [Assunto da reunião]" ou algo que referencia o que foi falado
- Abra agradecendo de forma genuína, sem exagero
- Resuma em 3 bullets o que foi acordado/discutido
- Responda qualquer objeção ou dúvida levantada na reunião
- Inclua o próximo passo CLARO com data e responsável
- Anexe ou mencione os materiais prometidos
- Tamanho: máximo 150 palavras

Contexto da reunião: [O QUE FOI DISCUTIDO]
Próximo passo acordado: [PRÓXIMO PASSO]
Objeções levantadas: [OBJEÇÕES]
Materiais a enviar: [MATERIAIS]`,
  },
  {
    category: "Vendas",
    title: "Script de Qualificação BANT",
    description: "Perguntas estruturadas para qualificar leads via call ou reunião",
    tags: ["qualificação", "bant", "sales"],
    content: `Crie um script de qualificação para [TIPO DE LEAD] usando o framework BANT adaptado.

Para cada dimensão, gere 3 perguntas naturais e consultivas (não pareçam interrogatório):

**Budget (Orçamento)**
Perguntas para entender se há recurso disponível sem perguntar diretamente "qual seu orçamento":
→ [Pergunta 1, 2, 3]

**Authority (Autoridade)**
Perguntas para mapear quem decide e quem influencia:
→ [Pergunta 1, 2, 3]

**Need (Necessidade)**
Perguntas para aprofundar a dor e criar urgência:
→ [Pergunta 1, 2, 3]

**Timeline (Prazo)**
Perguntas para entender urgência real vs. curiosidade:
→ [Pergunta 1, 2, 3]

**Perguntas de encerramento**: como concluir a call com próximo passo definido

Produto/Serviço: [PRODUTO]
Perfil do lead: [PERFIL]`,
  },
  {
    category: "RH",
    title: "Descrição de Vaga Atrativa",
    description: "Cria descrições de vagas que atraem candidatos qualificados",
    tags: ["rh", "recrutamento", "vaga"],
    content: `Crie uma descrição de vaga para [CARGO] que atraia os candidatos certos e repele os errados.

Estrutura:
**Headline**: título da vaga + 1 frase que vende a oportunidade

**Por que trabalhar conosco** (3 bullets específicos, não genéricos como "ambiente dinâmico")

**O que você vai fazer** (responsabilidades em ordem de importância, verbos no infinitivo)

**O que buscamos**:
- Essencial (sem isso, não avançamos)
- Diferencial (te coloca na frente)
- Não exigimos (quebrando barreiras desnecessárias)

**O que oferecemos** (seja específico: salário, benefícios reais, modelo de trabalho)

**Como é o processo seletivo** (transparência gera confiança)

Cargo: [CARGO]
Nível: [JÚNIOR/PLENO/SÊNIOR]
Área: [ÁREA]
Modelo: [REMOTO/HÍBRIDO/PRESENCIAL]`,
  },
  {
    category: "RH",
    title: "Feedback de Performance",
    description: "Estrutura feedbacks construtivos e motivadores para colaboradores",
    tags: ["rh", "feedback", "gestão"],
    content: `Escreva um feedback de performance para [COLABORADOR] baseado nas informações abaixo.

Use o modelo SBI (Situação → Comportamento → Impacto):

**Pontos fortes** (2-3):
Para cada um: situação específica onde demonstrou → comportamento observado → impacto nos resultados/equipe

**Pontos de desenvolvimento** (1-2):
Para cada um: situação onde houve oportunidade → comportamento observado → impacto que isso gerou → sugestão de melhoria específica e acionável

**Metas para próximo período**:
- Meta 1: [específica, mensurável, com prazo]
- Meta 2: [específica, mensurável, com prazo]

**Mensagem de encerramento**: reconhecimento genuíno e encorajamento

Tom: direto, respeitoso, sem jargões corporativos.

Colaborador: [COLABORADOR]
Cargo: [CARGO]
Período avaliado: [PERÍODO]
Contexto/conquistas: [CONTEXTO]`,
  },
  {
    category: "RH",
    title: "Onboarding — Plano 30/60/90 dias",
    description: "Cria plano estruturado de onboarding para novos colaboradores",
    tags: ["rh", "onboarding", "gestão"],
    content: `Crie um plano de onboarding 30/60/90 dias para [CARGO] na área de [ÁREA].

**Primeiros 30 dias — Aprender**
Foco: entender o contexto, as pessoas e os processos
- Semana 1: [atividades de imersão e integração]
- Semana 2-4: [processos, ferramentas, reuniões-chave]
- Entregável ao fim dos 30 dias: [o que deve ser capaz de fazer]
- Check-in: perguntas para a reunião de 30 dias

**Dias 31-60 — Contribuir**
Foco: começar a gerar valor com suporte
- Projetos iniciais: [o que assume]
- Habilidades a desenvolver: [gaps identificados]
- Entregável ao fim dos 60 dias: [o que deve ter entregado]

**Dias 61-90 — Liderar**
Foco: autonomia crescente
- Responsabilidades plenas: [o que já pertenece a ele/ela]
- Metas do trimestre: [o que define sucesso]
- Avaliação de fit: critérios claros

Cargo: [CARGO]
Área: [ÁREA]
Gestor direto: [GESTOR]`,
  },
  {
    category: "Produto",
    title: "Product Requirements Document (PRD)",
    description: "Estrutura um PRD completo para qualquer feature ou produto",
    tags: ["produto", "prd", "feature"],
    content: `Crie um PRD (Product Requirements Document) para [FEATURE/PRODUTO].

**1. Problema**
- Qual problema estamos resolvendo?
- Para quem? (persona específica)
- Como sabemos que é um problema real? (dados, pesquisa, feedback)

**2. Objetivos**
- O que sucesso parece? (métricas específicas)
- O que não é escopo desta versão?

**3. User Stories**
Como [persona], quero [ação], para que [benefício].
(Escreva 3-5 user stories principais)

**4. Requisitos Funcionais**
- Must have (MVP)
- Should have (próxima versão)
- Nice to have (futuramente)

**5. Requisitos Não-Funcionais**
Performance, segurança, acessibilidade, compatibilidade

**6. Fluxo do Usuário**
Descreva o fluxo principal passo a passo

**7. Critérios de Aceitação**
O que precisa estar verdadeiro para considerar pronto?

**8. Dependências e Riscos**

Feature/Produto: [FEATURE]
Time responsável: [TIME]
Prazo estimado: [PRAZO]`,
  },
  {
    category: "Produto",
    title: "User Story com Critérios de Aceitação",
    description: "Escreve user stories bem estruturadas com critérios claros",
    tags: ["produto", "agile", "user-story"],
    content: `Escreva user stories completas para [FEATURE] seguindo boas práticas de produto.

Para cada história use:

**User Story**: Como [tipo de usuário], quero [realizar ação], para que [alcance benefício/objetivo].

**Contexto**: quando e por que esse usuário tem essa necessidade

**Critérios de Aceitação** (formato Dado/Quando/Então):
- Dado [contexto inicial]
- Quando [ação do usuário]
- Então [resultado esperado]

**Critérios de Não-Aceitação**: o que definitivamente não deve acontecer

**Definition of Done**: checklist técnico para considerar pronto

**Story Points estimados**: [1/2/3/5/8] com justificativa

**Dependências**: outras histórias ou sistemas necessários

Gere 3-5 user stories para cobrir os principais fluxos de:
Feature: [FEATURE]
Usuários afetados: [USUÁRIOS]`,
  },
  {
    category: "Produto",
    title: "Roadmap Trimestral",
    description: "Estrutura um roadmap de produto claro e alinhado com a estratégia",
    tags: ["produto", "roadmap", "estratégia"],
    content: `Ajude a estruturar o roadmap de produto para o próximo trimestre.

Com base nas informações abaixo, organize as iniciativas em:

**Temas Estratégicos do Trimestre** (2-3 temas que guiam as decisões)

**Now (Mês 1)**
| Iniciativa | Impacto | Esforço | Responsável | Status |
Priorize o que trava crescimento ou resolve dívida crítica.

**Next (Mês 2)**
Iniciativas que dependem do Now ou têm impacto médio-alto.

**Later (Mês 3)**
Iniciativas importantes mas não urgentes.

**O que deliberadamente NÃO faremos este trimestre** (e por quê)

**Métricas de sucesso do trimestre**: OKRs ou KPIs específicos

**Riscos e dependências** por iniciativa

**Comunicação**: como apresentar para stakeholders, engenharia e suporte

Contexto: [CONTEXTO DA EMPRESA/PRODUTO]
Iniciativas em consideração: [LISTA DE INICIATIVAS]
Restrições: [EQUIPE, PRAZO, TECH DEBT]`,
  },
  {
    category: "Suporte",
    title: "Resposta a Reclamação de Cliente",
    description: "Transforma reclamações em oportunidades de fidelização",
    tags: ["suporte", "cx", "atendimento"],
    content: `Escreva uma resposta profissional e empática para a reclamação de cliente abaixo.

Princípios:
1. **Reconheça** antes de explicar — nunca comece com justificativa
2. **Assuma responsabilidade** mesmo quando a culpa não é totalmente sua
3. **Seja específico** sobre o que aconteceu e o que vai mudar
4. **Ofereça solução concreta** (não genérica) com prazo claro
5. **Recupere a confiança** com gesto além do esperado quando possível
6. **Tom**: humano, direto, sem copy-paste corporativo

Estrutura:
- Abertura: reconhecimento genuíno da frustração
- Entendimento: demonstre que entendeu o impacto real
- Explicação (breve): o que aconteceu, sem desculpas excessivas
- Solução: o que fazemos agora
- Prevenção: o que mudamos para não repetir
- Encerramento: compromisso real

Reclamação: [RECLAMAÇÃO DO CLIENTE]
Canal: [EMAIL/CHAT/REDES SOCIAIS]
Situação: [CONTEXTO]`,
  },
  {
    category: "Suporte",
    title: "FAQ — Respostas para Dúvidas Frequentes",
    description: "Cria uma base de FAQ clara e objetiva para qualquer produto",
    tags: ["suporte", "faq", "documentação"],
    content: `Crie uma seção de FAQ completa para [PRODUTO/SERVIÇO].

Para cada pergunta use:

**P: [Pergunta exatamente como o cliente perguntaria]**
R: [Resposta direta em 1-3 frases. Primeira frase responde sim/não ou o resultado. Resto explica.]

Gere perguntas e respostas para estas categorias:

**Primeiros passos**
- Como começo?
- Quanto tempo leva para configurar?
- Preciso de conhecimento técnico?

**Preço e pagamento**
- Quanto custa?
- Como funciona o período de teste?
- Posso cancelar quando quiser?

**Funcionalidades**
- [3 perguntas sobre features principais]

**Problemas comuns**
- [3 problemas que os usuários mais relatam]

**Segurança e dados**
- Como meus dados são protegidos?
- Posso exportar meus dados?

Produto/Serviço: [PRODUTO]
Público: [PERFIL DOS USUÁRIOS]`,
  },
  {
    category: "Operações",
    title: "SOP — Procedimento Operacional Padrão",
    description: "Documenta processos críticos de forma clara e replicável",
    tags: ["ops", "sop", "processo"],
    content: `Crie um SOP (Standard Operating Procedure) para o processo de [PROCESSO].

**Cabeçalho**
- Processo: [nome]
- Responsável: [cargo]
- Frequência: [quando é executado]
- Última atualização: [data]
- Versão: [número]

**Objetivo**
O que este processo garante quando seguido corretamente.

**Quando usar**
Gatilhos que indicam que este processo deve ser iniciado.

**Pré-requisitos**
O que é necessário antes de começar (acesso, materiais, informações).

**Passo a Passo**
Para cada etapa:
☐ Passo [N]: [ação específica]
   → Como fazer: [instrução clara]
   → Ferramenta/sistema: [onde]
   → Resultado esperado: [como saber que deu certo]
   → Se der errado: [o que fazer]

**Pontos de Controle de Qualidade**

**Perguntas frequentes sobre este processo**

**Histórico de alterações**

Processo: [PROCESSO]
Área: [ÁREA]
Complexidade: [SIMPLES/MÉDIO/COMPLEXO]`,
  },
  {
    category: "Operações",
    title: "Análise de Causa Raiz (RCA)",
    description: "Estrutura análise profunda de incidentes e problemas recorrentes",
    tags: ["ops", "rca", "incident"],
    content: `Faça uma análise de causa raiz (RCA) para o incidente/problema abaixo.

**1. Descrição do Incidente**
- O que aconteceu (fatos, sem interpretação)
- Quando começou e durou quanto tempo
- Quem foi impactado e como
- Severidade: [P1/P2/P3]

**2. Linha do Tempo**
[HH:MM] - evento
[HH:MM] - evento
(reconstrua os eventos em ordem cronológica)

**3. Análise dos 5 Porquês**
Por que aconteceu? → [resposta]
Por que isso? → [resposta]
... (continue até a causa raiz real)

**4. Causas Raiz Identificadas**
- Causa imediata: [o que diretamente causou]
- Causa contribuinte: [o que facilitou]
- Causa sistêmica: [o que no processo/cultura permitiu]

**5. Ações Corretivas**
| Ação | Responsável | Prazo | Status |

**6. Ações Preventivas**
O que muda nos processos/sistemas para não repetir.

**7. Lições Aprendidas**

Incidente: [DESCRIÇÃO DO INCIDENTE]`,
  },
  {
    category: "Operações",
    title: "OKR — Objectives & Key Results",
    description: "Define OKRs ambiciosos, mensuráveis e alinhados com a estratégia",
    tags: ["okr", "estratégia", "metas"],
    content: `Ajude a definir OKRs para [ÁREA/EMPRESA] para o período [PERÍODO].

Para cada Objetivo:

**Objective**: [frase inspiradora que define onde queremos chegar — qualitativo, motivador]
*Por que este objetivo importa agora:* [contexto estratégico]

**Key Result 1**: [métrica específica: de X para Y até data]
- Como medir: [fonte de dados, quem acompanha]
- Ritmo de check-in: [semanal/quinzenal]
- 70% = bom / 100% = excelente / >100% = extraordinário

**Key Result 2**: [métrica específica]
**Key Result 3**: [métrica específica]

**Iniciativas que entregam estes KRs**: [lista de projetos/ações]
**O que não faremos para focar nisto**: [trade-offs explícitos]
**Dependências**: [outros times, recursos, decisões necessárias]

Gere 2-3 Objectives com 3 KRs cada para:
Contexto: [CONTEXTO ESTRATÉGICO]
Área: [ÁREA]
Período: [TRIMESTRE/ANO]`,
  },
  {
    category: "Financeiro",
    title: "Análise de Viabilidade de Negócio",
    description: "Avalia a viabilidade financeira de uma ideia ou projeto",
    tags: ["financeiro", "viabilidade", "startup"],
    content: `Faça uma análise de viabilidade financeira para [NEGÓCIO/PROJETO].

**1. Premissas de Mercado**
- TAM (Mercado Total Endereçável): estimativa e metodologia
- SAM (Mercado Acessível): recorte realista
- SOM (Mercado Obtenível): meta dos primeiros 3 anos

**2. Modelo de Receita**
- Como a empresa ganha dinheiro (fontes de receita)
- Ticket médio e frequência de compra
- Projeção de clientes: Ano 1 / Ano 2 / Ano 3

**3. Estrutura de Custos**
- Custos fixos mensais: [lista]
- Custos variáveis por cliente/unidade: [lista]
- Investimento inicial necessário

**4. Métricas-chave**
- CAC (Custo de Aquisição de Cliente) estimado
- LTV (Lifetime Value) estimado
- LTV/CAC ratio
- Payback period
- Ponto de equilíbrio (break-even)

**5. Cenários**
| Métrica | Pessimista | Realista | Otimista |

**6. Conclusão**
Vale a pena? Principais riscos. Próximos passos para validar.

Negócio: [DESCRIÇÃO DO NEGÓCIO]
Setor: [SETOR]
Fase: [IDEIA/MVP/TRAÇÃO]`,
  },
  {
    category: "Financeiro",
    title: "Relatório Executivo Mensal",
    description: "Estrutura relatório financeiro mensal claro para diretoria e investidores",
    tags: ["financeiro", "relatório", "gestão"],
    content: `Estruture um relatório executivo mensal para [EMPRESA] referente a [MÊS/ANO].

**Executive Summary** (máx. 150 palavras)
3 parágrafos: situação geral → principais realizações → principais desafios + próximos passos

**KPIs do Mês**
| Métrica | Meta | Realizado | Δ vs Mês Anterior | Status |
(liste os 5-8 KPIs mais críticos do negócio)

**Financeiro**
- Receita: [valor] vs meta [valor] → [variação %]
- MRR/ARR se SaaS
- Principais fontes de receita
- Custos: total e principais linhas
- EBITDA / Resultado
- Caixa: posição atual e projeção 90 dias

**Comercial**
- Novos clientes: [número]
- Churn: [número e %]
- Pipeline: [valor total qualificado]

**Operacional**
- Projetos em andamento: status
- Problemas/bloqueios que precisam de decisão

**Destaques e Aprendizados**

**Foco do Próximo Mês** (top 3 prioridades)

Empresa: [EMPRESA]
Setor: [SETOR]
Dados do mês: [DADOS]`,
  },
  {
    category: "Liderança",
    title: "1:1 — Perguntas para Reunião com Liderado",
    description: "Perguntas poderosas para conduzir 1:1s que geram desenvolvimento real",
    tags: ["liderança", "1on1", "gestão"],
    content: `Gere um banco de perguntas para conduzir 1:1s eficazes com [TIPO DE LIDERADO].

**Abertura (escolha 1)**
- O que está na sua cabeça essa semana?
- Como você está de verdade?
- O que você mais quer que eu saiba hoje?

**Progresso e Trabalho**
- O que você conseguiu desde nossa última conversa que te deixou satisfeito?
- O que está travando você agora?
- Em qual projeto você está mais animado? Por quê?
- O que eu poderia tirar do seu caminho?

**Desenvolvimento**
- O que você está aprendendo?
- Onde você quer crescer nos próximos 6 meses?
- O que eu poderia fazer diferente para te ajudar mais?
- Tem alguma responsabilidade que você gostaria de assumir?

**Equipe e Cultura**
- Como está a dinâmica da equipe?
- Tem algo que a empresa poderia fazer melhor?

**Encerramento**
- Qual é a sua prioridade número 1 até nossa próxima reunião?
- O que eu me comprometo a fazer pela nossa próxima reunião?

Perfil do liderado: [PERFIL]
Fase de carreira: [JÚNIOR/PLENO/SÊNIOR/LIDERANÇA]`,
  },
  {
    category: "Liderança",
    title: "Comunicado de Mudança Organizacional",
    description: "Redige comunicados internos de mudança com clareza e empatia",
    tags: ["liderança", "comunicação", "interno"],
    content: `Escreva um comunicado interno sobre [MUDANÇA] para os colaboradores da [EMPRESA].

**Princípios do comunicado:**
- Seja honesto sobre o porquê — pessoas sentem quando estão recebendo spin
- Antecipe as perguntas que todo mundo vai ter mas não vai perguntar
- Seja específico sobre o que muda e o que não muda
- Dê próximos passos claros

**Estrutura:**
1. **Abertura**: reconheça o contexto (por que agora)
2. **O que está mudando**: seja específico, sem jargões
3. **Por que estamos fazendo isso**: a razão real, não a versão PR
4. **O que isso significa para você**: impacto prático por grupo de pessoas
5. **O que não muda**: ancoragem de segurança
6. **O que acontece agora**: timeline e próximos passos
7. **Como tiro minhas dúvidas**: canal, responsável, prazo

Tom: direto, humano, respeitoso. Sem eufemismos.

Mudança: [DESCRIÇÃO DA MUDANÇA]
Público: [TODA EMPRESA/ÁREA ESPECÍFICA]
Contexto: [CONTEXTO]`,
  },
  {
    category: "Conteúdo",
    title: "Estratégia de Conteúdo 90 dias",
    description: "Cria plano de conteúdo trimestral alinhado com objetivos de negócio",
    tags: ["conteúdo", "marketing", "estratégia"],
    content: `Crie uma estratégia de conteúdo para 90 dias para [EMPRESA/MARCA].

**Diagnóstico**
- Objetivo de negócio que o conteúdo deve apoiar
- Público-alvo principal (persona detalhada)
- Canais prioritários e por quê
- Posicionamento de conteúdo: o que nos diferencia

**Pilares de Conteúdo** (3-4 temas centrais que todo conteúdo se conecta)

**Calendário por Mês**

**Mês 1 — [Tema foco]**
| Semana | Formato | Tema | Canal | CTA |
(4 semanas, 3-5 publicações/semana)

**Mês 2 — [Tema foco]**
(mesmo formato)

**Mês 3 — [Tema foco]**
(mesmo formato)

**Formatos recomendados por canal**
- [Canal 1]: [formatos que performam]
- [Canal 2]: [formatos que performam]

**Métricas de sucesso**
- O que medir (não apenas likes e seguidores)
- Frequência de análise
- Sinal de que a estratégia está funcionando

**Próximos passos para execução**

Empresa: [EMPRESA]
Setor: [SETOR]
Objetivo: [OBJETIVO]
Canais: [CANAIS]`,
  },
  {
    category: "Conteúdo",
    title: "Newsletter Semanal de Negócios",
    description: "Estrutura uma newsletter engajante sobre qualquer tema de negócios",
    tags: ["newsletter", "email", "conteúdo"],
    content: `Escreva uma edição de newsletter semanal sobre [TEMA PRINCIPAL].

**Assunto do email**: [3 opções de assunto — teste A/B]
**Preview text**: [complemento do assunto, máx. 85 caracteres]

---

**Saudação personalizada** (não use "Olá, [nome]" — seja criativo)

**Abertura** (2-3 frases): gancho que conecta o tema da semana com algo que aconteceu

**[TÍTULO DA SEÇÃO PRINCIPAL]**
O insight ou análise principal. Máx. 300 palavras. Use:
- Dados concretos
- Exemplo real
- Implicação prática para o leitor

**O que você pode fazer hoje**: 1 ação específica derivada do insight acima

**Rápidos desta semana** (3-5 bullets):
→ [notícia/tendência relevante + 1 linha de contexto]

**Recomendação da semana**: [livro/ferramenta/artigo + por que vale]

**Encerramento**: pessoal, não corporativo. Termine com pergunta para gerar resposta.

---

**Footer**: link para cancelar, redes sociais, site

Tema: [TEMA]
Audiência: [PERFIL DOS LEITORES]
Tom: [FORMAL/CASUAL/TÉCNICO]`,
  },
  {
    category: "IA & Automação",
    title: "Prompt de Persona para IA",
    description: "Cria personas detalhadas para agentes de IA com comportamento consistente",
    tags: ["ia", "prompt", "automação"],
    content: `Crie uma persona completa para um agente de IA que vai atuar como [PAPEL].

**Identidade**
- Nome: [nome do agente]
- Papel: [descrição precisa do que faz]
- Especialidade: [área de conhecimento principal]

**Tom de Voz**
- Como fala: [adjetivos e exemplos]
- Como não fala: [o que evita]
- Nível de formalidade: [1-10 e por quê]
- Exemplos de frases que usa vs. evita

**Comportamento**
- Quando não sabe algo: [o que faz]
- Quando o pedido está fora do escopo: [como redireciona]
- Quando há ambiguidade: [pede clarificação ou assume e avisa?]
- Formato padrão de resposta: [estrutura]

**Limites e Restrições**
- O que pode fazer
- O que não pode ou não deve fazer
- Como lida com pedidos inapropriados

**Conhecimento Prioritário**
- O que sabe muito bem
- O que sabe razoavelmente
- O que não sabe e deve admitir

**Exemplo de interação ideal**:
Usuário: [pergunta exemplo]
Agente: [resposta ideal que exemplifica todos os princípios acima]

Papel: [PAPEL DO AGENTE]
Contexto de uso: [ONDE SERÁ USADO]
Usuários: [QUEM VAI INTERAGIR]`,
  },
  {
    category: "IA & Automação",
    title: "Análise de Dados com IA",
    description: "Extrai insights acionáveis de qualquer conjunto de dados",
    tags: ["ia", "dados", "análise"],
    content: `Analise os dados abaixo e extraia insights acionáveis para [OBJETIVO].

**Instruções de análise:**

1. **Padrões principais**: identifique as 3-5 tendências mais significativas nos dados
2. **Anomalias**: o que se destaca positiva ou negativamente do esperado
3. **Correlações**: relações entre variáveis que podem ter relação causal
4. **Segmentação**: como os dados se dividem em grupos significativos
5. **Benchmark implícito**: o que os dados sugerem sobre performance relativa

**Para cada insight:**
- O que os dados mostram (fato)
- O que isso provavelmente significa (interpretação)
- O que fazer com isso (ação recomendada)
- Confiança: alta/média/baixa (com justificativa)

**O que os dados não mostram**: lacunas e limitações da análise

**Próximas perguntas para investigar**: o que mais precisamos saber para tomar decisões melhores

**Resumo executivo**: 3 bullets com os insights mais críticos e ações imediatas

Dados: [COLE OS DADOS AQUI]
Objetivo: [O QUE VOCÊ QUER DESCOBRIR]
Contexto: [CONTEXTO DO NEGÓCIO]`,
  },
  {
    category: "Jurídico",
    title: "Revisão de Contrato — Red Flags",
    description: "Identifica cláusulas problemáticas em contratos comerciais",
    tags: ["jurídico", "contrato", "compliance"],
    content: `Revise o contrato abaixo e identifique pontos de atenção.

IMPORTANTE: Esta análise é para fins de orientação inicial e não substitui consultoria jurídica profissional.

**Analise e reporte:**

**🔴 Red Flags Críticos** (cláusulas que podem gerar risco significativo):
Para cada uma: [cláusula] → [por que é problemática] → [o que negociar]

**🟡 Pontos de Atenção** (cláusulas que merecem esclarecimento):
Para cada uma: [cláusula] → [ambiguidade ou risco moderado] → [sugestão]

**🟢 Cláusulas que protegem bem** (o que está bem redigido):
Para cada uma: [cláusula] → [por que é boa proteção]

**Cláusulas ausentes** (o que está faltando e deveria estar):
- [lista do que não está no contrato mas deveria]

**Recomendações de negociação** (em ordem de prioridade):
1. [cláusula crítica para negociar primeiro]
2. [segunda prioridade]
3. [terceira prioridade]

**Próximos passos recomendados**

Contrato: [COLE O CONTRATO AQUI]
Parte que você representa: [COMPRADOR/VENDEDOR/PRESTADOR/CONTRATANTE]
Setor: [SETOR]`,
  },
];

async function main() {
  console.log("🌱 Iniciando seed...");

  // Create or find the CavaLabs official user
  const hashedPassword = await bcrypt.hash("cavalabs-official-2026", 10);

  const officialUser = await prisma.user.upsert({
    where: { email: "official@cavalabs.tech" },
    update: {},
    create: {
      name: "CavaLabs",
      email: "official@cavalabs.tech",
      password: hashedPassword,
    },
  });

  console.log(`✅ Usuário oficial: ${officialUser.email}`);

  let created = 0;

  for (const p of prompts) {
    const categorySlug = p.category.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const category = await prisma.category.upsert({
      where: { userId_slug: { userId: officialUser.id, slug: categorySlug } },
      update: {},
      create: { name: p.category, slug: categorySlug, userId: officialUser.id },
    });

    const titleSlug = p.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.prompt.findUnique({
      where: { userId_slug: { userId: officialUser.id, slug: titleSlug } },
    });

    if (existing) {
      console.log(`⏭️  Já existe: ${p.title}`);
      continue;
    }

    const tagConnections = await Promise.all(
      p.tags.map(async (tagName) => {
        const tagSlug = tagName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        return { tagId: tag.id };
      }),
    );

    await prisma.prompt.create({
      data: {
        title: p.title,
        slug: titleSlug,
        content: p.content,
        description: p.description,
        visibility: "PUBLIC",
        userId: officialUser.id,
        categoryId: category.id,
        tags: { create: tagConnections },
      },
    });

    created++;
    console.log(`✅ Criado: ${p.title}`);
  }

  console.log(`\n🎉 Seed concluído! ${created} prompts criados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
