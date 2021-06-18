<!--
      Display the exercises of a campaign. It does not require
      to be authenticated however to discover the stem of an exercise
      require to be authenticated.
-->

<style>
</style>

<Page shortTitle={campaignName}
      title="Les exercices de {campaignName}" >

  <LastMessage />

  {#if isCampaign($campaign)}
  <p class='smallHint'>
    L'univers {$campaign.name} a débuté le
    {CodeGradX.Date2str($campaign.starttime).replace(/ .*$/, '')}
    et s'achèvera le 
    {CodeGradX.Date2str($campaign.endtime).replace(/ .*$/, '')}.
  </p>
  {/if}
  
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
     <WaitingImage message="Chargement de la liste d'exercices..." />
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
 import { sleep } from '../../common/utils.mjs';
 import { person, campaign, lastmessage } from '../../stores.mjs';
 import { initializePerson, isCampaign, goto, isUser }
   from '../../client/lib.mjs';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { buildGoto } from '../../client/lib.mjs';

 let error = undefined;
 let campaignName = '...';
 let showAuthentication = false;
 
 onMount(async () => {
   const uri = window.document.location.pathname;
   campaignName = uri.replace(/^(.*\/)?universe\/([^\/]+)/, '$2');
   try {
     $person = await initializePerson();
     let _campaign = await fetchCampaign($person, campaignName);
     if ( $person ) {
       if ( _campaign ) {
         //console.log('universe', {person: $person, campaign: $campaign});
         goto(`/results/${_campaign.name}`);
       } else {
         $lastmessage = `Je ne vois pas d'univers ainsi nommé!
Veuillez donc choisir un nouvel univers.`; //'
         goto('/universes');
       }
     } else if ( _campaign ) {
       $campaign = _campaign;
       showAuthentication = true;
     } else {
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
    
