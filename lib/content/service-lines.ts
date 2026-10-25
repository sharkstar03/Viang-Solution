import type { Service } from '@/lib/types';

/** Foto real en public/img/trabajos/. El dueño coloca el JPG en el deploy. */
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
  src: `/img/trabajos/${file}`,
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
    cover: 'img/trabajos/marmol-vista-mar-2.jpg',
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
      foto('marmol-vista-mar-2.jpg', 'Mármol blanco pulido que refleja ventanales con vista al mar'),
      foto('marmol-operario.jpg', 'Operario puliendo un piso de mármol'),
      foto('marmol-maquina.jpg', 'Máquina de pulido sobre mármol, con vista al mar'),
      foto('piso-brillo.jpg', 'Piso de baldosas con brillo de espejo'),
      foto('madera-1.jpg', 'Piso de madera restaurado'),
      foto('marmol-antes-mancha.jpg', 'Mármol con mancha, antes del tratamiento', 'Antes'),
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
    cover: 'img/trabajos/piscina-1.jpg',
    bullets: [
      'Bordes de piscina',
      'Limpieza post-construcción de galpones y oficinas',
      'Hidrolavado a presión',
      'Pintura y fachadas',
      'Rótulos en acero inoxidable',
    ],
    photos: [
      foto('piscina-1.jpg', 'Operario puliendo el borde de una piscina'),
      foto('piscina-2.jpg', 'Borde de piscina en tratamiento'),
      foto('galpon-antes-1.jpg', 'Galpón industrial antes de la limpieza post-construcción', 'Antes'),
      foto('piscina-antes.jpg', 'Borde de piscina antes del tratamiento', 'Antes'),
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
    cover: 'img/trabajos/filtros-agua.jpg',
    bullets: [
      'Sistemas de filtración de agua de 3 etapas',
      'Aire acondicionado',
      'Drywall',
      'Pintura',
      'Electricidad menor',
    ],
    photos: [
      foto('filtros-agua.jpg', 'Sistema de filtros de agua azules, de tres etapas'),
    ],
  },
];

export const workGallery: WorkPhoto[] = [
  foto('marmol-vista-mar-1.jpg', 'Mármol blanco pulido que refleja ventanales con vista al mar'),
  foto('marmol-vista-mar-2.jpg', 'Detalle del mármol pulido frente al ventanal'),
  foto('marmol-vista-mar-3.jpg', 'Otra vista del mármol con reflejo del mar'),
  foto('marmol-piso-alto-1.jpg', 'Piso de mármol en un nivel alto, ya pulido'),
  foto('marmol-piso-alto-2.jpg', 'Mármol de un piso alto con brillo parejo'),
  foto('marmol-piso-alto-3.jpg', 'Continuación del piso de mármol en altura'),
  foto('marmol-operario.jpg', 'Operario puliendo mármol'),
  foto('marmol-maquina.jpg', 'Máquina de pulido sobre mármol, con vista al mar'),
  foto('marmol-pared.jpg', 'Revestimiento de mármol en pared'),
  foto('marmol-antes-mancha.jpg', 'Mancha en el mármol, antes del tratamiento', 'Antes'),
  foto('piso-brillo.jpg', 'Piso con brillo de espejo'),
  foto('madera-1.jpg', 'Piso de madera'),
  foto('madera-2.jpg', 'Otro piso de madera restaurado'),
  foto('piscina-1.jpg', 'Pulido del borde de una piscina'),
  foto('piscina-2.jpg', 'Borde de piscina durante el trabajo'),
  foto('piscina-antes.jpg', 'Borde de piscina antes del tratamiento', 'Antes'),
  foto('galpon-antes-1.jpg', 'Galpón antes de la limpieza post-construcción', 'Antes'),
  foto('galpon-antes-2.jpg', 'Interior de galpón antes de la limpieza post-construcción', 'Antes'),
  foto('filtros-agua.jpg', 'Filtros de agua de tres etapas'),
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
