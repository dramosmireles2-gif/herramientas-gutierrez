// Datos que el CSV todavía no trae: descripción corta, specs, precio de ejemplo (MXN, pesos),
// existencia de ejemplo y banderas de demo. Si el CSV trae precio_mxn / stock, esos ganan.
// Specs tomadas de fichas públicas de cada modelo: validar con el cliente antes de producción.

export const details = {
  'generador-10000w-arranque-remoto': {
    price: 32999, stock: 4, featured: true,
    short: 'Energía de respaldo para toda la casa o la obra, con arranque a distancia desde el llavero.',
    specs: { 'Potencia máxima': '10,000 W', 'Potencia continua': '8,000 W', 'Motor': '4 tiempos, 459 cc', 'Arranque': 'Remoto, eléctrico y manual', 'Combustible': 'Gasolina', 'Salidas': '120 V / 240 V' },
  },
  'cepillo-banco-bauer-12-5': {
    price: 6499, stock: 6,
    short: 'Deja tablas parejas y al grosor exacto con un motor de 15 A y ancho de 12-1/2".',
    specs: { 'Ancho de corte': '12-1/2"', 'Motor': '15 A', 'Cuchillas': '2, reversibles', 'Profundidad máx. por pasada': '3/32"', 'Alimentación': '120 V' },
  },
  'compresor-mcgraw-29-gal': {
    price: 8999, stock: 5,
    short: 'Tanque de 29 galones para trabajar herramienta neumática sin pausas en el taller.',
    specs: { 'Tanque': '29 gal', 'Presión máxima': '155 PSI', 'Lubricación': 'Con aceite', 'Alimentación': '120 V', 'Uso': 'Taller y automotriz' },
  },
  'compresor-husky-165-psi': {
    price: 5999, stock: 7,
    short: 'Compresor compacto para clavadoras, inflado y pintura ligera en casa o en obra.',
    specs: { 'Presión máxima': '165 PSI', 'Lubricación': 'Libre de aceite', 'Alimentación': '120 V', 'Portátil': 'Sí, con asa' },
  },
  'gato-hidraulico-bajo-perfil-2t': {
    price: 4299, stock: 8,
    short: 'Entra debajo de autos deportivos y bajitos; sube rápido con doble pistón.',
    specs: { 'Capacidad': '2 t', 'Tipo': 'Patín, bajo perfil', 'Bomba': 'Doble pistón (Rapid Pump)', 'Material': 'Acero' },
  },
  'generador-inverter-predator-8750': {
    price: 39999, compare: 42999, stock: 3, featured: true,
    short: 'Inverter silencioso con energía limpia para equipo sensible, con ruedas para moverlo fácil.',
    specs: { 'Potencia máxima': '8,750 W', 'Potencia continua': '7,000 W', 'Tecnología': 'Inverter (energía limpia)', 'Arranque': 'Eléctrico y manual', 'Combustible': 'Gasolina', 'Salidas': '120 V / 240 V' },
  },
  'hidrolavadora-dewalt-3400-psi': {
    price: 14999, stock: 4,
    short: 'Quita lodo, grasa y pintura vieja de cocheras, banquetas y maquinaria.',
    specs: { 'Presión': '3,400 PSI', 'Caudal': '2.5 GPM', 'Motor': 'A gasolina', 'Bomba': 'Axial', 'Boquillas': 'Intercambiables de conexión rápida' },
  },
  'hidrolavadora-dewalt-4400-psi': {
    price: 27999, stock: 2, featured: true,
    short: 'Nivel profesional para limpieza pesada de equipo, fachadas y patios de maniobra.',
    specs: { 'Presión': '4,400 PSI', 'Caudal': '4.0 GPM', 'Motor': 'A gasolina, uso comercial', 'Bomba': 'Triplex', 'Chasis': 'Acero con llantas neumáticas' },
  },
  'hidrolavadora-ryobi-3300-psi': {
    price: 11999, stock: 5,
    short: 'Hidrolavadora a gasolina lista para limpiar autos, cocheras y terrazas.',
    specs: { 'Presión': '3,300 PSI', 'Caudal': '2.3 GPM', 'Motor': 'A gasolina', 'Boquillas': '5 de conexión rápida', 'Manguera': 'Alta presión' },
  },
  'podadora-dewalt-163cc': {
    price: 9999, stock: 4,
    short: 'Tracción trasera que empuja por ti: poda pastos grandes o con pendiente sin cansarte.',
    specs: { 'Motor': '163 cc a gasolina', 'Tracción': 'Autopropulsada, trasera', 'Ancho de corte': '21"', 'Funciones': 'Recolección, mulch y descarga lateral' },
  },
  'generador-predator-9000': {
    price: 24999, stock: 3,
    short: 'Potencia de sobra para herramienta pesada en obra o respaldo de casa completa.',
    specs: { 'Potencia máxima': '9,000 W', 'Potencia continua': '7,250 W', 'Motor': '4 tiempos, 420 cc', 'Arranque': 'Eléctrico y manual', 'Combustible': 'Gasolina' },
  },
  'generador-ryobi-3400w': {
    price: 17999, stock: 4,
    short: 'Inverter ligero y silencioso para campamento, eventos o respaldo en casa.',
    specs: { 'Potencia máxima': '3,400 W', 'Tecnología': 'Inverter (energía limpia)', 'Combustible': 'Gasolina', 'Arranque': 'Manual', 'Portátil': 'Sí, con ruedas y asa' },
  },
  'generador-ryobi-6500w': {
    price: 26999, stock: 2,
    short: 'Arranca equipos grandes con 8,125 W de pico y sostiene 6,500 W continuos.',
    specs: { 'Potencia máxima': '8,125 W', 'Potencia continua': '6,500 W', 'Combustible': 'Gasolina', 'Arranque': 'Eléctrico y manual', 'Salidas': '120 V / 240 V' },
  },
  'hidrolavadora-bauer-2000-psi': {
    price: 3299, stock: 10,
    short: 'Eléctrica y ligera: conéctala y lava auto, banqueta o muebles de jardín.',
    specs: { 'Presión': '2,000 PSI', 'Caudal': '1.76 GPM', 'Motor': 'Eléctrico, 13 A', 'Alimentación': '120 V' },
  },
  'hidrolavadora-bauer-2300-psi': {
    price: 4499, stock: 6,
    short: 'Motor brushless más durable y eficiente para limpiar seguido sin batallar.',
    specs: { 'Presión': '2,300 PSI', 'Motor': 'Eléctrico brushless', 'Alimentación': '120 V', 'Boquillas': 'Intercambiables' },
  },
  'hidrolavadora-bauker-1800-psi': {
    price: 2499, stock: 9,
    short: 'La opción económica para lavar auto, cochera y patio en casa.',
    specs: { 'Presión': '1,800 PSI', 'Motor': 'Eléctrico', 'Alimentación': '120 V', 'Accesorios': 'Lanza y depósito de jabón' },
  },
  'cepilladora-espesor-hercules': {
    price: 10999, stock: 2,
    short: 'Cepilla madera a espesor exacto; portátil para llevarla del taller a la obra.',
    specs: { 'Ancho de corte': '13"', 'Motor': '15 A', 'Tipo': 'Portátil de espesor', 'Alimentación': '120 V' },
  },
  'compactadora-placa-7hp': {
    price: 13999, stock: 3, featured: true,
    short: 'Compacta tierra, grava y adocreto antes de colar o empedrar.',
    specs: { 'Motor': '7 HP a gasolina', 'Tipo': 'Placa vibratoria', 'Uso': 'Tierra, grava y adoquín', 'Extras': 'Tanque de agua para asfalto' },
  },
  'compresor-dewalt-175-psi': {
    price: 7499, stock: 0,
    short: 'Más presión para herramienta exigente, con la resistencia de DeWalt.',
    specs: { 'Presión máxima': '175 PSI', 'Lubricación': 'Libre de aceite', 'Alimentación': '120 V', 'Uso': 'Clavado, grapado e inflado' },
  },
  'gato-hidraulico-rapid-pump-1-5t': {
    price: 2499, stock: 12,
    short: 'Ligero y rápido: levanta tu auto en pocas bombeadas para cambiar llanta o hacer servicio.',
    specs: { 'Capacidad': '1.5 t', 'Tipo': 'Patín', 'Bomba': 'Doble pistón (Rapid Pump)', 'Material': 'Aluminio y acero' },
  },
  'generador-predator-1400': {
    price: 5499, stock: 8,
    short: 'Pequeño y fácil de mover para luz, ventilador o herramienta ligera.',
    specs: { 'Potencia máxima': '1,400 W', 'Potencia continua': '1,100 W', 'Combustible': 'Gasolina', 'Arranque': 'Manual', 'Salidas': '120 V' },
  },
  'generador-enerwell-g1000': {
    price: 3999, stock: 10,
    short: 'Generador de entrada para focos, cargadores y pequeños aparatos.',
    specs: { 'Potencia máxima': '1,000 W', 'Potencia continua': '800 W', 'Motor': '2 tiempos', 'Combustible': 'Gasolina con aceite', 'Salidas': '120 V' },
  },
  'generador-enerwell-g2500': {
    price: 8499, stock: 6,
    short: 'Rinde para refri, luces y herramienta mediana en casa o puesto.',
    specs: { 'Potencia máxima': '2,500 W', 'Potencia continua': '2,200 W', 'Motor': '4 tiempos', 'Combustible': 'Gasolina', 'Arranque': 'Manual' },
  },
  'generador-predator-4375': {
    price: 10999, compare: 12499, stock: 5, featured: true,
    short: 'El equilibrio entre potencia y precio para obra y respaldo de casa.',
    specs: { 'Potencia máxima': '4,375 W', 'Potencia continua': '3,500 W', 'Motor': '4 tiempos, 212 cc', 'Combustible': 'Gasolina', 'Arranque': 'Manual' },
  },
  'generador-champion-5500': {
    price: 14999, stock: 3,
    short: 'Potencia confiable de Champion para herramienta de obra y electrodomésticos.',
    specs: { 'Potencia máxima': '5,500 W', 'Potencia continua': '4,500 W', 'Combustible': 'Gasolina', 'Arranque': 'Manual', 'Salidas': '120 V / 240 V' },
  },
  'hidrolavadora-dewalt-3600-psi': {
    price: 16999, stock: 0,
    short: 'Más presión para limpiar concreto manchado, remolques y maquinaria.',
    specs: { 'Presión': '3,600 PSI', 'Caudal': '2.5 GPM', 'Motor': 'A gasolina', 'Chasis': 'Acero con llantas neumáticas' },
  },
  'hidrolavadora-predator-4400-psi': {
    price: 19999, stock: 3,
    short: 'Presión profesional a mejor precio para trabajo pesado diario.',
    specs: { 'Presión': '4,400 PSI', 'Caudal': '4.0 GPM', 'Motor': 'A gasolina', 'Bomba': 'Triplex' },
  },
  'compresor-husky-200-psi': {
    price: 9499, stock: 4,
    short: 'Hasta 200 PSI para menos recargas y herramienta neumática de alto consumo.',
    specs: { 'Presión máxima': '200 PSI', 'Alimentación': '120 V', 'Uso': 'Taller y construcción' },
  },
  'podadora-atlas-80v': {
    price: 11999, stock: 5, featured: true,
    short: 'Sin gasolina, sin cable, sin jalar cuerda: arranca con un botón y trabaja en silencio.',
    specs: { 'Voltaje': '80 V', 'Motor': 'Eléctrico brushless', 'Arranque': 'Botón', 'Funciones': 'Recolección y mulch' },
  },
  'podadora-dewalt-196cc': {
    price: 8999, stock: 6,
    short: 'Motor de 196 cc con fuerza para pasto grueso en jardines medianos y grandes.',
    specs: { 'Motor': '196 cc a gasolina', 'Ancho de corte': '21"', 'Funciones': 'Recolección, mulch y descarga lateral', 'Arranque': 'Manual' },
  },
  'podadora-echo-190cc': {
    price: 9499, stock: 3,
    short: 'La durabilidad de Echo para mantener el pasto parejo temporada tras temporada.',
    specs: { 'Motor': '190 cc a gasolina', 'Ancho de corte': '21"', 'Funciones': 'Recolección, mulch y descarga lateral' },
  },
  'podadora-murray-e550': {
    price: 5999, stock: 7,
    short: 'Podadora sencilla y confiable para jardines de casa.',
    specs: { 'Motor': 'Briggs & Stratton E550', 'Tipo': 'De empuje', 'Ancho de corte': '20"', 'Combustible': 'Gasolina' },
  },
  'generador-predator-1800': {
    price: 6999, stock: 6,
    short: 'Compacto y económico para trabajos ligeros y cortes de luz.',
    specs: { 'Potencia máxima': '1,800 W', 'Potencia continua': '1,500 W', 'Combustible': 'Gasolina', 'Arranque': 'Manual' },
  },
  'generador-predator-6500': {
    price: 17999, stock: 0,
    short: 'Potencia para obra con varias herramientas trabajando al mismo tiempo.',
    specs: { 'Potencia máxima': '6,500 W', 'Combustible': 'Gasolina', 'Arranque': 'Manual', 'Salidas': '120 V / 240 V' },
  },
  'generador-inverter-predator-4550': {
    price: 21999, stock: 4, featured: true,
    short: 'Súper silencioso y con energía limpia para computadoras, TV y equipo sensible.',
    specs: { 'Potencia máxima': '4,550 W', 'Potencia continua': '3,700 W', 'Tecnología': 'Inverter (energía limpia)', 'Arranque': 'Eléctrico y manual', 'Combustible': 'Gasolina' },
  },
  'hidrolavadora-predator-3200-psi': {
    price: 8999, stock: 6,
    short: 'Hidrolavadora a gasolina de buen rendimiento a precio accesible.',
    specs: { 'Presión': '3,200 PSI', 'Caudal': '2.4 GPM', 'Motor': 'A gasolina, 212 cc', 'Boquillas': '5 de conexión rápida' },
  },
  'revolvedora-ryobi': {
    price: 6999, stock: 3,
    short: 'Prepara mezcla y concreto en obra chica sin partirte la espalda.',
    specs: { 'Tipo': 'Portátil, eléctrica', 'Alimentación': '120 V', 'Uso': 'Concreto, mortero y yeso' },
  },
  'sierra-mesa-warrior-10': {
    price: 5499, compare: 6299, stock: 5,
    short: 'Cortes rectos y repetibles en madera para taller y carpintería de obra.',
    specs: { 'Disco': '10"', 'Motor': '15 A', 'Alimentación': '120 V', 'Incluye': 'Guía de corte y protector' },
  },
  'polipasto-cadena': {
    price: 2999, stock: 4,
    short: 'Levanta motores y cargas pesadas con esfuerzo mínimo, sin electricidad.',
    specs: { 'Capacidad': '1 t', 'Tipo': 'Manual de cadena', 'Material': 'Acero' },
  },
}
