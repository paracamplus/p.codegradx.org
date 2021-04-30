<!--
      Information asking to confirm email
-->

<style>
</style>

<Page shortTitle="ConfirmationCourriel"
      title="Connexion à CodeGradX" >

{#if $person}
   <p>
     Si <code class='personName'>{$person.login}</code> est connu
     de CodeGradX, alors un courriel vient de lui être adressé.
     {#if ! $person.confirmedemail}
     Ce courriel contient un lien vous permettant de confirmer
     votre adresse électronique. Pensez ensuite à vous munir
     d'un mot de passe.
     {:else}
     Ce courriel contient un lien vous permettant de vous connecter
     à nouveau à CodeGradX.
     {/if}
     Pensez éventuellement à vérifier votre spam! 
   </p>

{:else}

  <p> Je ne sais qui vous êtes aussi vous redirigé-je vers la
    page appropriée...
  </p>

{/if}

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import ShowStore from '../components/ShowStore.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, lastmessage } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, goto, isUser } from '../client/lib.mjs';
 import { onClient } from '../common/utils.mjs';

 onClient(async () => {
   const maybeperson = await initializePerson();
   if ( isUser(maybeperson) ) {
     $person = maybeperson;
     $lastmessage = 
       `Bonjour ${$person.pseudo}, je vous épargne cette étape
puisque je vous connais déjà !`;
     goto('/universes');
     return;
   }
   // If coming from /connect, then $person is a partial user:
   if ( ! $person ) {
     $lastmessage = "Veuillez d'abord vous identifier!";
     goto('/connect');
   }
 });
 
</script>
