<style>
</style>

<Page shortTitle={campaignName}
      title=""
      showheader={false} >

   <header class='w3-center w3-margin-bottom'>
     {#if ! $campaign}
     <span>Les exercices de {campaignName}</span>
     {:else}
     <div class='bold'>
       {$campaign.title}
     </div>
     <div>
       du {CodeGradX.Date2str($campaign.starttime).replace(/ .*$/, '')}
       au {CodeGradX.Date2str($campaign.endtime).replace(/ .*$/, '')}
     </div>
     {/if}
  </header>

  <div transition:fade><Problem bind:error={error} /></div>

  {#if showAuthentication && ! $person}
  <div class='w3-container'>
    <div class='w3-center w3-animate-zoom'>
      <a class='w3-btn w3-center w3-round-xlarge w3-theme-d4'
         href='/connect'>
        Je m'identifie...
      </a>
    </div>
  </div>
  {/if}

  {#if $campaign}
  <ExercisesList on:authenticate={authenticate} />
  {:else}
  <WaitingImage />
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import ExercisesList from '../../components/ExercisesList.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/campaign';
 import { sleep } from '../../common/utils.mjs';
 import { fade } from 'svelte/transition';
 import { person, campaign } from '../../stores.mjs';
 import { initializePerson } from '../../client/lib.mjs';

 let error = undefined;
 let campaignName = '...';
 let showAuthentication = false;
 
 onMount(async () => {
   try {
     $person = await initializePerson();
     let uri = window.document.location.pathname;
     campaignName = uri.replace(/^(.*\/)?universe\/([^\/]+)/, '$2');
     $campaign = await fetchCampaign(campaignName);
     if ( ! $campaign ) {
       error = "Je ne vois pas d'univers ainsi nommé!";
       await sleep(3);
       sapper.goto('/universes');
     }
   } catch (exc) {
     error = exc.toString();
     console.log(exc);
   } 
 });

 async function fetchCampaign (campaignName) {
   const state = CodeGradX.getCurrentState();
   if ( $person ) {
     try {
       const campaign = await $person.getCampaign(campaignName);
       return campaign;
     } catch (_) {
       return undefined;
     }
   } else {
     const campaigns = await state.getOpenCampaigns();
     const campaign = campaigns[campaignName];
     return campaign;
   }
 }

 async function authenticate (event) {
   error = event.detail;
   showAuthentication = true;
   await sleep(5);
   error = undefined;
 }

</script>
    
