// Edita estes dados com a informação confirmada pela marca antes de publicar.
export const siteConfig = {
  brandName: "Delícias e Sabores de Fatu",
  currency: "CVE",
  locale: "pt-CV",
  whatsappNumber: "", // Formato internacional, apenas algarismos, por exemplo 238XXXXXXXX.
  email: "",
  location: "Cabo Verde",
  socialLinks: [
    // { label: "Instagram", url: "https://instagram.com/..." },
    // { label: "Facebook", url: "https://facebook.com/..." },
  ],
};

// Produtos, preços e disponibilidade abaixo são exemplos de demonstração.
// Substitui-os por informação confirmada e fotografias próprias antes de vender.
export const products = [
  {
    id: "ponvhee-demo",
    name: "Ponvhee",
    category: "Doces tradicionais",
    price: 450,
    availability: true,
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Seleção de doces apresentada numa mesa",
    description: "Produto de demonstração. Acrescenta aqui a descrição verdadeira, os ingredientes e o formato disponível.",
  },
  {
    id: "doce-tradicional-demo",
    name: "Doce tradicional",
    category: "Doces tradicionais",
    price: 600,
    availability: true,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Bolo artesanal para partilhar",
    description: "Produto de demonstração. Personaliza este texto com informação confirmada sobre o produto.",
  },
  {
    id: "cana-demo",
    name: "Especialidade de cana",
    category: "À base de cana-de-açúcar",
    price: 750,
    availability: true,
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Doce artesanal servido para partilhar",
    description: "Exemplo editável de uma especialidade relacionada com cana-de-açúcar. Confirma a composição antes de publicar.",
  },
  {
    id: "sabor-da-terra-demo",
    name: "Sabor da terra",
    category: "Outros sabores",
    price: 500,
    availability: true,
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Preparação artesanal apresentada num prato",
    description: "Produto de demonstração. Substitui o nome, a descrição, o preço e a fotografia pelos dados reais.",
  },
];
