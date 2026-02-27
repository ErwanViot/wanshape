import { Link, useNavigate, useParams } from 'react-router';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';

type Tab = 'mentions' | 'privacy' | 'cgu';

const TABS: { key: Tab; label: string }[] = [
  { key: 'mentions', label: 'Mentions légales' },
  { key: 'privacy', label: 'Confidentialité' },
  { key: 'cgu', label: 'CGU' },
];

const TAB_TITLES: Record<Tab, string> = {
  mentions: 'Mentions légales',
  privacy: 'Politique de confidentialité',
  cgu: "Conditions Générales d'Utilisation",
};

export function Legal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const tab: Tab = tabParam && ['mentions', 'privacy', 'cgu'].includes(tabParam) ? (tabParam as Tab) : 'mentions';

  useDocumentHead({
    title: TAB_TITLES[tab],
    description: `${TAB_TITLES[tab]} du site WAN SHAPE, édité par WAN SOFT.`,
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
          Le site <strong className="text-strong">WAN SHAPE</strong> (ci-après « le Site ») est édité par :
        </p>
        <p>
          <strong className="text-strong">WAN SOFT</strong>
          <br />
          SARL (Société à Responsabilité Limitée)
          <br />
          SIRET : 831 188 586 00026
          <br />
          Directeur de la publication : Erwan VIOT
          <br />
          Téléphone : 06 79 08 40 63
          <br />
          Contact :{' '}
          <a href="mailto:erwan.viot@wan-soft.fr" className="text-link underline">
            erwan.viot@wan-soft.fr
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

      <p className="text-sm text-faint mb-6">Dernière mise à jour : février 2026</p>

      <Section title="Responsable du traitement">
        <p>
          Le responsable du traitement des données est WAN SOFT, joignable à l'adresse :{' '}
          <a href="mailto:erwan.viot@wan-soft.fr" className="text-link underline">
            erwan.viot@wan-soft.fr
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
        </ul>
        <p>
          Nous ne collectons aucune donnée de santé, de localisation, ni de données relatives à votre condition
          physique. Vos données ne sont jamais revendues à des tiers.
        </p>
      </Section>

      <Section title="Finalités du traitement">
        <p>Vos données sont utilisées exclusivement pour :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Gérer votre compte et votre authentification</li>
          <li>Sauvegarder votre progression et votre historique de séances</li>
          <li>Vous envoyer des emails transactionnels (confirmation de compte, réinitialisation de mot de passe)</li>
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
          Le Site utilise des <strong className="text-strong">cookies techniques</strong> strictement nécessaires au
          fonctionnement de l'authentification.
        </p>
        <p>
          Le Site peut également utiliser des <strong className="text-strong">cookies publicitaires</strong> déposés par
          des régies tierces pour financer le service. Vous pouvez gérer vos préférences de cookies à tout moment via le
          bandeau de consentement.
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
        </ul>
        <p>
          Ces prestataires sont soumis à leurs propres politiques de confidentialité et offrent des garanties conformes
          au RGPD.
        </p>
      </Section>

      <Section title="Durée de conservation">
        <p>
          Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données
          personnelles sont effacées dans un délai de 30 jours.
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
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à{' '}
          <a href="mailto:erwan.viot@wan-soft.fr" className="text-link underline">
            erwan.viot@wan-soft.fr
          </a>
          . Nous nous engageons à répondre dans un délai de 30 jours.
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

      <p className="text-sm text-faint mb-6">Dernière mise à jour : février 2026</p>

      <Section title="Objet">
        <p>
          Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») définissent les conditions d'accès et
          d'utilisation du site WAN SHAPE, édité par WAN SOFT.
        </p>
        <p>L'utilisation du Site implique l'acceptation pleine et entière des présentes CGU.</p>
      </Section>

      <Section title="Description du service">
        <p>
          WAN SHAPE est un service gratuit proposant des séances d'exercices physiques quotidiennes. Le Site met à
          disposition des suggestions d'exercices guidées avec minuteur intégré, sans équipement nécessaire.
        </p>
        <p>
          La création d'un compte est optionnelle. Elle permet de sauvegarder son historique de séances et de suivre sa
          progression.
        </p>
      </Section>

      <Section title="Nature du contenu">
        <p>
          <strong className="text-strong">
            WAN SHAPE est un service de contenu éditorial et informationnel relatif à l'activité physique.
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

      <Section title="Accès au service">
        <p>
          Le service est accessible gratuitement à toute personne disposant d'un accès à Internet et d'un navigateur web
          compatible. L'accès aux séances ne nécessite pas de compte. WAN SOFT se réserve le droit de suspendre ou
          d'interrompre le service à tout moment, sans préavis ni indemnité.
        </p>
      </Section>

      <Section title="Compte utilisateur">
        <p>
          La création d'un compte est facultative et gratuite. Elle nécessite une adresse email valide et un mot de
          passe. L'utilisateur est responsable de la confidentialité de ses identifiants.
        </p>
        <p>
          L'utilisateur peut demander la suppression de son compte à tout moment en contactant{' '}
          <a href="mailto:erwan.viot@wan-soft.fr" className="text-link underline">
            erwan.viot@wan-soft.fr
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
        <p>Avant d'utiliser WAN SHAPE, il est indispensable de :</p>
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
        <p>Les mineurs doivent obtenir l'accord de leur représentant légal avant toute utilisation.</p>
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
        <p>En utilisant WAN SHAPE, l'utilisateur déclare :</p>
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
          <a href="mailto:erwan.viot@wan-soft.fr" className="text-link underline">
            erwan.viot@wan-soft.fr
          </a>
        </p>
      </Section>
    </>
  );
}
