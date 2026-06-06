-- ============================================================
-- Criollo · Paladar Argento — Carga inicial del menú (brief)
-- Nombres creativos en español en los 3 idiomas; descripciones traducidas.
-- Precios en ARS. Guarniciones/Postres/Bebidas: price_tbd = true.
-- Idempotente: categorías hacen upsert; platos no se pisan si ya existen.
-- ============================================================

-- ── Categorías ──
insert into public.categories (slug, name_es, name_en, name_pt, sort_order) values
  ('entradas',     'Entradas',     'Starters',        'Entradas',          1),
  ('tablas',       'Tablas',       'Sharing Boards',  'Tábuas',            2),
  ('carnes',       'Carnes',       'Grill & Meats',   'Carnes',            3),
  ('guarniciones', 'Guarniciones', 'Sides',           'Acompanhamentos',   4),
  ('postres',      'Postres',      'Desserts',        'Sobremesas',        5),
  ('bebidas',      'Bebidas',      'Drinks',          'Bebidas',           6)
on conflict (slug) do update
  set name_es = excluded.name_es,
      name_en = excluded.name_en,
      name_pt = excluded.name_pt,
      sort_order = excluded.sort_order;

-- ── ENTRADAS ──
insert into public.dishes
  (category_id, slug, name_es, name_en, name_pt, desc_es, desc_en, desc_pt, price, price2, price_kind, price_tbd, tags, sort_order)
values
  ((select id from public.categories where slug='entradas'), 'la-que-comia-san-martin',
   'La que comía San Martín', 'La que comía San Martín', 'La que comía San Martín',
   'Clásica empanada criolla argentina con salsa. Podés elegirla de carne dulce o de humita.',
   'Classic Argentine criolla empanada with sauce. Choose sweet beef or humita (creamy corn).',
   'Clássica empanada criolla argentina com molho. Escolha carne doce ou humita (creme de milho).',
   3000, null, 'single', false, '{}', 1),

  ((select id from public.categories where slug='entradas'), 'provo-y-gusto',
   'Provo y Gustó', 'Provo y Gustó', 'Provo y Gustó',
   'Provoleta a la parrilla bien pulenta. Sale con cazuela de salsa criolla.',
   'Properly loaded grilled provoleta cheese. Served with a pot of criolla sauce.',
   'Provoleta na grelha bem caprichada. Acompanha caçarola de molho criollo.',
   13900, null, 'single', false, '{veg,recom}', 2),

  ((select id from public.categories where slug='entradas'), 'papita-a-lo-criollo',
   'Papita a lo Criollo', 'Papita a lo Criollo', 'Papita a lo Criollo',
   'Papas fritas en bastones con queso fundido y salchicha parrillera en trozos.',
   'Steak-cut fries with melted cheese and chunks of grilled sausage.',
   'Batatas fritas em bastões com queijo derretido e linguiça grelhada em pedaços.',
   13900, null, 'single', false, '{}', 3),

  ((select id from public.categories where slug='entradas'), 'glotona',
   'Glotona', 'Glotona', 'Glotona',
   'Tradicional tortilla de papas rellena de chorizo y queso. Sale babé.',
   'Traditional potato omelette stuffed with chorizo and cheese. Served runny.',
   'Tradicional tortilha de batata recheada com chorizo e queijo. Servida molinha.',
   13900, null, 'single', false, '{}', 4),

  ((select id from public.categories where slug='entradas'), 'glotona-a-caballo',
   'Glotona a Caballo', 'Glotona a Caballo', 'Glotona a Caballo',
   'La Glotona coronada con huevos fritos.',
   'Our Glotona crowned with fried eggs.',
   'A Glotona coroada com ovos fritos.',
   16900, null, 'single', false, '{}', 5)
on conflict (slug) do nothing;

-- ── TABLAS (P2 / P4) ──
insert into public.dishes
  (category_id, slug, name_es, name_en, name_pt, desc_es, desc_en, desc_pt, price, price2, price_kind, price_tbd, tags, sort_order)
values
  ((select id from public.categories where slug='tablas'), 'la-indomable',
   'La Indomable', 'La Indomable', 'La Indomable',
   'Empanada criolla, vacío de cerdo a la pizza y a caballo, con papas fritas.',
   'Criolla empanada, pork flank "a la pizza" and "a caballo", with fries.',
   'Empanada criolla, vazio de porco à pizza e a cavalo, com batatas fritas.',
   33900, 65500, 'p2p4', false, '{compartir,recom}', 1),

  ((select id from public.categories where slug='tablas'), 'criolla',
   'Criolla', 'Criolla', 'Criolla',
   'Empanada criolla, bife de chorizo, costilla de ternera ancha y papas a caballo.',
   'Criolla empanada, sirloin steak, wide beef short rib and fries "a caballo".',
   'Empanada criolla, bife chorizo, costela de vitela larga e batatas a cavalo.',
   36500, 69500, 'p2p4', false, '{compartir}', 2),

  ((select id from public.categories where slug='tablas'), 'de-bodegon',
   'De Bodegón', 'De Bodegón', 'De Bodegón',
   'Empanada criolla, provoleta, costilla de cerdo, tapa de asado y papas a caballo.',
   'Criolla empanada, provoleta, pork rib, beef rib cap and fries "a caballo".',
   'Empanada criolla, provoleta, costela de porco, capa de costela e batatas a cavalo.',
   32500, 61500, 'p2p4', false, '{compartir}', 3),

  ((select id from public.categories where slug='tablas'), 'paladar-argento',
   'Paladar Argento', 'Paladar Argento', 'Paladar Argento',
   'Empanada criolla, provoleta, entrecot de ternera, matambrito de cerdo y papas Criollo.',
   'Criolla empanada, provoleta, beef entrecôte, pork matambre and Criollo fries.',
   'Empanada criolla, provoleta, entrecôte de vitela, matambre de porco e batatas Criollo.',
   37500, 71500, 'p2p4', false, '{compartir,recom}', 4),

  ((select id from public.categories where slug='tablas'), 'la-de-manuel-belgrano',
   'La de Manuel Belgrano', 'La de Manuel Belgrano', 'La de Manuel Belgrano',
   'Empanada criolla, chorizo bombón, morcilla bombón, tira de asado, banderita y tortilla Glotona.',
   'Criolla empanada, mini chorizo, mini blood sausage, short ribs, "banderita" and a Glotona omelette.',
   'Empanada criolla, chorizo bombom, morcela bombom, tira de assado, banderita e tortilha Glotona.',
   33900, 65500, 'p2p4', false, '{compartir}', 5)
on conflict (slug) do nothing;

-- ── CARNES ──
insert into public.dishes
  (category_id, slug, name_es, name_en, name_pt, desc_es, desc_en, desc_pt, price, price2, price_kind, price_tbd, tags, sort_order)
values
  ((select id from public.categories where slug='carnes'), 'senor-gula',
   'Señor Gula', 'Señor Gula', 'Señor Gula',
   'Bife de chorizo de 400 gr. Elegí tu punto. Sale con guarnición a elección.',
   '400 g sirloin steak. Cooked to your liking. Served with a side of your choice.',
   'Bife chorizo de 400 g. No ponto que preferir. Acompanha guarnição à escolha.',
   19000, null, 'single', false, '{recom}', 1),

  ((select id from public.categories where slug='carnes'), 'gaucha',
   'Gaucha', 'Gaucha', 'Gaucha',
   'Porción de 300 gr de entrañas. Elegí tu punto. Sale con guarnición a elección.',
   '300 g skirt steak (entraña). Cooked to your liking. With a side of your choice.',
   'Porção de 300 g de fraldinha (entranha). No seu ponto. Com guarnição à escolha.',
   18000, null, 'single', false, '{}', 2),

  ((select id from public.categories where slug='carnes'), 'atracon',
   'Atracón', 'Atracón', 'Atracón',
   'Matambrito de cerdo. Podés elegirlo al limón o a la pizza. Sale con guarnición a elección.',
   'Pork matambre. Choose lemon or "a la pizza" style. With a side of your choice.',
   'Matambre de porco. Escolha ao limão ou à pizza. Com guarnição à escolha.',
   16500, null, 'single', false, '{}', 3),

  ((select id from public.categories where slug='carnes'), 'mancha-mantel',
   'Mancha Mantel', 'Mancha Mantel', 'Mancha Mantel',
   'Milanesón de ternera frita. Podés elegirla a la napolitana o a caballo. Opcional de pollo.',
   'Large fried beef milanesa. Choose napolitana or "a caballo". Chicken option available.',
   'Milanesão de vitela frita. Escolha à napolitana ou a cavalo. Opção de frango.',
   16500, null, 'single', false, '{}', 4),

  ((select id from public.categories where slug='carnes'), 'interminable',
   'Interminable', 'Interminable', 'Interminable',
   'Sanguchazo de milanesa de ternera con tomate, lechuga, jamón, queso y huevo. Sale con papas y mayo casera. Si lo terminás, 10% de descuento.',
   'Huge beef milanesa sandwich with tomato, lettuce, ham, cheese and egg. With fries and house mayo. Finish it and get 10% off.',
   'Sanduíche gigante de milanesa de vitela com tomate, alface, presunto, queijo e ovo. Com batatas e maionese caseira. Se terminar, 10% de desconto.',
   16500, null, 'single', false, '{recom}', 5)
on conflict (slug) do nothing;

-- ── GUARNICIONES (precio a confirmar) ──
insert into public.dishes
  (category_id, slug, name_es, name_en, name_pt, desc_es, desc_en, desc_pt, price, price2, price_kind, price_tbd, tags, sort_order)
values
  ((select id from public.categories where slug='guarniciones'), 'papas-fritas-a-caballo',
   'Papas Fritas a Caballo', 'Papas Fritas a Caballo', 'Papas Fritas a Caballo',
   '400 gr de papas con tres huevos fritos.',
   '400 g of fries topped with three fried eggs.',
   '400 g de batatas fritas com três ovos fritos.',
   null, null, 'single', true, '{veg}', 1),

  ((select id from public.categories where slug='guarniciones'), 'rucula-y-queso',
   'Rúcula y Queso', 'Rúcula y Queso', 'Rúcula y Queso',
   'Hojas de rúcula y queso parmesano.',
   'Arugula leaves and parmesan cheese.',
   'Folhas de rúcula e queijo parmesão.',
   null, null, 'single', true, '{veg,tacc}', 2),

  ((select id from public.categories where slug='guarniciones'), 'mixta',
   'Mixta', 'Mixta', 'Mixta',
   'Lechuga, tomate y cebolla.',
   'Lettuce, tomato and onion.',
   'Alface, tomate e cebola.',
   null, null, 'single', true, '{veg,tacc}', 3),

  ((select id from public.categories where slug='guarniciones'), 'zanahoria-y-choclo',
   'Zanahoria y Choclo', 'Zanahoria y Choclo', 'Zanahoria y Choclo',
   'Choclo en granos y zanahoria rallada.',
   'Corn kernels and grated carrot.',
   'Milho em grãos e cenoura ralada.',
   null, null, 'single', true, '{veg,tacc}', 4)
on conflict (slug) do nothing;

-- ── POSTRES (precio a confirmar) ──
insert into public.dishes
  (category_id, slug, name_es, name_en, name_pt, desc_es, desc_en, desc_pt, price, price2, price_kind, price_tbd, tags, sort_order)
values
  ((select id from public.categories where slug='postres'), 'flan-mixto',
   'Flan Mixto', 'Flan Mixto', 'Flan Mixto',
   'Flan casero con dulce de leche y crema.',
   'Homemade flan with dulce de leche and cream.',
   'Pudim caseiro com doce de leite e creme.',
   null, null, 'single', true, '{veg,recom}', 1),

  ((select id from public.categories where slug='postres'), 'queso-y-dulce-vigilante',
   'Queso y Dulce (Vigilante)', 'Queso y Dulce (Vigilante)', 'Queso y Dulce (Vigilante)',
   'Queso fresco con dulce de membrillo o batata.',
   'Fresh cheese with quince or sweet-potato preserve.',
   'Queijo fresco com doce de marmelo ou batata-doce.',
   null, null, 'single', true, '{veg,tacc}', 2),

  ((select id from public.categories where slug='postres'), 'panqueque-dulce-de-leche',
   'Panqueque de Dulce de Leche', 'Panqueque de Dulce de Leche', 'Panqueque de Dulce de Leche',
   'Panqueque relleno y flambeado, clásico de bodegón.',
   'Dulce de leche crêpe, flambéed — a bodegón classic.',
   'Panqueca de doce de leite flambada, clássico de bodegón.',
   null, null, 'single', true, '{veg}', 3),

  ((select id from public.categories where slug='postres'), 'chocotorta',
   'Chocotorta', 'Chocotorta', 'Chocotorta',
   'Capas de galletita, dulce de leche y queso crema.',
   'Layers of chocolate biscuits, dulce de leche and cream cheese.',
   'Camadas de biscoito, doce de leite e cream cheese.',
   null, null, 'single', true, '{veg}', 4),

  ((select id from public.categories where slug='postres'), 'helado',
   'Helado', 'Helado', 'Helado',
   'Dos bochas a elección.',
   'Two scoops of your choice.',
   'Duas bolas à escolha.',
   null, null, 'single', true, '{veg}', 5)
on conflict (slug) do nothing;

-- ── BEBIDAS (precio a confirmar) ──
insert into public.dishes
  (category_id, slug, name_es, name_en, name_pt, desc_es, desc_en, desc_pt, price, price2, price_kind, price_tbd, tags, sort_order)
values
  ((select id from public.categories where slug='bebidas'), 'vino-tinto-de-la-casa',
   'Vino Tinto de la Casa', 'Vino Tinto de la Casa', 'Vino Tinto de la Casa',
   'Tinto de la casa, por copa o botella.',
   'House red, by the glass or bottle.',
   'Tinto da casa, por taça ou garrafa.',
   null, null, 'copa_botella', true, '{}', 1),

  ((select id from public.categories where slug='bebidas'), 'malbec',
   'Malbec', 'Malbec', 'Malbec',
   'Malbec, por copa o botella.',
   'Malbec, by the glass or bottle.',
   'Malbec, por taça ou garrafa.',
   null, null, 'copa_botella', true, '{recom}', 2),

  ((select id from public.categories where slug='bebidas'), 'vino-blanco',
   'Vino Blanco', 'Vino Blanco', 'Vino Blanco',
   'Blanco fresco, por copa o botella.',
   'Chilled white, by the glass or bottle.',
   'Branco gelado, por taça ou garrafa.',
   null, null, 'copa_botella', true, '{}', 3),

  ((select id from public.categories where slug='bebidas'), 'cerveza-rubia',
   'Cerveza Rubia', 'Cerveza Rubia', 'Cerveza Rubia',
   'Rubia bien fría, en porrón o lata.',
   'Ice-cold lager, bottle or can.',
   'Loura bem gelada, garrafa ou lata.',
   null, null, 'single', true, '{}', 4),

  ((select id from public.categories where slug='bebidas'), 'cerveza-tirada',
   'Cerveza Tirada', 'Cerveza Tirada', 'Cerveza Tirada',
   'Pinta tirada del día.',
   'Draft pint of the day.',
   'Chope do dia.',
   null, null, 'single', true, '{}', 5),

  ((select id from public.categories where slug='bebidas'), 'ipa-artesanal',
   'IPA Artesanal', 'IPA Artesanal', 'IPA Artesanal',
   'Cerveza artesanal IPA, con lúpulo bien marcado.',
   'Craft IPA, nicely hoppy.',
   'IPA artesanal, bem lupulada.',
   null, null, 'single', true, '{}', 6),

  ((select id from public.categories where slug='bebidas'), 'coca-cola',
   'Coca-Cola', 'Coca-Cola', 'Coca-Cola',
   'Coca-Cola bien fría.',
   'Ice-cold Coca-Cola.',
   'Coca-Cola bem gelada.',
   null, null, 'single', true, '{tacc}', 7),

  ((select id from public.categories where slug='bebidas'), 'coca-cola-sin-azucar',
   'Coca-Cola Sin Azúcar', 'Coca-Cola Sin Azúcar', 'Coca-Cola Sin Azúcar',
   'Coca-Cola sin azúcar.',
   'Coca-Cola Zero / no sugar.',
   'Coca-Cola sem açúcar.',
   null, null, 'single', true, '{tacc}', 8),

  ((select id from public.categories where slug='bebidas'), 'sprite',
   'Sprite', 'Sprite', 'Sprite',
   'Sprite bien fría.',
   'Ice-cold Sprite.',
   'Sprite bem gelada.',
   null, null, 'single', true, '{tacc}', 9),

  ((select id from public.categories where slug='bebidas'), 'fanta',
   'Fanta', 'Fanta', 'Fanta',
   'Fanta bien fría.',
   'Ice-cold Fanta.',
   'Fanta bem gelada.',
   null, null, 'single', true, '{tacc}', 10),

  ((select id from public.categories where slug='bebidas'), 'agua-sin-gas',
   'Agua sin gas', 'Agua sin gas', 'Agua sin gas',
   'Agua mineral sin gas.',
   'Still mineral water.',
   'Água mineral sem gás.',
   null, null, 'single', true, '{veg,tacc}', 11),

  ((select id from public.categories where slug='bebidas'), 'agua-con-gas',
   'Agua con gas', 'Agua con gas', 'Agua con gas',
   'Agua mineral con gas.',
   'Sparkling mineral water.',
   'Água mineral com gás.',
   null, null, 'single', true, '{veg,tacc}', 12),

  ((select id from public.categories where slug='bebidas'), 'limonada-casera',
   'Limonada Casera', 'Limonada Casera', 'Limonada Casera',
   'Limonada casera con menta y jengibre.',
   'Homemade lemonade with mint and ginger.',
   'Limonada caseira com hortelã e gengibre.',
   null, null, 'single', true, '{veg,recom}', 13)
on conflict (slug) do nothing;
