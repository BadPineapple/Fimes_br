export interface Filme {
  id: number;
  titulo: string;
  ano: number;
  nota: number;
  genero: string[];
  imagem_capa: string;
  diretor?: string;
  sinopse?: string;
  nota_letterboxd?: number;
  onde_assistir?: string[];
}

export const parseGenero = (genero: string): string[] => {
  return genero.split(',').map(g => g.trim());
};

export const filmesData: Filme[] = [
  {
    id: 1,
    titulo: "Cidade de Deus",
    ano: 2002,
    nota: 8.6,
    genero: ["Drama", "Crime", "Favela", "Rio de Janeiro"],
    imagem_capa: "",
    diretor: "Fernando Meirelles",
    sinopse: "Buscapé é um jovem pobre, negro e muito sensível, que cresce em um universo de muita violência. Ele vive na Cidade de Deus, favela carioca conhecida por ser um dos locais mais violentos do Rio.",
    nota_letterboxd: 4.3,
    onde_assistir: ["Netflix", "Globoplay"],
  },
  {
    id: 2,
    titulo: "Tropa de Elite",
    ano: 2007,
    nota: 8.0,
    genero: ["Ação", "Drama"],
    imagem_capa: "",
    diretor: "José Padilha",
    sinopse: "Nascimento é um capitão do BOPE que está à procura de um substituto para ficar em seu lugar quando seu filho nascer.",
    nota_letterboxd: 3.8,
    onde_assistir: ["Globoplay"],
  },
  {
    id: 3,
    titulo: "Central do Brasil",
    ano: 1998,
    nota: 8.0,
    genero: ["Drama", "Road Movie"],
    imagem_capa: "",
    diretor: "Walter Salles",
    sinopse: "Uma ex-professora que ganha a vida escrevendo cartas para analfabetos na estação Central do Brasil embarca em uma viagem com um garoto em busca de seu pai.",
    nota_letterboxd: 4.0,
    onde_assistir: ["Netflix"],
  },
  {
    id: 4,
    titulo: "O Auto da Compadecida",
    ano: 2000,
    nota: 8.7,
    genero: ["Comédia", "Drama"],
    imagem_capa: "",
    diretor: "Guel Arraes",
    sinopse: "As aventuras de João Grilo e Chicó, dois nordestinos pobres que vivem de golpes para sobreviver no sertão da Paraíba.",
    nota_letterboxd: 4.2,
    onde_assistir: ["Globoplay", "Disney+"],
  },
  {
    id: 5,
    titulo: "Aquarius",
    ano: 2016,
    nota: 7.3,
    genero: ["Drama", "Recife"],
    imagem_capa: "",
    diretor: "Kleber Mendonça Filho",
    sinopse: "Clara é uma crítica musical aposentada que é a última moradora de um edifício à beira-mar no Recife, que uma construtora quer demolir.",
    nota_letterboxd: 3.9,
    onde_assistir: ["MUBI"],
  },
  {
    id: 6,
    titulo: "Bacurau",
    ano: 2019,
    nota: 7.3,
    genero: ["Drama", "Thriller", "Sertão"],
    imagem_capa: "",
    diretor: "Kleber Mendonça Filho & Juliano Dornelles",
    sinopse: "Após a morte de sua matriarca, os moradores de um pequeno povoado no sertão brasileiro descobrem que a comunidade não consta mais em nenhum mapa.",
    nota_letterboxd: 3.7,
    onde_assistir: ["Globoplay"],
  },
  {
    id: 7,
    titulo: "Que Horas Ela Volta?",
    ano: 2015,
    nota: 7.4,
    genero: ["Drama", "Comédia"],
    imagem_capa: "",
    diretor: "Anna Muylaert",
    sinopse: "Val trabalha como empregada doméstica em São Paulo há décadas. Quando sua filha Jessica chega para prestar vestibular, a dinâmica da casa muda completamente.",
    nota_letterboxd: 3.8,
    onde_assistir: ["Netflix"],
  },
  {
    id: 8,
    titulo: "Carandiru",
    ano: 2003,
    nota: 7.5,
    genero: ["Drama", "Crime"],
    imagem_capa: "",
    diretor: "Hector Babenco",
    sinopse: "Um médico voluntário entra no presídio do Carandiru para realizar um trabalho de prevenção à AIDS e acaba conhecendo as histórias dos detentos.",
    nota_letterboxd: 3.6,
    onde_assistir: ["Globoplay"],
  },
];

export const allGeneros = Array.from(
  new Set(filmesData.flatMap((f) => f.genero))
).sort();
