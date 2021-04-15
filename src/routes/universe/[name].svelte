<!--
      Display the exercises of a campaign. It does not require
      to be authenticated however to discover the stem of an exercise
      require to be authenticated.
-->

<style>
</style>

<Page shortTitle={campaignName}
      title=""
      showheader={false} >

   <header class='w3-center w3-margin-bottom bold'>
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

  <LastMessage />
  
  {#if error}<Problem bind:error={error} />{/if}

  {#if showAuthentication && ! $person}
  <div class='w3-container'>
    <div class='w3-center w3-animate-zoom'>
      <a class='w3-btn w3-center w3-round-xlarge w3-theme-d4'
         href={buildGoto('connect')}>
        Je m'identifie...
      </a>
    </div>
  </div>
  {/if}

  {#if isCampaign($campaign)}
    <ExercisesList on:authenticate={authenticate} />
  {:else if ! error}
     <p class='waitingMessage'>Chargement de la liste d'exercices...</p>
     <WaitingImage />
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import ExercisesList from '../../components/ExercisesList.svelte';
 import LastMessage  from '../../components/LastMessage.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/campaign';
 import { sleep, onClient } from '../../common/utils.mjs';
 import { person, campaign, lastmessage } from '../../stores.mjs';
 import { initializePerson, isCampaign, goto } from '../../client/lib.mjs';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { buildGoto } from '../../client/lib.mjs';

 let error = undefined;
 let campaignName = '...';
 let showAuthentication = false;
 
 onClient(async () => {
   const uri = window.document.location.pathname;
   campaignName = uri.replace(/^(.*\/)?universe\/([^\/]+)/, '$2');
   try {
     $person = await initializePerson();
     $campaign = await fetchCampaign($person, campaignName);
     if ( ! $campaign ) {
       $lastmessage = `Je ne vois pas d'univers ainsi nommé!
Veuillez donc choisir un nouvel univers.`; //'
       goto('/universes');
     }
   } catch (exc) {
     console.log('universe', {exc});
     error = parseAnomaly(exc);
   }
 });

 async function authenticate (event) {
   error = event.detail;
   showAuthentication = true;
   await sleep(5);
   error = undefined;
 }

</script>
    
