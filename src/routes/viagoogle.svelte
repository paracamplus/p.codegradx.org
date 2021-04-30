<!--
       Button to process authentication via Google.
       With a foreword to warn about cookies.
-->

<style>
</style>

<Page shortTitle="ViaGoogle"
      title="Se connecter via Google" >
  
  <div>
    <p>
      S'inscrire ou s'identifier via Google est aisé, facile, pratique
      mais a des conséquences. CodeGradX n'affiche pas de publicité et
      n'utilise pas de captchas fournies par des tiers,
      l'infrastructure CodeGradX est ainsi respectueuse du RGPD. 
    </p>
    <p>
      Si vous passez par Google, votre nom de connexion sera le
      courriel connu par Google. Au passage, CodeGradX récupèrera vos
      nom, prénom et courriel. Vous y gagnerez aussi quelques cookies
      que Google utilise mais que CodeGradX n'exploite pas.
    </p>
    
    <div class="w3-center w3-margin-top">
      <a href={oauth2url} name="viaGoogle"
         class="w3-btn w3-theme-d2 w3-round-xxlarge"
         >via Google</a>
    </div>
  </div>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import InformationSign from '../components/InformationSign.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';

 import { person, lastmessage } from '../stores.mjs';
 import { initializePerson, goto, isUser  } from '../client/lib.mjs';
 import { onClient } from '../common/utils.mjs';

 let oauth2url = '/to/be/filled';

 onClient(async () => {
   const maybeperson = await initializePerson();
   if ( isUser(maybeperson) ) {
     $person = maybeperson;
     $lastmessage = 
       `Bonjour ${$person.pseudo}, je vous ai reconnu !`;
     goto('/universes');
     return;
   }
   // compute the url "via Google":
   const origin = window.document.location.origin;
   oauth2url = 'https://x.codegradx.org';
   oauth2url += `/googleopenid`;
   oauth2url += `?homeUrl=${origin}`;
   oauth2url += `&nofinalredir=1`;
   oauth2url += `&origin=${origin}`;
 });
 // NOTA use x.codegradx.org or use CodeGradX.sendXserver ?

</script>
