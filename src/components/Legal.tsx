import { Link, useNavigate, useParams } from 'react-router';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';

type Tab = 'mentions' | 'privacy' | 'cgu' | 'cgv';

const TABS: { key: Tab; label: string }[] = [
  { key: 'mentions', label: 'Mentions légales' },
  { key: 'privacy', label: 'Confidentialité' },
  { key: 'cgu', label: 'CGU' },
  { key: 'cgv', label: 'CGV' },
];

const TAB_TITLES: Record<Tab, string> = {
  mentions: 'Mentions légales',
  privacy: 'Politique de confidentialité',
  cgu: "Conditions Générales d'Utilisation",
  cgv: 'Conditions Générales de Vente',
};

export function Legal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const tab: Tab =
    tabParam && ['mentions', 'privacy', 'cgu', 'cgv'].includes(tabParam) ? (tabParam as Tab) : 'mentions';

  useDocumentHead({
    title: TAB_TITLES[tab],
    description: `${TAB_TITLES[tab]} du site Wan2Fit, édité par WAN SOFT.`,
  });

  return (
    <>
      {/* Header */}
      <header className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted hover:text-strong transition-colors" aria-label="Retour">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-bold text-lg text-heading">Informations légales</h1>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-6 flex gap-1">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => navigate(`/legal/${t.key}`, { replace: true })}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                tab === t.key
                  ? 'text-link bg-surface-light border-t-2 border-x border-brand border-x-divider -mb-px'
                  : 'text-muted hover:text-body'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="max-w-none">
          {tab === 'mentions' && <MentionsLegales />}
          {tab === 'privacy' && <PolitiqueConfidentialite />}
          {tab === 'cgu' && <CGU />}
          {tab === 'cgv' && <CGV />}
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-heading mb-3">{title}</h2>
      <div className="space-y-2 text-sm text-subtle leading-relaxed">{children}</div>
    </section>
  );
}

function MentionsLegales() {
  return (
    <>
      <h1 className="text-2xl font-bold text-heading mb-6">Mentions légales</h1>

      <Section title="Éditeur du site">
        <p>
          Le site <strong className="text-strong">Wan2Fit</strong> (ci-après « le Site ») est édité par :
        </p>
        <p>
          <strong className="text-strong">WAN SOFT</strong>
          <br />
          SARL (Société à Responsabilité Limitée) au capital de 1 000 €
          <br />
          Siège social : 33 La Baluère, 35220 Châteaubourg
          <br />
          RCS Rennes 831 188 586
          <br />
          SIRET : 831 188 586 00026
          <br />
          TVA intracommunautaire : FR59831188586
          <br />
          Directeur de la publication : Erwan VIOT
          <br />
          Téléphone : 06 79 08 40 63
          <br />
          Contact :{' '}
          <a href="mailto:contact@wan2fit.fr" className="text-link underline">
            contact@wan2fit.fr
          </a>
        </p>
      </Section>

      <Section title="Hébergement">
        <p>Le Site est hébergé par :</p>
        <p>
          <strong className="text-strong">Vercel Inc.</strong>
          <br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
          <br />
          Site web :{' '}
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-link underline">
            vercel.com
          </a>
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          L'ensemble des contenus présents sur le Site (textes, images, logos, icônes, programmes d'exercices, code
          source) est la propriété exclusive de WAN SOFT ou de ses partenaires et est protégé par les lois françaises et
          internationales relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du
          Site est interdite sans autorisation écrite préalable de WAN SOFT.
        </p>
      </Section>

      <Section title="Responsabilité">
        <p>
          Les informations et exercices proposés sur le Site le sont à titre indicatif. WAN SOFT ne saurait être tenu
          responsable des dommages directs ou indirects résultant de l'utilisation du Site ou de la pratique des
          exercices proposés.
        </p>
        <p>Il est recommandé de consulter un médecin avant de commencer tout programme d'activité physique.</p>
      </Section>

      <Section title="Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français
          seront seuls compétents.
        </p>
      </Section>
    </>
  );
}

function PolitiqueConfidentialite() {
  return (
    <>
      <h1 className="text-2xl font-bold text-heading mb-6">Politique de confidentialité</h1>

      <p className="text-sm text-faint mb-6">Dernière mise à jour : avril 2026 (version 2026-04)</p>

      <Section title="Responsable du traitement">
        <p>
          Le responsable du traitement des données est WAN SOFT, joignable à l'adresse :{' '}
          <a href="mailto:contact@wan2fit.fr" className="text-link underline">
            contact@wan2fit.fr
          </a>
        </p>
      </Section>

      <Section title="Données collectées">
        <p>
          Le Site peut être utilisé librement sans création de compte. Si vous choisissez de créer un compte, les
          données suivantes sont collectées :
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-strong">Adresse email</strong> — pour l'authentification et la récupération de
            compte
          </li>
          <li>
            <strong className="text-strong">Prénom ou pseudo</strong> — pour personnaliser l'affichage
          </li>
          <li>
            <strong className="text-strong">Historique des séances complétées</strong> — pour le suivi de progression
            (dates, durées)
          </li>
          <li>
            <strong className="text-strong">Données de facturation</strong> — pour la gestion de l'abonnement Premium
            (traitées par Stripe, voir ci-dessous)
          </li>
          <li>
            <strong className="text-strong">Photo de profil (avatar)</strong> — pour personnaliser votre compte (stockée
            sur Supabase Storage)
          </li>
          <li>
            <strong className="text-strong">Préférences d'entraînement</strong> — pour la génération IA de séances et
            programmes personnalisés : objectifs, expérience sportive, équipement, durée, intensité, zones ciblées,
            blessures déclarées, âge et sexe si renseignés. Ces données sont transmises à Anthropic pour la génération
            du contenu (voir « Services tiers » ci-dessous).
          </li>
        </ul>
        <p>
          <strong className="text-strong">Wan2Fit ne stocke jamais vos données bancaires.</strong> Les informations de
          paiement (numéro de carte, IBAN) sont collectées et traitées exclusivement par Stripe. Nous ne conservons que
          l'identifiant client Stripe et le statut de votre abonnement.
        </p>
        <p>
          Les déclarations de blessures renseignées lors de la création d'un programme IA ne constituent pas des données
          de santé au sens de l'article 9 du RGPD — il s'agit de déclarations volontaires de l'utilisateur à des fins de
          personnalisation. Vos données ne sont jamais revendues à des tiers.
        </p>
      </Section>

      <Section title="Suivi nutritionnel (feature optionnel)">
        <p>
          Lorsque vous activez le suivi nutritionnel, Wan2Fit collecte et conserve les informations que vous saisissez
          manuellement :{' '}
          <strong className="text-strong">
            nom du repas, calories, macronutriments éventuels, date et type de repas (petit-déjeuner, déjeuner, etc.)
          </strong>
          . Une <strong className="text-strong">cible calorique quotidienne</strong> peut également être persistée, sous
          la forme d'un simple nombre.
        </p>
        <p>
          <strong className="text-strong">Privacy by design :</strong> si vous utilisez le calculateur de cible
          (formulaire d'onboarding éphémère), vos données morphologiques (âge, sexe, taille, poids, niveau d'activité)
          <strong className="text-strong"> ne sont jamais envoyées sur nos serveurs</strong>. Elles sont utilisées
          uniquement dans votre navigateur pour calculer le nombre-cible selon la formule de Mifflin-St Jeor, puis
          oubliées lorsque vous quittez la page. Seul le nombre-cible est persisté.
        </p>
        <p>
          <strong className="text-strong">Qualification juridique :</strong> conformément à l'interprétation de la Cour
          de justice de l'Union européenne (arrêt <em>Lindenapotheke</em> C‑21/23 du 4 octobre 2024), nous considérons
          par prudence que votre journal alimentaire et votre cible calorique peuvent constituer des données concernant
          la santé au sens de l'article 9 du RGPD. Leur traitement repose sur votre{' '}
          <strong className="text-strong">consentement explicite</strong> (art. 9.2.a RGPD), matérialisé par
          l'activation volontaire du suivi nutritionnel, complété par l'exécution du contrat d'utilisation du service
          (art. 6.1.b). Vous pouvez retirer ce consentement à tout moment en supprimant votre journal et votre cible.
        </p>
        <p>
          <strong className="text-strong">Estimation IA (abonnés premium) :</strong> lorsque vous utilisez l'estimation
          automatique des calories via une description texte libre, la description saisie et l'heure de la demande sont
          transmises à Anthropic pour traitement (voir « Services tiers » ci-dessous). L'analyse quotidienne optionnelle
          (« Analyser ma journée ») transmet également un résumé des repas saisis et votre cible calorique si définie.
          Anthropic ne réutilise pas ces données pour l'entraînement de ses modèles.
        </p>
        <p>
          <strong className="text-strong">Scan de code-barres :</strong> lorsque vous scannez un produit, le code-barres
          est envoyé directement depuis votre navigateur à l'API publique{' '}
          <a href="https://openfoodfacts.org" target="_blank" rel="noopener noreferrer" className="text-link underline">
            Open Food Facts
          </a>{' '}
          (base collaborative libre sous licence ODbL). Wan2Fit ne voit ni ne stocke ce code-barres tant que vous n'avez
          pas confirmé l'ajout du produit à votre journal. Open Food Facts ne reçoit aucune donnée permettant de vous
          identifier.
        </p>
        <p>
          <strong className="text-strong">Base de référence CIQUAL :</strong> la recherche d'aliments dans la base
          CIQUAL (ANSES, licence Etalab 2.0) s'effectue sur nos serveurs. Seule la requête de recherche est traitée ;
          elle n'est pas associée à votre identité au-delà de votre session.
        </p>
      </Section>

      <Section title="Finalités du traitement et bases légales">
        <p>Vos données sont utilisées pour les finalités suivantes :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Gérer votre compte et votre authentification — <em>exécution du contrat (art. 6.1.b RGPD)</em>
          </li>
          <li>
            Sauvegarder votre progression et votre historique de séances —{' '}
            <em>exécution du contrat (art. 6.1.b RGPD)</em>
          </li>
          <li>
            Vous envoyer des emails transactionnels (confirmation, réinitialisation) —{' '}
            <em>exécution du contrat (art. 6.1.b RGPD)</em>
          </li>
          <li>
            Gérer votre abonnement Premium et traiter les paiements — <em>exécution du contrat (art. 6.1.b RGPD)</em>
          </li>
          <li>
            Générer des séances et programmes personnalisés par IA — <em>exécution du contrat (art. 6.1.b RGPD)</em>
          </li>
          <li>
            Gérer votre journal nutritionnel et votre cible calorique (feature optionnel) —{' '}
            <em>consentement explicite (art. 9.2.a RGPD) + exécution du contrat (art. 6.1.b RGPD)</em>
          </li>
          <li>
            Fournir une estimation IA des calories et une analyse quotidienne (abonnés premium) —{' '}
            <em>consentement explicite (art. 9.2.a RGPD) + exécution du contrat premium (art. 6.1.b RGPD)</em>
          </li>
          <li>
            Conserver les factures et données de facturation — <em>obligation légale (art. 6.1.c RGPD)</em>
          </li>
        </ul>
        <p>Nous n'envoyons aucun email marketing ni newsletter.</p>
      </Section>

      <Section title="Stockage local">
        <p>
          Le Site utilise le stockage local de votre navigateur (localStorage) pour mémoriser vos préférences
          d'utilisation (thème clair/sombre, préférences de son). Ces données restent sur votre appareil et ne sont
          jamais transmises à nos serveurs.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Le Site utilise uniquement des <strong className="text-strong">cookies techniques</strong> strictement
          nécessaires au fonctionnement de l'authentification. Aucun cookie publicitaire, analytique ou de suivi n'est
          déposé.
        </p>
      </Section>

      <Section title="Services tiers">
        <p>Le Site fait appel aux services tiers suivants :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-strong">Vercel</strong> — hébergement du site (logs serveur standard : adresse IP,
            navigateur, pages visitées)
          </li>
          <li>
            <strong className="text-strong">Supabase</strong> — authentification et base de données (stockage de votre
            compte et de votre historique)
          </li>
          <li>
            <strong className="text-strong">Stripe</strong> — traitement des paiements et gestion des abonnements
            (sous-traitant RGPD, données hébergées en UE). Stripe est certifié PCI-DSS niveau 1.
          </li>
          <li>
            <strong className="text-strong">Anthropic</strong> — génération de séances et programmes personnalisés et
            estimation nutritionnelle IA (modèles Claude). Les données transmises comprennent : (a) les paramètres de
            personnalisation fitness (objectifs, équipement, blessures déclarées, âge et sexe si renseignés) pour les
            séances et programmes ; (b) la description texte d'un repas pour l'estimation calorique premium ; (c) le
            récapitulatif des repas saisis du jour et la cible calorique si définie, pour l'analyse quotidienne premium.
            Anthropic ne réutilise pas ces données pour l'entraînement de ses modèles. Siège aux États-Unis.
          </li>
          <li>
            <strong className="text-strong">Open Food Facts</strong> — base collaborative libre de produits alimentaires
            (licence ODbL). Utilisée lors du scan de code-barres côté client uniquement. Aucune donnée identifiante
            n'est transmise — seul le code-barres scanné l'est.
          </li>
        </ul>
        <p>
          Ces prestataires sont soumis à leurs propres politiques de confidentialité et offrent des garanties conformes
          au RGPD.
        </p>
      </Section>

      <Section title="Transferts de données hors Union européenne">
        <p>Certains de nos sous-traitants sont situés aux États-Unis :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-strong">Vercel Inc.</strong> (hébergement) — transferts encadrés par les clauses
            contractuelles types (CCT) de la Commission européenne
          </li>
          <li>
            <strong className="text-strong">Supabase Inc.</strong> (base de données et authentification) — transferts
            encadrés par le Data Privacy Framework UE-US et les CCT
          </li>
          <li>
            <strong className="text-strong">Anthropic PBC</strong> (génération IA) — transferts encadrés par les CCT.
            Les données transmises sont limitées aux paramètres de personnalisation et ne sont pas utilisées pour
            l'entraînement des modèles d'IA.
          </li>
        </ul>
        <p>Stripe héberge les données de paiement dans l'Union européenne.</p>
      </Section>

      <Section title="Durée de conservation">
        <p>
          Vos données de compte (identifiants, préférences, historique de séances) sont conservées tant que votre compte
          est actif. En cas d'inactivité prolongée (plus de 2 ans sans connexion), nous pouvons supprimer votre compte
          après vous avoir notifié par email, conformément aux recommandations CNIL.
        </p>
        <p>
          Vos données de <strong className="text-strong">suivi nutritionnel</strong> (journal alimentaire, cible
          calorique, insights IA, estimations) sont conservées tant que le feature est activé et votre compte actif.
          Vous pouvez les supprimer à tout moment depuis la page de suivi nutritionnel.
        </p>
        <p>
          En cas de suppression de compte, l'ensemble de vos données personnelles est effacé dans un délai de 30 jours.
        </p>
        <p>
          Les données de facturation et justificatifs de paiement sont conservés pendant 10 ans conformément à l'article
          L.123-22 du Code de commerce, même en cas de suppression de compte.
        </p>
      </Section>

      <Section title="Vos droits">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
          vous disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement (suppression de compte)</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à{' '}
          <a href="mailto:contact@wan2fit.fr" className="text-link underline">
            contact@wan2fit.fr
          </a>
          . Nous nous engageons à répondre dans un délai de 30 jours.
        </p>
        <p>
          Vous disposez également du droit d'introduire une réclamation auprès de la Commission Nationale de
          l'Informatique et des Libertés (CNIL) —{' '}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-link underline">
            www.cnil.fr
          </a>{' '}
          — si vous estimez que le traitement de vos données constitue une violation du RGPD.
        </p>
      </Section>

      <Section title="Évolution de cette politique">
        <p>
          Cette politique de confidentialité peut être mise à jour à tout moment. En cas de modification significative,
          un bandeau d'information sera affiché sur le Site. La date de dernière mise à jour est indiquée en haut de
          cette page.
        </p>
      </Section>
    </>
  );
}

function CGU() {
  return (
    <>
      <h1 className="text-2xl font-bold text-heading mb-6">Conditions Générales d'Utilisation</h1>

      <p className="text-sm text-faint mb-6">Dernière mise à jour : avril 2026 (version 2026-04)</p>

      <Section title="Objet">
        <p>
          Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») définissent les conditions d'accès et
          d'utilisation du site Wan2Fit, édité par WAN SOFT.
        </p>
        <p>L'utilisation du Site implique l'acceptation pleine et entière des présentes CGU.</p>
      </Section>

      <Section title="Description du service">
        <p>
          Wan2Fit propose une offre gratuite de séances d'exercices physiques quotidiennes et une offre Premium payante
          donnant accès à des fonctionnalités avancées (séances et programmes personnalisés par IA, estimation IA des
          calories, analyse nutritionnelle quotidienne). Le Site met à disposition des suggestions d'exercices guidées
          avec minuteur intégré, sans équipement nécessaire, ainsi qu'un suivi nutritionnel optionnel.
        </p>
        <p>
          La création d'un compte est optionnelle. Elle permet de sauvegarder son historique de séances, son suivi
          nutritionnel et de suivre sa progression. Les conditions de l'abonnement Premium sont détaillées dans les{' '}
          <Link to="/legal/cgv" className="text-link underline">
            Conditions Générales de Vente
          </Link>
          .
        </p>
      </Section>

      <Section title="Suivi nutritionnel (feature optionnel)">
        <p>
          Le suivi nutritionnel vous permet de consigner vos repas, de rechercher des aliments dans la base CIQUAL
          (ANSES), de scanner des produits via Open Food Facts, et, pour les abonnés Premium, d'estimer les calories
          d'un repas via IA et d'obtenir une analyse quotidienne de votre équilibre alimentaire.
        </p>
        <p>
          <strong className="text-strong">Activation volontaire :</strong> le suivi nutritionnel est désactivé par
          défaut. Son utilisation est strictement volontaire et relève de votre choix. En l'activant et en saisissant
          votre premier repas, vous consentez explicitement au traitement des données nutritionnelles décrit dans la{' '}
          <Link to="/legal/privacy" className="text-link underline">
            Politique de Confidentialité
          </Link>{' '}
          (art. 9.2.a RGPD).
        </p>
        <p>
          <strong className="text-strong">Nature indicative des estimations :</strong> les calories et macronutriments
          proposés par la base CIQUAL, Open Food Facts ou l'estimation IA sont <strong>indicatifs</strong> (marge
          d'erreur typiquement ±20% pour l'IA, dépendante de la précision de la description). Wan2Fit n'offre aucune
          garantie de précision absolue. Ces estimations ne doivent pas se substituer à un suivi nutritionnel
          professionnel.
        </p>
        <p>
          <strong className="text-strong">Transparence sur l'IA :</strong> conformément au règlement (UE) 2024/1689 (AI
          Act), article 50, vous êtes informé que les fonctionnalités « Estimation IA » et « Analyse de ta journée »
          sont générées par un modèle d'intelligence artificielle (Claude, éditeur Anthropic). Les résultats affichés
          sont annotés avec un niveau de confiance lorsque pertinent.
        </p>
        <p>
          <strong className="text-strong">Public et restrictions :</strong> cette fonctionnalité est réservée aux
          utilisateurs majeurs (18 ans et plus). Nous recommandons de ne pas l'activer en cas de grossesse, de
          pathologie médicale (diabète, troubles du comportement alimentaire, maladies métaboliques), ou si vous êtes
          suivi par un professionnel de santé qui vous a prescrit un régime particulier. En cas de doute, consultez
          votre médecin avant d'utiliser le suivi calorique.
        </p>
        <p>
          <strong className="text-strong">Non-substitution à un avis médical :</strong> les informations fournies
          (cibles, estimations, suggestions) ne constituent pas un conseil médical, un diagnostic ou une prescription.
          Elles ne peuvent remplacer l'avis d'un professionnel de santé qualifié (médecin, nutritionniste, diététicien).
        </p>
      </Section>

      <Section title="Évolution des présentes conditions">
        <p>
          Les présentes CGU peuvent être mises à jour pour refléter des évolutions du service. En cas de modification
          substantielle (nouvelle finalité, nouveau sous-traitant, nouvelle catégorie de données), vous serez informé
          lors de votre prochaine connexion par une fenêtre vous invitant à prendre connaissance et à accepter la
          nouvelle version. La version en vigueur est indiquée en haut de cette page.
        </p>
      </Section>

      <Section title="Nature du contenu">
        <p>
          <strong className="text-strong">
            Wan2Fit est un service de contenu éditorial et informationnel relatif à l'activité physique.
          </strong>
        </p>
        <p>
          Les séances proposées constituent des suggestions d'exercices à caractère général, librement accessibles.
          Elles ne constituent en aucun cas :
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Un programme de coaching sportif personnalisé</li>
          <li>Un suivi individuel d'entraînement</li>
          <li>Une prestation d'encadrement sportif au sens de l'article L.212-1 du Code du sport</li>
          <li>Un avis médical ou paramédical</li>
        </ul>
        <p>
          WAN SOFT n'exerce pas l'activité d'éducateur sportif et ne prétend pas se substituer à un professionnel
          diplômé. Le contenu proposé relève de l'information éditoriale au même titre qu'un livre, une vidéo ou un
          article traitant d'exercices physiques.
        </p>
        <p>
          L'utilisateur est seul responsable de l'exécution des exercices et de l'adaptation des mouvements à sa
          condition physique personnelle.
        </p>
      </Section>

      <Section title="Contenu généré par intelligence artificielle">
        <p>
          Les fonctionnalités Premium de génération de séances et de programmes utilisent des modèles d'intelligence
          artificielle (Anthropic Claude) pour créer du contenu personnalisé à partir des paramètres renseignés par
          l'utilisateur.
        </p>
        <p>Le contenu généré par IA :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Constitue des suggestions d'exercices à caractère général, au même titre que le contenu éditorial du Site
          </li>
          <li>
            Ne constitue en aucun cas un programme de coaching sportif personnalisé au sens de l'article L.212-1 du Code
            du sport, ni un avis médical
          </li>
          <li>Peut contenir des imperfections ou des suggestions inadaptées à une situation particulière</li>
          <li>Ne se substitue pas aux conseils d'un professionnel de santé ou d'un éducateur sportif diplômé</li>
        </ul>
        <p>
          L'utilisateur reste entièrement responsable de l'adaptation et de l'exécution des exercices suggérés par l'IA.
          L'avertissement santé s'applique de la même manière au contenu généré par IA et au contenu éditorial.
        </p>
      </Section>

      <Section title="Accès au service">
        <p>
          Le service de base est accessible gratuitement à toute personne disposant d'un accès à Internet et d'un
          navigateur web compatible. L'accès aux séances quotidiennes ne nécessite pas de compte. Les fonctionnalités
          Premium (séances IA, programmes IA) sont réservées aux abonnés. WAN SOFT se réserve le droit de suspendre ou
          d'interrompre le service à tout moment, sans préavis ni indemnité.
        </p>
      </Section>

      <Section title="Compte utilisateur">
        <p>
          Le Site s'adresse exclusivement aux personnes majeures (18 ans et plus). En créant un compte, l'utilisateur
          déclare être âgé d'au moins 18 ans.
        </p>
        <p>
          La création d'un compte est facultative et gratuite. Elle nécessite une adresse email valide et un mot de
          passe. L'utilisateur est responsable de la confidentialité de ses identifiants.
        </p>
        <p>
          L'utilisateur peut demander la suppression de son compte à tout moment en contactant{' '}
          <a href="mailto:contact@wan2fit.fr" className="text-link underline">
            contact@wan2fit.fr
          </a>
          . La suppression entraîne l'effacement de l'ensemble des données associées dans un délai de 30 jours.
        </p>
      </Section>

      <Section title="Avertissement santé">
        <p>
          <strong className="text-strong">
            Les exercices proposés sont fournis à titre purement informatif et ne constituent en aucun cas un avis
            médical ni une prescription d'activité physique.
          </strong>
        </p>
        <p>Avant d'utiliser Wan2Fit, il est indispensable de :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Consulter un médecin pour vérifier votre aptitude à la pratique sportive</li>
          <li>Vous assurer de ne présenter aucune contre-indication médicale</li>
        </ul>
        <p>Le service est déconseillé sans avis médical préalable aux personnes présentant notamment :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Des pathologies cardiaques ou cardiovasculaires</li>
          <li>Des troubles musculo-squelettiques ou articulaires</li>
          <li>Un état de grossesse</li>
          <li>Toute condition médicale pouvant être aggravée par l'exercice physique</li>
        </ul>
        <p>Les conditions d'âge sont précisées dans la section « Compte utilisateur » ci-dessus.</p>
        <p>Pendant la pratique, l'utilisateur s'engage à :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Adapter les exercices à sa condition physique</li>
          <li>Cesser immédiatement en cas de douleur, gêne ou malaise</li>
          <li>S'hydrater régulièrement</li>
          <li>Pratiquer dans un environnement sécurisé et adapté</li>
        </ul>
      </Section>

      <Section title="Acceptation des risques et responsabilité">
        <p>
          <strong className="text-strong">
            L'utilisateur reconnaît que la pratique d'exercices physiques comporte des risques inhérents, y compris de
            blessure.
          </strong>
        </p>
        <p>En utilisant Wan2Fit, l'utilisateur déclare :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Avoir pris connaissance de l'avertissement santé ci-dessus</li>
          <li>Pratiquer sous sa propre responsabilité et à ses propres risques</li>
          <li>Être en mesure physique de réaliser les exercices proposés ou de les adapter</li>
        </ul>
        <p>
          WAN SOFT décline toute responsabilité en cas de blessure, malaise, aggravation d'un état de santé préexistant
          ou tout autre dommage direct ou indirect résultant de l'utilisation du service ou de la pratique des exercices
          proposés.
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          L'ensemble des contenus du Site (programmes, textes, design, code, logos) est protégé par le droit d'auteur et
          reste la propriété exclusive de WAN SOFT.
        </p>
        <p>
          L'utilisateur s'engage à ne pas copier, reproduire, modifier ou distribuer les contenus du Site sans
          autorisation préalable.
        </p>
      </Section>

      <Section title="Comportement de l'utilisateur">
        <p>L'utilisateur s'engage à :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Utiliser le service conformément à sa destination</li>
          <li>Ne pas tenter de compromettre le fonctionnement du Site</li>
          <li>Ne pas utiliser le service à des fins commerciales sans autorisation</li>
        </ul>
      </Section>

      <Section title="Crédits photographiques">
        <p>
          Les photographies d'illustration utilisées sur le Site proviennent des banques d'images libres de droits
          Unsplash et Pexels et sont utilisées conformément à leurs licences respectives.
        </p>
      </Section>

      <Section title="Modification des CGU">
        <p>
          WAN SOFT se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès
          leur publication sur le Site. L'utilisation continue du service après modification vaut acceptation des
          nouvelles conditions.
        </p>
      </Section>

      <Section title="Droit applicable et litiges">
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige relatif à l'interprétation ou l'exécution
          des présentes, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux français
          seront compétents.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Pour toute question relative aux présentes CGU, vous pouvez nous contacter à :{' '}
          <a href="mailto:contact@wan2fit.fr" className="text-link underline">
            contact@wan2fit.fr
          </a>
        </p>
      </Section>
    </>
  );
}

function CGV() {
  return (
    <>
      <h1 className="text-2xl font-bold text-heading mb-6">Conditions Générales de Vente</h1>

      <p className="text-sm text-faint mb-6">Dernière mise à jour : mars 2026</p>

      <Section title="Objet">
        <p>
          Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les conditions de souscription et
          d'utilisation de l'abonnement Premium proposé par WAN SOFT sur le site Wan2Fit.
        </p>
        <p>
          Toute souscription à l'offre Premium implique l'acceptation pleine et entière des présentes CGV, ainsi que des{' '}
          <Link to="/legal/cgu" className="text-link underline">
            Conditions Générales d'Utilisation
          </Link>
          .
        </p>
      </Section>

      <Section title="Offres et tarifs">
        <p>Wan2Fit propose les offres suivantes :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-strong">Gratuit</strong> — Séance du jour, bibliothèque exercices et formats, 3
            programmes guidés, historique complet et statistiques (avec compte gratuit)
          </li>
          <li>
            <strong className="text-strong">Premium mensuel</strong> — 9,99 € TTC/mois — Tout le contenu gratuit +
            séances IA sur-mesure + programmes IA personnalisés
          </li>
          <li>
            <strong className="text-strong">Premium annuel</strong> — 99,99 € TTC/an (soit ~8,33 €/mois, environ 17% de
            remise) — Contenu identique au mensuel
          </li>
        </ul>
        <p>
          Les prix sont indiqués toutes taxes comprises (TVA 20% incluse). WAN SOFT se réserve le droit de modifier ses
          tarifs à tout moment. Toute modification tarifaire n'affecte pas les abonnements en cours et prend effet au
          prochain renouvellement.
        </p>
      </Section>

      <Section title="Souscription et paiement">
        <p>
          La souscription à l'offre Premium nécessite la création d'un compte sur Wan2Fit. Le paiement est effectué en
          ligne par carte bancaire, Apple Pay, Google Pay ou prélèvement SEPA, via la plateforme de paiement sécurisée{' '}
          <strong className="text-strong">Stripe</strong>.
        </p>
        <p>
          WAN SOFT ne collecte ni ne stocke aucune donnée bancaire. L'ensemble des transactions est géré par Stripe
          (certifié PCI-DSS niveau 1).
        </p>
        <p>L'accès aux fonctionnalités Premium est activé immédiatement après confirmation du paiement par Stripe.</p>
      </Section>

      <Section title="Durée et renouvellement">
        <p>
          L'abonnement Premium est conclu pour une durée indéterminée avec des périodes de facturation mensuelles ou
          annuelles selon l'offre choisie. L'abonnement se renouvelle automatiquement à l'issue de chaque période de
          facturation, sauf résiliation par l'abonné avant la date de renouvellement.
        </p>
      </Section>

      <Section title="Droit de rétractation">
        <p>
          Conformément aux articles L.221-18 et L.221-28-1° du Code de la consommation, le consommateur dispose d'un
          droit de rétractation de 14 jours. Toutefois, en souscrivant à l'offre Premium, l'abonné demande expressément
          l'exécution immédiate du service et reconnaît renoncer à son droit de rétractation pour la période en cours,
          dès lors que l'exécution a commencé avec son accord préalable exprès.
        </p>
        <p>Un email de confirmation de souscription rappelant cette renonciation est adressé à l'abonné par Stripe.</p>
      </Section>

      <Section title="Résiliation">
        <p>
          L'abonné peut résilier son abonnement à tout moment depuis le portail client accessible dans ses paramètres de
          compte (bouton « Gérer mon abonnement »).
        </p>
        <p>
          La résiliation prend effet à la fin de la période de facturation en cours. L'accès aux fonctionnalités Premium
          est maintenu jusqu'à cette date. Aucun remboursement au prorata n'est effectué.
        </p>
      </Section>

      <Section title="Médiateur de la consommation">
        <p>
          Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige non résolu par le
          service client, l'abonné peut recourir gratuitement au médiateur de la consommation désigné par WAN SOFT :
        </p>
        <p>
          <strong className="text-strong">[À COMPLÉTER — médiateur à désigner avant mise en production]</strong>
        </p>
        <p>
          Pour contacter notre service client préalablement à toute médiation :{' '}
          <a href="mailto:contact@wan2fit.fr" className="text-link underline">
            contact@wan2fit.fr
          </a>
        </p>
      </Section>

      <Section title="Facturation">
        <p>
          Les factures sont disponibles depuis le portail client Stripe, accessible depuis les paramètres du compte.
          Conformément à la réglementation, les factures sont conservées pendant 6 ans.
        </p>
      </Section>

      <Section title="Droit applicable">
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de résolution amiable
          et/ou recours au médiateur, les tribunaux français seront compétents.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Pour toute question relative aux présentes CGV ou à votre abonnement :{' '}
          <a href="mailto:contact@wan2fit.fr" className="text-link underline">
            contact@wan2fit.fr
          </a>
        </p>
      </Section>
    </>
  );
}
