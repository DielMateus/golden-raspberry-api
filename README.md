# 🏆 API Golden Raspberry Awards

A aplicação lê uma lista de indicados e vencedores da categoria "Pior Filme" do Golden Raspberry Awards e expõe um endpoint para consultar os produtores com o maior e o menor intervalo entre prêmios consecutivos.

## ✨ Funcionalidades

- **Carga de Dados Automática**: Processa o arquivo `movielist.csv` e popula um banco de dados SQLite em memória durante a inicialização.
- **Banco de Dados em Memória**: Utiliza `better-sqlite3` para persistência volátil de alta performance, sem necessidade de instalação externa.
- **API RESTful**: Endpoint otimizado para consulta de intervalos de prêmios seguindo os padrões de maturidade Richardson Nível 2.
- **Cálculo de Intervalos**: Algoritmo que identifica os intervalos mínimo e máximo entre vitórias consecutivas, tratando corretamente empates e múltiplos produtores.
- **Estrutura Dockerizada**: `Dockerfile` multi-stage e `docker-compose.yml` configurados para ambientes de desenvolvimento, teste e produção.
- **Integridade de Dados**: Testes de integração que validam os resultados exatos do dataset da proposta e garantem que a lógica falhe caso os dados sejam alterados.
- **CI/CD com GitHub Actions**: Workflow automatizado para execução de testes e build da imagem Docker a cada push ou pull request.

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
git clone https://github.com/DielMateus/golden-raspberry-api.git
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

A aplicação utiliza multi-stage builds para garantir portabilidade e performance.

```bash
docker-compose up --build
```

Nota: O Dockerfile realiza o rebuild nativo do better-sqlite3, garantindo compatibilidade entre arquiteturas (ARM64/x64).

## 🧪 Como Rodar os Testes

### 1. Rodar Localmente

```bash
pnpm test:coverage
```

### 2. Além de testar com o Postman, podemos rodar o teste com REST Client

REST Client --> É uma extensão para quem utiliza VSCODE.
1º passo: Após instalar a extensão no VSCode, criar na raiz do projeto o arquivo: api.http

2º passo: Dentro do arquivo: api.http inserir a requisição: GET http://localhost:3000/producers/awards-interval

3º passo: Dentro de api.http e acima do GET clicar em: Send Request, ao lado de: api.http abrirá o json com o resultado da requisição.

### 3. Rodar Testes com Docker

```bash
docker-compose --profile test up --build
ou
docker-compose run --rm test
```

## 📂 Estrutura do Projeto

```plaintext
/
├── .github/workflows/    # Workflows de CI/CD (GitHub Actions)
├── data/
│   └── movielist.csv     # Dataset original (movielist.csv)
├── dist/                 # Código transpilado para produção
├── src/
│   ├── database/         # Configuração do SQLite e script de carga (seed)
│   ├── routes/           # Definição dos endpoints da API
│   ├── services/         # Lógica de negócio (cálculo de intervalos)
│   ├── types/            # Definições de tipos e interfaces TypeScript
│   ├── app.ts            # Configuração da instância do Fastify
│   └── server.ts         # Ponto de entrada da aplicação
├── tests/                # Testes de integração e unidade
├── Dockerfile            # Dockerfile multi-stage para build e produção
├── docker-compose.yml    # Orquestração de containers para diferentes ambientes
```

🌐 Endpoints da API

#### `GET /producers/awards-interval`

Retorna os produtores com maior e menor intervalo entre prêmios consecutivos.

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

### Health Check

- `GET /health`: Retorna o status da aplicação. Útil para monitoramento.
  { "status": "ok", "timestamp": "..." }
