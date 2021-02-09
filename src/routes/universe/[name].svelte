<style>
 .bold {
   font-weight: bolder;
   font-size: 120%;
  }
</style>

<svelte:head>
  <title>CodeGradX/{name}</title>
</svelte:head>

<Header />

<section class='w3-container'>
 <div class='w3-margin-top w3-padding'>
   <header class='w3-center'>
     {#if ! campaign}
     <span>Les exercices de {name}</span>
     {:else}
     <div class='bold'>
       {campaign.title}
     </div>
     <div>
       du {CodeGradX.Date2str(campaign.starttime).replace(/ .*$/, '')}
       au {CodeGradX.Date2str(campaign.endtime).replace(/ .*$/, '')}
     </div>
     {/if}
  </header>

  <div transition:fade><Problem bind:error={error} /></div>

  {#if showAuthentication}
  <div class='w3-container'>
    <div class='w3-center w3-animate-zoom'>
      <a class='w3-btn w3-center w3-round-xlarge w3-theme-d4'
         href='/connect'>
        Je m'identifie...
      </a>
    </div>
  </div>
  {/if}

  {#if campaign}
  <ExercisesList campaign={campaign} on:authenticate={authenticate} />
  {/if}

 </div>
</section>

<Bottom />

<script>
 import Header from '../../components/Header.svelte';
 import Problem from '../../components/Problem.svelte';
 import ExercisesList from '../../components/ExercisesList.svelte';
 import Bottom from '../../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/campaign';
 import { sleep } from '../../common/utils.mjs';
 import { fade } from 'svelte/transition';

 let error = undefined;
 let name = undefined;
 let campaign = undefined;
 let showAuthentication = false;
 
 onMount(async () => {
   try {
     let uri = window.document.location.pathname;
     name = uri.replace(/^(.*\/)?universe\/([^\/]+)/, '$2');
     campaign = await fetchCampaign(name);
     if ( ! campaign ) {
       error = "Je ne vois pas d'univers ainsi nommé!";
     }
   } catch (exc) {
     error = exc.toString();
     console.log(exc);
   } 
 });

 async function fetchCampaign (name) {
   const state = CodeGradX.getCurrentState();
   const campaigns = await state.getOpenCampaigns();
   const campaign = campaigns[name];
   return campaign;
 }

 async function authenticate (event) {
   error = event.detail;
   showAuthentication = true;
   await sleep(5);
   error = undefined;
 }

</script>
    
