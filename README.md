# API Golden Raspberry Awards

Esta é uma API RESTful desenvolvida como solução para o desafio de back-end da Outsera. A aplicação lê uma lista de indicados e vencedores da categoria "Pior Filme" do Golden Raspberry Awards e expõe um endpoint para consultar o produtor com o maior e o menor intervalo entre prêmios consecutivos.

## ✨ Funcionalidades

- **Carga de Dados Automática**: Carrega a lista de filmes do arquivo `movielist.csv` para um banco de dados SQLite em memória na inicialização.
- **Banco de Dados em Memória**: Utiliza `better-sqlite3` para um banco de dados rápido e que não requer instalação externa.
- **API RESTful (Nível 2 de Richardson)**: Endpoints para consultar os intervalos de prêmios e realizar operações CRUD na entidade de filmes.
- **Cálculo de Intervalos**: Algoritmo otimizado para encontrar os produtores com os maiores e menores intervalos entre vitórias.
- **Estrutura Dockerizada**: `Dockerfile` multi-stage e `docker-compose.yml` para ambientes de desenvolvimento, teste e produção.
- **Testes de Integração**: Cobertura de testes completa com Vitest para garantir a precisão e o funcionamento da API.
- **CI/CD com GitHub Actions**: Workflow automatizado para rodar testes e construir a imagem Docker a cada push ou pull request.

## 🛠️ Tecnologias Utilizadas

| Categoria           | Tecnologia                               |
| ------------------- | ---------------------------------------- |
| **Linguagem**       | TypeScript                               |
| **Framework**       | Fastify                                  |
| **Banco de Dados**  | SQLite (em memória com `better-sqlite3`) |
| **Testes**          | Vitest                                   |
| **Container**       | Docker & Docker Compose                  |
| **CI/CD**           | GitHub Actions                           |
| **Package Manager** | pnpm                                     |

## 🚀 Como Executar a Aplicação

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (v20 ou superior)
- [Docker](https://www.docker.com/get-started) (opcional, para execução em container)
- [pnpm](https://pnpm.io/installation) (instalado via `corepack enable` ou `npm install -g pnpm`)

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd golden-raspberry-api
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Executando Localmente (Desenvolvimento)

O servidor irá iniciar em `http://localhost:3000` com hot-reload.

```bash
pnpm dev
```

### 4. Executando com Docker

A forma mais simples de subir a aplicação em um ambiente de produção simulado é usando o Docker Compose.

```bash
docker-compose up --build
```

A API estará disponível em `http://localhost:3000`.

## 🧪 Como Rodar os Testes

Os testes de integração foram escritos com Vitest e cobrem todos os endpoints e a lógica de negócio principal.

### 1. Rodar Testes Localmente

```bash
pnpm test
```

Para ver a cobertura de testes:

```bash
pnpm test:coverage
```

### 2. Além de testar com o Postman, podemos rodar o teste com REST Client

REST Client --> É uma extensão para quem utiliza VSCODE.
1º passo: Após instalar a extensão no VSCode, criar na raiz do projeto o arquivo: api.http

2º passo: Dentro do arquivo: api.http inserir a requisição: GET http://localhost:3000/producers/awards-interval

3º passo: Dentro de api.http e acima do GET clicar em: Send Request, ao lado de: api.http abrirá o json com o resultado da requisição.

### 3. Rodar Testes com Docker

Este comando utiliza o `profile` de teste definido no `docker-compose.yml` para construir a imagem de teste e executar os testes em um ambiente isolado.

```bash
docker-compose --profile test up --build
```

## 📂 Estrutura do Projeto

A estrutura de arquivos foi organizada para manter uma clara separação de responsabilidades:

```plaintext
/
├── .github/workflows/    # Workflows de CI/CD (GitHub Actions)
├── data/
│   └── movielist.csv     # Arquivo CSV com os dados dos filmes
├── dist/                 # Código transpilado para produção
├── src/
│   ├── database/         # Configuração do SQLite e script de carga (seed)
│   ├── routes/           # Definição dos endpoints da API
│   ├── services/         # Lógica de negócio (cálculo de intervalos, CRUD)
│   ├── types/            # Definições de tipos e interfaces TypeScript
│   ├── app.ts            # Configuração da instância do Fastify
│   └── server.ts         # Ponto de entrada da aplicação
├── tests/                # Testes de integração
├── .dockerignore         # Arquivos a serem ignorados pelo Docker
├── .gitignore            # Arquivos a serem ignorados pelo Git
├── Dockerfile            # Dockerfile multi-stage para build e produção
├── docker-compose.yml    # Orquestração de containers para diferentes ambientes
├── package.json          # Dependências e scripts do projeto
├── pnpm-lock.yaml        # Lockfile do pnpm
├── tsconfig.json         # Configuração do compilador TypeScript
├── vitest.config.ts      # Configuração do Vitest
└── README.md             # Esta documentação
```

## 🌐 Endpoints da API

A API segue os princípios REST e o nível 2 de maturidade de Richardson.

### Endpoint Principal

#### `GET /producers/awards-interval`

Retorna o produtor com o maior intervalo entre dois prêmios consecutivos e o que obteve dois prêmios mais rápido.

**Exemplo de Resposta:**

```json
{
  "min": [
    {
      "producer": "Joel Silver",
      "interval": 1,
      "previousWin": 1990,
      "followingWin": 1991
    }
  ],
  "max": [
    {
      "producer": "Matthew Vaughn",
      "interval": 13,
      "previousWin": 2002,
      "followingWin": 2015
    }
  ]
}
```

### Endpoints de Gerenciamento (CRUD)

A API também provê endpoints para gerenciar os filmes, úteis para testes e futuras extensões.

- `GET /movies`: Lista todos os filmes.
- `GET /movies?year={ano}`: Filtra filmes por ano.
- `GET /movies?winner=true`: Filtra apenas os vencedores.
- `GET /movies/:id`: Obtém um filme por ID.
- `POST /movies`: Cria um novo filme.
- `PUT /movies/:id`: Atualiza um filme (substituição completa).
- `PATCH /movies/:id`: Atualiza um filme parcialmente.
- `DELETE /movies/:id`: Remove um filme.

### Health Check

- `GET /health`: Retorna o status da aplicação. Útil para monitoramento.
