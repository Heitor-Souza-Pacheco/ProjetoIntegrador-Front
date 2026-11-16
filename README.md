# Donnuts & Breack — Front-end

Front-end em HTML, CSS e JavaScript puro, mantendo a identidade visual original do projeto: tons de rosa e marrom, fontes Cutive, Hammersmith One e Holtwood One SC, além dos temas claro e escuro.

## Executar localmente

1. Inicie a API DeliveryAPI.
2. Configure a conexão MySQL da API pela variável de ambiente `ConnectionStrings__DefaultConnection`.
3. Execute o front com Live Server na porta `5500`.
4. A API local é chamada em `http://localhost:5295/api`.

Em produção, o front usa o caminho relativo `/api`. Configure o Nginx para encaminhar esse caminho à API.

## Funcionalidades integradas

- Cadastro de clientes e entregadores.
- Login com seleção do tipo de conta.
- Consulta dinâmica do catálogo e dos preços.
- Carrinho persistido no MySQL pela API.
- Finalização de pedido com endereço de entrega.
- Atualização de dados do perfil.
- Painel do entregador para consultar pedidos e avançar o status da entrega.

## Organização

- Páginas HTML separadas.
- Estilos organizados em `css/global`, `css/header` e `css/page`.
- `style.css` importa os arquivos de estilo.
- `script.js` concentra as chamadas à API e os comportamentos das páginas.
- `theme.js` controla o tema claro/escuro.

O projeto é acadêmico e ainda não utiliza tokens JWT ou autorização validada no servidor. Não deve ser usado em produção sem implementar esses controles no backend.
