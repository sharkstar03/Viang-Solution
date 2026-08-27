-- Contenido real portado del sitio estático (index.html, commit 3a79622).
-- Los horarios son el valor por defecto hasta que el cliente confirme los reales (spec §18).

insert into site_settings (phone, whatsapp, email, address, business_hours, social_links, seo_title, seo_description)
values (
  '+50767340816',
  '+50767340816',
  'gerencia@viangsolutions.com',
  'Ciudad de Panamá, Panamá',
  '{"mon":{"open":"08:00","close":"17:00"},"tue":{"open":"08:00","close":"17:00"},"wed":{"open":"08:00","close":"17:00"},"thu":{"open":"08:00","close":"17:00"},"fri":{"open":"08:00","close":"17:00"},"sat":null,"sun":null}',
  '{"facebook":"https://www.facebook.com/viangsolutions","instagram":"https://instagram.com/viangsolution","tiktok":"https://www.tiktok.com/@viangsolution","linkedin":"https://www.linkedin.com/company/viangsolution"}',
  'Viang Solutions & Service — Limpieza y Mantenimiento Especializado en Panamá',
  'Soluciones integrales para espacios residenciales y comerciales de alto valor: tratamientos de pisos, limpieza especializada, instalaciones y reparaciones en Panamá.'
);

insert into services (slug, title, short_description, long_description, icon, image_path, sort_order, published) values
('tratamientos-e-instalacion-de-pisos', 'Tratamientos e Instalación de Pisos',
 'Pulido y abrillantado de mármol, granito, porcelanato, concreto y más. Instalación, impermeabilización y epóxicos.',
 E'Soluciones especializadas para todo tipo de superficies, adaptadas a sus necesidades y exigencias:\n- Pulido y abrillantado de mármol, granito, porcelanato, concreto, adoquines, cerámica, pasta, vinilo, PVC, piedras naturales, gongrani y terrazo\n- Instalación profesional de pisos\n- Tratamientos de impermeabilización y sellado contra humedad\n- Aplicación de recubrimientos de pintura epóxica de alta resistencia',
 'sparkles', 'img/stock/marble-corridor.jpg', 1, true),
('limpieza-especializada', 'Limpieza Especializada',
 'Restauración de alfombras, muebles y tapicería automotriz, hidrolavado de precisión y limpieza integral.',
 E'Trabajos de limpieza y restauración con estándares de calidad superiores, ideales para inmuebles residenciales de lujo, establecimientos comerciales y espacios corporativos:\n- Limpieza y restauración de alfombras residenciales y comerciales\n- Tratamientos para muebles de interiores y exteriores\n- Limpieza y restauración de tapicería automotriz\n- Limpieza y mantenimiento de cortinas y sistemas roller\n- Limpieza integral de espacios residenciales y comerciales\n- Limpieza de muros, techos y pisos mediante hidrolavado de precisión\n- Mantenimiento de áreas comunes en edificios y propiedades horizontales',
 'droplets', 'img/stock/sofa-cleaning.jpg', 2, true),
('instalaciones-y-reparaciones', 'Instalaciones y Reparaciones',
 'Equipos audiovisuales, electricidad menor, drywall, impermeabilización, pintura y mantenimiento de A/C.',
 E'Instalación, mantenimiento y reparación para garantizar el correcto funcionamiento y la estética de sus espacios:\n- Instalación de equipos audiovisuales y elementos decorativos\n- Trabajos eléctricos de baja complejidad: luminarias, enchufes y sistemas de conexión\n- Estructuras y acabados en sistema drywall\n- Impermeabilización y tratamiento de techos y superficies expuestas\n- Pintura de interiores y exteriores con acabados de alta calidad\n- Mantenimiento preventivo y correctivo de sistemas de aire acondicionado',
 'wrench', 'img/stock/ac-service.jpg', 3, true);

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
