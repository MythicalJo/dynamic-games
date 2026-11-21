import type { AuctionCategory } from '../types/confidenceAuction';
import type { MentalSyncPrompt } from '../types/mentalSync';

export type FastMoneyCategory =
  | 'Fáciles'
  | 'Comida'
  | 'Cultura Popular'
  | 'Hábitos'
  | 'Anécdotas'
  | 'Gustos'
  | 'Personalidad'
  | 'Hipotéticas'
  | 'Amistad';

export interface BankFastMoneyQuestion {
  category: FastMoneyCategory;
  question: string;
}

/**
 * 83 preguntas cortas y divertidas para Dinero Rápido (español neutro / México y LatAm)
 */
export const FAST_MONEY_QUESTION_BANK: BankFastMoneyQuestion[] = [
  // Fáciles (10)
  { category: 'Fáciles', question: '¿Cuál es su comida favorita para pedir a domicilio?' },
  { category: 'Fáciles', question: '¿Qué bebida pide casi siempre en un restaurante?' },
  { category: 'Fáciles', question: '¿Cuál es la primera app que abre al despertar?' },
  { category: 'Fáciles', question: '¿Qué sabor de helado o nieve elige siempre?' },
  { category: 'Fáciles', question: '¿Cuál es su color favorito?' },
  { category: 'Fáciles', question: '¿Prefiere perro, gato o ninguna mascota?' },
  { category: 'Fáciles', question: '¿Cuál es su botana favorita del OXXO o tiendita?' },
  { category: 'Fáciles', question: '¿A qué hora suele dormirse normalmente?' },
  { category: 'Fáciles', question: '¿Cuál es su estación del año favorita (frío o calor)?' },
  { category: 'Fáciles', question: '¿Qué ingrediente de comida odia o siempre le quita a su plato?' },

  // Comida (11)
  { category: 'Comida', question: '¿Cuál es su taco o antojito favorito?' },
  { category: 'Comida', question: '¿Cómo prefiere el café (o qué toma en lugar de café)?' },
  { category: 'Comida', question: '¿Cuál es su sabor de pizza favorito?' },
  { category: 'Comida', question: '¿Qué postre nunca rechazaría?' },
  { category: 'Comida', question: '¿Qué es lo único que sabe cocinar súper bien?' },
  { category: 'Comida', question: '¿Qué botana agarra siempre primero en el OXXO o tiendita?' },
  { category: 'Comida', question: '¿De qué sabor pide sus tacos o antojitos siempre?' },
  { category: 'Comida', question: '¿Qué comida o ingrediente NO soporta ni ver en su plato?' },
  { category: 'Comida', question: '¿Qué bebida pide casi siempre cuando salen a cenar?' },
  { category: 'Comida', question: '¿Cuál es su postre o dulce favorito sin pensarlo?' },
  { category: 'Comida', question: '¿Qué tan picosa aguanta la salsa del 1 al 10?' },

  // Cultura Popular (10)
  { category: 'Cultura Popular', question: '¿Qué película podría ver mil veces sin aburrirse?' },
  { category: 'Cultura Popular', question: '¿Cuál es su artista o banda favorita de todos los tiempos?' },
  { category: 'Cultura Popular', question: '¿Qué serie recomienda siempre a todo el mundo?' },
  { category: 'Cultura Popular', question: '¿Qué canción nunca se salta si sale en aleatorio?' },
  { category: 'Cultura Popular', question: '¿Cuál es su videojuego favorito (o el que más ha jugado)?' },
  { category: 'Cultura Popular', question: '¿Qué personaje de caricatura o anime lo representa mejor?' },
  { category: 'Cultura Popular', question: '¿A qué celebridad le pediría una foto sin pensarlo?' },
  { category: 'Cultura Popular', question: '¿Cuál es su película animada favorita de Disney o Pixar?' },
  { category: 'Cultura Popular', question: '¿Qué género de música escucha cuando maneja o viaja?' },
  { category: 'Cultura Popular', question: '¿Qué YouTuber, streamer o podcast ve más seguido?' },

  // Personalidad (13)
  { category: 'Personalidad', question: '¿Cuál es su excusa favorita para cancelar un plan?' },
  { category: 'Personalidad', question: '¿Qué es lo que más rápido lo hace perder la paciencia?' },
  { category: 'Personalidad', question: '¿Cuál es su mayor miedo irracional?' },
  { category: 'Personalidad', question: '¿En qué gasta dinero que sabe que no necesita?' },
  { category: 'Personalidad', question: '¿Qué talento inútil o dato curioso tiene?' },
  { category: 'Personalidad', question: '¿Cuál es su mayor defecto o manía?' },
  { category: 'Personalidad', question: '¿Qué es lo que siempre pierde o deja olvidado?' },
  { category: 'Personalidad', question: '¿Qué manía o ruido ajeno le saca de quicio rápido?' },
  { category: 'Personalidad', question: '¿Qué frase o muletilla repite todo el tiempo?' },
  { category: 'Personalidad', question: '¿Qué talento secreto o habilidad rara tiene?' },
  { category: 'Personalidad', question: '¿Qué es lo primero que nota cuando conoce a alguien?' },
  { category: 'Personalidad', question: '¿En qué situación se pone más competitivo(a)?' },
  { category: 'Personalidad', question: '¿Qué animal describe mejor su personalidad?' },

  // Hábitos (12)
  { category: 'Hábitos', question: '¿Con cuántas alarmas se despierta en la mañana?' },
  { category: 'Hábitos', question: '¿Qué hace siempre antes de irse a dormir?' },
  { category: 'Hábitos', question: '¿Qué objeto nunca le falta al salir de casa (aparte del celular)?' },
  { category: 'Hábitos', question: '¿Cuál es su plan ideal para un domingo libre?' },
  { category: 'Hábitos', question: '¿Qué red social usa más al día?' },
  { category: 'Hábitos', question: '¿Qué hace literalmente primero al despertar?' },
  { category: 'Hábitos', question: '¿Qué excusa usa siempre para cancelar un plan?' },
  { category: 'Hábitos', question: '¿Qué app abre más veces al día sin darse cuenta?' },
  { category: 'Hábitos', question: '¿Cuántas alarmas pone para levantarse por la mañana?' },
  { category: 'Hábitos', question: '¿Qué cosa pierde o deja olvidada más seguido?' },
  { category: 'Hábitos', question: '¿Qué hace cuando se aburre en una fila o en el tráfico?' },
  { category: 'Hábitos', question: '¿Cuánto tarda en arreglarse antes de salir a una fiesta?' },

  // Hipotéticas (12)
  { category: 'Hipotéticas', question: 'Si ganara la lotería hoy, ¿qué sería lo primero que compraría?' },
  { category: 'Hipotéticas', question: 'Si pudiera viajar gratis a cualquier país mañana, ¿a cuál iría?' },
  { category: 'Hipotéticas', question: 'Si solo pudiera comer un platillo el resto de su vida, ¿cuál sería?' },
  { category: 'Hipotéticas', question: '¿Qué superpoder elegiría tener?' },
  { category: 'Hipotéticas', question: 'Si pudiera aprender una habilidad al instante, ¿cuál sería?' },
  { category: 'Hipotéticas', question: 'Si tuviera que vivir en una película o serie, ¿en cuál viviría?' },
  { category: 'Hipotéticas', question: 'Si ganara la lotería hoy, ¿qué es lo primero que compraría?' },
  { category: 'Hipotéticas', question: 'Si pudiera cenar con cualquier famoso, ¿a quién elegiría?' },
  { category: 'Hipotéticas', question: 'Si solo pudiera comer una cosa el resto de su vida, ¿cuál sería?' },
  { category: 'Hipotéticas', question: 'Si tuviera un superpoder por un día, ¿cuál escogería?' },
  { category: 'Hipotéticas', question: 'Si pudiera vivir en otro país un año, ¿a dónde se mudaría?' },
  { category: 'Hipotéticas', question: 'Si escribiera un libro sobre su vida, ¿qué título le pondría?' },

  // Amistad (3)
  { category: 'Amistad', question: 'En una palabra, ¿cómo describiría nuestra amistad?' },
  { category: 'Amistad', question: '¿Dónde fue la última vez que salimos juntos?' },
  { category: 'Amistad', question: '¿Qué es lo que más le da risa cuando estamos juntos?' },

  // Anécdotas (6)
  { category: 'Anécdotas', question: '¿Cuál fue el peor corte de pelo o look que tuvo?' },
  { category: 'Anécdotas', question: '¿Cuál es su compra más impulsiva o innecesaria?' },
  { category: 'Anécdotas', question: '¿Qué travesura o momento penoso de la escuela aún le da risa?' },
  { category: 'Anécdotas', question: '¿Cuál ha sido el mejor viaje o salida que recuerdan juntos?' },
  { category: 'Anécdotas', question: '¿Qué cosa rompió o arruinó alguna vez por accidente?' },
  { category: 'Anécdotas', question: '¿Qué trabajo o sueño loco quería tener de niño(a)?' },

  // Gustos (6)
  { category: 'Gustos', question: '¿Cuál es su canción infaltable en el karaoke?' },
  { category: 'Gustos', question: '¿Qué película ha visto más veces en su vida?' },
  { category: 'Gustos', question: '¿Cuál es su destino soñado para irse de vacaciones?' },
  { category: 'Gustos', question: '¿A qué artista o banda pagaría lo que fuera por ver en vivo?' },
  { category: 'Gustos', question: '¿Qué plan perfecto elige para un domingo de flojera?' },
  { category: 'Gustos', question: '¿Qué olor o aroma le encanta al instante?' },
];

/**
 * 64 categorías divertidas para Subasta de Confianza
 */
export const AUCTION_CATEGORY_BANK: AuctionCategory[] = [
  { id: 'cat_01', title: 'Cosas que siempre trae en su mochila o bolsa', hint: 'Vida Diaria · Cargadores, recibos, bálsamo, llaves...' },
  { id: 'cat_02', title: 'Canciones que canta a todo pulmón en la regadera', hint: 'Título o artista, sin repetir.' },
  { id: 'cat_03', title: 'Películas que ha visto más de 3 veces', hint: 'Clásicos, animadas o de confort.' },
  { id: 'cat_04', title: 'Cosas que le hacen perder la paciencia', hint: 'Tráfico, Wi-Fi lento, llegar tarde...' },
  { id: 'cat_05', title: 'Marcas de botanas y dulces', hint: 'Papas, chocolates, gomitas, galletas...' },
  { id: 'cat_06', title: 'Excusas clásicas para llegar tarde', hint: 'Vida Diaria · Desde el tráfico hasta «ya voy a dos cuadras».' },
  { id: 'cat_07', title: 'Cosas que hay en el refrigerador de tu amigo ahora mismo', hint: 'Salsas, limones secos, sobras...' },
  { id: 'cat_08', title: 'Canciones de los 2000 que todos se saben', hint: 'Pop, rock en español o reguetón clásico.' },
  { id: 'cat_09', title: 'Sabores o tipos de tacos y antojitos', hint: 'Pastor, suadero, quesadilla, sope...' },
  { id: 'cat_10', title: 'Cosas que nunca faltan en una carne asada o reunión', hint: 'Hielo, bocina, limones, salsa...' },
  { id: 'cat_11', title: 'Apps instaladas en su teléfono ahora mismo', hint: 'Redes, bancos, delivery, juegos...' },
  { id: 'cat_12', title: 'Ingredientes de pizza (buenos o polémicos)', hint: '¡Piña cuenta si el público la aprueba!' },
  { id: 'cat_13', title: 'Razones por las que alguien deja en visto un mensaje', hint: '«Lo respondí en mi mente» vale.' },
  { id: 'cat_14', title: 'Caricaturas o programas de nuestra infancia', hint: 'Los que veíamos saliendo de la escuela.' },
  { id: 'cat_15', title: 'Cosas que se compran «por si acaso» y nunca se usan', hint: 'Cables, libretas, equipo de gym...' },
  { id: 'cat_16', title: 'Destinos o ciudades que quisiera visitar', hint: 'Playas, capitales o pueblos mágicos.' },
  { id: 'cat_17', title: 'Frases típicas de mamá o papá', hint: '«Mientras vivas bajo este techo...»' },
  { id: 'cat_18', title: 'Cosas que haces cuando nadie te está viendo', hint: 'Hablar solo, bailar raro, cantar...' },
  { id: 'cat_19', title: 'Tipos de pan dulce o postres favoritos', hint: 'Concha, churro, flan, pastel de tres leches...' },
  { id: 'cat_20', title: 'Series famosas que casi todo el mundo conoce', hint: 'Comedia, drama, anime o suspenso.' },
  { id: 'cat_21', title: 'Objetos que encuentras en la guantera de un coche', hint: 'Servilletas, monedas, lentes, manual...' },
  { id: 'cat_22', title: 'Cosas que te despiertan a las 3 de la mañana', hint: 'Mosquitos, sobrepensar, sed...' },
  { id: 'cat_23', title: 'Cadenas de comida rápida o cafeterías', hint: 'Hamburguesas, café, pollo, pizza...' },
  { id: 'cat_24', title: 'Planes baratos o gratis para hacer con amigos', hint: 'Caminar, juegos de mesa, maratón...' },
  { id: 'cat_25', title: 'Cosas que te dan pena ajena al instante', hint: 'Cantar mal sin pena, tropezar...' },
  { id: 'cat_26', title: 'Sabores de helado o nieve', hint: 'Limón, mango, chocolate, chicle...' },
  { id: 'cat_27', title: 'Regalos clásicos cuando no sabes qué regalar', hint: 'Taza, calcetines, vela, tarjeta...' },
  { id: 'cat_28', title: 'Deportes o juegos que se juegan con pelota', hint: 'Fútbol, básquet, pádel, quemados...' },
  // Categorías adicionales del banco expandido
  { id: 'cat_29', title: 'Películas de Disney o Pixar', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_30', title: 'Canciones de los 2000s que todos se saben', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_31', title: 'Superhéroes de Marvel o DC', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_32', title: 'Personajes de videojuegos famosos', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_33', title: 'Series famosas de Netflix', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_34', title: 'Caricaturas de nuestra infancia', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_35', title: 'Artistas o bandas de rock / pop en español', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_36', title: 'Villanos famosos del cine o anime', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_37', title: 'Personajes de Los Simpson o Bob Esponja', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_38', title: 'Películas de terror clásicas', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_39', title: 'Canciones infaltables en un karaoke o boda', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_40', title: 'Animes famosos', hint: 'Categoría: Cultura Popular' },
  { id: 'cat_41', title: 'Cosas que encuentras en un OXXO', hint: 'Categoría: Fáciles' },
  { id: 'cat_42', title: 'Marcas de botanas, papas o dulces', hint: 'Categoría: Fáciles' },
  { id: 'cat_43', title: 'Frutas o verduras de color verde', hint: 'Categoría: Fáciles' },
  { id: 'cat_44', title: 'Cosas que siempre hay en una fiesta', hint: 'Categoría: Fáciles' },
  { id: 'cat_45', title: 'Marcas de refrescos o jugos', hint: 'Categoría: Fáciles' },
  { id: 'cat_46', title: 'Países de América o Europa', hint: 'Categoría: Fáciles' },
  { id: 'cat_47', title: 'Razas de perros', hint: 'Categoría: Fáciles' },
  { id: 'cat_48', title: 'Marcas de carros', hint: 'Categoría: Fáciles' },
  { id: 'cat_49', title: 'Deportes olímpicos', hint: 'Categoría: Fáciles' },
  { id: 'cat_50', title: 'Cosas que llevas a la playa', hint: 'Categoría: Fáciles' },
  { id: 'cat_51', title: 'Antojitos o comidas callejeras mexicanas', hint: 'Categoría: Comida' },
  { id: 'cat_52', title: 'Sabores de tacos', hint: 'Categoría: Comida' },
  { id: 'cat_53', title: 'Ingredientes que le puedes poner a una pizza', hint: 'Categoría: Comida' },
  { id: 'cat_54', title: 'Cadenas de comida rápida', hint: 'Categoría: Comida' },
  { id: 'cat_55', title: 'Sabores de agua fresca', hint: 'Categoría: Comida' },
  { id: 'cat_56', title: 'Dulces típicos o picosos mexicanos', hint: 'Categoría: Comida' },
  { id: 'cat_57', title: 'Cosas que hay en el refrigerador de tu amigo', hint: 'Categoría: Vida Diaria' },
  { id: 'cat_58', title: 'Frases típicas de mamá', hint: 'Categoría: Vida Diaria' },
  { id: 'cat_59', title: 'Cosas que haces cuando se va el internet', hint: 'Categoría: Vida Diaria' },
  { id: 'cat_60', title: 'Apps que casi todo el mundo tiene en su celular', hint: 'Categoría: Vida Diaria' },
  { id: 'cat_61', title: 'Cosas que te hacen enojar en el tráfico', hint: 'Categoría: Vida Diaria' },
  { id: 'cat_62', title: 'Mentiras piadosas que todos decimos', hint: 'Categoría: Vida Diaria' },
  { id: 'cat_63', title: 'Cosas que compras en Amazon o Mercado Libre', hint: 'Categoría: Vida Diaria' },
  { id: 'cat_64', title: 'Prendas de ropa que usas en invierno', hint: 'Categoría: Vida Diaria' },
];

/**
 * 80 consignas de tipo "¿Quién es más probable...?" (Pizarras físicas) para Sincronía Mental
 */
export const MENTAL_SYNC_PROMPT_BANK: MentalSyncPrompt[] = [
  { id: 'ms_01', type: 'who', text: '¿Quién moriría primero en un apocalipsis zombie?' },
  { id: 'ms_02', type: 'who', text: '¿Quién lloraría primero viendo una película?' },
  { id: 'ms_03', type: 'who', text: '¿Quién llegaría más tarde a su propia boda?' },
  { id: 'ms_04', type: 'who', text: '¿Quién se volvería viral en TikTok por accidente?' },
  { id: 'ms_05', type: 'who', text: '¿Quién se perdería usando Google Maps?' },
  { id: 'ms_06', type: 'who', text: '¿Quién se acabaría su quincena en un solo fin de semana?' },
  { id: 'ms_07', type: 'who', text: '¿Quién se pelearía primero con un desconocido en internet?' },
  { id: 'ms_08', type: 'who', text: '¿Quién olvidaría el cumpleaños del otro?' },
  { id: 'ms_09', type: 'who', text: '¿Quién se quedaría dormido en el cine?' },
  { id: 'ms_10', type: 'who', text: '¿Quién adoptaría 5 gatos o perros sin avisar?' },
  { id: 'ms_11', type: 'who', text: '¿Quién sobreviviría más tiempo en una isla desierta?' },
  { id: 'ms_12', type: 'who', text: '¿Quién contaría un secreto por accidente?' },
  { id: 'ms_13', type: 'who', text: '¿Quién es peor respondiendo mensajes de WhatsApp?' },
  { id: 'ms_14', type: 'who', text: '¿Quién es más dramático cuando se enferma de gripa?' },
  { id: 'ms_15', type: 'who', text: '¿Quién cancelaría un plan a último minuto para quedarse en casa?' },
  { id: 'ms_16', type: 'who', text: '¿Quién se reiría primero en un momento súper serio?' },
  { id: 'ms_17', type: 'who', text: '¿Quién ganaría en una pelea contra 10 patos?' },
  { id: 'ms_18', type: 'who', text: '¿Quién tarda más en elegir qué ver en Netflix o qué pedir de comer?' },
  { id: 'ms_19', type: 'who', text: '¿Quién se haría amigo de un extraño en la fila de un concierto?' },
  { id: 'ms_20', type: 'who', text: '¿Quién rompería su celular más rápido por un descuido?' },
  { id: 'ms_21', type: 'who', text: '¿Quién se sabría más chismes sin siquiera buscarlos?' },
  { id: 'ms_22', type: 'who', text: '¿Quién cantaría a todo pulmón en un karaoke sin pena?' },
  { id: 'ms_23', type: 'who', text: '¿Quién caería primero en una estafa por internet?' },
  { id: 'ms_24', type: 'who', text: '¿Quién tiene más probabilidad de hacerse millonario de la nada?' },
  { id: 'ms_25', type: 'who', text: '¿Quién maneja peor (o se enoja más en el tráfico)?' },
  { id: 'ms_26', type: 'who', text: '¿Quién tiene más probabilidad de quemar la cocina intentando hacer algo fácil?' },
  { id: 'ms_27', type: 'who', text: '¿Quién sería el primero en ser arrestado por una tontería?' },
  { id: 'ms_28', type: 'who', text: '¿Quién gastaría más dinero en conciertos o coleccionables?' },
  { id: 'ms_29', type: 'who', text: '¿Quién se quejaría primero si hay que caminar mucho?' },
  { id: 'ms_30', type: 'who', text: '¿Quién tiene más probabilidad de olvidar dónde estacionó el carro?' },
  { id: 'ms_31', type: 'who', text: '¿Quién daría mejores consejos en una emergencia?' },
  { id: 'ms_32', type: 'who', text: '¿Quién se asustaría más rápido en una casa embrujada?' },
  { id: 'ms_33', type: 'who', text: '¿Quién se pondría a bailar primero en una fiesta?' },
  { id: 'ms_34', type: 'who', text: '¿Quién tiene la batería del celular siempre abajo del 15%?' },
  { id: 'ms_35', type: 'who', text: '¿Quién tardaría más tiempo en arreglarse para salir?' },
  { id: 'ms_36', type: 'who', text: '¿Quién ganaría un concurso de comer tacos?' },
  { id: 'ms_37', type: 'who', text: '¿Quién se iría a vivir a otro país sin avisarle a casi nadie?' },
  { id: 'ms_38', type: 'who', text: '¿Quién es más competitivo en los juegos de mesa o videojuegos?' },
  { id: 'ms_39', type: 'who', text: '¿Quién tiene más probabilidad de tropezarse en público?' },
  { id: 'ms_40', type: 'who', text: '¿Quién se quedaría sin voz primero en un concierto?' },
  { id: 'ms_41', type: 'who', text: '¿Quién sobreviviría menos de un día sin celular?' },
  { id: 'ms_42', type: 'who', text: '¿Quién se comería la última rebanada de pizza sin preguntar?' },
  { id: 'ms_43', type: 'who', text: '¿Quién lloraría con un video de perritos en redes sociales?' },
  { id: 'ms_44', type: 'who', text: '¿Quién se reiría si el otro se cae en la calle antes de ayudarlo?' },
  { id: 'ms_45', type: 'who', text: '¿Quién tiene más fotos vergonzosas guardadas en su galería?' },
  { id: 'ms_46', type: 'who', text: '¿Quién se quedaría dormido en una fiesta?' },
  { id: 'ms_47', type: 'who', text: '¿Quién pediría el platillo más caro si alguien más está invitando?' },
  { id: 'ms_48', type: 'who', text: '¿Quién se quejaría primero del clima (mucho frío o mucho calor)?' },
  { id: 'ms_49', type: 'who', text: '¿Quién se aprendería primero un trend de baile de TikTok?' },
  { id: 'ms_50', type: 'who', text: '¿Quién terminaría platicando con el chofer de Uber toda la ruta?' },
  { id: 'ms_51', type: 'who', text: "¿Quién dejaría en 'visto' al otro durante tres días seguidos?" },
  { id: 'ms_52', type: 'who', text: '¿Quién compraría algo totalmente inútil solo porque estaba en oferta?' },
  { id: 'ms_53', type: 'who', text: '¿Quién se asustaría más rápido si alguien lo espanta por la espalda?' },
  { id: 'ms_54', type: 'who', text: '¿Quién se sabría toda la letra de una canción de telenovela o Disney?' },
  { id: 'ms_55', type: 'who', text: '¿Quién llegaría al aeropuerto apenas 20 minutos antes del vuelo?' },
  { id: 'ms_56', type: 'who', text: '¿Quién se pondría a discutir por las reglas de un juego de mesa?' },
  { id: 'ms_57', type: 'who', text: '¿Quién tiene el cuarto o escritorio más desordenado ahora mismo?' },
  { id: 'ms_58', type: 'who', text: '¿Quién entraría en pánico primero si se quedan atrapados en un elevador?' },
  { id: 'ms_59', type: 'who', text: "¿Quién le daría 'like' por accidente a una foto vieja stalkeando a alguien?" },
  { id: 'ms_60', type: 'who', text: '¿Quién se comería un insecto por una apuesta de 500 pesos?' },
  { id: 'ms_61', type: 'who', text: '¿Quién olvidaría el nombre de alguien dos segundos después de conocerlo?' },
  { id: 'ms_62', type: 'who', text: '¿Quién se gastaría todo su dinero en comida antes que en ropa?' },
  { id: 'ms_63', type: 'who', text: '¿Quién fingiría saber de un tema aunque no tenga ni idea?' },
  { id: 'ms_64', type: 'who', text: '¿Quién se pondría a cantar en el carro como si estuviera en un concierto?' },
  { id: 'ms_65', type: 'who', text: '¿Quién sería el peor guardando una sorpresa de cumpleaños?' },
  { id: 'ms_66', type: 'who', text: '¿Quién se quedaría despierto hasta las 4 AM viendo videos sin sentido?' },
  { id: 'ms_67', type: 'who', text: '¿Quién le hablaría bonito a cualquier perro o gato que se cruce en la calle?' },
  { id: 'ms_68', type: 'who', text: "¿Quién sería el primero en decir 'ya vámonos' en una reunión?" },
  { id: 'ms_69', type: 'who', text: '¿Quién se tropezaría subiendo las escaleras?' },
  { id: 'ms_70', type: 'who', text: '¿Quién tiene más pestañas abiertas en su navegador ahora mismo?' },
  { id: 'ms_71', type: 'who', text: '¿Quién se enojaría más si le dan spoiler de su serie favorita?' },
  { id: 'ms_72', type: 'who', text: '¿Quién pediría ayuda primero si se poncha una llanta?' },
  { id: 'ms_73', type: 'who', text: '¿Quién se cambiaría de look radicalmente por un impulso de madrugada?' },
  { id: 'ms_74', type: 'who', text: '¿Quién sobreviviría mejor en un reality show tipo Survivor?' },
  { id: 'ms_75', type: 'who', text: '¿Quién se pondría más nervioso hablando frente a una cámara?' },
  { id: 'ms_76', type: 'who', text: '¿Quién se sabe más chistes malos?' },
  { id: 'ms_77', type: 'who', text: '¿Quién dejaría todo para el último minuto antes de una fecha límite?' },
  { id: 'ms_78', type: 'who', text: '¿Quién se llevaría mejor con los papás del otro?' },
  { id: 'ms_79', type: 'who', text: '¿Quién tiene más probabilidad de hacerse amigo de un famoso?' },
  { id: 'ms_80', type: 'who', text: '¿Quién ganaría si los dos compitieran en Mario Kart ahora mismo?' },
];

/**
 * 40 plantillas / ideas rápidas para inspirar afirmaciones en El Polígrafo
 */
export const POLYGRAPH_TEMPLATE_IDEAS: string[] = [
  'Una vez entré por error a una fiesta o boda a la que no estaba invitado y comí gratis.',
  'He fingido que no vi a alguien en la calle o en el súper solo para no saludarlo.',
  'Mentí diciendo que ya había visto una película o serie famosa solo para encajar en la plática.',
  'Alguna vez me quedé dormido en el cine, en un concierto o en una fiesta ruidosa.',
  'He inventado una emergencia falsa para salirme temprano de una reunión aburrida.',
  'Una vez regalé algo que me habían regalado a mí antes (reciclé un regalo).',
  'De niño(a) rompí algo caro en casa y logré culpar a un hermano o a la mascota.',
  'Me he reído de un chiste que no entendí absolutamente nada por pura pena.',
  'Una vez me pasé de mi parada en el transporte por ir distraído con el celular.',
  'He stalkeado a alguien en redes y se me escapó un «me gusta» en una foto de hace 4 años.',
  'Alguna vez dije «estoy a 5 minutos» cuando ni siquiera me había bañado.',
  'He comido algo que se cayó al suelo aplicando la regla de los 5 segundos sin que me vieran.',
  'Una vez confundí a un desconocido por la calle y le hablé como si fuera mi amigo.',
  'He cantado una canción en inglés inventando por completo la letra con total seguridad.',
  'Alguna vez guardé un objeto «prestado» de un amigo por tanto tiempo que ya es mío.',
  // Ideas adicionales del banco expandido
  'Una vez me quedé dormido en un lugar público súper incómodo.',
  'Fingí que me gustaba un regalo durante años aunque lo odiaba.',
  'Una vez me confundieron con un empleado de una tienda y ayudé al cliente.',
  'Tengo una fobia secreta a algo completamente normal.',
  'Alguna vez me salí de un cine antes de que terminara la película.',
  'De niño me comí algo que definitivamente no era comida.',
  'Una vez mandé un mensaje hablando mal de alguien... a esa misma persona.',
  'Nunca he visto una de las sagas más famosas del cine (ej. Star Wars o Harry Potter).',
  'Una vez fingí estar enfermo solo para quedarme jugando o viendo series.',
  'Me sé de memoria la coreografía completa de una canción penosa.',
  'Alguna vez me perdí en un centro comercial o supermercado siendo ya adulto.',
  'Una vez saludé súper emocionado a alguien que resultó ser un completo desconocido.',
  'Me he comido comida que se me cayó al piso aplicando la regla de los 5 segundos.',
  'Una vez entré al baño equivocado por accidente y no me di cuenta al instante.',
  'He fingido que no vi a alguien conocido en la calle solo para no saludar.',
  'Una vez me subí al carro equivocado pensando que era el de mi familia o Uber.',
  'Tengo una cuenta secundaria o anónima en redes sociales que nadie conoce.',
  'Alguna vez rompí algo en casa de alguien más y nunca dije que fui yo.',
  'Una vez me quedé encerrado afuera de mi propia casa en pijama.',
  'Me da miedo hablar por teléfono para pedir comida o hacer una cita.',
  'Una vez lloré viendo un comercial de televisión.',
  'He buscado mi propio nombre en Google para ver qué aparece.',
  'Una vez mentí sobre haber visto una película famosa solo para encajar en la plática.',
  'De niño intenté cortar mi propio cabello y terminó en desastre.',
  'Una vez me reí tanto que escupí lo que estaba tomando.',
];

/**
 * Selecciona `count` preguntas al azar evitando las usadas recientemente y mezclando categorías.
 */
export function pickRandomFastMoneyQuestions(
  recentlyUsed: string[],
  count = 5
): { selected: BankFastMoneyQuestion[]; nextRecent: string[] } {
  const recentSet = new Set(recentlyUsed);
  let available = FAST_MONEY_QUESTION_BANK.filter((item) => !recentSet.has(item.question));

  let resetPool = false;
  if (available.length < count) {
    // Si quedan menos de 5 sin usar, reinicia el historial evitando repetir las últimas 5
    const lastFive = new Set(recentlyUsed.slice(-count));
    available = FAST_MONEY_QUESTION_BANK.filter((item) => !lastFive.has(item.question));
    resetPool = true;
  }

  // Mezcla Fisher-Yates
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Prioriza diversidad de categorías en el set de 5
  const picked: BankFastMoneyQuestion[] = [];
  const usedCategories = new Set<FastMoneyCategory>();

  for (const item of shuffled) {
    if (picked.length >= count) break;
    if (!usedCategories.has(item.category)) {
      picked.push(item);
      usedCategories.add(item.category);
    }
  }
  for (const item of shuffled) {
    if (picked.length >= count) break;
    if (!picked.includes(item)) {
      picked.push(item);
    }
  }

  const pickedTexts = picked.map((p) => p.question);
  const nextRecent = resetPool ? pickedTexts : [...recentlyUsed, ...pickedTexts];

  return { selected: picked, nextRecent };
}

/**
 * Selecciona `count` (por defecto 12) preguntas al azar para Sincronía Mental
 * evitando repetir preguntas usadas recientemente en el banco integrado.
 */
export function pickRandomMentalSyncPrompts(
  recentlyUsed: string[],
  count = 12
): { selected: MentalSyncPrompt[]; nextRecent: string[] } {
  const shuffle = <T,>(items: T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const recentSet = new Set(recentlyUsed);
  const unused = shuffle(MENTAL_SYNC_PROMPT_BANK.filter((item) => !recentSet.has(item.text)));

  let picked: MentalSyncPrompt[];
  let resetPool = false;

  if (unused.length >= count) {
    picked = unused.slice(0, count);
  } else {
    // Usar todas las que faltaban sin repetir y completar el resto reiniciando el banco
    picked = [...unused];
    const pickedTextSet = new Set(picked.map((p) => p.text));
    const refill = shuffle(
      MENTAL_SYNC_PROMPT_BANK.filter((item) => !pickedTextSet.has(item.text))
    );
    for (const item of refill) {
      if (picked.length >= count) break;
      picked.push(item);
    }
    resetPool = true;
  }

  const selected = picked.map((item) => ({ ...item }));
  const pickedTexts = selected.map((item) => item.text);
  const nextRecent = resetPool ? pickedTexts : [...recentlyUsed, ...pickedTexts];

  return { selected, nextRecent };
}
