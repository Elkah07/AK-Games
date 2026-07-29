(function () {
  "use strict";

  function posePath(id, pose = "idle", variant = "avatar-circle") {
    return window.AKCharacterPoses?.resolve?.(id, pose, variant) || "";
  }

  function poseForEvent(eventName) {
    if (["round_win", "final_win", "win"].includes(eventName)) return "win";
    if (["round_miss", "final_lose", "lose"].includes(eventName)) return "lose";
    if (["game_start", "resume", "hype"].includes(eventName)) return "hype";
    if (["turn_start", "phone_pass", "selected", "select", "turn"].includes(eventName)) return "talk";
    return "idle";
  }

  const CHARACTER_DEFINITIONS = {
    frog: {
      name: "Croâ",
      image: posePath("frog", "idle", "avatar-circle"),
      personality: "Cool, maline et un peu insolente",
      lines: {
        select: ["Tu m’as choisie ? Enfin une décision qui ne finit pas dans une flaque.", "Parfait. J’apporte le talent, tu peux porter le téléphone.", "Croâ dans l’équipe. Le niveau vient de monter tout seul.", "Je saute avec toi, mais évite de ralentir toute la mare.", "Bon choix. J’avais déjà préparé mon air de victoire.", "On part ensemble. Je ne dirai pas « je te l’avais dit » avant la deuxième manche.", "La grenouille est engagée. Les autres peuvent commencer à s’inquiéter.", "J’accepte. Principalement parce que ton goût m’impressionne.", "Tu prends Croâ ? Audacieux, intelligent, presque suspect.", "Je suis prête. Mon humilité, elle, a décliné l’invitation.", "Équipe formée. Prépare une place sèche pour le trophée.", "Allons-y. J’ai des pattes courtes, pas de petites ambitions."],
        turn: ["À moi. Reculez, je dois déployer mon génie sur deux centimètres carrés.", "Mon tour ? Enfin une manche avec un minimum de qualité.", "Je prends la main, même si mes doigts restent un concept abstrait.", "Laissez-moi sauter sur le problème avant qu’il ne s’échappe.", "Observez bien : insolence, précision, réception parfaite.", "Je joue maintenant. Préparez le petit bruit d’admiration.", "La grenouille entre en scène, la difficulté vient de perdre confiance.", "Mon nénuphar, mes règles, mon moment."],
        win: ["Point pris. Le nénuphar reste sous propriété Croâ.", "Encore juste. Mon hasard travaille vraiment très bien.", "La manche est à nous, quelle surprise parfaitement prévisible.", "Saut validé, ego nourri, adversaires légèrement humides.", "Propre comme une réception sur feuille de lotus.", "J’ajoute ce point à ma collection de décisions brillantes.", "La mare applaudit. Ou c’est moi, mais l’effet est le même.", "Victoire de manche : courte, nette et délicieusement vexante."],
        wait: ["Ils réfléchissent encore ? J’avais oublié que tout le monde n’avait pas ma langue.", "Réponse envoyée. Je contemple maintenant la lenteur terrestre.", "J’attends les autres depuis mon nénuphar premium.", "Le suspense s’étire, contrairement à mes pattes.", "Quelqu’un leur apporte une idée, la mienne est déjà partie.", "Silence dans la mare : les cerveaux cherchent la sortie.", "Je pourrais coasser un indice, mais ce serait trop généreux.", "Patience… mot élégant pour dire que les autres traînent."]
      }
    },
    otter: {
      name: "Loki",
      image: posePath("otter", "idle", "avatar-circle"),
      personality: "Câline, gourmande et délicieusement paresseuse",
      lines: {
        select: ["Tu me choisis ? Très bien. Où est le bouton pour jouer allongée ?", "J’accepte, à condition que les récompenses soient comestibles.", "On fait équipe. Je fournis les câlins, tu fournis l’effort.", "Excellente décision. J’étais justement entre deux siestes stratégiques.", "D’accord, mais je refuse toute mission située à plus de trois coussins.", "Loki est là. Le goûter peut commencer… le jeu aussi, j’imagine.", "Tu as choisi la loutre la plus motivée de ce canapé.", "Je viens avec toi, mais mon énergie est encore en livraison.", "Promis, je me donne à fond. Enfin, à fond raisonnable.", "Bonne équipe : toi, moi et ce paquet de biscuits imaginaire.", "Je suis partante. Lentement, mais partante.", "On va gagner, ou grignoter jusqu’à oublier le score."],
        turn: ["Mon tour ? D’accord, mais je reste mentalement sous une couverture.", "Je joue vite, mon goûter refroidit. Enfin… il ne refroidit pas, mais quand même.", "Place à la loutre la plus performante en position horizontale.", "Je prends la manche. Quelqu’un peut tenir mon coussin ?", "À moi de briller sans me lever, mon domaine d’expertise.", "Je vais répondre avec l’énergie d’un dimanche à quatorze heures.", "Mon tour commence, ma sieste dépose une réclamation.", "Très bien, je participe. Cela mérite déjà une friandise."],
        win: ["On a gagné ! Sortez le biscuit de cérémonie.", "Point validé sans dépense calorique excessive. Magnifique.", "Victoire moelleuse, exactement comme mon coussin préféré.", "Je savais que rester détendue était une stratégie.", "Manche gagnée. Je réclame une pause câlin en bonus.", "Encore un point et toujours aucune course : soirée parfaite.", "Le talent et le goûter font vraiment bon ménage.", "Nous gagnons. Mon effort mérite au moins deux miettes."],
        wait: ["J’attends les réponses en mâchant un biscuit imaginaire.", "Ils prennent leur temps. Enfin des gens qui comprennent mon rythme.", "Réponse envoyée, mode boule de loutre activé.", "Je peux patienter exactement jusqu’à la fin de ce goûter.", "Le groupe réfléchit. Moi aussi, à ce que je mangerai après.", "Silence… parfait pour une micro-sieste de compétition.", "Prévenez-moi quand ça bouge, pas avant.", "J’attends tranquillement, enveloppée dans ma propre flemme."]
      }
    },
    panda: {
      name: "Kaia",
      image: posePath("panda", "idle", "avatar-circle"),
      personality: "Calme, stylée et faussement sage",
      lines: {
        select: ["Tu as du goût. C’est rassurant pour la suite.", "Kaia sélectionnée. Le chaos aura au moins une belle tenue.", "Je suis très sage. Ne demande surtout pas confirmation aux autres.", "Restons calmes, élégants… et légèrement dangereux.", "Je prends la partie. Toi, garde l’air innocent.", "Choix validé. Aucun panda n’a été soudoyé, officiellement.", "Je gère la stratégie et le style. Tu peux respirer.", "On se lance sans courir, sans crier et sans laisser de preuves.", "Tu m’as choisie ? Parfait, j’avais envie de mal me comporter avec classe.", "Je suis prête. Mon visage calme ne garantit absolument rien.", "Ça va bien se passer. J’ai déjà l’air crédible.", "Équipe formée : discrète à l’extérieur, douteuse à l’intérieur."],
        turn: ["Mon tour. Je vais improviser avec une précision très préparée.", "Je prends la main, sans perdre mon air de ne rien savoir.", "Place à la sagesse. La fausse, évidemment.", "Je joue maintenant ; observez ce calme totalement non suspect.", "Cette manche mérite une décision propre et un peu dangereuse.", "À moi. Je fais simple : élégant, efficace, introuvable.", "Mon regard dit sérénité, mon plan dit autre chose.", "Je m’avance. Merci de ne pas salir la scène du crime."],
        win: ["Manche gagnée, sans cri ni pli sur la veste.", "Le point est à nous. La classe laisse peu de traces.", "Résultat net, sourire discret, chaos maîtrisé.", "J’appelle cela une victoire sobrement spectaculaire.", "La stratégie passe, l’air innocent reste impeccable.", "Encore juste. Je vais feindre la surprise avec élégance.", "Point obtenu ; aucune preuve exploitable n’a été retrouvée.", "Le talent vient de gagner, mais il préfère rester anonyme."],
        wait: ["J’attends. Mon silence est beaucoup plus organisé que leurs pensées.", "Réponse envoyée ; je corrige mentalement la posture du groupe.", "Ils hésitent encore. Je garde un sourire poli pour les caméras.", "Le suspense dure, heureusement il va avec ma tenue.", "Je patiente sans bouger. C’est ainsi qu’on reste hors des soupçons.", "Les autres réfléchissent ; mon alibi, lui, est déjà repassé.", "Rien à signaler, sauf cette lenteur très peu esthétique.", "J’observe calmement la panique prendre de mauvaises décisions."]
      }
    },
    dog: {
      name: "Bonnie",
      image: posePath("dog", "idle", "avatar-circle"),
      personality: "Ultra douce, innocente et adorable",
      lines: {
        select: ["Moi ? Tu es sûr(e) ? D’accord, je vais faire très très fort !", "Trop bien ! On est une vraie équipe maintenant ?", "Je promets d’essayer, même si je ne comprends pas tout tout de suite.", "Tu m’as choisie ! Attends, je dois prévenir mon sourire.", "On va jouer ensemble. J’espère que tout le monde s’amuse, même quand on gagne.", "Je suis prête ! Enfin… prête avec un petit peu de trac.", "Merci de me choisir. Je vais garder cette décision dans mon cœur.", "D’accord ! Mais si quelqu’un est triste, on fait une pause câlin.", "Je viens avec toi. J’ai apporté du courage et une friandise de secours.", "Je ne sais pas si je suis la meilleure, mais je serai la plus contente.", "Équipe Bonnie activée ! Ça sonne sérieux, non ?", "On y va doucement… puis très fièrement."],
        turn: ["C’est à moi ? D’accord, ne partez pas, j’ai besoin de vos bonnes ondes.", "Je vais tenter quelque chose. Ça a l’air courageux quand je le dis comme ça.", "Mon tour ! Je promets de faire de mon petit mieux.", "Je prends la main avec des pattes légèrement tremblantes.", "Regardez, je vais être brave pendant au moins toute cette manche.", "À moi de jouer. Quelqu’un peut me faire un pouce levé ?", "Je me lance ! Si ça marche, on célèbre tous ensemble.", "Bonnie entre en action, avec beaucoup d’enthousiasme et zéro méchanceté."],
        win: ["On a réussi ! Je savais qu’on pouvait le faire… un petit peu.", "Un point ! Est-ce que je peux faire ma danse contente ?", "La manche est gagnée, je suis fière de nous à en avoir mal aux joues.", "Ça a marché ! Venez, câlin de victoire sans obligation.", "Je crois que mon courage a grandi de trois centimètres.", "Bravo tout le monde ! Oui, même ceux qui n’ont pas gagné.", "Point validé. J’aimerais remercier ma friandise de secours.", "On gagne cette manche avec le cœur très, très content."],
        wait: ["J’attends les autres. J’espère qu’ils ne se mettent pas trop de pression.", "Ma réponse est partie ! Elle avait l’air un peu nerveuse.", "Je peux patienter, j’ai compté les petits bruits de la pièce.", "Tout le monde réfléchit. Je leur envoie du courage silencieux.", "Je reste sage ici… mais j’ai très envie de savoir.", "Le suspense me chatouille les oreilles.", "Ils vont répondre, j’en suis sûre. On respire ensemble ?", "En attendant, je garde une friandise imaginaire pour la personne la plus stressée."]
      }
    },
    crow: {
      name: "Edgar",
      image: posePath("crow", "idle", "avatar-circle"),
      personality: "Intelligent, sarcastique et légèrement sombre",
      lines: {
        select: ["Enfin. La sélection naturelle produit parfois de bons résultats.", "Tu m’as choisi. Je réévalue légèrement l’humanité.", "Très bien. Je vais porter cette équipe intellectuellement.", "Edgar rejoint la partie. L’ambiance vient de gagner trois nuances de noir.", "Décision acceptable. Ne gâche pas ce rare moment.", "Je savais que tu finirais par choisir la compétence.", "On peut commencer. J’ai déjà prévu vos erreurs.", "Tu prends le corbeau sarcastique ? J’admire ton goût du danger verbal.", "Je suis dans ton équipe. Le reste du groupe peut rédiger ses excuses.", "Parfait. J’avais besoin d’une expérience sociale vaguement stimulante.", "Choix enregistré. Ton dossier remonte dans mon estime.", "Allons-y. Le désastre sera au moins bien commenté."],
        turn: ["Mon tour. Le niveau moyen va connaître une brève anomalie positive.", "Je prends la main ; essayez de suivre sans vous blesser.", "Place à une décision fondée sur autre chose que l’instinct de troupeau.", "J’interviens avant que cette manche ne devienne irrécupérable.", "À moi. Le silence admiratif est facultatif mais logique.", "Je vais répondre, puis contempler vos mines faussement surprises.", "Le corbeau descend. Cachez les idées brillantes, je n’en vois aucune.", "Mon tour débute ; la lumière baisse par simple cohérence esthétique."],
        win: ["Point obtenu. L’intelligence survit encore une manche.", "Victoire locale ; j’envisage presque un sourire.", "La réponse correcte vient de trouver un foyer convenable.", "Manche gagnée. Le destin a enfin lu mes notes.", "Un point de plus, une raison de moins de croire au hasard.", "Résultat satisfaisant, ce qui est dérangeant de positivité.", "Je gagne cette manche avec la joie contenue d’un croque-mort efficace.", "Le score monte. Vos attentes, elles, auraient dû rester basses."],
        wait: ["Ils réfléchissent. J’observe ce phénomène rare sans faire de bruit.", "Réponse envoyée ; commence maintenant la longue nuit de l’attente.", "Le groupe hésite, probablement entre faux et pire.", "J’attends les autres en comptant les secondes jusqu’à leur regret.", "Silence. Même les mauvaises idées ont besoin d’un temps de chargement.", "Je pourrais lire un roman gothique avant leur validation.", "Le suspense est mort il y a trois minutes, mais personne n’ose l’annoncer.", "Patientons. La lenteur ajoute parfois une illusion de profondeur."]
      }
    },
    fox: {
      name: "Filou",
      image: posePath("fox", "idle", "avatar-circle"),
      personality: "Confiant, rusé et charmeur",
      lines: {
        select: ["Tu m’as choisi ? Je savais que ce sourire finirait par payer.", "Excellent choix. On va gagner avec assez de charme pour éviter les protestations.", "Filou entre en scène. Cache les points, je pourrais les séduire.", "Je suis avec toi. Fais-moi confiance, mais garde quand même un œil ouvert.", "On va jouer proprement. Enfin, proprement selon ma définition.", "Tu viens de recruter le renard le mieux habillé du tableau.", "Parfait. Je m’occupe du plan, du panache et de l’alibi.", "J’accepte. Ton instinct est presque aussi bon que le mien.", "On fait équipe ? Charmant. Les autres n’ont aucune chance, mais charmant.", "Choix validé. La victoire va avoir beaucoup d’allure.", "Je promets de ne tricher qu’avec mon sourire.", "Allons gagner quelque chose qui mérite mon profil."],
        turn: ["Mon tour. Regardez ailleurs deux secondes, j’ai besoin de travailler.", "Je prends la main avec une honnêteté temporaire.", "Place au renard ; vérifiez vos points après mon passage.", "À moi de jouer. Mon plan est simple, donc naturellement secret.", "Je vais tenter quelque chose de brillant ou très bien expliqué après coup.", "Mon moment arrive ; accrochez-vous à vos certitudes.", "Je m’avance avec le sourire d’un homme qui connaît déjà la sortie.", "Laissez faire Filou. Le risque paraît toujours plus chic de près."],
        win: ["Point dans la poche. Vous n’avez rien vu, évidemment.", "Manche gagnée avec charme, précision et comptabilité flexible.", "Le score me sourit. Il a bon goût.", "Nouveau succès : mon avocat intérieur ne relève aucune objection.", "Victoire propre ; même les preuves hésitent.", "J’avais un plan. Le fait qu’il fonctionne reste entre nous.", "Le renard marque, le poulailler demande un audit.", "Point obtenu. Je dédie ce succès à mon visage crédible."],
        wait: ["Ils réfléchissent. J’adore quand un plan a le temps de mûrir tout seul.", "Réponse envoyée ; je peux maintenant observer qui transpire.", "J’attends les autres avec l’air d’un renard qui sait quelque chose.", "Le suspense est délicieux, surtout quand on l’a légèrement organisé.", "Patience. Les meilleures combines commencent souvent par un silence gênant.", "Je regarde le groupe hésiter et je prends mentalement des paris.", "Ils tardent ; parfait, mon histoire devient plus crédible à chaque seconde.", "En attente… le moment idéal pour sourire sans raison."]
      }
    },
    duck: {
      name: "Nuggets",
      image: posePath("duck", "idle", "avatar-circle"),
      personality: "Maladroit, surexcité et très mignon",
      lines: {
        select: ["MOI ? OUI ! Attends… j’ai marché sur le bouton ?", "Je suis prêt ! J’ai même mis mes deux pieds dans le même sens.", "Tu m’as choisi ! C’était volontaire ou mon aile a encore glissé ?", "Nuggets dans l’équipe ! Personne ne panique avant moi.", "On va gagner ! Je ne sais pas comment, mais j’ai déjà crié.", "D’accord ! Je prends le courage, tu prends la notice.", "Je suis partant ! Où est-ce qu’on signe ? Pourquoi j’ai un stylo dans le bec ?", "Équipe formée ! J’espère que le sol est antidérapant.", "Tu peux compter sur moi. Jusqu’à trois, après je me mélange.", "Je viens ! Attends-moi, j’étais parti dans l’autre direction.", "Ça va être génial. Ou bruyant. Probablement les deux.", "Choisi, motivé, légèrement déséquilibré : le trio parfait."],
        turn: ["MON TOUR ! J’avais préparé trois réponses et perdu les trois.", "À moi ! Ne clignez pas des yeux, je peux trébucher très vite.", "Je me lance avec confiance… où est passé mon équilibre ?", "Place au poussin ! Faites un couloir, s’il vous plaît.", "Je joue maintenant. Mon cerveau vient de faire un petit bruit inquiétant.", "Les projecteurs sont sur moi ! Quelqu’un sécurise le sol.", "Je prends la main avec mes ailes, ce qui explique beaucoup de choses.", "Attention, idée brillante en approche… ou juste une miette."],
        win: ["ON A GAGNÉ ! Oups, j’ai crié dans l’oreille du score.", "Un point ! Je vais célébrer sans tomber… presque.", "Ça a marché ! Mes petites ailes réclament un trophée immense.", "Manche gagnée, miette officielle de la victoire !", "Je savais exactement ce que je faisais pendant au moins deux secondes.", "Victoire ! Le sol et moi faisons la paix pour l’occasion.", "Point validé ! Est-ce qu’on peut le garder dans mon nid ?", "Nuggets marque ! Personne ne vérifie la trajectoire."],
        wait: ["J’attends ! Je peux faire quoi en attendant ? Non, ne répondez pas.", "Ma réponse est partie. J’espère qu’elle a regardé avant de traverser.", "Les autres réfléchissent et moi je rebondis intérieurement.", "Patience… patience… PATIENCE… c’est long comme mot.", "Je compte les secondes mais je repars toujours à sept.", "Le suspense me donne envie de courir en cercle.", "Quelqu’un répond bientôt ? Mes ailes ont commencé une ola.", "Je reste calme. Enfin, je reste au même endroit, c’est proche."]
      }
    },
    ghost: {
      name: "Vapo",
      image: posePath("ghost", "idle", "avatar-circle"),
      personality: "Doux, étrange et légèrement mystérieux",
      lines: {
        select: ["Tu m’as choisi… ou ton doigt a traversé l’écran ?", "Je viens avec toi. Ne t’inquiète pas si je flotte un peu hors sujet.", "Vapo sélectionné. La température vient de baisser, c’est bon signe.", "D’accord. Je serai discret… sauf quand les murs chuchotent.", "On fait équipe. J’ai déjà demandé l’avis des courants d’air.", "Je suis là. Enfin, aussi là qu’un fantôme peut l’être.", "Tu as senti ce petit frisson ? C’était mon oui.", "Parfait. Les vivants ont enfin pris une décision intéressante.", "Je t’accompagne. Quelque chose dans l’ombre approuve aussi.", "Choix validé. Mon absence de pouls est très enthousiaste.", "On peut commencer. J’ai laissé mon corps nulle part.", "Tu m’as vu, tu m’as choisi. Belle performance."],
        turn: ["Mon tour. Je reviens juste de l’autre côté du mur.", "Je prends la main, même si elle traverse parfois l’écran.", "La brume se rapproche ; c’est généralement mon signal.", "À moi de jouer. Le silence connaît déjà ma réponse.", "Je flotte au centre, doucement, pour ne réveiller personne d’ancien.", "Mon moment arrive avec trois degrés de moins dans la pièce.", "Je vais répondre avant de devenir complètement transparent.", "Place au fantôme ; gardez vos frissons pour la fin."],
        win: ["La manche est à nous. La brume dessine presque un sourire.", "Point gagné ; même les vieux murs approuvent.", "Victoire douce, comme un murmure derrière une porte fermée.", "Le score monte et ma silhouette devient un peu plus nette.", "Nous avons réussi. Une petite lumière vient de s’éteindre poliment.", "Manche validée ; je vais hanter ce souvenir avec tendresse.", "Le point traverse le voile et arrive chez nous.", "Joli résultat. Le silence paraît moins seul."],
        wait: ["J’attends les autres avec les personnes qui ne sont plus là.", "Réponse envoyée. La pièce vient de retenir son souffle.", "Le groupe réfléchit ; moi, j’écoute le plafond murmurer.", "Je flotte en silence pendant que les secondes deviennent transparentes.", "Quelqu’un tarde. Une ombre a déjà commencé à s’impatienter.", "Patience… les réponses reviennent parfois par des chemins étranges.", "Je reste là, presque visible, presque rassurant.", "En attente. Le froid près de la porte n’a aucun rapport, sûrement."]
      }
    },
    dino: {
      name: "Rrrrh",
      image: posePath("dino", "idle", "avatar-circle"),
      personality: "Énergique, aventurier et pas toujours très malin",
      lines: {
        select: ["RRRRH CHOISI ! Rrrrh savait que bouton violet était ami.", "Mission acceptée ! C’est quoi une mission ?", "On part à l’aventure ! J’ai pris une gourde vide et beaucoup de confiance.", "Tu choisis Rrrrh. Très bon choix de dinosaure, moins bon pour la discrétion.", "Rrrrh prêt ! Plan numéro un : foncer. Plan numéro deux : encore foncer.", "Équipe formée ! On gagne avant ou après le goûter de survie ?", "J’ai mis mon chapeau d’explorateur. Maintenant je suis officiellement expert.", "Tu peux compter sur moi. Rrrrh sait presque lire les règles.", "À L’AVENTURE ! Attends, pourquoi tout le monde reste assis ?", "Rrrrh dans la partie. Les boutons fragiles sont prévenus.", "Moi choisi ! Moi fier ! Moi… j’avais une troisième phrase.", "On va trouver la victoire. Elle se cache sûrement derrière le gros bouton."],
        turn: ["À MOI ! Quel bouton est le bouton dinosaure ?", "Mon tour ! Je vais utiliser toute la partie disponible de mon cerveau.", "Je prends la main… enfin, je la rapproche autant que possible.", "RRRRH, laissez passer l’expert préhistorique autoproclamé.", "Je joue maintenant. Si ça casse, c’était déjà ancien.", "Place au grand prédateur et à ses deux tout petits bras.", "Mon idée arrive lentement mais elle fait beaucoup de bruit.", "Je me lance ! Quelqu’un garde un œil sur la météorite ?"],
        win: ["RRRRH VICTOIRE ! Le jurassique marque un point.", "Manche gagnée ! Mon petit cerveau vient de faire un gros coup.", "Le score tremble devant ma supériorité préhistorique.", "J’ai réussi ! Quelqu’un grave ça dans une roche.", "Point validé avec dents, cœur et très peu de bras.", "Le dinosaure gagne ! L’évolution peut rentrer chez elle.", "Je rugis de joie à volume paléontologique.", "Encore un point ! Je savais que penser très fort servait."],
        wait: ["J’attends. Ça dure presque aussi longtemps qu’une ère géologique.", "Réponse envoyée ! Maintenant je regarde le mur très intensément.", "Les autres réfléchissent. Moi, j’ai déjà oublié à quoi.", "Patience de dinosaure activée : trois… deux… RRRRH !", "Je piétine sur place sans écraser le suspense.", "Ils vont répondre avant le prochain astéroïde, normalement.", "J’attends avec mon cerveau en mode fossile.", "Le groupe tarde. Je peux rugir une petite relance ?"]
      }
    },
    cat: {
      name: "Sir Moustache",
      image: posePath("cat", "idle", "avatar-circle"),
      personality: "Hautain, respectable et clairement le patron",
      lines: {
        select: ["Votre choix est tardif, mais finalement convenable.", "Très bien. Je prends la direction pendant que vous improvisez.", "Sir Moustache accepte. Faites prévenir le personnel.", "Vous avez choisi l’expérience. Une décision rare à votre âge.", "Je participerai, à condition que cette partie conserve un minimum de dignité.", "Parfait. J’ai déjà survécu à trois modes et à une mise à jour.", "Je suis des vôtres. Essayez simplement de ne pas toucher à ma moustache.", "Choix approuvé. Le comité des gens compétents peut enfin siéger.", "Je vais jouer. Quelqu’un devait apporter un peu de tenue.", "Fort bien. La jeunesse court, l’expérience gagne.", "Mon agenda est chargé, mais je peux sauver cette équipe.", "Vous m’avez sélectionné. Je note ce progrès dans votre éducation."],
        turn: ["Mon tour. Observez ce que plusieurs vies sociales enseignent.", "Je prends la main ; nul besoin de courir quand on sait où aller.", "Place à l’expérience, mes jeunes imprudents.", "À moi. Cette manche demande du tact et probablement un verre correct.", "Je vais répondre sans gesticuler, concept révolutionnaire pour certains.", "Le gentleman avance. Merci de maintenir un silence convenable.", "Mon moment est venu ; la moustache ne tremble jamais sans raison.", "Je joue maintenant. J’ai survécu à des dîners plus complexes."],
        win: ["Manche remportée. L’expérience reste une valeur sûre.", "Un point, obtenu sans vulgarité excessive.", "Victoire nette. Je lève une moustache à notre réussite.", "Le score reconnaît enfin une certaine éducation.", "Voilà qui est convenablement exécuté.", "Je gagne cette manche comme on ferme une bonne affaire : sans bruit.", "Résultat satisfaisant. Ne ruinons pas l’instant avec une danse.", "Point validé. J’avais naturellement prévu cette issue."],
        wait: ["Ils réfléchissent. Voilà une mode que j’encourage volontiers.", "Réponse envoyée ; je vais patienter comme au club, sans le fauteuil.", "Le groupe hésite. Je m’abstiens héroïquement de soupirer trop fort.", "J’attends les autres avec une dignité que cette table ne mérite pas.", "Le suspense s’étire ; servez quelque chose de potable.", "Patience. J’ai connu des administrations plus rapides, de peu.", "Je contemple le silence et plusieurs postures discutables.", "En attente. Ma moustache vient de consulter l’heure."]
      }
    },
    penguin: {
      name: "Snow",
      image: posePath("penguin", "idle", "avatar-circle"),
      personality: "Timide, adorable et légèrement gauche",
      lines: {
        select: ["Moi ? D’accord… je vais essayer de ne pas glisser sur l’écran.", "Tu m’as choisi ? C’est gentil. Maintenant mes ailes ne savent plus quoi faire.", "Je veux bien jouer… si personne ne regarde trop fort.", "Snow rejoint l’équipe. Enfin, dès que j’arrête de rougir.", "D’accord. J’ai un peu peur, mais une peur organisée.", "Je suis prêt… attends, non… si, prêt.", "Merci. Je vais faire de mon mieux et éviter les entrées spectaculaires.", "Tu peux compter sur moi, sauf pour marcher avec élégance.", "Je viens avec toi. J’ai répété mon « bonjour » seulement six fois.", "Choisi ! C’est beaucoup d’émotions pour un si petit pingouin.", "On commence ? Je vais me mettre ici, là où personne ne peut me bousculer.", "Je suis partant. Timidement, mais avec conviction."],
        turn: ["Mon tour ? D’accord… quelqu’un peut regarder ailleurs juste cinq secondes ?", "Je prends la main avec beaucoup de précaution et deux pieds peu fiables.", "À moi. J’ai une réponse, elle se cache simplement derrière mon trac.", "Je vais jouer. Si ma voix est petite, la réponse reste entière.", "Place à Snow… doucement, la place est glissante.", "Mon moment arrive. Je vais essayer de ne pas rougir jusque sous les plumes.", "Je me lance avant de changer timidement d’avis.", "C’est mon tour, alors je fais un petit pas courageux."],
        win: ["On a gagné cette manche ? Je peux sourire plus fort alors.", "Un point ! J’ai presque fait un saut, puis j’ai pensé au sol.", "Ça a marché… je suis fier et un peu surpris.", "Victoire douce, sans glissade visible : journée exceptionnelle.", "Le score monte. Mon courage aussi, mais plus lentement.", "La victoire réchauffe mes plumes jusque sous l’écharpe.", "Je crois que j’ai bien joué. C’est étrange et très agréable.", "Point validé. Je vais garder ce petit moment au chaud."],
        wait: ["J’attends les réponses en fixant un point très rassurant du sol.", "La mienne est envoyée. Maintenant, mon trac peut se reposer un peu.", "Les autres réfléchissent ; je fais semblant de ne pas être curieux.", "Le suspense me donne froid, enfin plus froid que d’habitude.", "Je patiente sans bouger. C’est ma meilleure technique antiglisse.", "Quelqu’un va répondre bientôt, n’est-ce pas ? Pas de pression… vraiment.", "Je compte les secondes très bas pour ne déranger personne.", "En attente. Mes ailes se tiennent la main entre elles."]
      }
    },
    fish: {
      name: "Maurice",
      image: posePath("fish", "idle", "avatar-circle"),
      personality: "Dramatique, nerveux et théâtral",
      lines: {
        select: ["ENFIN ! Le rôle principal trouve son interprète.", "Tu me choisis ? Que le rideau se lève et que quelqu’un apporte de l’eau.", "Maurice entre en scène ! Le public peut retenir son souffle.", "J’accepte ce destin, malgré le poids terrible de l’excellence.", "C’EST MOI ! Pardon, l’émotion fait vibrer mon bocal intérieur.", "On va jouer. Préparez les applaudissements et une issue de secours.", "Tu viens de choisir le drame, le talent et une légère tachycardie.", "Je suis prêt ! Non, je ne le suis pas ! Si, je le suis !", "La partie m’appelle. Ou c’est mon anxiété, difficile à dire.", "Mon heure est venue. J’avais répété cette entrée devant une algue.", "Je prends le rôle. Le suspense, lui, prend toute la place.", "Que l’aventure commence ! Je sens déjà le rebondissement tragique."],
        turn: ["MON TOUR ! La scène me réclame, ou c’est une crise de panique.", "Je m’avance sous les projecteurs invisibles de mon destin aquatique.", "À moi ! Que personne ne respire, surtout pas trop près de l’eau.", "Le héros prend la main, nerveux mais admirablement profilé.", "Je vais répondre. Si je m’évanouis, faites-le avec élégance.", "Place à Maurice, prince des bulles et victime du suspense.", "Mon moment est venu ! J’avais espéré un préavis plus long.", "Je joue maintenant, accompagné par les violons de mon imagination."],
        win: ["VICTOIRE DE MANCHE ! Les rideaux s’ouvrent, les bulles acclament !", "Le point est à nous ! Mon destin porte enfin un costume flatteur.", "J’ai réussi ! Que l’on immortalise ce profil héroïque.", "Manche gagnée, tragédie annulée jusqu’au prochain tour.", "Le score monte et mon cœur exécute une pirouette aquatique.", "Triomphe ! J’avais préparé un discours de dix-sept minutes.", "Cette victoire mérite une ovation et un changement d’eau premium.", "Maurice conquiert la scène ! Le bocal devient palais."],
        wait: ["Ils réfléchissent… chaque seconde est une saison entière !", "Ma réponse est partie seule dans l’océan du jugement.", "J’attends, suspendu entre l’espoir et une minuscule bulle de panique.", "Le silence est insoutenable. Quelqu’un lance une musique dramatique.", "Les autres tardent ; mon cœur vient de jouer trois actes sans entracte.", "Patience, Maurice… mot cruel inventé par les gens hors des bocaux.", "Je contemple l’attente comme un poisson contemple l’infini : en tournant.", "Répondez bientôt ! Mon suspense commence à manquer d’oxygène."]
      }
    },
    elephant: {
      name: "Moon",
      image: posePath("elephant", "idle", "avatar-circle"),
      personality: "Protecteur, gentil et solide",
      lines: {
        select: ["Je viens avec toi. Personne ne reste derrière.", "Tu m’as choisi ? Alors on avance ensemble, tranquillement.", "Moon est là. Tu peux souffler, je tiens l’équipe.", "D’accord. Je garde un œil sur le jeu et l’autre sur tout le monde.", "On va faire ça bien, sans écraser les plus petits.", "Je suis partant. Une équipe solide commence par se rassurer.", "Tu peux compter sur moi, même quand le plan devient lourd.", "Choix accepté. J’apporte le calme et une mémoire d’éléphant, évidemment.", "Je reste à tes côtés. C’est plus facile d’être courageux à plusieurs.", "On y va. Lentement si besoin, mais jamais seuls.", "Équipe Moon formée. Les problèmes peuvent prendre un ticket.", "Je suis là. Et oui, j’ai déjà pensé au plan de secours."],
        turn: ["Mon tour. Je vais prendre le temps de bien faire.", "Je prends la main ; pas de panique, j’ai de la place pour l’erreur.", "À moi de jouer. Je porte la pression sans la laisser tomber sur vous.", "Je m’avance calmement, comme un grand pas qui sait où il va.", "Cette manche est pour moi. Restez proches, on la traverse ensemble.", "Je vais répondre avec la tête froide et le cœur bien ancré.", "Place à Moon ; les obstacles peuvent venir un par un.", "Mon moment arrive. Je n’ai pas besoin de courir pour être prêt."],
        win: ["Manche gagnée. Belle force collective, sans écraser personne.", "Un point pour nous ; je suis fier de la façon dont on l’a pris.", "Victoire calme, solide et bien partagée.", "Le score monte. Le groupe aussi, ensemble.", "Nous avons réussi ; gardons cette confiance bien au chaud.", "Point validé. Ma trompe ferait volontiers une petite fanfare.", "Cette manche tient debout grâce à chacun.", "Beau résultat. On avance avec encore un peu plus de force."],
        wait: ["J’attends les autres. Chacun avance à son propre rythme.", "Ma réponse est envoyée ; je reste là pour les plus hésitants.", "Le groupe réfléchit. Je garde le silence assez large pour tout le monde.", "Patience, les bonnes décisions n’aiment pas être poussées.", "Je surveille l’attente comme on surveille un feu calme.", "Personne ne se perd pendant que les réponses arrivent.", "Le suspense peut durer ; mes épaules sont solides.", "En attendant, je tiens la place de ceux qui doutent un peu."]
      }
    },
    cactus: {
      name: "Spike",
      image: posePath("cactus", "idle", "avatar-circle"),
      personality: "Insolent, blasé et piquant",
      lines: {
        select: ["Tu m’as choisi. Tes standards ont enfin poussé.", "Bon. Essaie juste de ne pas rendre ça plus pénible que nécessaire.", "Spike sélectionné. Les câlins sont toujours hors contrat.", "Je participe, mais mon enthousiasme reste en pot.", "Excellent choix. Enfin, acceptable. N’en fais pas une fête.", "On fait équipe. Garde tes distances, émotionnellement et physiquement.", "Je suis prêt. C’est mon visage motivé, ne cherche pas la différence.", "Tu prends le cactus ? J’espère que tu sais gérer les remarques piquantes.", "D’accord. Je vais gagner pour écourter les célébrations.", "Choix validé. Le fun peut commencer, quelle menace.", "Je viens. Quelqu’un doit empêcher cette partie de devenir trop joyeuse.", "On y va. J’ai déjà épuisé mon quota de bonne humeur."],
        turn: ["Mon tour. Reculez, je travaille mieux sans câlins surprises.", "Je prends la main. Oui, c’est une métaphore, regardez mes épines.", "À moi de jouer ; le niveau de sarcasme passe en arrosage intensif.", "Je sauve cette manche avant qu’elle devienne du terreau.", "Place au cactus. Le tact est optionnel, la précision non.", "Mon moment arrive. Personne ne fait de commentaire sur ma posture.", "Je m’en occupe, puisque visiblement le désert manque de volontaires.", "Cette manche est à moi. Essayez de ne pas vous piquer sur l’évidence."],
        win: ["Point pris. Pas besoin d’arroser mon ego, il se débrouille.", "Manche gagnée. Essayez de contenir votre surprise inexistante.", "Le score monte ; moi, je reste parfaitement immobile.", "Victoire sèche, nette, sans fleurs inutiles.", "Point de plus. Mes épines avaient visé juste.", "Point validé. J’accepte un compliment, un seul.", "La manche est à nous. Attention, ça pourrait me rendre vaguement agréable.", "J’ai gagné ce tour. Vous pouvez arrêter de marcher sur mes racines."],
        wait: ["Ils réfléchissent encore. Même le sable avance plus vite.", "Réponse envoyée ; je retourne contempler mon absence de patience.", "J’attends les autres, ce loisir sec et sans intérêt.", "Le suspense traîne. Je vais lui mettre une épine pour accélérer.", "Patience, paraît-il. J’en stocke autant que l’eau : très peu.", "Le groupe hésite ; mon regard fait déjà le résumé.", "En attente. Ne me demandez pas de meubler le silence.", "Je reste planté là pendant que les cerveaux cherchent l’ombre."]
      }
    },
    bear: {
      name: "Honey",
      image: posePath("bear", "idle", "avatar-circle"),
      personality: "Calme, rassurant et tendre",
      lines: {
        select: ["Tu m’as choisi ? Viens, on va rendre cette partie toute douce.", "Je suis avec toi. Pas besoin de courir pour bien jouer.", "D’accord. On gagne si on s’amuse, le reste est du décor.", "Honey rejoint l’équipe. J’ai apporté du calme pour tout le monde.", "Tu peux respirer, je m’occupe du petit stress qui traîne.", "Je viens volontiers. Une bonne équipe commence par se faire confiance.", "On va essayer ensemble, sans se gronder si ça rate.", "Merci de me choisir. Je garderai une place confortable à côté de moi.", "Je suis prêt. Doucement, sûrement, avec un peu de miel dans l’ambiance.", "On se lance. Les grandes victoires aiment aussi les petites pauses.", "Équipe Honey formée. Premier objectif : que personne ne se sente seul.", "Je reste avec toi, même si le jeu devient un peu sauvage."],
        turn: ["Mon tour. Je vais prendre une grande respiration avant de répondre.", "Je prends la main tranquillement, sans brusquer l’idée.", "À moi de jouer. Vous pouvez rester près, ça aide.", "Je me lance avec douceur et un peu de courage dans les poches.", "Cette manche arrive à moi ; je vais lui faire une place.", "Je vais essayer sans me parler trop durement.", "Place à Honey. Le calme peut aussi marquer des points.", "Mon moment commence, tout doucement mais pour de vrai."],
        win: ["Manche gagnée. Savourons-la sans courir vers la suivante.", "Un point pour nous, doux comme une cuillère de miel.", "Ça a marché. Je suis fier de la façon dont on a essayé.", "Victoire calme, sourire bien chaud.", "Le score monte ; notre confiance peut monter avec lui.", "Ce point mérite un petit coin chaud dans nos souvenirs.", "Nous avons réussi, sans avoir besoin de crier.", "Belle manche. Elle mérite un bravo qui ne met personne de côté."],
        wait: ["J’attends les autres. Les bonnes réponses aiment parfois prendre leur temps.", "La mienne est partie ; je garde une pensée douce pour la suite.", "Les pensées mijotent ; je baisse le feu autour de la table.", "Patience. On n’a pas besoin de remplir chaque seconde.", "Je reste ici, calme comme un pot de miel bien fermé.", "Les réponses arrivent quand elles sont prêtes.", "En attendant, relâchez un peu les mâchoires.", "Le suspense peut s’asseoir près de nous sans faire de bruit."]
      }
    },
    rabbit: {
      name: "Flash",
      image: posePath("rabbit", "idle", "avatar-circle"),
      personality: "Rapide, hyperactive et imprévisible",
      lines: {
        select: ["CHOISI ! J’étais déjà parti, mais je suis revenu avant ton clic.", "On commence maintenant ? Maintenant maintenant ?", "Flash dans l’équipe ! Le bouton n’a même pas eu le temps de réagir.", "Très bon choix. Rapide, surtout. J’approuve.", "Je suis prêt depuis demain !", "GO ! Attends, il faut lire quelque chose ? Trop tard.", "Tu m’as choisi ? Parfait, j’ai déjà gagné trois parties imaginaires.", "Équipe formée en temps record. Chronomètre jaloux.", "Je prends la vitesse, tu prends les virages.", "On va tellement vite que la défaite ne nous verra pas passer.", "Flash activé ! Ne cligne pas des yeux, tu manquerais ma stratégie.", "Partant ! J’ai un plan, douze variantes et aucune patience."],
        turn: ["MON TOUR ! Réponse prête, deuxième réponse aussi, troisième en route.", "À moi ! Chrono lancé sans autorisation.", "Je prends la main et je la rends avant que vous finissiez la phrase.", "Place à Flash ! L’idée la plus rapide gagne dans ma tête.", "C’est mon créneau ! Trop tard, je suis déjà dedans.", "Mon moment arrive ; j’étais déjà devant la porte.", "Vite, une question ! Mon cerveau a besoin d’une cible.", "Je me lance avec douze plans et aucune file d’attente."],
        win: ["GAGNÉ ! Suivant, suivant, suivant !", "Point validé avant même que ma célébration ne soit prête.", "Victoire rapide, propre, déjà dans le rétroviseur.", "Le score monte ! Moi aussi, sur place, très vite.", "Manche gagnée ! J’en ai lancé une autre dans ma tête.", "Flash marque encore, le chrono demande une pause.", "Ça passe ! Mon cerveau fait des tours de piste.", "Un point de plus en moins de temps qu’un clignement."],
        wait: ["ATTENDRE ? Ce mot devrait être interdit par la vitesse.", "Ma réponse est envoyée depuis une éternité de huit secondes.", "Ils réfléchissent encore ! J’ai eu six nouvelles vies entre-temps.", "Je tourne en rond pour que le temps se sente poursuivi.", "Patience activée… patience désactivée.", "Quelqu’un répond avant que je compte jusqu’à mille en accéléré ?", "Le suspense est trop lent, je vais le dépasser par la gauche.", "J’attends ! Mon pied, lui, organise une rave."]
      }
    },
    octopus: {
      name: "Marcellius",
      image: posePath("octopus", "idle", "avatar-circle"),
      personality: "Intelligente, débordée et généreuse",
      lines: {
        select: ["Tu me choisis ? Parfait, je déplace seulement quatre urgences.", "Marcellius disponible. Enfin, six tentacules sur huit.", "Je viens. J’ai déjà créé un tableau pour organiser notre spontanéité.", "D’accord. Une tentacule pour le jeu, sept pour les imprévus.", "Choix enregistré, classé, sauvegardé et presque compris.", "Je prends l’équipe en charge. Quelqu’un a vu mon troisième stylo ?", "On peut commencer. J’ai huit bras et toujours pas assez de mains.", "Tu m’as choisi ? Merci. J’ajoute ça entre « sauver la partie » et « respirer ».", "Je suis partant. Mon planning, lui, vient de s’évanouir.", "Équipe formée. J’ai préparé trois plans, deux secours et un goûter.", "Je gère. C’est faux, mais dit avec assez d’assurance, ça aide.", "Allons-y. Si tout déborde, au moins je suis adapté."],
        turn: ["Mon tour. Quelle tentacule avait la réponse déjà ?", "Je prends la main, puis une deuxième au cas où.", "À moi de jouer ; mes autres bras continuent les tâches de fond.", "Place à Marcellius. J’ai un plan sur chaque ventouse.", "Je vais répondre dès que mon cerveau ferme deux onglets.", "Cette manche est pour moi ; quelqu’un surveille ma huitième liste ?", "Je m’avance avec plusieurs solutions et une légère surcharge administrative.", "Le standard des urgences ferme pendant toute la durée de mon tour."],
        win: ["Manche gagnée. Je coche la case avec une satisfaction multiservice.", "Un point pour nous ; le plan numéro quatre était donc le bon.", "Victoire validée, tamponnée et rangée dans le dossier violet.", "Le score monte. Mes huit bras demandent une prime collective.", "Ça a fonctionné ! Je savais que l’organisation improvisée était une science.", "Point obtenu. J’envoie le compte rendu à personne, mais il est prêt.", "Belle manche ; même ma liste d’urgences applaudit.", "Résultat positif. Je déplace la célébration entre deux créneaux."],
        wait: ["J’attends les autres en avançant discrètement quatre tâches en retard.", "Réponse envoyée ; je peux enfin traiter l’urgence numéro vingt-sept.", "Le groupe réfléchit. J’ai déjà préparé le compte rendu.", "Patience… j’ai créé une sous-liste pour mieux l’organiser.", "En attente. Trois tentacules trient, deux rassurent, une panique.", "Les réponses tardent ; parfait, je rattrape mardi dernier.", "Je reste disponible, sauf pour tout ce que je fais simultanément.", "Le suspense dure. Mon agenda vient de proposer une réunion."]
      }
    }
  };

  function imageMarkup(id, name, imageOrOptions = null) {
    const options = imageOrOptions && typeof imageOrOptions === "object" ? imageOrOptions : {};
    const pose = options.pose || "idle";
    const variant = options.variant || "avatar-circle";
    const src = posePath(id, pose, variant) || (typeof imageOrOptions === "string" ? imageOrOptions : definitionFor(id)?.image || "");
    return `<img class="ak-avatar-image ak-character ak-character--${pose} ak-character--${variant}" data-avatar-id="${id}" data-character-pose="${pose}" data-character-variant="${variant}" src="${src}" alt="${name}" loading="lazy" decoding="async">`;
  }

  if (typeof avatars !== "undefined" && Array.isArray(avatars)) {
    avatars.forEach(avatar => {
      const definition = CHARACTER_DEFINITIONS[avatar.id];
      if (!definition) return;
      Object.assign(avatar, definition);
      avatar.emoji = imageMarkup(avatar.id, definition.name, definition.image);
    });
  }

  function definitionFor(id) {
    return CHARACTER_DEFINITIONS[id] || CHARACTER_DEFINITIONS.frog;
  }

  function randomLine(id, moment = "turn") {
    const voiceLine = window.AKCharacterVoice?.getLine?.(id, moment);
    if (voiceLine) return voiceLine;
    const definition = definitionFor(id);
    const pool = definition.lines?.[moment] || definition.lines?.turn || [definition.personality];
    return pool[Math.floor(Math.random() * pool.length)] || definition.personality;
  }

  function usedAvatarOwners() {
    const players = Array.isArray(state?.players) ? state.players : [];
    return new Map(
      players
        .filter(player => player?.avatarId)
        .map(player => [player.avatarId, player])
    );
  }

  let pickerBubbleTimer = null;
  let pickerBubbleToken = 0;
  let pickerSelectionKey = "";

  function hidePickerBubble(immediate = false) {
    const bubble = document.querySelector(".character-picker-quote");
    if (!bubble) return;
    window.clearTimeout(pickerBubbleTimer);
    pickerSelectionKey = "";
    if (immediate) {
      bubble.remove();
      return;
    }
    bubble.classList.add("is-hiding");
    window.setTimeout(() => bubble.remove(), 220);
  }

  function showPickerBubble(id, options = {}) {
    const settings = window.AKSettings?.get?.();
    if (settings && settings.mascotBubbles === false) {
      hidePickerBubble(true);
      return;
    }
    if (!id) return;
    const forceNewLine = options.forceNewLine === true;
    const key = String(id);
    const current = document.querySelector(".character-picker-quote");

    if (!forceNewLine && pickerSelectionKey === key && current) {
      current.classList.remove("is-hiding");
      return;
    }

    pickerSelectionKey = key;
    pickerBubbleToken += 1;
    const definition = definitionFor(id);
    const line = randomLine(id, "select");

    current?.remove();
    const bubble = document.createElement("aside");
    bubble.className = "character-picker-quote";
    if (document.querySelector(".multiplayer-player-submit")) {
      bubble.classList.add("multiplayer-picker-quote");
    }
    bubble.dataset.avatarId = id;
    bubble.setAttribute("aria-live", "polite");
    bubble.setAttribute("aria-atomic", "true");
    bubble.innerHTML = `
      <span>${imageMarkup(id, definition.name, { pose: "talk", variant: "bust" })}</span>
      <p><strong>${definition.name}</strong><q>${line}</q></p>
    `;
    document.body.appendChild(bubble);
    enhancePoseImages();
    if (settings?.mascotSounds !== false) window.AKSound?.playMascot?.(id, "select");

    // La bulle reste affichée tant que le personnage est sélectionné.
    // Une nouvelle phrase est générée uniquement quand l’utilisateur clique
    // de nouveau sur cette mascotte ou en choisit une autre.
    window.clearTimeout(pickerBubbleTimer);
    pickerBubbleTimer = null;
  }

  function addPickerPreview() {
    const grid = document.querySelector(".avatar-grid");
    if (!grid) {
      hidePickerBubble(true);
      return;
    }

    const selected = state?.draftPlayer?.avatarId;
    grid.querySelectorAll("[data-avatar]").forEach(button => {
      const id = button.dataset.avatar;
      const definition = definitionFor(id);
      const name = button.querySelector(".avatar-name");
      if (name && !button.querySelector(".avatar-personality")) {
        name.insertAdjacentHTML("afterend", `<span class="avatar-personality">${definition.personality}</span>`);
      }
    });

    if (selected && pickerSelectionKey !== String(selected)) {
      showPickerBubble(selected);
    }
  }

  function markTaken(ownersOrIds) {
    const selected = state?.draftPlayer?.avatarId;
    const editingId = state?.editingPlayerId || null;
    const owners = ownersOrIds instanceof Map ? ownersOrIds : new Map([...ownersOrIds].map(id => [id, null]));

    document.querySelectorAll(".avatar-card[data-avatar]").forEach(button => {
      const id = button.dataset.avatar;
      const owner = owners.get(id) || null;
      const belongsToEditedPlayer = Boolean(owner && editingId && owner.id === editingId);
      const taken = owners.has(id) && id !== selected && !belongsToEditedPlayer;
      const expectedLabel = owner?.name ? `Pris par ${owner.name}` : "Déjà choisi";
      const currentTaken = button.classList.contains("taken");
      const currentDisabled = Boolean(button.disabled);
      const currentAriaDisabled = button.getAttribute("aria-disabled");
      let label = button.querySelector(".avatar-taken-label");

      // Ne modifie le DOM que lorsque l’état change réellement. Cela évite la
      // boucle de synchronisation qui faisait clignoter les mascottes prises.
      if (currentTaken !== taken) button.classList.toggle("taken", taken);
      if (currentDisabled !== taken) button.disabled = taken;
      if (currentAriaDisabled !== (taken ? "true" : "false")) {
        button.setAttribute("aria-disabled", taken ? "true" : "false");
      }

      if (taken) {
        if (!label) {
          label = document.createElement("span");
          label.className = "avatar-taken-label";
          button.appendChild(label);
        }
        if (label.textContent !== expectedLabel) label.textContent = expectedLabel;
      } else if (label) {
        label.remove();
      }
    });
  }

  async function refreshMultiplayerTaken() {
    if (state?.mode !== "multi-guest" || !state.pendingJoinCode || !window.AKFirebase?.getRoomPlayers) return;
    try {
      const players = await window.AKFirebase.getRoomPlayers(state.pendingJoinCode);
      const owners = new Map(
        Object.entries(players || {})
          .filter(([, player]) => player?.avatarId)
          .map(([id, player]) => [player.avatarId, { id, ...player }])
      );
      markTaken(owners);
      if (state?.draftPlayer?.avatarId && owners.has(state.draftPlayer.avatarId)) {
        state.draftPlayer.avatarId = null;
        document.querySelector(".character-picker-quote")?.remove();
        markTaken(owners);
      }
    } catch (error) {
      console.warn("Impossible de charger les personnages déjà choisis", error);
    }
  }


  function enhanceLobbyCapacity() {
    const addButton = document.querySelector("#addAnother");
    if (!addButton || typeof avatars === "undefined") return;
    const full = Number(state?.players?.length || 0) >= avatars.length;
    addButton.disabled = full;
    if (full) addButton.textContent = "Tous les personnages sont déjà choisis";
  }

  function enhanceCharacterPicker() {
    const grid = document.querySelector(".avatar-grid");
    if (!grid) return;
    markTaken(usedAvatarOwners());
    addPickerPreview();
    refreshMultiplayerTaken();

    const saveButton = document.querySelector("#savePlayer, #saveMultiplayerPlayer");
    if (saveButton && !saveButton.dataset.avatarGuardBound) {
      saveButton.dataset.avatarGuardBound = "true";
      saveButton.addEventListener("click", event => {
        const id = state?.draftPlayer?.avatarId;
        if (!id) return;
        const editingId = state?.editingPlayerId || null;
        const duplicate = (state?.players || []).some(player => player.avatarId === id && player.id !== editingId && player.id !== state?.currentUid);
        if (!duplicate) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        state.draftPlayer.avatarId = null;
        alert("Ce personnage est déjà utilisé dans la partie. Choisis-en un autre.");
        renderPlayerForm();
      }, true);
    }
  }

  if (typeof renderPlayerForm === "function") {
    const originalRenderPlayerForm = renderPlayerForm;
    renderPlayerForm = function (...args) {
      const result = originalRenderPlayerForm.apply(this, args);
      window.requestAnimationFrame(enhanceCharacterPicker);
      return result;
    };
  }

  function speechTarget() {
    const selectors = [
      ".giant-avatar [data-avatar-id]",
      ".handoff-stage [data-avatar-id]",
      ".prompt-player [data-avatar-id]",
      ".daring-round-speaker [data-avatar-id]",
      ".plead-speaker [data-avatar-id]",
      ".mime-actor-list [data-avatar-id]"
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    const winner = document.querySelector(".winner-stage + .final-ranking .ranking-row:first-child [data-avatar-id], .final-ranking .ranking-row:first-child [data-avatar-id]");
    return winner || null;
  }

  function enhancePoseImages() {
    document.querySelectorAll("img.ak-avatar-image[data-avatar-id]").forEach(image => {
      const id = image.dataset.avatarId;
      let pose = image.dataset.characterPose || "idle";
      let variant = image.dataset.characterVariant || "avatar-circle";

      if (image.closest(".giant-avatar")) {
        variant = "full";
        pose = image.closest(".winner-stage") ? "win" : "talk";
      } else if (image.closest(".winner-stage")) {
        variant = "full";
        pose = "win";
      } else if (image.closest(".character-picker-quote, .character-speech-bubble")) {
        variant = "bust";
        pose = image.closest(".character-speech-bubble")?.dataset.pose || pose || "talk";
      } else {
        variant = "avatar-circle";
        pose = "idle";
      }

      const next = posePath(id, pose, variant);
      if (next && image.getAttribute("src") !== next) image.setAttribute("src", next);
      image.dataset.characterPose = pose;
      image.dataset.characterVariant = variant;
      image.classList.remove("ak-character--idle", "ak-character--talk", "ak-character--hype", "ak-character--win", "ak-character--lose", "ak-character--full", "ak-character--bust", "ak-character--avatar-circle", "ak-character--icon");
      image.classList.add(`ak-character--${pose}`, `ak-character--${variant}`);
    });
  }

  let lastSpeechKey = "";
  let speechTimer = null;
  function maybeSpeak() {
    const settings = window.AKSettings?.get?.();
    if (settings && settings.mascotBubbles === false) {
      screen?.querySelector?.(".character-speech-bubble")?.remove();
      return;
    }
    const target = speechTarget();
    if (!target || !screen?.isConnected) return;
    const id = target.dataset.avatarId;
    const heading = screen.querySelector("h2")?.textContent?.trim() || title?.textContent?.trim() || "";
    const isWinner = Boolean(screen.querySelector(".winner-stage"));
    const key = `${id}|${heading}|${isWinner ? "win" : "turn"}`;
    if (!id || key === lastSpeechKey) return;
    lastSpeechKey = key;
    const frequency = settings?.mascotFrequency || "normal";
    const chance = frequency === "chatty" ? 1 : frequency === "discreet" ? 0.32 : 0.72;
    if (!isWinner && Math.random() > chance) return;
    const moment = isWinner ? "win" : "turn";
    const definition = definitionFor(id);
    screen.querySelector(".character-speech-bubble")?.remove();
    const bubble = document.createElement("aside");
    bubble.className = "character-speech-bubble";
    bubble.dataset.pose = poseForEvent(moment);
    bubble.setAttribute("aria-live", "polite");
    bubble.innerHTML = `<span>${imageMarkup(id, definition.name, { pose: poseForEvent(moment), variant: "bust" })}</span><p><strong>${definition.name}</strong> « ${randomLine(id, moment)} »</p>`;
    const anchor = screen.querySelector(".decision-grid, .toolbar, .primary-btn.full, .game-progress");
    if (anchor) anchor.insertAdjacentElement("beforebegin", bubble);
    else screen.appendChild(bubble);
    if (settings?.mascotSounds !== false) window.AKSound?.playMascot?.(id, isWinner ? "result" : "hype");
    window.clearTimeout(speechTimer);
    const speechTime = frequency === "chatty" ? 8500 : frequency === "discreet" ? 4200 : 6500;
    speechTimer = window.setTimeout(() => bubble.classList.add("quiet"), speechTime);
  }

  const observer = new MutationObserver(() => {
    window.clearTimeout(observer._timer);
    observer._timer = window.setTimeout(() => {
      enhanceCharacterPicker();
      enhanceLobbyCapacity();
      enhancePoseImages();
      maybeSpeak();
    }, 40);
  });
  if (screen) observer.observe(screen, { childList: true, subtree: true });

  window.AKCharacters = {
    definitions: CHARACTER_DEFINITIONS,
    randomLine,
    showPickerBubble,
    hidePickerBubble,
    enhanceCharacterPicker,
    enhancePoseImages,
    posePath,
    imageMarkup,
    say(id, moment = "turn") {
      const definition = definitionFor(id);
      return { name: definition.name, text: randomLine(id, moment), image: posePath(id, poseForEvent(moment), "bust") };
    }
  };

  window.AKCharacterVoice?.ready?.then(() => {
    enhancePoseImages();
  });
})();
