
<style>
</style>

<Page shortTitle="Aide/identification"
      title="Se connecter" >

  <section class='w3-container w3-padding'>

    <section>
      <header> S'enregistrer (la première fois) </header>
      <p>

        Il y a plusieurs façons de s'enregistrer la première fois.

      </p>
      <p>
        
        Vous pouvez utiliser Google avec le bouton
        <a href={buildGoto('viagoogle')} 
           class="w3-btn w3-theme-d2 w3-round-xxlarge"
           >via Google</a>.
        Si vous permettez alors à CodeGradX de récupérer vos nom,
        prénom, pseudo et courriel, vous serez enregistré et vous
        pourrez, les fois suivantes, vous connecter via le même
        bouton. C'est pratique, simple mais Google saura que vous
        vous intéressez à CodeGradX :)
        
      </p>
      <p>

        L'autre solution est <span class="w3-badge">1</span> de vous
        <a href={buildGoto('enroll')} 
           class="w3-btn w3-theme-d2 w3-round-xxlarge">inscrire</a>
        en donnant votre courriel (qui sera utilisé pour
        valider votre adresse électronique et qui deviendra votre nom
        de connexion) et en résolvant une Captcha (indépendante de
        tout fournisseur de Captcha). Vous recevrez alors un courriel
        vous demandant <span class="w3-badge">2</span> de confirmer
        votre adresse électronique. En revenant sur le
        site de CodeGradX, vous aurez à lire et
        approuver <span class="w3-badge">3</span> les
        <a href={buildGoto('/ua')}>conditions d'usage</a>.
        Enfin <span class="w3-badge">4</span>,
        vous aurez à modifier votre profil et notamment votre mot de
        passe afin de pouvoir vous identifier les fois suivantes.

      </p>

    </section>

    <section>
      <header> S'identifier (les fois suivantes) </header>
      <p>

        Tout dépend de la façon dont vous vous êtes enregistré.

      </p>
      <p>
        Si vous connaissez votre nom de connexion et avez défini un
        mot de passe, utilisez ces deux informations pour vous
        <a href={buildGoto('login')}
           class="w3-btn w3-theme-d2 w3-round-xxlarge">identifier</a>.

      </p>
      <p>

        Si vous avez utilisé le bouton
        <a href={buildGoto('viagoogle')}
           class="w3-btn w3-theme-d2 w3-round-xxlarge"
           >via Google</a>, utilisez la même méthode.

      </p>
      <p>

        Si vous avez <a href={buildGoto('lostpassword')}
           class="w3-btn w3-theme-d2 w3-round-xxlarge">
        oublié votre mot de passe</a>, vous recevrez un courriel
        contenant un lien temporaire afin de vous permettre de vous
        re-connecter pour, par exemple, redéfinir votre mot de passe!

      </p>
      
    </section>
    
</section>

</Page>

<script>
 import Page from '../../components/Page.svelte';
 
 import { buildGoto } from '../../client/lib.mjs';
</script>


  
