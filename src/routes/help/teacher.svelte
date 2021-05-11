<!--  
        display some help for teachers
-->

<style>
</style>

<Page shortTitle="Aide/enseignant"
      title="Aides pour enseignant" >

<section class='w3-container w3-padding'>

  <Problem bind:error={error} />

  <p>

    À tout univers est associé au moins un enseignant qui peut gérer
    cet univers c'est-à-dire effectuer un grand nombre d'opérations
    sur cet univers:

  </p>
  <ul>
    <li> définir les exercices </li>
    <li> définir les apprenants </li>
    <li> définir les enseignants </li>
    <li> consulter les progrès des apprenants </li>
    <li> consulter les statistiques </li>
    <li> voir les dernières notifications </li>
  </ul>

  <p>

    Les univers sont créés à la demande pour les clients de CodeGradX.
    Ils deviennent ainsi enseignant de ces nouveaux univers. Il est
    usuel de créer un univers par session de cours afin que les
    statistiques ne concernent qu'une unique cohorte d'apprenants.
    
  </p>

  <section>
    <header> Exercices </header>
    <p>

      Un jeu d'exercices est défini par un fichier YAML. Les exercices
      peuvent être mis en groupes, des textes peuvent préfixer ou
      suffixer les groupes d'exercices. 

    </p>
  </section>

  <section>
    <header> Apprenants et enseignants </header>
    <p>

      Il est possible d'ajouter de nouveaux apprenants par fichier ou
      à la main. Une fois ajoutés, on peut les promouvoir comme
      enseignant ou les supprimer de la liste des apprenants. Le
      fichier des apprenants est formé de lignes contenant le courriel
      suivi optionnellement de nom, prénom, pseudo.

    </p>
  </section>

  <section>
    <header> Progrès </header>
    <p>

      Dans la liste des apprenants, il est possible de consulter
      l'historique des réponses de l'apprenant, c'est-à-dire
      l'ensemble des réponses de cet apprenant pour les exercices de
      l'univers.

    </p>
    <p>

      À partir de la liste des exercices, il est aussi possible de
      consulter la liste des réponses des apprenants par rapport à cet
      exercice.

    </p>
  </section>

  <section>
    <header> Lots </header>
    <p>

      Il est possible de soumettre un lot de copies (regroupés en un
      .tar.gz) pour un exercice. C'est, par exemple, utile pour
      traiter les réponses à un examen.

    </p>
  </section>
  
  <section>
    <header> Statistiques </header>
    <p>

      Plusieurs statistiques sont proposées par apprenant, par
      exercice ou par jour.

    </p>
  </section>

  <section>
    <header> Notifications </header>
    <p>

      Les notifications montrent les dernières activités des
      apprenants au sein de l'univers. 
      
    </p>
  </section>  

</section>

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 
 import { buildGoto, initializePerson } from '../../client/lib.mjs';
 import { onMount } from 'svelte';
 import { person, campaign } from '../../stores.mjs';
 import { isUser, isTeacher } from '../../client/lib.mjs';
 import { fetchCampaign } from '../../client/campaignlib.mjs';

 let error;

 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $campaign ) {
     $campaign = await fetchCampaign($person, 'free');
   }
   if ( $person && $campaign && ! isTeacher($campaign, $person) ) {
     error = `Vous n'êtes pas enseignant mais vous pouvez 
quand même lire cette documentation.`;
   }
 });
 
</script>
