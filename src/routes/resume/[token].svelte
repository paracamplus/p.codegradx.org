<!--
         resume/[token]

     This page is displayed for new users who entered their email
     and solve the captcha.

-->

<style>
</style>

<Page shortTitle="Courriel à confirmer"
      title="Confirmation de courriel" >
    
  <p> Bonjour {#if $person}<span class='personName'>
    {$person.login || $person.email}</span>{/if}
  </p>

  {#if $person}
    {#if $person.confirmedemail}
    <p> Vous avez déjà confirmé votre adresse électronique! </p>
      {#if $person.confirmedua === $person.uaversion}
        <p> Vous avez déjà signé les conditions d'usage. </p>
        <p> Veuillez vous identifier ou concéder que vous avez oublié
          votre mot de passe ? </p>

        <div class="w3-center w3-margin-top">
          <a class="w3-btn w3-theme-d2 w3-round-xxlarge"
             href={buildGoto('/connect')}>
            Je m'identifie!
          </a>
        </div>
        
      {:else}
      <p> Vous n'avez pas encore signé les conditions d'usage. </p>
      {/if}

    {:else}
    <p> J'attends donc que vous confirmiez votre adresse électronique en
      cliquant sur le lien qui vient de vous être envoyé par courriel ce
      qui vous permettra de progresser dans votre inscription. Vous
      pourrez également recharger cette page.
    </p>
    {/if}
  {:else}
    <p> Veuillez d'abord vous identifier! </p>
  {/if}

  {#if error}<Problem bind:error={error} />{/if}
    
</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import ShowStore from '../../components/ShowStore.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, lastmessage } from '../../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, goto, buildGoto, isUser }
   from '../../client/lib.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { onClient } from '../../common/utils.mjs';

 let error = undefined;

 onClient(async () => {
   const maybeperson = await initializePerson();
   //console.log('enroll1', {maybeperson});//DEBUG
   if ( isUser(maybeperson) ) {
     $person = maybeperson;
     $lastmessage = error =
       "Comme j'ai vu qui vous êtes, je vous emmène vers une meilleure page!";
     goto('/universes');
   } else if ( maybeperson ) {
     if ( maybeperson.confirmedemail ) {
       if ( maybeperson.confirmedua < maybeperson.uaversion ) {
         goto('/signua');
       }
     }
   } else {
     $lastmessage = error = `Veuillez d'abord vous identifier!`; //'
     goto('/connect');
   }
 });

</script>
