import type { AuctionCategory } from '../types/confidenceAuction';
import type { MentalSyncPrompt } from '../types/mentalSync';

export type FastMoneyCategory =
  | 'Comida'
  | 'Hábitos'
  | 'Anécdotas'
  | 'Gustos'
  | 'Personalidad'
  | 'Hipotéticas';

export interface BankFastMoneyQuestion {
  category: FastMoneyCategory;
  question: string;
}

/**
 * 40 preguntas cortas y divertidas para Dinero Rápido (español neutro / México y LatAm)
 */
export const FAST_MONEY_QUESTION_BANK: BankFastMoneyQuestion[] = [
  // Comida (7)
  { category: 'Comida', question: '¿Cuál es su comida favorita para pedir a domicilio?' },
  { category: 'Comida', question: '¿Qué botana agarra siempre primero en el OXXO o tiendita?' },
  { category: 'Comida', question: '¿De qué sabor pide sus tacos o antojitos siempre?' },
  { category: 'Comida', question: '¿Qué comida o ingrediente NO soporta ni ver en su plato?' },
  { category: 'Comida', question: '¿Qué bebida pide casi siempre cuando salen a cenar?' },
  { category: 'Comida', question: '¿Cuál es su postre o dulce favorito sin pensarlo?' },
  { category: 'Comida', question: '¿Qué tan picosa aguanta la salsa del 1 al 10?' },

  // Hábitos (7)
  { category: 'Hábitos', question: '¿Qué hace literalmente primero al despertar?' },
  { category: 'Hábitos', question: '¿Qué excusa usa siempre para cancelar un plan?' },
  { category: 'Hábitos', question: '¿Qué app abre más veces al día sin darse cuenta?' },
  { category: 'Hábitos', question: '¿Cuántas alarmas pone para levantarse por la mañana?' },
  { category: 'Hábitos', question: '¿Qué cosa pierde o deja olvidada más seguido?' },
  { category: 'Hábitos', question: '¿Qué hace cuando se aburre en una fila o en el tráfico?' },
  { category: 'Hábitos', question: '¿Cuánto tarda en arreglarse antes de salir a una fiesta?' },

  // Anécdotas (6)
  { category: 'Anécdotas', question: '¿Cuál fue el peor corte de pelo o look que tuvo?' },
  { category: 'Anécdotas', question: '¿Cuál es su compra más impulsiva o innecesaria?' },
  { category: 'Anécdotas', question: '¿Qué travesura o momento penoso de la escuela aún le da risa?' },
  { category: 'Anécdotas', question: '¿Cuál ha sido el mejor viaje o salida que recuerdan juntos?' },
  { category: 'Anécdotas', question: '¿Qué cosa rompió o arruinó alguna vez por accidente?' },
  { category: 'Anécdotas', question: '¿Qué trabajo o sueño loco quería tener de niño(a)?' },

  // Gustos (7)
  { category: 'Gustos', question: '¿Cuál es su canción infaltable en el karaoke?' },
  { category: 'Gustos', question: '¿Qué película ha visto más veces en su vida?' },
  { category: 'Gustos', question: '¿Cuál es su destino soñado para irse de vacaciones?' },
  { category: 'Gustos', question: '¿Qué serie recomienda siempre a todo el mundo?' },
  { category: 'Gustos', question: '¿A qué artista o banda pagaría lo que fuera por ver en vivo?' },
  { category: 'Gustos', question: '¿Qué plan perfecto elige para un domingo de flojera?' },
  { category: 'Gustos', question: '¿Qué olor o aroma le encanta al instante?' },

  // Personalidad (7)
  { category: 'Personalidad', question: '¿Cuál es su mayor miedo irracional?' },
  { category: 'Personalidad', question: '¿Qué manía o ruido ajeno le saca de quicio rápido?' },
  { category: 'Personalidad', question: '¿Qué frase o muletilla repite todo el tiempo?' },
  { category: 'Personalidad', question: '¿Qué talento secreto o habilidad rara tiene?' },
  { category: 'Personalidad', question: '¿Qué es lo primero que nota cuando conoce a alguien?' },
  { category: 'Personalidad', question: '¿En qué situación se pone más competitivo(a)?' },
  { category: 'Personalidad', question: '¿Qué animal describe mejor su personalidad?' },

  // Hipotéticas (6)
  { category: 'Hipotéticas', question: 'Si ganara la lotería hoy, ¿qué es lo primero que compraría?' },
  { category: 'Hipotéticas', question: 'Si pudiera cenar con cualquier famoso, ¿a quién elegiría?' },
  { category: 'Hipotéticas', question: 'Si solo pudiera comer una cosa el resto de su vida, ¿cuál sería?' },
  { category: 'Hipotéticas', question: 'Si tuviera un superpoder por un día, ¿cuál escogería?' },
  { category: 'Hipotéticas', question: 'Si pudiera vivir en otro país un año, ¿a dónde se mudaría?' },
  { category: 'Hipotéticas', question: 'Si escribiera un libro sobre su vida, ¿qué título le pondría?' },
];

/**
 * 28 categorías divertidas para Subasta de Confianza
 */
export const AUCTION_CATEGORY_BANK: AuctionCategory[] = [
  { id: 'cat_01', title: 'Cosas que siempre trae en su mochila o bolsa', hint: 'Cargadores, recibos, bálsamo, llaves...' },
  { id: 'cat_02', title: 'Canciones que canta a todo pulmón en la regadera', hint: 'Título o artista, sin repetir.' },
  { id: 'cat_03', title: 'Películas que ha visto más de 3 veces', hint: 'Clásicos, animadas o de confort.' },
  { id: 'cat_04', title: 'Cosas que le hacen perder la paciencia', hint: 'Tráfico, Wi-Fi lento, llegar tarde...' },
  { id: 'cat_05', title: 'Marcas de botanas y dulces', hint: 'Papas, chocolates, gomitas, galletas...' },
  { id: 'cat_06', title: 'Excusas clásicas para llegar tarde', hint: 'Desde el tráfico hasta «ya voy a dos cuadras».' },
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
];

/**
 * 28 consignas para Sincronía Mental (mezcla de "¿Quién es más probable...?" y "Completa la frase...")
 */
export const MENTAL_SYNC_PROMPT_BANK: MentalSyncPrompt[] = [
  { id: 'ms_01', type: 'who', text: '¿Quién moriría primero en un apocalipsis zombi?' },
  { id: 'ms_02', type: 'who', text: '¿Quién lloraría primero viendo una película triste?' },
  { id: 'ms_03', type: 'fill', text: 'Si [Nombre] ganara la lotería hoy, lo primero que compraría sería ________.' },
  { id: 'ms_04', type: 'who', text: '¿Quién tiene más probabilidades de mandar una captura al chat equivocado?' },
  { id: 'ms_05', type: 'fill', text: 'Si abriéramos un restaurante juntos, se llamaría «________».' },
  { id: 'ms_06', type: 'who', text: '¿Quién se perdería incluso usando Google Maps?' },
  { id: 'ms_07', type: 'fill', text: 'La regla #1 de salir de viaje con nosotros es: NUNCA ________.' },
  { id: 'ms_08', type: 'who', text: '¿Quién terminaría haciéndose amigo de un desconocido en la fila del baño?' },
  { id: 'ms_09', type: 'fill', text: 'Si nuestra amistad fuera una película, se titularía «________».' },
  { id: 'ms_10', type: 'who', text: '¿Quién gastaría toda su quincena en comida y antojos?' },
  { id: 'ms_11', type: 'fill', text: 'El talento más inútil pero divertido de [Nombre] es ________.' },
  { id: 'ms_12', type: 'who', text: '¿Quién tardaría 4 días en contestar un mensaje que decía «urgente»?' },
  { id: 'ms_13', type: 'fill', text: 'Si [Nombre] fuera un sabor de helado, sería de ________.' },
  { id: 'ms_14', type: 'who', text: '¿Quién se volvería viral en redes por un accidente chistoso?' },
  { id: 'ms_15', type: 'fill', text: 'Nunca dejes que [Nombre] se encargue de ________ en una fiesta.' },
  { id: 'ms_16', type: 'who', text: '¿Quién sobreviviría más tiempo perdido en una isla desierta?' },
  { id: 'ms_17', type: 'fill', text: 'La frase que más dice [Nombre] cuando algo sale mal es «________».' },
  { id: 'ms_18', type: 'who', text: '¿Quién adoptaría 5 perros sin avisarle a nadie?' },
  { id: 'ms_19', type: 'fill', text: 'Nuestra canción oficial cuando vamos en el coche es ________.' },
  { id: 'ms_20', type: 'who', text: '¿Quién llegaría tarde incluso a su propia boda?' },
  { id: 'ms_21', type: 'fill', text: 'Si [Nombre] tuviera un reality show, el nombre sería «________».' },
  { id: 'ms_22', type: 'who', text: '¿Quién caería primero en una estafa por internet?' },
  { id: 'ms_23', type: 'fill', text: 'Lo único que puede poner de malas a [Nombre] en 3 segundos es ________.' },
  { id: 'ms_24', type: 'who', text: '¿Quién se ríe en los momentos más serios e inapropiados?' },
  { id: 'ms_25', type: 'fill', text: 'En 10 años, seguro encontraremos a [Nombre] viviendo en ________.' },
  { id: 'ms_26', type: 'who', text: '¿Quién ganaría una discusión incluso estando equivocado?' },
  { id: 'ms_27', type: 'fill', text: 'El plan favorito de [Nombre] para celebrar una buena noticia es ________.' },
  { id: 'ms_28', type: 'who', text: '¿Quién olvidaría el cumpleaños de alguien importante si no fuera por las redes?' },
];

/**
 * 15 plantillas / ideas rápidas para inspirar afirmaciones en El Polígrafo
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
