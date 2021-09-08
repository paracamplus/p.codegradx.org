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
 import { initializePerson, goto, isUser } from '../../client/lib.mjs';
 import { fetchCampaign, register_in_open_campaign }
    from '../../client/campaignlib.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { onClient } from '../../common/utils.mjs';

 let error = undefined;
 let campaignName = '';
 let campaignTitle = '';

 onClient(async () => {
   const uri = window.document.location.pathname;
   const campaignName = uri.replace(/^(.*\/)?results\/([^\/]+)/, '$2');
   campaignTitle = 'dans ' + campaignName;
 
   const maybeperson = await initializePerson();
   if ( ! isUser(maybeperson) ) {
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     goto('/connect');
     return;
   } else {
     $person = maybeperson;
   }
   
   let _campaign = await fetchCampaign($person, campaignName);
   if ( _campaign ) {
     // ATTENTION: $person may not be enrolled in $campaign if
     // $campaign is an open campaign
     try {
       $person = await register_in_open_campaign($person, _campaign);
       $campaign = _campaign;
     } catch (response) {
       $lastmessage = error = `Je n'ai pas réussi à vous inscrire
dans l'univers ${campaignName} !?`;
       return goto('/universes');
     }
   } else {
     if ( campaignName ) {
       $lastmessage = error = `Vous ne semblez pas faire partie des
apprenants de l'univers ${campaignName} !`; //'
     } else {
       $lastmessage = error = "Veuillez d'abord choisir un univers! ...";
       return goto('/universes');
     }
   }
   campaignTitle = `dans ${campaignName}`;
 });
 
</script>
