# Delícias e Sabores de Fatu

Website estático, responsivo e em português para a marca cabo-verdiana Delícias e Sabores de Fatu. Inclui catálogo pesquisável e filtrável, detalhes de produto, carrinho guardado no navegador e preparação de pedidos através do WhatsApp.

## Executar localmente

Não é necessário instalar dependências nem compilar o projeto. Como o site usa módulos JavaScript, abre-o através de um servidor HTTP local:

1. Instala o Python 3, se ainda não estiver instalado.
2. Na pasta do projeto, executa no PowerShell:

   ```powershell
   py -m http.server 8000
   ```

3. Abre <http://localhost:8000> no navegador.
4. Para parar o servidor, usa `Ctrl+C` no terminal.

Também podes abrir a pasta no Visual Studio Code e iniciar um servidor estático com uma extensão como Live Server.

## Configuração da marca e catálogo

Edita [config.js](./config.js) antes de publicar:

- `whatsappNumber`: número de WhatsApp com indicativo internacional, apenas algarismos. Sem esta configuração, os botões informam que o contacto não está ativo e não simulam o envio.
- `email`, `location` e `socialLinks`: contactos e páginas oficiais confirmados pela empresa.
- `products`: nomes, categorias, preços em CVE, disponibilidade, descrições, textos alternativos e fotografias.
- `currency` e `locale`: moeda e formatação regional.

Os quatro produtos, respetivas descrições, disponibilidades e preços incluídos são **dados de demonstração**. Confirma e substitui todos esses dados antes de aceitar encomendas. As fotografias são imagens ilustrativas externas do Unsplash, não fotografias dos produtos da marca; troca-as por imagens próprias que correspondam fielmente a cada artigo. A história apresentada na homepage também é texto de demonstração e deve ser substituída pela história verdadeira da proprietária.

## Funcionalidades e limites

- A pesquisa, os filtros, os detalhes de produto, as quantidades, a remoção de artigos e o subtotal funcionam no frontend.
- O carrinho fica em `localStorage` no navegador do cliente. Não guarda dados de pagamento nem envia uma encomenda para um servidor.
- O formulário de pedido valida os campos e, após uma ação explícita do cliente, prepara uma mensagem com o resumo e abre o WhatsApp configurado. O pedido só é uma consulta: **não confirma encomenda, stock, preço final, entrega ou pagamento**. A equipa deve responder ao cliente.
- A newsletter permanece inativa. O formulário valida o endereço, mas informa que não o envia nem guarda.
- Não estão configurados pagamentos, inventário sincronizado, entregas, armazenamento de encomendas, contas de cliente, backend ou serviço de newsletter. Para essas funções, integra um backend seguro e/ou prestador de serviços adequado; não coloques chaves secretas no JavaScript do browser.
- Os textos informativos de entregas e pagamentos deixam claro que essas opções ainda precisam de ser confirmadas. O carrinho e o pedido não constituem checkout com pagamento.
- A homepage inclui metadados básicos e Open Graph. Não inclui dados estruturados de produtos, uma vez que os artigos e preços ainda são apenas exemplos.
- A preferência do sistema por movimento reduzido é respeitada. A interface inclui navegação por teclado, rótulos acessíveis, formulários validados e disposição adaptável a ecrãs pequenos.

## Publicar na Internet

O projeto não requer compilação. Publica os ficheiros `index.html`, `styles.css`, `app.js` e `config.js` num alojamento de sites estáticos, como Netlify, Vercel, GitHub Pages ou um servidor web com HTTPS:

1. Substitui o conteúdo de demonstração e confirma os contactos, produtos, preços, disponibilidade e direitos das fotografias.
2. Carrega os ficheiros do projeto para o alojamento, preservando a estrutura e os caminhos relativos.
3. Define o domínio e ativa HTTPS no serviço de alojamento.
4. Testa a navegação móvel, as ligações, as imagens, o carrinho e o fluxo WhatsApp no endereço publicado.

Para receber encomendas de forma automatizada, processar pagamentos ou guardar contactos, liga um serviço/backend seguro e configura a política de privacidade e as condições de venda correspondentes antes de ativar essas funções.
