-- Contenido real portado del sitio estático (index.html, commit 3a79622).
-- Los horarios son el valor por defecto hasta que el cliente confirme los reales (spec §18).

insert into site_settings (phone, whatsapp, email, address, business_hours, social_links, seo_title, seo_description)
values (
  '+50767340816',
  '+50767340816',
  'gerencia@viangsolutions.com',
  'Ciudad de Panamá, Panamá',
  '{"mon":{"open":"08:00","close":"17:00"},"tue":{"open":"08:00","close":"17:00"},"wed":{"open":"08:00","close":"17:00"},"thu":{"open":"08:00","close":"17:00"},"fri":{"open":"08:00","close":"17:00"},"sat":null,"sun":null}',
  '{"facebook":"https://www.facebook.com/viangsolutions","instagram":"https://instagram.com/viangsolution","tiktok":"https://www.tiktok.com/@viangsolution","linkedin":"https://www.linkedin.com/in/vionel-angulo-cede%C3%B1o/"}',
  'Viangsolutions & Services — Limpieza y Mantenimiento Especializado en Panamá',
  'Soluciones integrales para espacios residenciales y comerciales de alto valor: tratamientos de pisos, limpieza especializada, instalaciones y reparaciones en Panamá.'
);

insert into services (slug, title, short_description, long_description, icon, image_path, sort_order, published) values
('tratamientos-e-instalacion-de-pisos', 'Tratamientos de pisos',
 'Restauración de mármol, granito y madera: pulido con diamante, brillo, juntas, manchas y sellado.',
 E'Devolvemos el brillo al mármol, al granito y a la madera. Cada superficie se trabaja con diamante, de grano 60 a 3000, hasta dejar un acabado parejo y protegido.\n- Restauración de mármol y granito\n- Pulido con diamante, grano 60 a 3000\n- Realce de brillo\n- Tratamiento de juntas\n- Eliminación de manchas\n- Sellado\n- Pisos de madera',
 'sparkles', 'img/obras/marmol-sala.webp', 1, true),
('limpieza-especializada', 'Limpieza especializada y exteriores',
 'Bordes de piscina, limpieza post-construcción, hidrolavado, pintura, fachadas y rótulos de acero.',
 E'Bordes de piscina, galpones y oficinas después de una obra, fachadas y rótulos. Una limpieza que deja el inmueble listo para usarse.\n- Bordes de piscina\n- Limpieza post-construcción de galpones y oficinas\n- Hidrolavado a presión\n- Pintura y fachadas\n- Rótulos en acero inoxidable',
 'droplets', 'img/obras/piscina.webp', 2, true),
('instalaciones-y-reparaciones', 'Instalaciones y reparaciones',
 'Filtración de agua de 3 etapas, aire acondicionado, drywall, pintura y electricidad menor.',
 E'Instalamos y reparamos lo que mantiene el espacio en funcionamiento: el agua, el aire acondicionado y los acabados.\n- Sistemas de filtración de agua de 3 etapas\n- Aire acondicionado\n- Drywall\n- Pintura\n- Electricidad menor',
 'wrench', 'img/obras/techo.webp', 3, true);

-- Logos aprobados por el dueño. El orden sigue a public/img/clientes/01.png … 09.png.
insert into clients (name, logo_path, sort_order, published) values
('Tocumen Aeropuerto Internacional', 'img/clientes/01.png', 1, true),
('Cervecería Barú (Grupo Heineken)', 'img/clientes/02.png', 2, true),
('Hotel El Panamá', 'img/clientes/03.png', 3, true),
('Massimo Dutti', 'img/clientes/04.png', 4, true),
('Nike', 'img/clientes/05.png', 5, true),
('Regency Real Estate', 'img/clientes/06.png', 6, true),
('Puma', 'img/clientes/07.png', 7, true),
('Sportline America', 'img/clientes/08.png', 8, true),
('Desigual', 'img/clientes/09.png', 9, true);

-- stats queda vacía: las cifras no están confirmadas y no se publican.
