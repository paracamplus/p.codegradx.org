<style>
 div.background {
   background-color: var(--color-theme-d4);
   min-height: 100vh;
 }
 p.text, div.text {
   color: white;
   font-size: 200%;
 }
 span.marquee {
   animation: marquee 1s infinite linear;
 }
 @keyframes marquee {
   0%   {opacity: 1;}
   50%  {opacity: 0;}
   100% {opacity: 1;}
</style>

<svelte:head>
  <title>CodeGradX - Exercices de programmation</title>
</svelte:head>

<div class='w3-container background'
     on:click={pursue} >
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
      automatique <span class='marquee'>...</span>
    </p>
  </div>
</div>

<script>
 import SplashImage from '../components/SplashImage.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, config } from '../stores.mjs';
 import { isUser, initializePerson, configureConfig, goto }
   from '../client/lib.mjs';

 onMount(async () => {
   /* no await */ sapper.prefetchRoutes(['/universes']);
   $config = configureConfig();
   $person = await initializePerson();
   return pursue();
 });

 async function pursue (event) {
   const host = window.document.location.hostname
          .replace(/^([^.]+)[.].*$/, '$1');
   if ( host.match(/^(test)?p$/) ) {
     return goto('/universes');
   } else if ( $config.homepage ) {
     return goto($config.homepage);
   } else {
     return goto(`/universe/${host}`);
   }
 }   
 
</script>
