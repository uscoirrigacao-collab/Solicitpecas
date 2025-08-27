# Solicit Peças

Solicit Peças é uma aplicação web progressiva (PWA) para gestão de pedidos de peças, construída com Next.js e Firebase. Ela permite que usuários criem solicitações de peças e que administradores gerenciem o status desses pedidos em tempo real.

## Tecnologias Utilizadas

- **Next.js:** Framework React para construção de aplicações web modernas e performáticas.
- **Firebase:** Plataforma para desenvolvimento de aplicações web e móveis.
    - **Firestore:** Banco de dados NoSQL em tempo real para armazenamento de dados.
    - **App Hosting:** Hospedagem para a aplicação web.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
- **ShadCN/UI:** Coleção de componentes de UI reutilizáveis.
- **Tailwind CSS:** Framework de CSS para estilização.

## Funcionalidades

- **Autenticação:** Sistema de login para administradores.
- **Visualização por Perfil:**
    - **Administrador:** Visualiza e gerencia todas as solicitações de peças.
    - **Usuário Comum:** Visualiza apenas as suas próprias solicitações.
- **Criação e Edição de Pedidos:** Formulário completo para criar e atualizar solicitações.
- **Atualização de Status:** Administradores podem alterar o status de um pedido (Pendente, Disponível, Em Falta, Concluído).
- **Progressive Web App (PWA):** A aplicação pode ser "instalada" em dispositivos móveis e desktops para uma experiência nativa.
- **Design Responsivo:** Interface adaptável para diferentes tamanhos de tela.

## Como Executar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone <url-do-seu-repositorio-github>
   ```

2. **Navegue até o diretório do projeto:**
   ```bash
   cd Solicit-Pecas
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

A aplicação estará disponível em `http://localhost:9002`.
