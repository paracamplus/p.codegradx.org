<!--
      Display the synthetized results of the user
-->

<Page shortTitle="Résultats/{campaignName}"
      title="Mes résultats {campaignTitle}">

  <Problem bind:error={error} />

  {#if $campaign}
  <Results bind:person={$person}
           bind:campaign={$campaign} />
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import Results from '../../components/Results.svelte';
  
 import { onMount } from 'svelte';
 import { person, campaign, lastmessage } from '../../stores.mjs';
 import { initializePerson, goto } from '../../client/lib.mjs';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';

 let error = undefined;
 let campaignName = '';
 let campaignTitle = '';

 onMount(async () => {
   const uri = window.document.location.pathname;
   const campaignName = uri.replace(/^(.*\/)?results\/([^\/]+)/, '$2');
   campaignTitle = 'dans ' + campaignName;
 
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     goto('/connect');
     return;
   }
   $campaign = await fetchCampaign($person, campaignName);
   if ( ! $campaign ) {
     $lastmessage = error = "Veuillez d'abord choisir un univers! ...";
     goto('/universes');
     return;
   }
   campaignTitle = `dans ${$campaign.name}`;
 });
 
</script>
