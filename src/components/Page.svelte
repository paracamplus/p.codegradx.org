<style>
</style>

<svelte:head>
  <title>CodeGradX/{shortTitle}</title>
</svelte:head>

<Header />

<section id='mainSection' class='w3-container w3-margin-top w3-padding'>
  {#if showheader}
  <header class='w3-center w3-margin-bottom'>
    {title}
  </header>
  {/if}

  <slot>
    <p> Page en construction... </p>
  </slot>
</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Bottom from '../components/Bottom.svelte';

 import { onMount } from 'svelte';
 import { person, campaign } from '../stores.mjs';

 export let title;
 export let shortTitle;
 export let showheader = true;
 
</script>
