<style>
 header.bold {
   font-weight: bold;
 }
</style>

<svelte:head>
  <title>CodeGradX/Identification</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <div class='w3-margin-top w3-padding'>
    <header class='w3-center w3-large bold'>
      Se connecter via Google
    </header>

    <p>
      S'inscrire ou s'identifier via Google est aisé, facile, pratique
      mais a des conséquences. CodeGradX n'affiche pas de publicité et
      n'utilise pas de captchas fournies par des tiers,
      l'infrastructure CodeGradX est ainsi respectueuse du RGPD. 
    </p>
    <p>
      Si vous passez par Google, votre nom de connexion sera le
      courriel connu par Google. Au passage, CodeGradX récupèrera vos
      nom, prénom et courriel. Vous gagnerez aussi quelques cookies
      que CodeGradX n'exploite pas.
    </p>
    
    <div class="w3-center w3-margin-top">
      <a href={oauth2url} name="viaGoogle"
         class="w3-btn w3-theme-d1 w3-round-xxlarge"
         >via Google</a>
    </div>
    
  </div>
</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import InformationSign from '../components/InformationSign.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { getConfig, initializePerson } from '../client/lib.mjs';

 let oauth2url = '/to/be/filled';

 onMount(async () => {
   return initializePerson()
     .then(async () => {
     // compute the url "via Google":
     oauth2url = getConfig().x.url;
     oauth2url += `/googleopenid`;
     oauth2url += `?homeUrl=${origin}`;
     oauth2url += `&nofinalredir=1`;
     oauth2url += `&origin=${origin}`;
   });
 });

</script>
