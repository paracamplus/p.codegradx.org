<style>
 header.padding {
   padding: 0px 1em 0px 1em;
 }
</style>

<section class='w3-container w3-center w3-modal'
         style='display:block' >
  <div class='w3-modal-content w3-animate-top w3-border'>
    <header class='w3-xlarge w3-theme-l2 padding'>
      <span> Comment s'enregistrer... </span>
      <span class='w3-right w3-margin-left'
            on:click={close}>&#x2716;</span>
    </header>
    <div class='w3-container w3-margin w3-left-align'>
      <p>
        Vous voulez vous créer un compte sur CodeGradX afin d'avoir accès
        aux exercices de programmation ? Bienvenue à CodeGradX!
      </p>
      <ol>
        <li> Renseignez d'abord votre courriel qui deviendra votre nom
          de connexion et attendez un courriel pour confirmer votre
          adresse. Si vous utilisez une adresse Google, vous pourrez
          (une fois votre compte créé) vous identifier via Google.
        </li>
        <li> Une fois votre adresse électronique confirmée, vous aurez
          à signer les
          <a href='/ua'>
            conditions d'usage</a> de
          CodeGradX (en gros, vous donnez à la Science, vos réponses
          aux exercices proposés). </li>
        <li> Mettez à jour votre profil et notamment votre mot de passe.
          Vous pouvez sauter cette étape lorsque vous vous connecterez
          plus tard via Google. </li>
        <li> Et maintenant, codez! </li>
      </ol>
    </div>
  </div>
</section>

<script>
 export let helpshown;
  
 function close (event) {
   helpshown = false;
 }
</script>
