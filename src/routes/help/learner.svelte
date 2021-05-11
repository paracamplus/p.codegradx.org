<!--  
        display some help for learners
-->

<style>
</style>

<Page shortTitle="Aide/apprenant"
      title="Aide pour apprenants" >

<section class='w3-container w3-padding'>

<p>

Une fois <a href={buildGoto('/help/connect')}>connu de CodeGradX</a>,
vous avez accès à l'ensemble des
exercices de programmation à notation automatisée publics. Ces
exercices sont regroupés en univers centrés autour d'un langage
de programmation, d'un cours ou d'un MOOC. 

</p>

<section>
 <header> Démarche </header>
 <p> La démarche est simple: </p>

 <ul>
   <li> Choisissez un univers parmi les univers publics, ouverts à tous,
     ou parmi les univers dans lesquels vous êtes inscrit. </li>
   <li> Choisissez un exercice. Ceux-ci sont classés par thèmes ou
     par difficulté croissante. </li>
   <li> Lisez l'énoncé et récupérez (s'il y en a) les fichiers complémentaires
     qui sont fournis. </li>
 </ul>
 
</section>

<section>
  <header> Résolution </header>
  <p>

    Certains exercices s'affichent accompagnés d'un éditeur de texte
    permettant de composer son programme dans le navigateur même.
    Parfois, cet éditeur vient aussi avec un bouton permettant
    l'exécution de ce programme dans le navigateur même: il n'y a donc
    rien à installer sur son ordinateur.
    
  </p>
  <p>

    Même si un éditeur en ligne est fourni, il est souvent possible
    d'utiliser son propre environnement de développement pour produire
    le (ou les) fichier(s) demandé(s) qu'il faut envoyer à CodeGradX
    avec le bouton « envoyer fichier » associé. Dans ce cas, vous
    devez disposer, sur l'ordinateur sur lequel vous travaillez, d'un
    environnement de développement avec les outils afférents à savoir
    éditeur, évaluateur (interprète ou compilateur), etc.
    
  </p>
  <p>

    Certains exercices demandent plusieurs fichiers auquel cas, il vous
    est demandé de les regrouper en un seul fichier (un <code>.tar.gz</code>
    ou un <code>.zip</code>) pour le transmettre. L'énoncé vous renseigne
    pour ce faire.
    
  </p>
</section>

<section>
  <header> Notation </header>
  <p>
    
    Une fois votre programme écrit et, si possible, testé, vous
    l'envoyez à CodeGradX pour notation. Dans la plupart des cas, la
    notation prend une trentaine de secondes et s'affiche avec une
    note. Le rapport de notation vous aide, normalement, à comprendre
    les raisons menant à la note obtenue.
    
  </p>
  <p>
    
    Si vous pensez que le rapport de notation n'est pas cohérent avec
    l'énoncé de l'exercice, parlez-en au premier auteur de l'exercice.
  </p>
</section>

<section>
  <header> Historique, Résultats </header>
  <p>

    En tant qu'apprenant, vous avez accès à votre historique et à vos
    résultats. L'historique montre tous les programmes qui ont été
    notés au sein de l'univers courant. Les résultats vous donnent un
    aperçu, semblable à la liste des exercices d'un univers, des
    exercices que vous avez entamés ou résolus.

  </p>
</section>

<section>
  <header> Profil </header>
  <p>

    La page de profil affiche vos nom, prénom, pseudo, courriel, nom
    de connexion, ainsi que les univers où vous êtes inscrits. Vous
    pouvez modifier vos nom, prénom, pseudo et courriel mais pas votre
    nom de connexion (usuellement le courriel avec lequel vous vous
    êtes inscrit initialement).
    
  </p>
</section>

</Page>

<script>
 import Page from '../../components/Page.svelte';
 
 import { buildGoto } from '../../client/lib.mjs';
</script>
