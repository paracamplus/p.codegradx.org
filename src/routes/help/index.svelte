
<style>
 div.row {
   display: flex;
   flex-direction: row;
   flex-wrap: wrap;
   justify-content: center;
 }
 div.row div {
   margin-left: 1em;
 }
</style>

<Page shortTitle="Aides"
      title="Aides en tout genre" >

<section class='w3-container w3-padding'>

  <div class='row'>
    <div><a class="w3-btn w3-theme-l4 w3-round-xlarge"
            href={buildGoto('help/connect')}>Comment s'identifier?</a></div>
    
    <div><a class="w3-btn w3-theme-l4 w3-round-xlarge"
            href={buildGoto('help/learner')}>Aide pour apprenant</a></div>

    <div><a class="w3-btn w3-theme-l4 w3-round-xlarge"
            href={buildGoto('help/teacher')}>Aide pour enseignants</a></div>
    
    <div><a class="w3-btn w3-theme-l4 w3-round-xlarge"
            href={buildGoto('help/author')}> Aide pour auteurs</a></div>

  </div>

</section>

</Page>

<script>
 import Page from '../../components/Page.svelte';
 
 import { buildGoto, initializePerson } from '../../client/lib.mjs';
 import { onMount } from 'svelte';
 import { person, campaign } from '../../stores.mjs';
 import { isUser, isTeacher } from '../../client/lib.mjs';
 import { fetchCampaign } from '../../client/campaignlib.mjs';

 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $campaign ) {
     $campaign = await fetchCampaign($person, 'free');
   }
 });

</script>
