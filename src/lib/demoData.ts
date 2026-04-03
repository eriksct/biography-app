import { Project } from './types';

export const demoProject: Project = {
  id: 'project-1',
  name: 'Mémoires de Jeanne Moreau',
  allThemes: ['Enfance', 'Études', 'Carrière', 'Famille', 'Guerre', 'Voyages'],
  interviews: [
    {
      id: 'interview-1',
      number: 1,
      date: '2024-09-12',
      duration: '1h 23min',
      status: 'processed',
      themes: ['Enfance', 'Famille'],
      notes: 'Premier entretien très riche. Jeanne était très émue en parlant de son enfance. Revenir sur l\'épisode du jardin lors du prochain entretien.',
      issues: [
        'Comprendre l\'influence du père menuisier sur la personnalité de Jeanne',
        'Le rôle de la mère comme pilier familial pendant la guerre',
        'L\'impact de l\'institutrice Mademoiselle Duval sur le goût des lettres',
        'La résilience des enfants face à la guerre',
      ],
      summary: 'Ce premier entretien couvre l\'enfance de Jeanne Moreau à Honfleur, de sa naissance en 1938 à la fin de la guerre. Elle évoque la maison familiale, le métier de son père menuisier, l\'école et l\'institutrice qui lui a transmis le goût des livres, ainsi que la vie quotidienne pendant l\'Occupation.',
      summarySections: [
        {
          title: 'La naissance et la maison d\'Honfleur',
          content: 'Jeanne naît en novembre 1938 à Honfleur, dans une petite maison de pêcheurs aux murs en colombages. Son père plaisante sur le brouillard qui enveloppait l\'estuaire ce jour-là, disant qu\'elle était arrivée « enveloppée de mystère ».',
        },
        {
          title: 'Le père menuisier',
          content: 'Henri Moreau est menuisier avec un atelier au fond du jardin. Homme taiseux, il transmet à sa fille la patience et l\'amour du travail bien fait à travers ses gestes. Jeanne passe des heures à le regarder travailler le bois.',
        },
        {
          title: 'L\'école et la découverte des livres',
          content: 'L\'institutrice Mademoiselle Duval éveille chez Jeanne le goût de la lecture et de l\'écriture. Le prêt du « Grand Meaulnes » à onze ans constitue un moment fondateur.',
        },
        {
          title: 'La guerre au quotidien',
          content: 'Pendant l\'Occupation, les enfants jouent dans les ruines tandis que la mère s\'épuise à nourrir la famille. Malgré les privations, elle trouve le moyen de préparer un gâteau le dimanche.',
        },
      ],
      persons: [
        { id: 'p1', name: 'Jeanne Moreau', relation: 'Narratrice' },
        { id: 'p2', name: 'Henri Moreau', relation: 'Père' },
        { id: 'p3', name: 'Marie-Louise Moreau', relation: 'Mère' },
        { id: 'p4', name: 'Pierre Moreau', relation: 'Frère aîné' },
      ],
      placesDates: [
        { id: 'pd1', label: 'Honfleur, Normandie — 1938-1952' },
        { id: 'pd2', label: 'Ferme des Tilleuls — maison familiale' },
        { id: 'pd3', label: 'École communale d\'Honfleur — 1944-1950' },
      ],
      passages: [
        {
          id: 'pass-1-1',
          timestamp: '00:02:15',
          themeAnnotations: [], themes: ['Enfance'],
          status: 'integre',
          usedInChapter: 'chap-1',
          text: 'Je suis née un matin de novembre 1938, à Honfleur. Ma mère me racontait toujours que ce jour-là, il y avait un brouillard si épais sur l\'estuaire qu\'on ne voyait plus le pont. Mon père disait en riant que j\'étais arrivée « enveloppée de mystère ». C\'était une petite maison de pêcheurs, avec les murs en colombages et un jardin qui descendait presque jusqu\'à la mer.',
        },
        {
          id: 'pass-1-2',
          timestamp: '00:08:42',
          themeAnnotations: [], themes: ['Enfance', 'Famille'],
          status: 'integre',
          usedInChapter: 'chap-1',
          text: 'Mon père était menuisier. Il avait son atelier au fond du jardin, une petite cabane qui sentait le bois frais et la colle. Je passais des heures à le regarder travailler. Il ne parlait pas beaucoup, mon père, mais ses mains racontaient tout. Quand il rabotait une planche, on aurait dit qu\'il caressait quelque chose de vivant. C\'est lui qui m\'a appris la patience, sans jamais prononcer le mot.',
        },
        {
          id: 'pass-1-3',
          timestamp: '00:15:30',
          themeAnnotations: [], themes: ['Enfance'],
          status: 'non-integre',
          text: 'L\'école, c\'était un autre monde. Mademoiselle Duval, notre institutrice, avait cette façon de lire les dictées qui me fascinait. Chaque mot devenait important. C\'est elle qui m\'a donné le goût des livres. Un jour, elle m\'a prêté un exemplaire du « Grand Meaulnes » — j\'avais onze ans. Ce livre a changé ma vie. J\'ai compris qu\'on pouvait mettre le monde entier dans des phrases.',
        },
        {
          id: 'pass-1-4',
          timestamp: '00:28:05',
          themeAnnotations: [], themes: ['Famille', 'Guerre'],
          status: 'non-integre',
          text: 'Pendant la guerre, on avait peur, bien sûr. Mais les enfants, vous savez, ils s\'adaptent à tout. Mon frère Pierre et moi, on jouait dans les ruines de la vieille chapelle comme si c\'était un château fort. Ma mère serrait les dents. Elle faisait la queue pendant des heures pour un peu de beurre, un peu de farine. Mais le dimanche, elle trouvait toujours le moyen de faire un gâteau. Je ne sais pas comment elle faisait.',
        },
        {
          id: 'pass-1-5',
          timestamp: '00:42:18',
          themeAnnotations: [], themes: ['Enfance', 'Famille'],
          status: 'non-integre',
          text: 'Le jardin de la maison, c\'était le territoire de ma mère. Elle y cultivait des roses, des dahlias, des légumes aussi. Elle parlait à ses plantes, je vous assure. Et quand le vent soufflait de la mer, tout le jardin sentait le sel et la lavande mélangés. C\'est une odeur que je n\'ai jamais retrouvée nulle part ailleurs.',
        },
      ],
    },
    {
      id: 'interview-2',
      number: 2,
      date: '2024-09-26',
      duration: '1h 05min',
      status: 'transcribed',
      themes: ['Études', 'Carrière'],
      notes: 'Jeanne parle avec beaucoup de fierté de ses années d\'études. Le passage sur l\'arrivée à Paris est très fort visuellement.',
      issues: [
        'Le choc culturel entre la Normandie rurale et Paris',
        'L\'importance de la chambre à soi (lien avec Virginia Woolf)',
        'Le rôle du professeur Langlois comme mentor',
        'L\'amitié durable avec Françoise Delorme',
      ],
      summary: 'Deuxième entretien centré sur les années d\'études de Jeanne à Paris. Elle raconte son arrivée à la gare Saint-Lazare, sa chambre de bonne rue Mouffetard, la Sorbonne et ses amitiés fondatrices.',
      summarySections: [
        {
          title: 'L\'arrivée à Paris',
          content: 'En septembre 1956, Jeanne arrive à Paris avec une valise en carton fabriquée par son père. Le choc de la grande ville après le calme d\'Honfleur est considérable.',
        },
        {
          title: 'La vie d\'étudiante',
          content: 'Sa chambre de bonne de huit mètres carrés rue Mouffetard devient son premier espace à elle. Malgré le froid hivernal, elle y trouve le bonheur de l\'indépendance.',
        },
        {
          title: 'La vocation enseignante',
          content: 'Le professeur Langlois, par une simple phrase d\'encouragement après un cours sur Chrétien de Troyes, oriente toute la carrière de Jeanne vers l\'enseignement.',
        },
      ],
      persons: [
        { id: 'p5', name: 'Professeur Langlois', relation: 'Professeur de lettres à la Sorbonne' },
        { id: 'p6', name: 'Françoise Delorme', relation: 'Amie d\'université' },
        { id: 'p7', name: 'Robert Moreau', relation: 'Futur époux' },
      ],
      placesDates: [
        { id: 'pd4', label: 'Paris, Quartier Latin — 1956-1960' },
        { id: 'pd5', label: 'Sorbonne — Licence de lettres' },
        { id: 'pd6', label: 'Chambre de bonne, rue Mouffetard' },
      ],
      passages: [
        {
          id: 'pass-2-1',
          timestamp: '00:01:30',
          themeAnnotations: [], themes: ['Études'],
          status: 'non-integre',
          text: 'Quand je suis arrivée à Paris en septembre 1956, j\'avais dix-huit ans et une valise en carton. Littéralement, une valise en carton — mon père l\'avait fabriquée. La gare Saint-Lazare m\'a semblé immense, effrayante. Tous ces gens qui couraient, ce bruit. Moi qui venais d\'un village où l\'on entendait les mouettes... Je me suis assise sur un banc et j\'ai pleuré. Et puis je me suis levée, j\'ai pris le métro, et ma vie a commencé.',
        },
        {
          id: 'pass-2-2',
          timestamp: '00:12:45',
          themeAnnotations: [], themes: ['Études'],
          status: 'non-integre',
          text: 'Ma chambre de bonne, rue Mouffetard, faisait huit mètres carrés. Il y avait un lit, une table, une chaise, et des livres partout. Par la lucarne, je voyais les toits de Paris. L\'hiver, il faisait si froid que l\'encre gelait dans l\'encrier. Mais j\'étais heureuse. Pour la première fois de ma vie, j\'avais une chambre à moi. Virginia Woolf aurait compris.',
        },
        {
          id: 'pass-2-3',
          timestamp: '00:25:10',
          themeAnnotations: [], themes: ['Études', 'Carrière'],
          status: 'non-integre',
          text: 'Le professeur Langlois m\'a ouvert les yeux sur la littérature médiévale. Il avait cette passion communicative. Un jour, après un cours sur Chrétien de Troyes, il m\'a dit : « Mademoiselle Moreau, vous avez l\'oreille. Vous devriez enseigner. » C\'est la première fois que quelqu\'un me disait que j\'étais capable de quelque chose. Cette phrase a décidé de toute ma carrière.',
        },
        {
          id: 'pass-2-4',
          timestamp: '00:38:00',
          themeAnnotations: [], themes: ['Études'],
          status: 'non-integre',
          text: 'Avec Françoise, on partageait tout : les cours, les cafés au Procope, les discussions sans fin sur Sartre et Beauvoir. Elle voulait devenir journaliste, moi enseignante. On se retrouvait le samedi au jardin du Luxembourg avec nos livres. Cinquante ans plus tard, on se téléphone encore chaque dimanche.',
        },
      ],
    },
    {
      id: 'interview-3',
      number: 3,
      date: '2024-10-10',
      duration: '58min',
      status: 'transcribed',
      themes: ['Carrière', 'Famille'],
      notes: 'Entretien plus court, Jeanne était fatiguée. Mais le passage sur sa première classe est magnifique. Prévoir un entretien sur la retraite.',
      persons: [
        { id: 'p8', name: 'Robert Moreau', relation: 'Époux' },
        { id: 'p9', name: 'Catherine Moreau', relation: 'Fille aînée' },
        { id: 'p10', name: 'Marc Moreau', relation: 'Fils' },
      ],
      placesDates: [
        { id: 'pd7', label: 'Lycée Victor Hugo, Rouen — 1962-1995' },
        { id: 'pd8', label: 'Rouen — installation en 1962' },
      ],
      passages: [
        {
          id: 'pass-3-1',
          timestamp: '00:03:00',
          themeAnnotations: [], themes: ['Carrière'],
          status: 'non-integre',
          text: 'Mon premier jour de classe, en septembre 1962, je m\'en souviens comme si c\'était hier. J\'avais vingt-quatre ans, j\'étais terrifiée. Trente-cinq élèves de troisième qui me regardaient, et moi avec mon tailleur neuf qui me grattait. J\'ai ouvert mon cahier, j\'ai commencé à parler de Molière, et au bout de cinq minutes, j\'avais oublié ma peur. Les mots m\'ont sauvée, comme toujours.',
        },
        {
          id: 'pass-3-2',
          timestamp: '00:15:22',
          themeAnnotations: [], themes: ['Carrière', 'Famille'],
          status: 'non-integre',
          text: 'Robert et moi, on s\'est mariés en juin 1963, à la mairie de Rouen. Un mariage simple, quelques amis, la famille. Ma mère avait fait le voyage depuis Honfleur — elle portait son chapeau des grands jours, un chapeau bleu marine avec une petite voilette. Mon père avait fabriqué un coffret en bois pour nos alliances. Il était si fier.',
        },
        {
          id: 'pass-3-3',
          timestamp: '00:30:45',
          themeAnnotations: [], themes: ['Famille'],
          status: 'non-integre',
          text: 'Catherine est née en 1965, Marc en 1968. Être mère et enseignante, c\'était un exercice d\'équilibriste permanent. Robert m\'aidait beaucoup — il était en avance sur son époque, pour ça. Le soir, on corrigeait les copies ensemble à la table de la cuisine, pendant que les enfants dormaient. C\'était notre rituel.',
        },
      ],
    },
  ],
  chapters: [
    {
      id: 'chap-1',
      title: 'Chapitre 1 — Les brumes d\'Honfleur',
      content: 'Honfleur, novembre 1938. Le brouillard enveloppait l\'estuaire de la Seine comme un châle de laine grise. Dans une petite maison de pêcheurs aux murs de colombages, une enfant venait de naître.\n\nJe suis née un matin de novembre 1938, à Honfleur. Ma mère me racontait toujours que ce jour-là, il y avait un brouillard si épais sur l\'estuaire qu\'on ne voyait plus le pont. Mon père disait en riant que j\'étais arrivée « enveloppée de mystère ». C\'était une petite maison de pêcheurs, avec les murs en colombages et un jardin qui descendait presque jusqu\'à la mer.\n\nHenri Moreau, son père, était un homme de peu de mots mais de beaucoup de gestes. Dans son atelier au fond du jardin, il façonnait le bois avec une tendresse qui ne le quittait jamais.\n\nMon père était menuisier. Il avait son atelier au fond du jardin, une petite cabane qui sentait le bois frais et la colle. Je passais des heures à le regarder travailler. Il ne parlait pas beaucoup, mon père, mais ses mains racontaient tout. Quand il rabotait une planche, on aurait dit qu\'il caressait quelque chose de vivant. C\'est lui qui m\'a appris la patience, sans jamais prononcer le mot.',
      blocks: [
        {
          id: 'block-1',
          type: 'text',
          content: 'Honfleur, novembre 1938. Le brouillard enveloppait l\'estuaire de la Seine comme un châle de laine grise. Dans une petite maison de pêcheurs aux murs de colombages, une enfant venait de naître.',
        },
        {
          id: 'block-2',
          type: 'passage',
          content: 'Je suis née un matin de novembre 1938, à Honfleur. Ma mère me racontait toujours que ce jour-là, il y avait un brouillard si épais sur l\'estuaire qu\'on ne voyait plus le pont. Mon père disait en riant que j\'étais arrivée « enveloppée de mystère ». C\'était une petite maison de pêcheurs, avec les murs en colombages et un jardin qui descendait presque jusqu\'à la mer.',
          passageId: 'pass-1-1',
          interviewId: 'interview-1',
          interviewNumber: 1,
        },
        {
          id: 'block-3',
          type: 'text',
          content: 'Henri Moreau, son père, était un homme de peu de mots mais de beaucoup de gestes. Dans son atelier au fond du jardin, il façonnait le bois avec une tendresse qui ne le quittait jamais.',
        },
        {
          id: 'block-4',
          type: 'passage',
          content: 'Mon père était menuisier. Il avait son atelier au fond du jardin, une petite cabane qui sentait le bois frais et la colle. Je passais des heures à le regarder travailler. Il ne parlait pas beaucoup, mon père, mais ses mains racontaient tout. Quand il rabotait une planche, on aurait dit qu\'il caressait quelque chose de vivant. C\'est lui qui m\'a appris la patience, sans jamais prononcer le mot.',
          passageId: 'pass-1-2',
          interviewId: 'interview-1',
          interviewNumber: 1,
        },
      ],
    },
    {
      id: 'chap-2',
      title: 'Chapitre 2 — Paris, enfin',
      content: 'En septembre 1956, Jeanne Moreau quittait la Normandie pour la première fois. Paris l\'attendait, immense et indifférente, avec ses promesses et ses solitudes.',
      blocks: [
        {
          id: 'block-5',
          type: 'text',
          content: 'En septembre 1956, Jeanne Moreau quittait la Normandie pour la première fois. Paris l\'attendait, immense et indifférente, avec ses promesses et ses solitudes.',
        },
      ],
    },
  ],
};
