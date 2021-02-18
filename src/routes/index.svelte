<style>
 div.background {
   background-color: #20295b;
   min-height: 100vh;
 }
 p.text, div.text {
   color: white;
   font-size: 200%;
 }
</style>

<svelte:head>
  <title>CodeGradX</title>
</svelte:head>

<div class='w3-container background'
     on:click={go} >
  <div class='w3-center'>
    <div class='text' style='padding-top: 10vh;'>
      CodeGradX
    </div>

    <div style='margin-top: 10vh;'>
      <SplashImage size='25%'/>
    </div>

    {#if isUser($person)}
    <p class='text'>
      Bonjour {$person.pseudo},
    </p>
    {/if}
    
    <p class='text'>
      Découvrez ses exercices de programmation à notation
      automatique...
    </p>
  </div>
</div>

<script>
 import SplashImage from '../components/SplashImage.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, config } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { isUser, initializePerson, configureConfig } from '../client/lib.mjs';
 import { sleep } from '../common/utils.mjs';

 function go (event) {
   sapper.goto('/universes');
 }

 onMount(async () => {
   $config = configureConfig();
   $person = await initializePerson();
   const host = window.document.location.hostname
          .replace(/^([^.]+)[.].*$/, '$1');
   if ( host.match(/^(test)?p$/) ) {
     return sapper.goto('/universes');
   } else {
     return sapper.goto(`/universe/${host}`);
   }
 });
 
</script>
