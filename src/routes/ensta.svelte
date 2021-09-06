<!--
      Special landing page for ENSTA
-->

<Page shortTitle="ENSTA"
      title="ENSTA" >

  <div class='w3-panel w3-border w3-sand w3-xxlarge'>
    Ce site est réservé aux élèves de l'ENSTA ParisTech
  </div>

  <h2> Comment se connecter ? </h2>
  <p>
    Il n'y a actuellement pas de connexion possible à CodeGradX avec
    vos identifiants de l'ENSTA, il faut donc, lors de votre première
    connexion, initialiser votre relation avec CodeGradX comme suit:
  </p>

  <ol>
    <li>
      Cliquez sur le bouton « connexion » ci-dessous.
    </li>
    <li>
      Dans le formulaire qui apparaîtra, renseignez votre courriel
      officiel (celui ressemblant à <code>xx@ensta-paris.fr</code>)
      puis cliquez sur le bouton « j'ai perdu mon mot de passe! ».
    </li>
    <li>
      Vous recevrez alors un courriel avec un lien temporaire vous
      permettant de finaliser votre inscription.
    </li>
    <li>
      Acceptez les <a href='/apropos'>conditions d'usage</a>
      qui, en gros, stipulent que vous
      donnez vos programmes à la science (ce qui permet aux auteurs
      des exercices de les améliorer).
    </li>
    <li>
      Vous pouvez maintenant contempler les nombreux exercices qui
      vous sont proposés.
    </li>
    <li>
      Afin de pouvoir vous re-connecter aisément les fois suivantes,
      pensez alors à modifier votre profil et indiquer un mot de
      passe.
    </li>
    <li>
      Bon codage!
    </li>
  </ol>

  <div class='w3-center'>
    <a class="w3-btn w3-theme-d2 w3-round-xxlarge"
       href='/lostpassword'>
      Connexion
    </a>
  </div>
  
</Page>

<script>
 import Page from '../components/Page.svelte';
 
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { initializePerson, goto }
   from '../client/lib.mjs';

 let campaignName = 'ensta-2021';

 onMount(async () => {
   try {
     $person = await initializePerson();
     if ( $person ) {
       goto(`/results/${campaignName}`);
     }
   } catch (exc) {
     console.log(`Problem ensta`, {exc});
   }
 });

</script>
