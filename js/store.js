/**
 * Calc Coffee - Curadoria de Grãos & Equipamentos (Shopping / Afiliação)
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CoffeeStore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  const PRODUCTS = [
    {
      id: "grao-mantiqueira",
      category: "beans",
      title: "Mantiqueira de Minas • Catuaí Amarelo",
      roaster: "Torrefação Artesanal Parceira",
      sca: "88 Pontos SCA",
      roast: "Média Clara",
      notes: "Melaço de cana, pêssego e acidez cítrica málica brilhante",
      process: "Cereja Descascado",
      price: "R$ 48,90",
      package: "250g em grãos",
      badge: "Mais Vendido",
      partner: "Moka Clube / Veroo / Torrefações Locais",
      link: "https://amazon.com.br?tag=calccoffee-20",
      coupon: "CALCCOFFEE10"
    },
    {
      id: "grao-cerrado",
      category: "beans",
      title: "Cerrado Mineiro • Bourbon Amarelo",
      roaster: "Reserva Especial",
      sca: "86 Pontos SCA",
      roast: "Média",
      notes: "Chocolate belga meio amargo, avelã tostada e finalização doce",
      process: "Natural Fermentado",
      price: "R$ 44,00",
      package: "250g em grãos",
      badge: "Clássico",
      partner: "Torrefações Mineiras",
      link: "https://amazon.com.br?tag=calccoffee-20",
      coupon: "CALCCOFFEE10"
    },
    {
      id: "grao-caparao",
      category: "beans",
      title: "Caparaó • Microlote Raro Variedade Arara",
      roaster: "Origens do Brasil",
      sca: "91 Pontos SCA",
      roast: "Clara",
      notes: "Flor de laranjeira, mel silvestre e maracujá doce",
      process: "Fermentação Anaeróbica 72h",
      price: "R$ 68,00",
      package: "200g em grãos",
      badge: "Microlote Campeão",
      partner: "Produtores da Serra do Caparaó",
      link: "https://amazon.com.br?tag=calccoffee-20",
      coupon: "CALCCOFFEE10"
    },
    {
      id: "moedor-timemore",
      category: "gear",
      title: "Moedor Manual Timemore Chestnut C3",
      roaster: "Timemore Original",
      sca: "Mós Cônicas em Inox S2C",
      roast: "Essencial",
      notes: "Acaba com o pó fino irregular. Regulagem clique a clique para V60, Aeropress e Prensa.",
      process: "Corpo em Alumínio Aeroespacial",
      price: "R$ 389,00",
      package: "Garantia 12 meses",
      badge: "Salto de Qualidade #1",
      partner: "Amazon Brasil / Distribuidor Oficial",
      link: "https://amazon.com.br?tag=calccoffee-20",
      coupon: "FRETE GRÁTIS"
    },
    {
      id: "chaleira-gooseneck",
      category: "gear",
      title: "Chaleira Bico de Ganso Gooseneck 1.0L",
      roaster: "Fava / Mimo Style",
      sca: "Termômetro Analógico na Tampa",
      roast: "Precisão",
      notes: "Permite controlar a vazão em fio contínuo de água sem afundar ou quebrar a cama de pó.",
      process: "Aço Inox 304 Polido",
      price: "R$ 179,00",
      package: "Compatível com Indução e Gás",
      badge: "Controle de Fluxo",
      partner: "Amazon Brasil",
      link: "https://amazon.com.br?tag=calccoffee-20",
      coupon: "CALCCOFFEE"
    },
    {
      id: "balanca-timer",
      category: "gear",
      title: "Balança Digital de Alta Precisão (0.1g) com Cronômetro",
      roaster: "Barista Setup",
      sca: "Precisão 0.1g a 3kg",
      roast: "Autonomia",
      notes: "Display LED embutido, tara rápida e timer integrado. Bateria recarregável via USB-C.",
      process: "Borracha de silicone isolante térmica",
      price: "R$ 139,00",
      package: "Cabo USB incluso",
      badge: "Custo-Benefício",
      partner: "Mercado Livre / Amazon",
      link: "https://amazon.com.br?tag=calccoffee-20",
      coupon: "CALCCOFFEE"
    },
    {
      id: "koar-porcelana",
      category: "gear",
      title: "Koar de Porcelana Original (Made in Brazil)",
      roaster: "Koar Cafés Especiais",
      sca: "Método 100% Brasileiro",
      roast: "Doçura & Corpo",
      notes: "Desenvolvido em Recife com 16 sulcos inclinados que maximizam a doçura e extração de cafés brasileiros.",
      process: "Porcelana refratária de alta densidade",
      price: "R$ 159,00",
      package: "Acompanha anel suporte",
      badge: "Orgulho Nacional",
      partner: "Koar Oficial",
      link: "https://koar.com.br",
      coupon: "CALCCOFFEE10"
    },
    {
      id: "filtros-v60",
      category: "gear",
      title: "Filtros de Papel Hario V60-02 (Pacote com 100 un)",
      roaster: "Hario Japão",
      sca: "Papel Branco Alvejado sem Gosto",
      roast: "Consumível",
      notes: "Papel de fibra virgem japonesa. Não passa gosto de papel para o café e mantém a vazão ideal.",
      process: "Original Hario Japan",
      price: "R$ 54,90",
      package: "100 filtros",
      badge: "Reposição",
      partner: "Amazon Prime",
      link: "https://amazon.com.br?tag=calccoffee-20",
      coupon: "ASSINATURA DISPONÍVEL"
    }
  ];

  function getProducts(category) {
    if (!category || category === "all") return PRODUCTS;
    return PRODUCTS.filter(p => p.category === category);
  }

  return {
    PRODUCTS,
    getProducts
  };
});
