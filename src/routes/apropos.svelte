
<svelte:head>
  <title>CodeGradX/À propos</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <div class='w3-margin-top w3-padding'>
    <header class='w3-center w3-large bold'>
      À propos
    </header>

    <p>Version {version} </p>
  </div>
</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Bottom from '../components/Bottom.svelte';
 import { version } from '../client/TS.mjs';
  
</script>
