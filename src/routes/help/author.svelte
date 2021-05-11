<!--  
        display some help for authors
-->

<style>
</style>

<Page shortTitle="Aide/auteur"
      title="Aides pour auteur" >

<section class='w3-container w3-padding'>

  <Problem bind:error={error} />

  <p>

  La qualité d'auteur n'est pas donnée à tout le monde. Concevoir un
  exercice n'est pas trivial car cela nécessite d'écrire des
  programmes pour noter des programmes. Cela ressemble, parfois, un
  peu à du test unitaire.

  </p> <p>

  Un item de menu permet de soumettre de nouveaux exercices ou de
  mettre à jour d'anciens exercices. Lorsque l'exercice est déployé,
  un enseignant peut l'incorporer dans un univers.

  </p> <p>

  Un exercice a un nom, ce nom doit débuter par un des préfixes dont
  dispose l'auteur (ces préfixes apparaissent dans le profil). Lorsque
  l'exercice est déployé il est identifié par un identifiant unique
  (techniquement un UUID). Lorsqu'un jeu d'exercices mentionne un nom,
  c'est l'exercice portant ce nom et possédant le plus récent UUID qui
  sera sélectionné. Un jeu d'exercices peut aussi mentionner un UUID
  pour imposer la version choisie de l'exercice.

  </p>

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
   if ( $person && ! $person.isauthor ) {
     error = `Vous n'êtes pas auteur mais vous pouvez 
quand même lire cette documentation.`;
   }
 });
 
</script>
