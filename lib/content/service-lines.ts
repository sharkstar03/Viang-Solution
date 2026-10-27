import type { Service } from '@/lib/types';

/** Foto real optimizada en public/img/obras/. */
export interface WorkPhoto {
  src: string;
  alt: string;
  /** Marca de estado, por ejemplo "Antes". */
  badge?: string;
}

export interface ServiceLine {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  icon: string;
  /** Ruta sin barra inicial, igual que services.image_path. */
  cover: string;
  bullets: string[];
  photos: WorkPhoto[];
}

const foto = (file: string, alt: string, badge?: string): WorkPhoto => ({
  src: `/img/obras/${file}`,
  alt,
  badge,
});

/**
 * Las tres líneas, con el detalle que pidió el dueño.
 * La portada usa este módulo directo: una fila vieja en la base no pisa las viñetas.
 * Los slugs no cambian, para no romper las URLs.
 */
export const serviceLines: ServiceLine[] = [
  {
    slug: 'tratamientos-e-instalacion-de-pisos',
    title: 'Tratamientos de pisos',
    summary:
      'Restauración de mármol, granito y madera: pulido con diamante, brillo, juntas, manchas y sellado.',
    intro:
      'Devolvemos el brillo al mármol, al granito y a la madera. Cada superficie se trabaja con diamante, de grano 60 a 3000, hasta dejar un acabado parejo y protegido.',
    icon: 'sparkles',
    cover: 'img/obras/marmol-sala.webp',
    bullets: [
      'Restauración de mármol y granito',
      'Pulido con diamante, grano 60 a 3000',
      'Realce de brillo',
      'Tratamiento de juntas',
      'Eliminación de manchas',
      'Sellado',
      'Pisos de madera',
    ],
    photos: [
      foto('marmol-sala.webp', 'Comedor con piso de mármol oscuro y vista a la ciudad'),
      foto('marmol-brillo.webp', 'Mármol pulido que refleja los ventanales'),
      foto('marmol-operario.webp', 'Operario con pulidora sobre mármol, vista al jardín'),
      foto('marmol-pasillo.webp', 'Operario puliendo un pasillo de mármol'),
      foto('marmol-mar.webp', 'Sala de mármol pulido con vista al mar'),
      foto('marmol-comedor.webp', 'Comedor con piso de mármol en brillo'),
      foto('madera.webp', 'Deck de madera junto al bosque'),
      foto('oficina.webp', 'Oficina con porcelanato en brillo'),
    ],
  },
  {
    slug: 'limpieza-especializada',
    title: 'Limpieza especializada y exteriores',
    summary:
      'Bordes de piscina, limpieza post-construcción, hidrolavado, pintura, fachadas y rótulos de acero.',
    intro:
      'Bordes de piscina, galpones y oficinas después de una obra, fachadas y rótulos. Una limpieza que deja el inmueble listo para usarse.',
    icon: 'droplets',
    cover: 'img/obras/piscina.webp',
    bullets: [
      'Bordes de piscina',
      'Limpieza post-construcción de galpones y oficinas',
      'Hidrolavado a presión',
      'Pintura y fachadas',
      'Rótulos en acero inoxidable',
    ],
    photos: [
      foto('piscina.webp', 'Borde de piscina en travertino, con deck y grama'),
      foto('travertino.webp', 'Terraza de travertino hacia el jardín'),
      foto('terraza-mar.webp', 'Terraza de travertino con balaustrada y vista al mar'),
      foto('terraza-operario.webp', 'Operario en una terraza de travertino con vista al mar'),
      foto('post-obra.webp', 'Pasillo protegido durante la limpieza post-construcción'),
      foto('concreto.webp', 'Galera con concreto pulido'),
      foto('pintura.webp', 'Pintura de pared con rodillo'),
    ],
  },
  {
    slug: 'instalaciones-y-reparaciones',
    title: 'Instalaciones y reparaciones',
    summary:
      'Filtración de agua de 3 etapas, aire acondicionado, drywall, pintura y electricidad menor.',
    intro:
      'Instalamos y reparamos lo que mantiene el espacio en funcionamiento: el agua, el aire acondicionado y los acabados.',
    icon: 'wrench',
    cover: 'img/obras/techo.webp',
    bullets: [
      'Sistemas de filtración de agua de 3 etapas',
      'Aire acondicionado',
      'Drywall',
      'Pintura',
      'Electricidad menor',
    ],
    photos: [
      foto('techo.webp', 'Estructura metálica de techo en obra'),
      foto('vinil.webp', 'Piso de vinilo ya instalado'),
      foto('oficina.webp', 'Oficina con porcelanato pulido'),
      foto('pintura.webp', 'Trabajo de pintura en pared'),
    ],
  },
];

export const workGallery: WorkPhoto[] = [
  foto('marmol-sala.webp', 'Comedor con piso de mármol oscuro y vista a la ciudad'),
  foto('marmol-brillo.webp', 'Mármol pulido que refleja los ventanales'),
  foto('marmol-mar.webp', 'Sala de mármol pulido con vista al mar'),
  foto('marmol-operario.webp', 'Pulido de mármol con máquina, vista al jardín'),
  foto('piscina.webp', 'Borde de piscina en travertino'),
  foto('travertino.webp', 'Terraza de travertino hacia el jardín'),
  foto('terraza-mar.webp', 'Terraza con vista al mar'),
  foto('madera.webp', 'Deck de madera'),
  foto('concreto.webp', 'Concreto pulido en galera industrial'),
  foto('post-obra.webp', 'Limpieza post-construcción en un pasillo'),
  foto('oficina.webp', 'Porcelanato en brillo, oficina'),
  foto('pintura.webp', 'Pintura de interiores'),
  foto('techo.webp', 'Estructura de techo en obra'),
  foto('vinil.webp', 'Instalación de vinilo'),
];

export const processSteps = [
  {
    title: 'Visita y diagnóstico',
    text: 'Vamos al lugar, vemos el estado de las superficies y definimos el alcance.',
  },
  {
    title: 'Cotización escrita',
    text: 'Recibe el detalle del trabajo por escrito, antes de empezar.',
  },
  {
    title: 'Programación',
    text: 'Acordamos fecha y horario para no interrumpir su operación.',
  },
  {
    title: 'Ejecución',
    text: 'El equipo trabaja con materiales de calidad y el método que corresponde a cada superficie.',
  },
  {
    title: 'Entrega y garantía',
    text: 'Revisamos el resultado juntos y el trabajo queda respaldado.',
  },
] as const;

export const whyUs = [
  { title: 'Materiales de calidad', text: 'Insumos adecuados para mármol, madera, fachadas y equipos.' },
  { title: 'Trabajo garantizado', text: 'Entregamos el resultado acordado y respondemos por él.' },
  { title: 'Puntualidad', text: 'Llegamos en el horario pautado y cuidamos el tiempo de su operación.' },
  { title: 'Comunicación clara', text: 'Un solo contacto, del diagnóstico a la entrega.' },
  { title: 'Precios justos', text: 'La cotización escrita dice qué incluye, sin sorpresas al final.' },
  { title: 'Cobertura en todo Panamá', text: 'Residencias, comercios, edificios y galpones en el país.' },
] as const;

export function serviceLineBySlug(slug: string): ServiceLine | undefined {
  return serviceLines.find((line) => line.slug === slug);
}

export function servicesFromLines(): Service[] {
  return serviceLines.map((line, index) => ({
    id: `svc-${line.slug}`,
    slug: line.slug,
    title: line.title,
    short_description: line.summary,
    long_description: `${line.intro}\n${line.bullets.map((item) => `- ${item}`).join('\n')}`,
    icon: line.icon,
    image_path: line.cover,
    faq: [],
    price_from: null,
    sort_order: index + 1,
  }));
}
