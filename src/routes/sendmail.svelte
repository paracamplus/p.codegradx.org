<!--
      Tell the new potential user that he should confirm his email.
-->

<Page shortTitle="ConfirmationCourriel"
      title="Confirmation de courriel">

<section class='w3-container'>
{#if $person}
  {#if sendmail}
  <p>
    Vous n'avez pas encore confirmé votre adresse électronique:
    Cliquez sur le bouton ci-dessous pour que vous soit envoyé
    un courriel adressé à <code>{$person.email}</code>.
    Ce courriel contiendra un lien vous permettant de progresser dans
    votre inscription à CodeGradX. 
  </p>
  <div class='w3-center'>
    <button class="w3-btn w3-theme-d2 w3-round-xxlarge"
            on:click={lostpassword} >
      M'envoyer un courriel
    </button>
  </div>
  
  {:else}
  <p>
    Un courriel vient de vous être adressé. Vous pourrez cliquer sur le
    bouton ci-dessous après avoir confirmé votre adresse électronique.
  </p>
  <div class='w3-center'>
    <a class="w3-btn w3-theme-d2 w3-round-xxlarge"
       href={buildGoto('/universes')} >
      Je continue
    </a>
  </div>
  {/if}

{:else}
  <p>
    Je n'ai aucune idée de qui vous êtes ?
    Pouvez-vous tenter de vous identifier ...
  </p>
  
  {#if showauthentication}
  <div class='w3-container'>
    <div class='w3-center w3-animate-zoom'>
      <a class='w3-btn w3-center w3-round-xlarge w3-theme-d4'
         href={buildGoto('/connect')} >
        Je m'identifie...
      </a>
    </div>
  </div>
  {/if}
  
{/if}

{#if error}<Problem bind:error={error} />{/if}
</section>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import ShowStore from '../components/ShowStore.svelte';

 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, buildGoto, goto } from '../client/lib.mjs';
 import { sleep } from '../common/utils.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';

 let sendmail = true;
 let error = undefined;
 let showauthentication = false;
 
 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     showauthentication = true;
   }
 });

 async function lostpassword (event) {
   try {
     const login = $person.email;
     if ( ! login || login === '' ) {
       error = "Quel est votre courriel ?";
       return;
     }
     const state = CodeGradX.getCurrentState();
     $person = await state.userGetLink(login);
     sendmail = false;
   } catch (exc) {
     error = "Je ne vois pas qui vous êtes !";
   }
 }

 async function XXXresume (event) {
   try {
     // Redirect to the /universes page with renewed credentials:
     let url = `/fromp/reconnect/${$person.token}` +
               `?site=${window.document.location.origin}/universes`;
     const response = await CodeGradX.getCurrentState().sendAXServer('x', {
       path: url,
       method: 'GET',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/x-www-form-urlencoded'
       }
     });
     if ( response.ok ) {
       // Never reached since redirection should have occurred!
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('sendmail', {exc});
     error = parseAnomaly(exc);
   }
 }
 
</script>
