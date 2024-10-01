# teste Parcero Imóveis - Backend

Este é o backend do sistema Parcero Imóveis, fornecendo uma API RESTful para o gerenciamento de propriedades imobiliárias.

## Pré-requisitos

- Node.js (versão 14.x ou superior)
- npm (normalmente vem com o Node.js)
- MongoDB (versão 4.x ou superior)

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/partner.git
   cd partner
   ```

2. Instale as dependências:
   ```
   npm install
   ```

## Configuração

1. Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/seu_banco_aqui
   JWT_SECRET=sua_chave_secreta_aqui
   JWT_EXPIRE=30d
   ```
   Ajuste as variáveis conforme necessário.

## Executando o projeto

Para iniciar o servidor em modo de desenvolvimento:
```
npm run dev
```


Para iniciar o servidor em modo de produção:
```
npm start
```

O servidor estará rodando em `http://localhost:5000`.

## Estrutura do projeto

- `src/`: Contém o código-fonte do aplicativo
  - `controllers/`: Lógica de negócios
  - `models/`: Modelos do Mongoose
  - `routes/`: Definições de rotas
  - `middleware/`: Middlewares personalizados
  - `utils/`: Utilitários e helpers

## API Endpoints

- `GET /api/properties`: Lista todas as propriedades
- `POST /api/properties`: Cria uma nova propriedade
- `GET /api/properties/:id`: Obtém detalhes de uma propriedade específica
- `PUT /api/properties/:id`: Atualiza uma propriedade
- `DELETE /api/properties/:id`: Exclui uma propriedade

Para mais detalhes sobre os endpoints, consulte a documentação da API.

## Contribuindo
@UmarginaU

Por favor, leia CONTRIBUTING.md para detalhes sobre nosso código de conduta e o processo para enviar pull requests (não implementado).

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE.md para detalhes.
