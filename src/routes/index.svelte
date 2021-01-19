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
  <center>
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
  </center>
</div>

<script>
 import SplashImage from '../components/SplashImage.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { isUser, sleep, initializePerson } from '../client/lib.mjs';

 function go (event) {
   sapper.goto('/universes');
 }

 onMount(async () => {
   return initializePerson()
   .then(async () => {
     return sapper.goto('/universes');
   });
 });

 
</script>
