-- Contenido real portado del sitio estático (index.html, commit 3a79622).
-- Los horarios son el valor por defecto hasta que el cliente confirme los reales (spec §18).

insert into site_settings (phone, whatsapp, email, address, business_hours, social_links, seo_title, seo_description)
values (
  '+50767340816',
  '+50767340816',
  'vionel@viangsolution.com',
  'Ciudad de Panamá, Panamá',
  '{"mon":{"open":"08:00","close":"17:00"},"tue":{"open":"08:00","close":"17:00"},"wed":{"open":"08:00","close":"17:00"},"thu":{"open":"08:00","close":"17:00"},"fri":{"open":"08:00","close":"17:00"},"sat":null,"sun":null}',
  '{"facebook":"https://www.facebook.com/viangsolutions","instagram":"https://instagram.com/viangsolution"}',
  'Viang Solution — Limpieza y Mantenimiento Profesional en Panamá',
  'Servicios profesionales de limpieza y mantenimiento en Panamá: pulimiento de pisos, limpieza de muebles y alfombras, pintura, instalaciones y limpieza empresarial.'
);

insert into services (slug, title, short_description, long_description, icon, image_path, sort_order, published) values
('pulimiento-de-pisos', 'Pulimientos y Limpiezas de Pisos',
 'Pisos de cemento, mármol, granito, madera y más. También pulimos sobres de cualquier material.',
 'Devolvemos el brillo a pisos de cemento, mármol, granito y madera con maquinaria profesional. También pulimos sobres y superficies de cualquier material, para hogares, oficinas y comercios.',
 'sparkles', 'img/Servicios/PISOS.jpg', 1, true),
('limpieza-de-muebles-y-alfombras', 'Limpieza de Muebles y Alfombras',
 'Alfombras de todo tipo y muebles de cualquier material — también interiores de autos.',
 'Limpieza profunda de alfombras de todo tipo y muebles de cualquier material, incluyendo tapicería de autos. Eliminamos manchas, ácaros y olores con productos eco-amigables.',
 'sofa', 'img/Servicios/alfombras.jpg', 2, true),
('multi-servicios', 'Multi Servicios',
 'Electricidad menor, plomería básica y reparaciones generales para su hogar.',
 'Resolvemos el mantenimiento de su hogar o negocio: electricidad menor, plomería básica y reparaciones generales, con un solo proveedor de confianza.',
 'wrench', 'img/Servicios/electricidad.jpg', 3, true),
('instalaciones', 'Instalaciones de Todo Tipo',
 'Aires acondicionados, cortinas eléctricas, ventiladores y más.',
 'Instalamos aires acondicionados, cortinas eléctricas, ventiladores y otros equipos para su hogar o empresa, con garantía de trabajo bien hecho.',
 'plug', 'img/Servicios/instalacionesac.jpg', 4, true),
('pintura', 'Pintura',
 'Pintura interior y exterior, tratamiento de superficies y acabados especiales.',
 'Servicios de pintura interior y exterior con preparación y tratamiento de superficies y acabados especiales, para resultados duraderos y prolijos.',
 'paint-roller', 'img/Servicios/pintura.jpg', 5, true),
('limpieza-empresarial', 'Limpieza Empresarial',
 'Oficinas, locales comerciales, espacios industriales y pos-construcción.',
 'Limpieza especializada para oficinas, locales comerciales y espacios industriales, incluyendo limpieza pos-construcción. Planes por frecuencia adaptados a su operación.',
 'building', 'img/Servicios/PISOS.jpg', 6, true);

insert into clients (name, logo_path, sort_order, published) values
('Cliente 1', 'img/clientes/01.png', 1, true),
('Cliente 2', 'img/clientes/02.png', 2, true),
('Cliente 3', 'img/clientes/03.png', 3, true),
('Cliente 4', 'img/clientes/04.png', 4, true),
('Cliente 5', 'img/clientes/05.png', 5, true),
('Cliente 6', 'img/clientes/06.png', 6, true),
('Cliente 7', 'img/clientes/07.png', 7, true),
('Cliente 8', 'img/clientes/08.png', 8, true),
('Cliente 9', 'img/clientes/09.png', 9, true);
